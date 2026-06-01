<script setup lang="ts">
import {
  biDash,
  biInputCursorText,
  biPlus,
  biPlusLg,
  biShare,
  biTrash,
  biXLg
} from '@quasar/extras/bootstrap-icons';
import { fasScroll } from '@quasar/extras/fontawesome-v7';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash-es';
import { copyToClipboard, useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { encounterStore, infoStore, partyStore, settingsStore } from '../../stores/store';
import {
  decodeEncounterLink,
  encounterInfo,
  generateEncounterLink,
  requestCreatureId,
  requestHazardId
} from '../../utils/encounter-api-calls';

import type {
  encounter_info,
  encounter_list,
  min_creature_hazard,
  shareable_encounter
} from '../../types/encounter';
import type { complexities, games, variants } from '../../types/filters';

const isApp = process.env.IS_APP === 'true';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const is_pwl_on = ref(false);

const party = partyStore();
const encounter = encounterStore();
const info = infoStore();
const settings = settingsStore();

const currentGame = ref<games>(settings.getGame === 'sf' ? 'sf' : 'pf');
const currentAon = ref(currentGame.value === 'sf' ? 'aonsrd' : 'aonprd');

const importEncounterDialog = ref(false);
const importNameInput = ref();
const importEncounterName = ref('');
const importEncounterData = ref<shareable_encounter>();

const shareDialog = ref(false);
const shareUrl = ref('');
const isGenerating = ref(false);

const newEncounterDialog = ref(false);
const encounterNameInput = ref();
const newEncounterName = ref('');

const renameEncounterDialog = ref(false);
const encounterRenameInput = ref();
const newEncounterRename = ref('');

const removeEncounterDialog = ref(false);

const tmpEncounter = ref<encounter_list>(encounter.getActiveEncounter!);
const encounters = ref<string[]>(encounter.getEncounters.map((encounter) => encounter.name));

tmpEncounter.value = {
  name: encounter.getActiveEncounter!.name,
  creatures: encounter.getActiveEncounter!.creatures
};

const debouncedCall = debounce(async function () {
  const encounterList = encounter.getActiveEncounter!.creatures;
  const creatureLevels: number[] = [];
  const hazardLevels: { complexity: complexities; level: number }[] = [];
  for (const item of encounterList) {
    for (let j = 0; j < item.quantity!; j++) {
      if (item.is_hazard === false) {
        switch (item.variant) {
          case 'Weak':
            if (item.level === 1) {
              creatureLevels.push(item.level - 2);
            } else {
              creatureLevels.push(item.level - 1);
            }
            break;
          case 'Elite':
            if (item.level === -1 || item.level === 0) {
              creatureLevels.push(item.level + 2);
            } else {
              creatureLevels.push(item.level + 1);
            }
            break;
          default:
            creatureLevels.push(item.level);
            break;
        }
      } else {
        hazardLevels.push({ complexity: item.complexity!, level: item.level });
      }
    }
  }
  const partyLevels = party.getActiveParty!.members;
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
  const body: encounter_info = {
    creatures_params: { enemy_levels: creatureLevels, is_pwl_on: is_pwl_on.value },
    hazards_params: { hazards: hazardLevels },
    party_levels: partyLevels
  };
  try {
    if (!encounter.getGenerating) {
      const returnedEncounterInfo = await encounterInfo(currentGame.value, body);
      if (returnedEncounterInfo === undefined) {
        throw new TypeError('Error calculating encounter challenge');
      }
      info.setInfo(returnedEncounterInfo);
    }
  } catch (error) {
    console.error(error);
  }
}, 300);

// get info on creature list change
watch(encounter, async () => {
  tmpEncounter.value = {
    name: encounter.getActiveEncounter!.name,
    creatures: encounter.getActiveEncounter!.creatures
  };
  saveChanges();
  await debouncedCall();
});

// get info on party change
watch(party, async () => {
  await debouncedCall();
});

// get info on page load
await debouncedCall();

// read the "share" query and decode it
const shareQuery =
  String(route.query.share) === 'undefined' || String(route.query.share) === 'null'
    ? ''
    : String(route.query.share);
const encodedData = ref(shareQuery);

const decodeData = async () => {
  if (encodedData.value !== '') {
    isGenerating.value = true;
    importEncounterDialog.value = true;
    try {
      const decodedData = await decodeEncounterLink(encodedData.value);
      if (decodedData === undefined) {
        importEncounterDialog.value = false;
        throw new TypeError('Error importing encounter');
      }
      importEncounterData.value = decodedData;
      importEncounterName.value = decodedData.encounter_name;
    } catch (error) {
      importEncounterDialog.value = false;
      console.error(error);
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error importing encounter',
        icon: matPriorityHigh
      });
    }
    isGenerating.value = false;
  }
};
await decodeData();

