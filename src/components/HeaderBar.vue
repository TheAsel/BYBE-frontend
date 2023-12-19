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
  biCloudArrowUp
} from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { TailwindDarkFix } from 'src/utils/tw-dark-fix';
import debounce from 'lodash/debounce';
import { party } from 'src/types/party';
import { encounterList } from 'src/types/encounter';

TailwindDarkFix();

const route = useRoute();
const currentPath = ref(route.path);

const settingsDialog = ref(false);
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
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
            />
            <q-dialog
              v-model="settingsDialog"
              aria-label="Settings dialog"
              @escape-key="settingsDialog = false"
            >
              <q-card flat bordered>
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
                <q-card-section class="tw-space-y-3">
                  <q-card-actions>
                    <q-btn
                      outline
                      label="Export Data"
                      no-caps
                      :icon="biCloudArrowDown"
                      @click="downloadData"
                    />
                  </q-card-actions>
                  <q-card-actions>
                    <q-btn
                      outline
                      label="Import Data"
                      no-caps
                      :icon="biCloudArrowUp"
                      @click="uploadData"
                    >
                      <q-tooltip
                        class="text-caption tw-bg-red-700 tw-text-grey-400 tw-rounded-md tw-shadow-sm dark:tw-bg-red-700"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Backup your data by exporting first!
                      </q-tooltip>
                    </q-btn>
                  </q-card-actions>
                  <q-separator />
                  <q-card-actions>
                    <q-toggle
                      disable
                      v-model="legacy"
                      label="Legacy"
                      @update:model-value="toggleLegacy"
                    >
                      <q-tooltip
                        class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Work in progress! <br />
                        Waiting for the Monster Core
                      </q-tooltip>
                    </q-toggle>
                  </q-card-actions>
                </q-card-section>
              </q-card>
            </q-dialog>
            <q-btn
              v-if="currentPath === '/encounter/'"
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
