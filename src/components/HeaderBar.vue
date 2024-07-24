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
import { debounce } from 'lodash-es';
import type { party } from 'src/types/party';
import type { encounter_list } from 'src/types/encounter';
import { settingsStore, encounterStore } from 'stores/store';
import { shop_list } from 'src/types/shop';

const encounter = encounterStore();
const settings = settingsStore();

TailwindDarkFix();

const supportButton = ref(
  document.querySelectorAll('[id^=kofi-widget-overlay-]').item(0) as HTMLElement
);
supportButton.value.classList.add('hide-print');

const route = useRoute();
const currentPath = ref(route.path);

const settingsDialog = ref(false);
const tab = ref('General');
const pfVersion = ref('Any');
const localPfVersion = ref(localStorage.getItem('pf_version'));

switch (localPfVersion.value?.toLowerCase()) {
  case 'any':
    pfVersion.value = 'Any';
    break;
  case 'legacy':
    pfVersion.value = 'Legacy';
    break;
  case 'remaster':
    pfVersion.value = 'Remaster';
    break;
  default:
    pfVersion.value = 'Any';
    localStorage.setItem('pf_version', 'Any');
    break;
}

settings.setPfVersion(pfVersion.value);

const togglePfVersion = () => {
  localStorage.setItem('pf_version', pfVersion.value);
  window.location.reload();
};

const hideSupport = ref(false);
const localSupport = ref(localStorage.getItem('hide_support'));

switch (localSupport.value) {
  case 'true':
    hideSupport.value = true;
    supportButton.value.style.display = 'none';
    break;
  case 'false':
    hideSupport.value = false;
    supportButton.value.style.display = 'block';
    break;
  default:
    hideSupport.value = false;
    supportButton.value.style.display = 'block';
    localStorage.setItem('hide_support', 'false');
    break;
}

const toggleSupport = () => {
  localStorage.setItem('hide_support', JSON.stringify(hideSupport.value));
  if (hideSupport.value) {
    supportButton.value.style.display = 'none';
  } else {
    supportButton.value.style.display = 'block';
  }
};

const all_experimentals = ref(false);
const localExperimentals = ref(localStorage.getItem('all_experimentals'));

switch (localExperimentals.value) {
  case 'true':
    all_experimentals.value = true;
    break;
  case 'false':
    all_experimentals.value = false;
    break;
  default:
    all_experimentals.value = false;
    localStorage.setItem('all_experimentals', 'false');
    break;
}

settings.setExperimentalFeatures(all_experimentals.value);

const toggleAllExperimental = () => {
  is_creature_sheets_on.value = all_experimentals.value;
  localStorage.setItem('is_creature_sheets_on', JSON.stringify(all_experimentals.value));
  settings.setCreatureSheets(all_experimentals.value);
  is_aon_links_on.value = all_experimentals.value;
  localStorage.setItem('is_aon_links_on', JSON.stringify(all_experimentals.value));
  settings.setAonLinks(all_experimentals.value);
  localStorage.setItem('all_experimentals', JSON.stringify(all_experimentals.value));
  settings.setExperimentalFeatures(all_experimentals.value);
};

const is_pwl_on = ref(false);
const localPwl = ref(localStorage.getItem('is_pwl_on'));

switch (localPwl.value) {
  case 'true':
    is_pwl_on.value = true;
    break;
  case 'false':
    is_pwl_on.value = false;
    break;
  default:
    is_pwl_on.value = false;
    localStorage.setItem('is_pwl_on', 'false');
    break;
}

encounter.setPwL(is_pwl_on.value);

const togglePwL = () => {
  localStorage.setItem('is_pwl_on', JSON.stringify(is_pwl_on.value));
  encounter.setPwL(is_pwl_on.value);
};

const is_creature_sheets_on = ref(false);
const localCreatureSheets = ref(localStorage.getItem('is_creature_sheets_on'));

switch (localCreatureSheets.value) {
  case 'true':
    is_creature_sheets_on.value = true;
    break;
  case 'false':
    is_creature_sheets_on.value = false;
    break;
  default:
    is_creature_sheets_on.value = false;
    localStorage.setItem('is_creature_sheets_on', 'false');
    break;
}

settings.setCreatureSheets(is_creature_sheets_on.value);