// clean and check the link for manual app import
const sharedLink = ref('');
const cleanLink = async () => {
  try {
    const parsedUrl = new URL(sharedLink.value);
    const path = parsedUrl.pathname;
    if (path !== route.path) {
      closeDialog();
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Invalid page for this link',
        icon: matPriorityHigh
      });
      throw new Error('Invalid page for this link');
    }
    const share = parsedUrl.searchParams.get('share');
    if (share === null || share === '') {
      closeDialog();
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing share hash',
        icon: matPriorityHigh
      });
      throw new TypeError('Missing share code');
    }
    encodedData.value = share;
    closeDialog();
    await decodeData();
  } catch (error) {
    console.error(error);
  }
};

// clean the url from queries
await router.replace({
  path: route.path,
  query: { game: currentGame.value }
});

// open the share dialog and generate the shareable link
const openShare = async () => {
  isGenerating.value = true;
  shareDialog.value = true;
  const encounterList = encounter.getActiveEncounter!.creatures;
  const body: shareable_encounter = {
    encounter_name: encounter.getActiveEncounter?.name
      ? encounter.getActiveEncounter.name
      : 'Default',
    creatures_data: [],
    hazards_data: []
  };

  for (const item of encounterList) {
    if (item.game !== 'pf' && item.game !== 'sf') {
      shareDialog.value = false;
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'This legacy list cannot be shared',
        icon: matPriorityHigh
      });
      return;
    }

    if (item.is_hazard === false) {
      const tmp_variant: variants = item.variant ? item.variant : 'Base';
      const tmp_qty: number = item.quantity ? item.quantity : 1;
      const tmp_game: games = item.game;

      body.creatures_data.push({
        id: item.id,
        variant: tmp_variant,
        qty: tmp_qty,
        game: tmp_game
      });
    } else {
      const tmp_qty: number = item.quantity ? item.quantity : 1;
      const tmp_game: games = item.game;

      body.hazards_data.push({
        id: item.id,
        qty: tmp_qty,
        game: tmp_game
      });
    }
  }

  try {
    const shareableLink = await generateEncounterLink(body);
    if (typeof shareableLink === 'string') {
      shareUrl.value =
        'https://bybe.app/encounter?game=' + currentGame.value + '&share=' + shareableLink;
    } else {
      shareDialog.value = false;
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error generating shared link',
        icon: matPriorityHigh
      });
    }
  } catch (error) {
    shareDialog.value = false;
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error generating shared link',
      icon: matPriorityHigh
    });
  }
  isGenerating.value = false;
};

const importEncounter = async () => {
  importNameInput.value.validate();
  if (!importNameInput.value.hasError) {
    const tmp_creatures: min_creature_hazard[] = [];
    for (const creature of importEncounterData.value?.creatures_data ?? []) {
      try {
        const fetchedCreatureData = await requestCreatureId(
          creature.game,
          creature.id,
          creature.variant,
          is_pwl_on.value
        );

        if (fetchedCreatureData === undefined) {
          throw new TypeError('Undefined response');
        }
        tmp_creatures.push({
          game: creature.game,
          id: creature.id,
          archive_link: fetchedCreatureData.core_data.derived.archive_link,
          name: fetchedCreatureData.core_data.essential.name,
          level: fetchedCreatureData.core_data.essential.base_level,
          quantity: creature.qty,
          variant: creature.variant,
          is_hazard: false
        });
      } catch (error) {
        console.error(error);
      }
    }
    for (const hazard of importEncounterData.value?.hazards_data ?? []) {
      try {
        const fetchedHazardsData = await requestHazardId(hazard.game, hazard.id);

        if (fetchedHazardsData === undefined) {
          throw new TypeError('Undefined response');
        }
        tmp_creatures.push({
          game: hazard.game,
          id: hazard.id,
          archive_link:
            'https://2e.' +
            currentAon.value +
            '.com/search?q=' +
            encodeURIComponent(fetchedHazardsData.core_hazard.essential.name) +
            ' type%3A(hazard)&type=eqs',
          name: fetchedHazardsData.core_hazard.essential.name,
          level: fetchedHazardsData.core_hazard.essential.level,
          quantity: hazard.qty,
          is_hazard: true,
          complexity: fetchedHazardsData.core_hazard.essential.complexity
        });
      } catch (error) {
        console.error(error);
      }
    }
    encounter.addEncounter(importEncounterName.value);
    encounters.value = encounter.getEncounters.map((encounter) => encounter.name);
    encounter.updateEncounter(importEncounterName.value, tmp_creatures);
    tmpEncounter.value = {
      name: encounter.getActiveEncounter!.name,
      creatures: [...encounter.getActiveEncounter!.creatures]
    };
    saveChanges();
    importEncounterName.value = '';
    importEncounterDialog.value = false;
  }
};

