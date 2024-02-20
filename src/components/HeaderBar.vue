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
import { TailwindDarkFix } from 'src/utils/tw-dark-fix';
import debounce from 'lodash/debounce';
import { party } from 'src/types/party';
import { encounterList } from 'src/types/encounter';
import { encounterStore } from 'stores/store';
import { tour } from 'src/boot/globals';

const encounter = encounterStore();

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

watch(
  () => route.path,
  () => {
    currentPath.value = route.path;
  }
);

const navigation = [
  { name: 'Encounter Builder', to: '/encounter/' },
  { name: 'Shop Generator', to: '/shop/' },
  { name: 'NPC Generator', to: '/npc/' }
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
              p.members.every((member: any) => typeof member === 'number')
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

const startTour = () => {
  tour.value.startTour();
};

localStorage.removeItem('vjt-encounter');
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
            flat
            no-caps
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
            <div id="v-step-8">
              <q-btn
                flat
                round
                size="sm"
                padding="sm"
                class="tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
                :icon="biGear"
                target="_blank"
                aria-label="Open settings"
                @click="settingsDialog = true"
              />
            </div>
            <q-dialog
              v-model="settingsDialog"
              aria-label="Settings dialog"
              @escape-key="settingsDialog = false"
            >
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
                            <b>Work in progress!</b> <br />
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
                        href="https://2e.aonprd.com/Rules.aspx?ID=1370"
                        target="_blank"
                        class="tw-ml-2"
                      >
                        <q-tooltip
                          class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          <b>Proficiency without Level</b> <br />
                          Click to learn more
                        </q-tooltip>
                      </q-btn>
                    </q-card-actions>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card>
            </q-dialog>
            <q-btn
              v-if="currentPath === '/encounter/'"
              flat
              padding="sm"
              class="sm:tw-ml-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              @click="startTour"
              aria-label="Start help tour"
            >
              HELP
            </q-btn>
            <div v-else class="tw-mr-[58px]"></div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style lang="scss">
@use 'sass:math';
$vjt__tooltip_color: #fff;
$vjt__tooltip_z_index: 9999;
$vjt__tooltip_font_size: 13px;
$vjt__tooltip_arrow_size: 8px;
$vjt__tooltip_background: #333;
$vjt__tooltip_border_radius: 4px;
$vjt__tooltip_max_width: 300px;

$vjt__highlight_offset: 4px !default;
$vjt__highlight_color: rgba(255, 0, 0, 0.6) !default;
$vjt__highlight_outline_radius: 4px !default;
$vjt__highlight_outline: 4px solid $vjt__highlight_color !default;

$vjt__action_button_color: #fff;
$vjt__action_button_font_size: 13px;
$vjt__action_button_color_hover: #fff;
$vjt__action_button_padding: 4px 16px;
$vjt__action_button_border_radius: 4px;
$vjt__action_button_background_hover: #000;
$vjt__action_button_border: 1px solid #fff;
$vjt__action_button_background: transparent;

[data-hidden] {
  display: none;
}

#vjt-tooltip {
  background-color: $vjt__tooltip_background;
  color: $vjt__tooltip_color;
  padding: 0.5rem;
  border-radius: $vjt__tooltip_border_radius;
  font-size: $vjt__tooltip_font_size;
  z-index: $vjt__tooltip_z_index;
  max-width: $vjt__tooltip_max_width;
}

#vjt-tooltip[data-popper-placement^='top'] {
  #vjt-arrow {
    bottom: math.div(-$vjt--tooltip-arrow-size, 2);
  }
}

#vjt-tooltip[data-popper-placement^='bottom'] {
  #vjt-arrow {
    top: math.div(-$vjt--tooltip-arrow-size, 2);
  }
}

#vjt-tooltip[data-popper-placement^='left'] {
  #vjt-arrow {
    right: math.div(-$vjt--tooltip-arrow-size, 2);
  }
}

#vjt-tooltip[data-popper-placement^='right'] {
  #vjt-arrow {
    left: math.div(-$vjt--tooltip-arrow-size, 2);
  }
}

#vjt-arrow {
  width: $vjt__tooltip_arrow_size;
  height: $vjt__tooltip_arrow_size;
  position: absolute;
  z-index: -1;

  &::before {
    content: '';
    width: $vjt__tooltip_arrow_size;
    height: $vjt__tooltip_arrow_size;
    background-color: $vjt__tooltip_background;
    transform: rotate(45deg);
    position: absolute;
  }
}

.vjt-highlight {
  outline: $vjt__highlight_outline;
  outline-offset: $vjt__highlight_offset;
  border-radius: $vjt__highlight_outline_radius;
}

.vjt-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  gap: 0.5rem;

  button {
    width: 100%;
    padding: 0.25rem 1rem;
    border: $vjt__action_button_border;
    border-radius: $vjt__action_button_border_radius;
    background-color: $vjt__action_button_background;
    color: $vjt__action_button_color;
    font-size: $vjt__action_button_font_size;
    font-weight: 500;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: $vjt__action_button_background_hover;
      color: $vjt__action_button_color_hover;
    }
  }
}
</style>
