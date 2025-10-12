<script setup lang="ts">
import {
  biCloudArrowDown,
  biCloudArrowUp,
  biGear,
  biQuestionCircle,
  biXLg
} from '@quasar/extras/bootstrap-icons';
import { fasFlaskVial } from '@quasar/extras/fontawesome-v6';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

import { encounterStore, settingsStore } from 'src/stores/store';

import type { encounter_list } from '../types/encounter';
import type { npc_list } from '../types/npcs';
import type { party } from '../types/party';
import type { shop_list } from '../types/shop';
import type { template } from '../types/template';

const $q = useQuasar();

const settings = settingsStore();
const encounter = encounterStore();

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
  globalThis.location.reload();
};

const hideSupport = ref(false);
const localSupport = ref(localStorage.getItem('hide_support'));

switch (localSupport.value) {
  case 'true':
    hideSupport.value = true;
    break;
  case 'false':
    hideSupport.value = false;
    break;
  default:
    hideSupport.value = false;
    localStorage.setItem('hide_support', 'false');
    break;
}

interface Widget {
  draw: (username, type) => void;
}
declare let kofiWidgetOverlay: Widget;

const loadKofiWidget = () => {
  return new Promise<void>((resolve, reject) => {
    const kofiWidget = document.createElement('script');
    kofiWidget.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    kofiWidget.integrity =
      'sha512-M5C7x3flCdJVRDM/E9jAWOtukG3A+9K2vGYYsi5D8fr49cvowu+aPOS47S/gzuUFfzMy2OJ7IqfBB+NE9kmnEw== sha512-Qq9Wa8l8WJo/UHkeTG+uo0cuHH8TgQ0yN3TXdRSUxhwIpgNRyqeqeCen+JED6L/772FJbduOYvZ31yhxYHegJg==';
    kofiWidget.crossOrigin = 'anonymous';
    kofiWidget.async = true;
    kofiWidget.onload = () => {
      resolve();
    };
    kofiWidget.onerror = () => reject(new Error('Failed to load script'));
    document.body.appendChild(kofiWidget);
  });
};

if (!hideSupport.value) {
  try {
    await loadKofiWidget();
    if (kofiWidgetOverlay && typeof kofiWidgetOverlay.draw === 'function') {
      kofiWidgetOverlay.draw('theasel', {
        type: 'floating-chat',
        'floating-chat.donateButton.text': 'Support Us',
        'floating-chat.donateButton.background-color': '#00b9fe',
        'floating-chat.donateButton.text-color': '#fff'
      });
      const supportButton = document
        .querySelectorAll('[id^=kofi-widget-overlay-]')
        .item(0) as HTMLElement;

      supportButton.classList.add('hide-print');
    } else {
      throw new Error('Error loading Ko-Fi widget');
    }
  } catch (error) {
    console.error(error);
  }
}

const toggleSupport = () => {
  localStorage.setItem('hide_support', JSON.stringify(hideSupport.value));
  globalThis.location.reload();
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

const uploadData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const arrayBuffer = await file.text();
      validateData(arrayBuffer);
    }
  };
  input.click();
};

