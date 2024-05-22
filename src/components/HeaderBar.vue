<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  biList,
  biGithub,
  biSun,
  biMoon,
  biGear,
  biXLg,
  biCloudArrowDown,
  biCloudArrowUp,
  biQuestionCircle
} from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { fasFlaskVial } from '@quasar/extras/fontawesome-v6';
import { TailwindDarkFix } from 'src/utils/tw-dark-fix';
import { debounce } from 'lodash';
import type { party } from 'src/types/party';
import type { encounterList } from 'src/types/encounter';
import { encounterStore, settingsStore } from 'stores/store';

const encounter = encounterStore();
const settings = settingsStore();

TailwindDarkFix();

const supportButton = ref(
  document.querySelectorAll('[id^=kofi-widget-overlay-]').item(0) as HTMLElement
);

const route = useRoute();
const currentPath = ref(route.path);

const settingsDialog = ref(false);
const tab = ref('General');
const legacy = ref(false);
const localLegacy = ref(localStorage.getItem('legacy'));

switch (localLegacy.value) {
  case 'true':
    legacy.value = true;
    break;
  case 'false':
    legacy.value = false;
    break;
  default:
    legacy.value = false;
    localStorage.setItem('legacy', 'false');
    break;
}

const toggleLegacy = () => {
  localStorage.setItem('legacy', JSON.stringify(legacy.value));
};

const hideSupport = ref(false);
const localSupport = ref(localStorage.getItem('hideSupport'));

switch (localSupport.value) {
  case 'true':
    hideSupport.value = true;
    supportButton.value.style.visibility = 'hidden';
    break;
  case 'false':
    hideSupport.value = false;
    supportButton.value.style.visibility = '';
    break;
  default:
    hideSupport.value = false;
    supportButton.value.style.visibility = '';
    localStorage.setItem('hideSupport', 'false');
    break;
}

const toggleSupport = () => {
  localStorage.setItem('hideSupport', JSON.stringify(hideSupport.value));
  if (hideSupport.value) {
    supportButton.value.style.visibility = 'hidden';
  } else {
    supportButton.value.style.visibility = '';
  }
};

const is_pwl_on = ref(false);
const localPwl = ref(localStorage.getItem('is_pwl_on'));

switch (localPwl.value) {
  case 'true':
    is_pwl_on.value = true;
    encounter.setPwL(true);
    break;
  case 'false':
    is_pwl_on.value = false;
    encounter.setPwL(false);
    break;
  default:
    is_pwl_on.value = false;
    localStorage.setItem('is_pwl_on', 'false');
    encounter.setPwL(false);
    break;
}

const togglePwL = () => {
  localStorage.setItem('is_pwl_on', JSON.stringify(is_pwl_on.value));
  encounter.setPwL(is_pwl_on.value);
};

const is_creature_sheets_on = ref(false);
const localCreatureSheets = ref(localStorage.getItem('is_creature_sheets_on'));

switch (localCreatureSheets.value) {
  case 'true':
    is_creature_sheets_on.value = true;
    settings.setCreatureSheets(true);
    break;
  case 'false':
    is_creature_sheets_on.value = false;
    settings.setCreatureSheets(false);
    break;
  default:
    is_creature_sheets_on.value = false;
    localStorage.setItem('is_creature_sheets_on', 'false');
    settings.setCreatureSheets(false);
    break;
}

const toggleCreatureSheets = () => {
  localStorage.setItem('is_creature_sheets_on', JSON.stringify(is_creature_sheets_on.value));
  settings.setCreatureSheets(is_creature_sheets_on.value);
};

watch(
  () => route.path,
  () => {
    currentPath.value = route.path;
  }
);

const navigation = [
  { name: 'Encounter Builder', to: '/encounter' },
  { name: 'Shop Generator', to: '/shop' },
  { name: 'NPC Generator', to: '/npc' }
];

const $q = useQuasar();
const theme = ref(localStorage.getItem('theme'));

switch (theme.value) {
  case 'dark':
    $q.dark.set(true);
    break;
  case 'light':
    $q.dark.set(false);
    break;

  default:
    localStorage.setItem('theme', 'dark');
    $q.dark.set(true);
    break;
}

if (theme.value === 'dark') {
  $q.dark.set(true);
}

const themeSwitch = () => {
  $q.dark.toggle();
  if ($q.dark.isActive) {
    theme.value = 'dark';
    localStorage.setItem('theme', 'dark');
  } else {
    theme.value = 'light';
    localStorage.setItem('theme', 'light');
  }
};

const hidden = ref(true);
const unhide = debounce(function () {
  hidden.value = !hidden.value;
}, 50);