const toggleCreatureSheets = () => {
  localStorage.setItem('is_creature_sheets_on', JSON.stringify(is_creature_sheets_on.value));
  settings.setCreatureSheets(is_creature_sheets_on.value);
  if (!is_creature_sheets_on.value) {
    all_experimentals.value = false;
    localStorage.setItem('all_experimentals', JSON.stringify(all_experimentals.value));
    settings.setExperimentalFeatures(all_experimentals.value);
  }
};

const is_aon_links_on = ref(false);
const localAonLinks = ref(localStorage.getItem('is_aon_links_on'));

switch (localAonLinks.value) {
  case 'true':
    is_aon_links_on.value = true;
    break;
  case 'false':
    is_aon_links_on.value = false;
    break;
  default:
    is_aon_links_on.value = false;
    localStorage.setItem('is_aon_links_on', 'false');
    break;
}

settings.setAonLinks(is_aon_links_on.value);

const toggleAonLinks = () => {
  localStorage.setItem('is_aon_links_on', JSON.stringify(is_aon_links_on.value));
  settings.setAonLinks(is_aon_links_on.value);
  if (!is_aon_links_on.value) {
    all_experimentals.value = false;
  }
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

const unhide = debounce(function () {
  settings.setHiddenNav(!settings.getHiddenNav);
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
          validateData(result);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const validateData = (result: string) => {
  const parsedData = JSON.parse(result);
  try {
    Object.keys(parsedData).forEach((key) => {
      switch (key) {
        case 'encounters': {
          const parsedEncounter = JSON.parse(parsedData[key]);
          if (Array.isArray(parsedEncounter)) {
            const isCompatible = parsedEncounter.every((p) => {
              return typeof p.name === 'string' && Array.isArray(p.creatures);
            });
            if (isCompatible) {
              const encounters: encounter_list[] = parsedEncounter;
              const encounterNames = encounters.map((p) => p.name);
              if (new Set(encounterNames).size !== encounterNames.length) {
                throw new Error('Duplicate loaded encounter names');
              }
            } else {
              throw new Error('Invalid loaded encounter format');
            }
          } else {
            throw new Error('Invalid loaded encounter format');
          }
          break;
        }
        case 'shops': {
          const parsedShop = JSON.parse(parsedData[key]);
          if (Array.isArray(parsedShop)) {
            const isCompatible = parsedShop.every((p) => {
              return typeof p.name === 'string' && Array.isArray(p.items);
            });
            if (isCompatible) {
              const shops: shop_list[] = parsedShop;
              const shopNames = shops.map((p) => p.name);
              if (new Set(shopNames).size !== shopNames.length) {
                throw new Error('Duplicate loaded shop names');
              }
            } else {
              throw new Error('Invalid loaded shop format');
            }
          } else {
            throw new Error('Invalid loaded shop format');
          }
          break;
        }
        case 'pf_version':
          if (!['any', 'legacy', 'remaster'].includes(parsedData[key].toLowerCase())) {
            throw new Error('Invalid loaded pathfinder version value');
          }
          break;
        case 'parties': {
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
                  throw new Error('Invalid loaded party levels');
                }
              });
              const partyNames = parties.map((p) => p.name);
              if (new Set(partyNames).size !== partyNames.length) {
                throw new Error('Duplicate loaded party names');
              }
            } else {
              throw new Error('Invalid loaded party format');
            }
          } else {
            throw new Error('Invalid loaded party format');
          }
          break;
        }
        case 'theme':
          if (parsedData[key] != 'light' && parsedData[key] != 'dark') {
            throw new Error('Invalid loaded theme value');
          }
          break;
        case 'is_creature_sheets_on':
          if (parsedData[key] != 'true' && parsedData[key] != 'false') {
            throw new Error('Invalid loaded creature sheets value');
          }
          break;
        case 'is_pwl_on':
          if (parsedData[key] != 'true' && parsedData[key] != 'false') {
            throw new Error('Invalid loaded pwl value');
          }
          break;
        case 'hide_support':
          if (parsedData[key] != 'true' && parsedData[key] != 'false') {
            throw new Error('Invalid loaded hide support value');
          }
          break;
        case 'is_aon_links_on':
          if (parsedData[key] != 'true' && parsedData[key] != 'false') {
            throw new Error('Invalid loaded aon links value');
          }
          break;
        case 'all_experimentals':
          if (parsedData[key] != 'true' && parsedData[key] != 'false') {
            throw new Error('Invalid loaded all experimentals value');
          }
          break;
        default:
          throw new Error('Unknown loaded key: ' + key);
      }
      localStorage.setItem(key, parsedData[key]);
    });
    window.location.reload();
  } catch (error) {
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error reading the uploaded file',
      icon: matPriorityHigh
    });
  }
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
  <q-header
    class="tw-opacity-100 sm:tw-opacity-80 dark:tw-opacity-100 sm:dark:tw-opacity-90 tw-flex tw-flex-wrap sm:tw-justify-start sm:tw-flex-nowrap tw-z-50 tw-w-full tw-bg-white tw-border-b tw-border-gray-200 tw-text-sm tw-py-3 sm:tw-py-0 dark:tw-bg-gray-800 dark:tw-border-gray-700"
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
          <div class="tw-my-auto tw-ml-4 tw-text-gray-800 dark:tw-text-gray-200">BYBE</div>
        </router-link>
        <div class="sm:tw-hidden">
          <q-btn
            flat
            unelevated
            type="button"
            class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
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
        :class="{ 'tw-hidden': settings.getHiddenNav, 'overflow-hidden': settings.getHiddenNav }"
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

          <div class="tw-flex tw-items-center tw-gap-x-4 sm:tw-gap-x-0 tw-relative">
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
              <q-card flat bordered style="min-height: 451px; min-width: 270px">
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
                  <q-tab name="Shop" label="Shop" />
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
                        <q-select
                          outlined
                          dense
                          options-dense
                          v-model="pfVersion"
                          :options="['Any', 'Legacy', 'Remaster']"
                          label="Pathfinder Version"
                          @update:model-value="togglePfVersion"
                        />
                        <q-toggle
                          v-model="hideSupport"
                          label="Hide support button"
                          @update:model-value="toggleSupport"
                          aria-label="Toggle support button visibility"
                        />
                        <q-toggle
                          class="tw-w-52 tw-text-wrap"
                          v-model="all_experimentals"
                          label="Enable all experimental features"
                          @update:model-value="toggleAllExperimental"
                          aria-label="Toggle all experimental features"
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
                        aria-label="Toggle proficiency without level"
                      >
                      </q-toggle>
                      <q-space />
                      <q-btn
                        flat
                        round
                        size="sm"
                        :icon="biQuestionCircle"
                        href="https://2e.aonprd.com/Rules.aspx?ID=2762"
                        target="_blank"
                        rel="noopener"
                        aria-label="Link to explanation for proficiency without level"
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
                        <q-icon :name="fasFlaskVial" size="sm" class="tw-mr-2" />
                        Experimental features
                      </div>
                    </q-card-actions>
                    <q-card-actions>
                      <q-toggle
                        v-model="is_creature_sheets_on"
                        label="Creature sheets"
                        @update:model-value="toggleCreatureSheets"
                        aria-label="Toggle experimental creature sheets"
                      >
                      </q-toggle>
                      <q-space />
                      <q-icon flat round size="xs" :name="biQuestionCircle" class="tw-mr-1.5">
                        <q-tooltip
                          class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          <strong>Click on the scroll icon beside the creature's name</strong>
                          <br />
                          It will show a creature sheet showing it's attributes
                        </q-tooltip>
                      </q-icon>
                    </q-card-actions>
                  </q-tab-panel>
                  <q-tab-panel name="Shop" class="tw-space-y-3">
                    <q-card-actions>
                      <div class="tw-mx-auto">
                        <q-icon :name="fasFlaskVial" size="sm" class="tw-mr-2" />
                        Experimental features
                      </div>
                    </q-card-actions>
                    <q-card-actions>
                      <q-toggle
                        v-model="is_aon_links_on"
                        label="AoN item links"
                        @update:model-value="toggleAonLinks"
                        aria-label="Toggle experimental item links"
                      >
                      </q-toggle>
                      <q-space />
                      <q-icon flat round size="xs" :name="biQuestionCircle" class="tw-mr-1.5">
                        <q-tooltip
                          class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          <strong>Adds external links to the items</strong>
                          <br />
                          It will try to search the item on Archives of Nethys
                        </q-tooltip>
                      </q-icon>
                    </q-card-actions>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card>
            </q-dialog>
            <q-btn
              v-if="currentPath === '/encounter' || currentPath === '/shop'"
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
  </q-header>
</template>