const closeDialog = () => {
  importEncounterDialog.value = false;
  shareDialog.value = false;
  newEncounterDialog.value = false;
  renameEncounterDialog.value = false;
  removeEncounterDialog.value = false;
  sharedLink.value = '';
  importEncounterName.value = '';
  newEncounterName.value = '';
  newEncounterRename.value = '';
};

const addEncounter = () => {
  encounterNameInput.value.validate();
  if (!encounterNameInput.value.hasError) {
    encounter.addEncounter(newEncounterName.value);
    encounters.value = encounter.getEncounters.map((encounter) => encounter.name);
    tmpEncounter.value = {
      name: encounter.getActiveEncounter!.name,
      creatures: [...encounter.getActiveEncounter!.creatures]
    };
    saveChanges();
    newEncounterName.value = '';
    newEncounterDialog.value = false;
  }
};

const renameEncounter = () => {
  encounterRenameInput.value.validate();
  if (!encounterRenameInput.value.hasError) {
    encounter.getActiveEncounter!.name = newEncounterRename.value;
    encounters.value = encounter.getEncounters.map((encounter) => encounter.name);
    tmpEncounter.value = {
      name: encounter.getActiveEncounter!.name,
      creatures: [...encounter.getActiveEncounter!.creatures]
    };
    saveChanges();
    newEncounterRename.value = '';
    renameEncounterDialog.value = false;
  }
};

const removeEncounter = () => {
  encounter.removeEncounter();
  encounters.value = encounter.getEncounters.map((encounter) => encounter.name);
  tmpEncounter.value = {
    name: encounter.getActiveEncounter!.name,
    creatures: [...encounter.getActiveEncounter!.creatures]
  };
  saveChanges();
  removeEncounterDialog.value = false;
};

const changeActiveEncounter = (selected: string) => {
  encounter.changeActiveEncounter(encounter.getEncounterIndex(selected));
  tmpEncounter.value = {
    name: encounter.getActiveEncounter!.name,
    creatures: [...encounter.getActiveEncounter!.creatures]
  };
};

const saveChanges = () => {
  encounter.updateEncounter(tmpEncounter.value.name, tmpEncounter.value.creatures);
  localStorage.setItem('encounters', JSON.stringify(encounter.getEncounters));
};

const openCreatureSheet = (game: games, id: number, variant: variants) => {
  const routeData = router.resolve({
    name: 'bestiary',
    query: { game: currentGame.value, id: id, variant: variant }
  });
  if (isApp) {
    globalThis.open(routeData.href, '_self');
  } else {
    globalThis.open(routeData.href, '_blank');
  }
};

const openHazardSheet = (game: games, id: number) => {
  const routeData = router.resolve({
    name: 'hazard',
    query: { game: currentGame.value, id: id }
  });
  if (isApp) {
    globalThis.open(routeData.href, '_self');
  } else {
    globalThis.open(routeData.href, '_blank');
  }
};
</script>