const uploadData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          try {
            validateData(result);
          } catch (error) {
            console.error('Error parsing JSON file:', error);
            $q.notify({
              progress: true,
              type: 'warning',
              message: 'Error reading the uploaded file',
              icon: matPriorityHigh
            });
          }
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const validateData = (result: string) => {
  const parsedData = JSON.parse(result);
  Object.keys(parsedData).forEach((key) => {
    switch (key) {
      case 'encounters':
        const parsedEncounters = JSON.parse(parsedData[key]);
        if (Array.isArray(parsedEncounters)) {
          const isCompatible = parsedEncounters.every((p) => {
            return typeof p.name === 'string' && Array.isArray(p.creatures);
          });
          if (isCompatible) {
            const encounters: encounterList[] = parsedEncounters;
            const encounterNames = encounters.map((p) => p.name);
            if (new Set(encounterNames).size !== encounterNames.length) {
              throw 'Duplicate loaded encounter names';
            }
          } else {
            throw 'Invalid loaded encounter format';
          }
        } else {
          throw 'Invalid loaded encounter format';
        }
        break;
      case 'legacy':
        if (parsedData[key] != 'true' && parsedData[key] != 'false') {
          throw 'Invalid loaded legacy value';
        }
        break;
      case 'parties':
        const parsedParties = JSON.parse(parsedData[key]);
        if (Array.isArray(parsedParties)) {
          const isCompatible = parsedParties.every((p) => {
            return (
              typeof p.name === 'string' &&
              Array.isArray(p.members) &&
              p.members.every((member) => typeof member === 'number')
            );
          });
          if (isCompatible) {
            const parties: party[] = parsedParties;
            parties.forEach((p) => {
              if (!p || !p.members.every((player) => player >= 1 && player <= 20)) {
                throw 'Invalid loaded party levels';
              }
            });
            const partyNames = parties.map((p) => p.name);
            if (new Set(partyNames).size !== partyNames.length) {
              throw 'Duplicate loaded party names';
            }
          } else {
            throw 'Invalid loaded party format';
          }
        } else {
          throw 'Invalid loaded party format';
        }
        break;
      case 'theme':
        if (parsedData[key] != 'light' && parsedData[key] != 'dark') {
          throw 'Invalid loaded theme value';
        }
        break;
      default:
        throw 'Unknown loaded key';
    }
    localStorage.setItem(key, parsedData[key]);
  });
  window.location.reload();
};