const validateData = (result: string) => {
  const parsedData = JSON.parse(result);
  try {
    for (const key of Object.keys(parsedData)) {
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
            throw new TypeError('Invalid loaded encounter format');
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
            throw new TypeError('Invalid loaded shop format');
          }
          break;
        }
        case 'npcs': {
          const parsedNpc = JSON.parse(parsedData[key]);
          if (Array.isArray(parsedNpc)) {
            const isCompatible = parsedNpc.every((p) => {
              return typeof p.name === 'string';
            });
            if (isCompatible) {
              const npcs: npc_list[] = parsedNpc;
              const npcNames = npcs.map((p) => p.name);
              if (new Set(npcNames).size !== npcNames.length) {
                throw new Error('Duplicate loaded npc names');
              }
            } else {
              throw new Error('Invalid loaded npc format');
            }
          } else {
            throw new TypeError('Invalid loaded npc format');
          }
          break;
        }
        case 'templates': {
          const parsedTemplates = JSON.parse(parsedData[key]);
          if (Array.isArray(parsedTemplates)) {
            const isCompatible = parsedTemplates.every((p) => {
              return typeof p.name === 'string' && typeof p.default === 'boolean';
            });
            if (isCompatible) {
              const templates: template[] = parsedTemplates;
              const templatesNames = templates.map((p) => p.name);
              if (new Set(templatesNames).size !== templatesNames.length) {
                throw new Error('Duplicate loaded template names');
              }
            } else {
              throw new Error('Invalid loaded template format');
            }
          } else {
            throw new TypeError('Invalid loaded template format');
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
              for (const p of parties) {
                if (!p || !p.members.every((player) => player >= 1 && player <= 20)) {
                  throw new Error('Invalid loaded party levels');
                }
              }
              const partyNames = parties.map((p) => p.name);
              if (new Set(partyNames).size !== partyNames.length) {
                throw new Error('Duplicate loaded party names');
              }
            } else {
              throw new Error('Invalid loaded party format');
            }
          } else {
            throw new TypeError('Invalid loaded party format');
          }
          break;
        }
        case 'theme':
          if (parsedData[key] !== 'light' && parsedData[key] !== 'dark') {
            throw new Error('Invalid loaded theme value');
          }
          break;
        case 'is_pwl_on':
          if (parsedData[key] !== 'true' && parsedData[key] !== 'false') {
            throw new Error('Invalid loaded pwl value');
          }
          break;
        case 'hide_support':
          if (parsedData[key] !== 'true' && parsedData[key] !== 'false') {
            throw new Error('Invalid loaded hide support value');
          }
          break;
        case 'is_aon_links_on':
          if (parsedData[key] !== 'true' && parsedData[key] !== 'false') {
            throw new Error('Invalid loaded aon links value');
          }
          break;
        case 'all_experimentals':
          if (parsedData[key] !== 'true' && parsedData[key] !== 'false') {
            throw new Error('Invalid loaded all experimentals value');
          }
          break;
        default:
          throw new Error('Unknown loaded key: ' + key);
      }
      localStorage.setItem(key, parsedData[key]);
    }
    globalThis.location.reload();
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
  <q-btn
    id="v-step-9"
    flat
    round
    size="sm"
    padding="sm"
    class="tw:sm:mr-2 tw:text-gray-800! tw:dark:text-gray-200!"
    :icon="biGear"
    target="_blank"
    aria-label="Open settings"
    @click="settingsDialog = true"
  />
  <q-dialog v-model="settingsDialog" aria-label="Settings dialog">
    <q-card flat bordered style="min-height: 451px; min-width: 270px">
      <q-card-section>
        <div class="row">
          <div class="text-h6 tw:mr-4 tw:my-auto">Settings</div>
          <q-space />
          <q-btn
            v-close-popup
            :icon="biXLg"
            size="md"
            padding="sm"
            flat
            round
            dense
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
        <q-tab-panel name="General" class="tw:space-y-3!">
          <q-card-actions class="tw:items-center">
            <q-btn
              outline
              label="Export Data"
              no-caps
              :icon="biCloudArrowDown"
              class="tw:mx-auto!"
              @click="downloadData"
            />
          </q-card-actions>
          <q-card-actions>
            <q-btn
              outline
              label="Import Data"
              no-caps
              :icon="biCloudArrowUp"
              class="tw:mx-auto!"
              @click="uploadData"
            >
              <q-tooltip
                class="text-caption tw:bg-amber-400! tw:text-gray-800! tw:rounded-md tw:shadow-sm tw:dark:bg-amber-400!"
                anchor="top middle"
                self="bottom middle"
              >
                Remember to backup your data by exporting first!
              </q-tooltip>
            </q-btn>
          </q-card-actions>
          <q-separator />
          <q-card-actions>
            <div class="q-gutter-y-sm column tw:mx-auto">
              <q-select
                v-model="pfVersion"
                outlined
                dense
                options-dense
                :options="['Any', 'Legacy', 'Remaster']"
                label="Pathfinder Version"
                @update:model-value="togglePfVersion"
              />
              <q-toggle
                v-model="hideSupport"
                label="Hide support button"
                aria-label="Toggle support button visibility"
                @update:model-value="toggleSupport"
              />
              <q-toggle
                v-model="all_experimentals"
                class="tw:w-52 tw:text-wrap"
                label="Enable all experimental features"
                aria-label="Toggle all experimental features"
                @update:model-value="toggleAllExperimental"
              />
            </div>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="Encounter" class="tw:space-y-3">
          <q-card-actions>
            <q-toggle
              v-model="is_pwl_on"
              label="Prof. without Level"
              class="tw:mx-auto"
              aria-label="Toggle proficiency without level"
              @update:model-value="togglePwL"
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
                class="text-caption text-center tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>Proficiency without Level</strong> <br />
                Click to learn more
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="Shop" class="tw:space-y-3">
          <q-card-actions>
            <div class="tw:mx-auto">
              <q-icon :name="fasFlaskVial" size="sm" class="tw:mr-2" />
              Experimental features
            </div>
          </q-card-actions>
          <q-card-actions>
            <q-toggle
              v-model="is_aon_links_on"
              label="AoN item links"
              aria-label="Toggle experimental item links"
              @update:model-value="toggleAonLinks"
            >
            </q-toggle>
            <q-space />
            <q-icon flat round size="xs" :name="biQuestionCircle" class="tw:mr-1.5">
              <q-tooltip
                class="text-caption text-center tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
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
</template>