<template>
  <div class="q-pa-md tw:w-full tw:md:w-[27%]">
    <q-dialog
      v-model="importEncounterDialog"
      aria-label="Import shared encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Import encounter</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="importNameInput"
            v-model="importEncounterName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !encounters.some((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This encounter already exists'
            ]"
            @keyup.enter="importEncounter"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Import encounter"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add encounter"
            @click="importEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="shareDialog" aria-label="Share dialog" @escape-key="closeDialog">
      <q-card flat bordered style="min-height: 210px; width: 320px">
        <q-card-section>
          <div class="row">
            <div class="text-h6 tw:mr-4 tw:my-auto">Share</div>
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
        <div v-if="isApp">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            Paste a shared link here to import it:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-input
                v-model="sharedLink"
                class="tw:w-44 tw:text-gray-800! tw:dark:text-gray-200!"
                outlined
                dense
              />
              <q-btn label="Import" @click="cleanLink" />
            </div>
          </q-card-section>
          <q-separator inset class="tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-700!" />
        </div>
        <div v-if="!isGenerating">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            A copy of your encounter can be accessed via the following link:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-field class="tw:w-48 tw:text-gray-800! tw:dark:text-gray-200!" outlined dense>
                <template v-slot:control>
                  <div class="tw:text-nowrap tw:overflow-x-scroll tw:py-4!">
                    {{ shareUrl }}
                  </div>
                </template>
              </q-field>
              <q-btn label="Copy" @click="copyToClipboard(shareUrl)" />
            </div>
          </q-card-section>
        </div>
        <q-inner-loading showing v-else style="z-index: 2">
          <q-spinner-gears
            class="tw:mx-auto tw:mt-8! tw:text-black tw:dark:text-white"
            size="5em"
          />
        </q-inner-loading>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="newEncounterDialog"
      aria-label="New encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">New encounter name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="encounterNameInput"
            v-model="newEncounterName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !encounters.some((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This encounter already exists'
            ]"
            @keyup.enter="addEncounter"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Add encounter"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add encounter"
            @click="addEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="renameEncounterDialog"
      aria-label="New encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Rename encounter</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="encounterRenameInput"
            v-model="newEncounterRename"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !encounters.some((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This encounter already exists'
            ]"
            @keyup.enter="renameEncounter"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Rename encounter"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Rename encounter"
            @click="renameEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="removeEncounterDialog"
      aria-label="Remove encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Remove this encounter?</div>
        </q-card-section>
        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Remove"
            class="tw:text-red-600! tw:dark:text-red-400!"
            aria-label="Remove encounter"
            @click="removeEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-layout
      id="v-step-7"
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 126px)"
      class="tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200! tw:rounded-xl tw:shadow-sm tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:flex-wrap tw:justify-center! tw:mx-4 tw:my-1.5 tw:gap-2">
          <q-btn
            id="v-step-10"
            class="tw:grow"
            :icon="biShare"
            label="Share"
            unelevated
            push
            @click="openShare"
          />
          <div class="tw:flex">
            <q-btn
              class="tw:my-auto! tw:max-h-[33.15px]!"
              :icon="biPlusLg"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Add new encounter"
              @click="newEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Add new encounter
              </q-tooltip>
            </q-btn>
            <q-btn
              class="tw:my-auto! tw:ml-2! tw:max-h-[33.15px]!"
              :icon="biInputCursorText"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Rename encounter"
              @click="renameEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Rename encounter
              </q-tooltip>
            </q-btn>
            <q-btn
              class="tw:my-auto! tw:mx-2! tw:max-h-[33.15px]!"
              :icon="biTrash"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Remove current encounter"
              @click="removeEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Delete encounter
              </q-tooltip>
            </q-btn>
          </div>
          <q-select
            v-model="tmpEncounter.name"
            dense
            style="min-width: 120px; max-width: 120px"
            class="tw:my-auto"
            outlined
            :options="encounters"
            label="Encounters"
            @update:model-value="changeActiveEncounter(tmpEncounter.name)"
          />
          <q-btn flat dense aria-label="Clear encounter" @click="encounter.clearEncounter"
            >CLEAR</q-btn
          >
        </div>
      </q-header>
      <q-page-container v-if="encounter.getGenerating === false">
        <div v-for="(item, index) in encounter.getActiveEncounter!.creatures" :key="index">
          <div class="tw:flex">
            <div id="v-step-8" class="tw:flex-none tw:w-12 tw:my-auto tw:mx-1">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-md"
                :icon="biPlus"
                aria-label="Add creature"
                @click="encounter.addToEncounter(item, index)"
              />
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-md"
                :icon="biDash"
                aria-label="Remove creature"
                @click="encounter.removeFromEncounter(index)"
              />
            </div>
            <div class="tw:flex tw:flex-row tw:grow tw:flex-wrap">
              <div class="tw:flex-1 tw:my-auto tw:mx-1" style="min-width: 100px">
                <q-btn
                  v-if="item.is_hazard === false"
                  round
                  unelevated
                  :icon="fasScroll"
                  size="sm"
                  class="tw:mr-2!"
                  target="_blank"
                  aria-label="Open creature sheet"
                  @click="openCreatureSheet(item.game, item.id, item.variant!)"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Open creature sheet
                  </q-tooltip>
                </q-btn>
                <q-btn
                  v-else
                  round
                  unelevated
                  :icon="fasScroll"
                  size="sm"
                  class="tw:mr-2!"
                  target="_blank"
                  aria-label="Open hazard sheet"
                  @click="openHazardSheet(item.game, item.id)"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Open hazard sheet
                  </q-tooltip>
                </q-btn>
                <span class="tw:align-middle">
                  {{ item.quantity }}
                  <a
                    v-if="item.archive_link"
                    :href="
                      item.archive_link +
                      '&Weak=' +
                      (item.variant === 'Weak') +
                      '&Elite=' +
                      (item.variant === 'Elite')
                    "
                    target="_blank"
                    rel="noopener"
                  >
                    <span
                      class="tw:text-blue-600! tw:decoration-2 tw:hover:underline tw:dark:text-blue-400!"
                      >{{ item.name }}</span
                    >
                  </a>
                  <span v-else>{{ item.name }}</span>
                  — Lv. {{ item.level }}
                </span>
              </div>
              <div
                id="v-step-9"
                v-if="item.is_hazard === false"
                class="tw:flex-initial tw:my-auto tw:mx-1"
              >
                <q-btn-group unelevated flat spread>
                  <q-btn
                    flat
                    label="Weak"
                    size="15px"
                    :class="
                      item.variant === 'Weak'
                        ? 'tw:text-green-500!'
                        : 'tw:dark:text-gray-200! tw:text-gray-400!'
                    "
                    padding="xs"
                    class="text-weight-bold"
                    @click="encounter.changeVariant(index, 'Weak')"
                  />
                  <q-btn
                    flat
                    label="Base"
                    size="15px"
                    :class="
                      item.variant === 'Base'
                        ? 'tw:text-blue-500!'
                        : 'tw:dark:text-gray-200! tw:text-gray-400!'
                    "
                    padding="xs"
                    class="text-weight-bold"
                    @click="encounter.changeVariant(index, 'Base')"
                  />
                  <q-btn
                    flat
                    label="Elite"
                    size="15px"
                    :class="
                      item.variant === 'Elite'
                        ? 'tw:text-orange-500!'
                        : 'tw:dark:text-gray-200! tw:text-gray-400!'
                    "
                    padding="xs"
                    class="text-weight-bold"
                    @click="encounter.changeVariant(index, 'Elite')"
                  />
                </q-btn-group>
              </div>
              <div v-else class="tw:flex-initial tw:my-auto tw:mx-1">
                <span
                  v-if="item.complexity === 'Simple'"
                  flat
                  size="15px"
                  padding="xs"
                  class="tw:text-green-500! text-weight-bold"
                >
                  SIMPLE
                </span>
                <span
                  v-else
                  flat
                  size="15px"
                  padding="xs"
                  class="tw:text-orange-500! text-weight-bold"
                >
                  COMPLEX
                </span>
              </div>
            </div>
            <div class="tw:flex-initial tw:my-auto tw:ml-1 tw:mr-3">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                padding="sm"
                :icon="biTrash"
                round
                aria-label="Clear creature"
                @click="encounter.clearCreature(item)"
              />
            </div>
          </div>
          <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
        </div>
      </q-page-container>
      <q-page-container v-else class="tw:flex" style="height: 78vh">
        <div class="tw:m-auto">
          <q-spinner-gears class="tw:mx-auto tw:text-black tw:dark:text-white" size="5em" />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:mx-4 tw:my-1.5">
          <q-linear-progress
            id="v-step-11"
            rounded
            size="35px"
            :value="1"
            :color="info.getInfo.color"
            aria-label="Encounter challenge"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                class="tw:absolute tw:text-base! tw:hidden! tw:xl:flex!"
                color="grey-10"
                text-color="white"
                :label="'Challenge: ' + info.getInfo.challenge"
              />
              <q-badge
                class="tw:absolute tw:text-base! tw:xl:hidden! tw:flex!"
                color="grey-10"
                text-color="white"
                :label="info.getInfo.challenge"
              />
            </div>
          </q-linear-progress>
          <q-separator vertical class="tw:mx-4! tw:bg-gray-200! tw:dark:bg-gray-700!" />
          <div
            class="flex flex-center text-subtitle1 font-bold tw:whitespace-nowrap tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800!"
          >
            Cost: {{ info.getInfo.experience }} XP
          </div>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