const downloadData = () => {
  const localStorageData = { ...localStorage };
  const jsonData = JSON.stringify(localStorageData, null, '\t');
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bybe_data.json';
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <header
    class="tw-flex tw-flex-wrap sm:tw-justify-start sm:tw-flex-nowrap tw-z-50 tw-w-full tw-bg-white tw-border-b tw-border-gray-200 tw-text-sm tw-py-3 sm:tw-py-0 dark:tw-bg-gray-800 dark:tw-border-gray-700"
  >
    <nav
      class="tw-relative tw-w-full tw-mx-auto tw-px-4 sm:tw-flex sm:tw-items-center sm:tw-justify-between sm:tw-px-6 lg:tw-px-8"
      aria-label="Global"
    >
      <div class="tw-flex tw-items-center tw-justify-between">
        <router-link
          flat
          class="text-h5 tw-flex tw-flex-nowrap dark:tw-text-white tw-my-auto"
          to="/"
        >
          <q-avatar size="36px">
            <img
              width="36px"
              height="36px"
              v-if="theme === 'light'"
              src="/favicon-64x64-light.png"
              alt="Light BYBE logo"
            />
            <img
              width="36px"
              height="36px"
              v-else
              src="/favicon-64x64-dark.png"
              alt="Dark BYBE logo"
            />
          </q-avatar>
          <div class="tw-my-auto tw-ml-4">BYBE</div>
        </router-link>
        <div class="sm:tw-hidden">
          <q-btn
            flat
            unelevated
            type="button"
            aria-controls="navbar-collapse"
            aria-label="Toggle navigation"
            :icon="biList"
            @click="unhide"
          />
        </div>
      </div>
      <div
        id="navbar-collapse"
        class="tw-grow sm:tw-block"
        :class="{ 'tw-hidden': hidden, 'overflow-hidden': hidden }"
      >
        <div
          class="tw-flex tw-flex-col tw-gap-y-4 tw-gap-x-0 tw-mt-5 sm:tw-flex-row sm:tw-items-center sm:tw-justify-end sm:tw-gap-y-0 sm:tw-gap-x-7 sm:tw-mt-0 sm:tw-pl-7"
        >
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            :class="
              currentPath === item.to
                ? 'tw-text-blue-600 sm:tw-py-4 dark:tw-text-blue-400'
                : 'tw-text-gray-500 hover:tw-text-gray-400 sm:tw-py-4 dark:tw-text-gray-400 dark:hover:tw-text-gray-500'
            "
            :aria-current="item.to ? 'page' : undefined"
            >{{ item.name }}
          </router-link>
          <q-separator vertical inset class="sm:tw-block tw-hidden" />

          <div class="tw-flex tw-items-center tw-relative">
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              :icon="biGithub"
              href="https://github.com/TheAsel/BYBE-frontend"
              target="_blank"
              aria-label="GitHub link"
              rel="noopener"
            />
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              @click="themeSwitch"
              :icon="$q.dark.isActive ? biSun : biMoon"
              aria-label="Toggle theme"
            />
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              :icon="biGear"
              target="_blank"
              aria-label="Open settings"
              @click="settingsDialog = true"
              id="v-step-8"
            />
            <q-dialog v-model="settingsDialog" aria-label="Settings dialog">
              <q-card flat bordered style="min-height: 400px; min-width: 270px">
                <q-card-section>
                  <div class="row">
                    <div class="text-h6 tw-mr-4 tw-my-auto">Settings</div>
                    <q-space />
                    <q-btn
                      :icon="biXLg"
                      size="md"
                      padding="sm"
                      flat
                      round
                      dense
                      v-close-popup
                      aria-label="Close dialog"
                    />
                  </div>
                </q-card-section>
                <q-separator />
                <q-tabs
                  v-model="tab"
                  class="text-grey"
                  active-color="primary"
                  indicator-color="primary"
                  narrow-indicator
                >
                  <q-tab name="General" label="General" />
                  <q-tab name="Encounter" label="Encounter" />
                </q-tabs>
                <q-tab-panels v-model="tab" animated>
                  <q-tab-panel name="General" class="tw-space-y-3">
                    <q-card-actions>
                      <q-btn
                        outline
                        label="Export Data"
                        no-caps
                        :icon="biCloudArrowDown"
                        @click="downloadData"
                        class="tw-mx-auto"
                      />
                    </q-card-actions>
                    <q-card-actions>
                      <q-btn
                        outline
                        label="Import Data"
                        no-caps
                        :icon="biCloudArrowUp"
                        @click="uploadData"
                        class="tw-mx-auto"
                      >
                        <q-tooltip
                          class="text-caption tw-bg-amber-400 tw-text-gray-800 tw-rounded-md tw-shadow-sm dark:tw-bg-amber-400"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          Remember to backup your data by exporting first!
                        </q-tooltip>
                      </q-btn>
                    </q-card-actions>
                    <q-separator />
                    <q-card-actions>
                      <div class="q-gutter-y-sm column tw-mx-auto">
                        <q-toggle
                          disable
                          v-model="legacy"
                          label="Legacy version"
                          @update:model-value="toggleLegacy"
                        >
                          <q-tooltip
                            class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                            anchor="top middle"
                            self="bottom middle"
                          >
                            <strong>Work in progress!</strong> <br />
                            Waiting for the Monster Core
                          </q-tooltip>
                        </q-toggle>
                        <q-toggle
                          v-model="hideSupport"
                          label="Hide support button"
                          @update:model-value="toggleSupport"
                        />
                      </div>
                    </q-card-actions>
                  </q-tab-panel>
                  <q-tab-panel name="Encounter" class="tw-space-y-3">
                    <q-card-actions>
                      <q-toggle
                        v-model="is_pwl_on"
                        label="Prof. without Level"
                        @update:model-value="togglePwL"
                        class="tw-mx-auto"
                      >
                      </q-toggle>
                      <q-btn
                        flat
                        round
                        size="sm"
                        :icon="biQuestionCircle"
                        href="https://2e.aonprd.com/Rules.aspx?ID=2762"
                        target="_blank"
                        rel="noopener"
                        class="tw-ml-2"
                      >
                        <q-tooltip
                          class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          <strong>Proficiency without Level</strong> <br />
                          Click to learn more
                        </q-tooltip>
                      </q-btn>
                    </q-card-actions>
                    <q-separator />
                    <q-card-actions>
                      <div class="tw-mx-auto">
                        <q-icon :name="fasFlaskVial" size="sm" class="tw-mr-2"></q-icon>
                        Experimental features
                      </div>
                    </q-card-actions>
                    <q-card-actions>
                      <q-toggle
                        v-model="is_creature_sheets_on"
                        label="Creature sheets"
                        @update:model-value="toggleCreatureSheets"
                        class="tw-mx-auto"
                      >
                      </q-toggle>
                      <q-btn
                        flat
                        round
                        size="sm"
                        :icon="biQuestionCircle"
                        target="_blank"
                        class="tw-ml-2"
                      >
                        <q-tooltip
                          class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          <strong>Click on the scroll beside the creature's name</strong> <br />
                          It will show a creature sheet showing it's attributes
                        </q-tooltip>
                      </q-btn>
                    </q-card-actions>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card>
            </q-dialog>
            <q-btn
              v-if="currentPath === '/encounter'"
              flat
              padding="sm"
              class="tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              @click="$tours[currentPath].start()"
              aria-label="Start help tour"
            >
              HELP
            </q-btn>
            <div v-else class="tw-mr-[50px]"></div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
