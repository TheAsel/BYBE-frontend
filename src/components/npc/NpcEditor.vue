<script setup lang="ts">
import {
  biArrowRepeat,
  biInputCursorText,
  biLock,
  biPlusLg,
  biShare,
  biTrash,
  biUnlock,
  biXLg
} from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash-es';
import { copyToClipboard, useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  decodeNpcLink,
  generateNpcLink,
  npcLevelGenerator,
  npcNamesGenerator,
  npcParametersGenerator
} from 'src/api/npc-api-calls';
import { npcStore } from 'src/stores/npc';
import { npcParametersStore } from 'src/stores/npcParameters';
import { settingsStore } from 'src/stores/settings';

import type { games } from 'src/types/filters';
import type { npc, npc_list, shareable_npc } from 'src/types/npcs';

const isApp = process.env.IS_APP === 'true';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const npcParameters = npcParametersStore();
const npcs = npcStore();
const settings = settingsStore();

const currentGame = ref<games>(settings.game === 'sf' ? 'sf' : 'pf');

const importNpcDialog = ref(false);
const importNameInput = ref();
const importNpcName = ref('');
const importNpcData = ref<shareable_npc>();

const shareDialog = ref(false);
const shareUrl = ref('');
const isGenerating = ref(false);

const newNpcDialog = ref(false);
const npcNameInput = ref();
const newNpcName = ref('');

const renameNpcDialog = ref(false);
const npcRenameInput = ref();
const newNpcRename = ref('');

const removeNpcDialog = ref(false);

const tmpNpc = ref<npc_list>(npcs.npcs[npcs.activeNpc]!);
const npcList = ref<string[]>(npcs.npcs.map((npc) => npc.name));

tmpNpc.value = {
  name: npcs.npcs[npcs.activeNpc]!.name,
  npc: npcs.npcs[npcs.activeNpc]!.npc,
  culture: npcs.npcs[npcs.activeNpc]!.culture
};

// save on npc change
watch(npcs, () => {
  tmpNpc.value = {
    name: npcs.npcs[npcs.activeNpc]!.name,
    npc: npcs.npcs[npcs.activeNpc]!.npc,
    culture: npcs.npcs[npcs.activeNpc]!.culture
  };
  saveChanges();
});

const generateParameterNpc = debounce(async function (
  parameter: 'ancestry' | 'class' | 'gender' | 'job' | 'nickname' | 'level' | 'culture'
) {
  if (
    (!npcs.locks.ancestry && parameter === 'ancestry') ||
    (!npcs.locks.culture && parameter === 'culture') ||
    (!npcs.locks.class && parameter === 'class') ||
    (!npcs.locks.gender && parameter === 'gender') ||
    (!npcs.locks.job && parameter === 'job') ||
    (!npcs.locks.nickname && parameter === 'nickname') ||
    (!npcs.locks.level && parameter === 'level')
  ) {
    npcs.setGenerating(true);

    try {
      if (parameter === 'level') {
        const newLevel = await npcLevelGenerator(currentGame.value);
        if (newLevel === undefined) {
          throw new TypeError('Error generating npc level');
        }
        npcs.npcs[npcs.activeNpc]!.npc.level = newLevel;
      } else {
        const newParameter = await npcParametersGenerator(currentGame.value, parameter);
        if (newParameter === undefined) {
          throw new TypeError('Error generating npc ' + parameter);
        }
        // regex: adds spaces between words
        switch (parameter) {
          case 'ancestry':
            npcs.npcs[npcs.activeNpc]!.npc.ancestry = newParameter.replaceAll(
              /([a-z])([A-Z])/g,
              '$1 $2'
            );
            break;
          case 'culture':
            npcs.npcs[npcs.activeNpc]!.npc.culture = newParameter.replaceAll(
              /([a-z])([A-Z])/g,
              '$1 $2'
            );
            break;
          case 'class':
            npcs.npcs[npcs.activeNpc]!.npc.class = newParameter.replaceAll(
              /([a-z])([A-Z])/g,
              '$1 $2'
            );
            break;
          case 'gender':
            npcs.npcs[npcs.activeNpc]!.npc.gender = newParameter.replaceAll(
              /([a-z])([A-Z])/g,
              '$1 $2'
            );
            break;
          case 'job':
            npcs.npcs[npcs.activeNpc]!.npc.job = newParameter.replaceAll(
              /([a-z])([A-Z])/g,
              '$1 $2'
            );
            break;
          case 'nickname':
            npcs.npcs[npcs.activeNpc]!.npc.nickname = newParameter.replaceAll(
              /([a-z])([A-Z])/g,
              '$1 $2'
            );
            break;

          default:
            break;
        }
      }
    } catch (error) {
      console.error(error);
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error generating random npc ' + parameter,
        icon: matPriorityHigh
      });
    }

    npcs.setGenerating(false);
  }
}, 300);

let namesIndex = 10;
let namesList: string[] = [];
let tmpGender: string;
let tmpAncestry: string;
let tmpCulture: string;
const generateNamesNpc = debounce(async function () {
  if (!npcs.locks.name) {
    npcs.setGenerating(true);

    if (
      namesIndex >= namesList.length - 1 ||
      tmpGender !== npcs.npcs[npcs.activeNpc]!.npc.gender ||
      tmpAncestry !== npcs.npcs[npcs.activeNpc]!.npc.ancestry ||
      tmpCulture !== npcs.npcs[npcs.activeNpc]!.npc.culture
    ) {
      tmpGender = npcs.npcs[npcs.activeNpc]!.npc.gender!;
      tmpAncestry = npcs.npcs[npcs.activeNpc]!.npc.ancestry!;
      if (currentGame.value === 'pf') {
        tmpCulture = npcs.npcs[npcs.activeNpc]!.npc.culture!;
      }

      const body: {
        gender?: string | undefined;
        origin?: {
          FromAncestry?: string | undefined;
          FromCulture?: string | undefined;
        };
      } = {};

      if (
        npcs.npcs[npcs.activeNpc]!.npc.gender &&
        npcParameters.npcParameters.genders.includes(npcs.npcs[npcs.activeNpc]!.npc.gender!)
      ) {
        body.gender = npcs.npcs[npcs.activeNpc]!.npc.gender!.replaceAll(' ', '');
      }

      if (currentGame.value === 'sf') {
        if (
          npcs.npcs[npcs.activeNpc]!.npc.ancestry &&
          npcParameters.npcParameters.ancestries.includes(npcs.npcs[npcs.activeNpc]!.npc.ancestry!)
        ) {
          body.origin = {
            FromAncestry: npcs.npcs[npcs.activeNpc]!.npc.ancestry!.replaceAll(' ', '')
          };
        }
      } else {
        if (
          !npcs.npcs[npcs.activeNpc]!.culture &&
          npcs.npcs[npcs.activeNpc]!.npc.ancestry &&
          npcParameters.npcParameters.ancestries.includes(npcs.npcs[npcs.activeNpc]!.npc.ancestry!)
        ) {
          body.origin = {
            FromAncestry: npcs.npcs[npcs.activeNpc]!.npc.ancestry!.replaceAll(' ', '')
          };
        }

        if (
          npcs.npcs[npcs.activeNpc]!.culture &&
          npcs.npcs[npcs.activeNpc]!.npc.culture &&
          npcParameters.npcParameters.cultures.includes(npcs.npcs[npcs.activeNpc]!.npc.culture!)
        ) {
          body.origin = {
            FromCulture: npcs.npcs[npcs.activeNpc]!.npc.culture!.replaceAll(' ', '')
          };
        }

        if (body.origin?.FromAncestry === 'Leshy' && body.gender) {
          if (body.gender !== 'NonBinary') {
            $q.notify({
              progress: true,
              type: 'warning',
              message: 'Invalid gender for this ancestry, defaulting to Non Binary',
              icon: matPriorityHigh
            });
          }
          body.gender = 'NonBinary';
        }
      }

      try {
        const newNames = await npcNamesGenerator(currentGame.value, body);
        if (newNames === undefined) {
          throw new TypeError('Error generating npc names');
        }
        namesIndex = 0;
        namesList = newNames;
        npcs.npcs[npcs.activeNpc]!.npc.name = namesList[namesIndex];
      } catch (error) {
        console.error(error);
        $q.notify({
          progress: true,
          type: 'warning',
          message: 'Error generating random npc names',
          icon: matPriorityHigh
        });
      }
    } else {
      namesIndex++;
      npcs.npcs[npcs.activeNpc]!.npc.name = namesList[namesIndex];
    }

    npcs.setGenerating(false);
  }
}, 300);

const addCustomField = () => {
  if (npcs.npcs[npcs.activeNpc]!.npc.custom_fields === undefined) {
    npcs.npcs[npcs.activeNpc]!.npc.custom_fields = [{ name: '', body: '' }];
  } else {
    npcs.npcs[npcs.activeNpc]!.npc.custom_fields.push({ name: '', body: '' });
  }
};

const removeCustomField = (index: number) => {
  npcs.npcs[npcs.activeNpc]!.npc.custom_fields.splice(index, 1);
  if (npcs.npcs[npcs.activeNpc]!.npc.custom_fields.length === 0) {
    npcs.npcs[npcs.activeNpc]!.npc.custom_fields = [{ name: '', body: '' }];
  }
};

// read the "share" query and decode it
const shareQuery =
  String(route.query.share) === 'undefined' || String(route.query.share) === 'null'
    ? ''
    : String(route.query.share);
const encodedData = ref(shareQuery);

const decodeData = async () => {
  if (encodedData.value !== '') {
    isGenerating.value = true;
    importNpcDialog.value = true;
    try {
      const decodedData = await decodeNpcLink(encodedData.value);
      if (decodedData === undefined) {
        importNpcDialog.value = false;
        throw new TypeError('Error importing npc');
      }
      importNpcData.value = decodedData;
      importNpcName.value = decodedData.list_name;
    } catch (error) {
      importNpcDialog.value = false;
      console.error(error);
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error importing npc',
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
  query: {}
});

// open the share dialog and generate the shareable link
const openShare = async () => {
  isGenerating.value = true;
  shareDialog.value = true;
  const currentNpc = npcs.npcs[npcs.activeNpc]!.npc;
  const body: shareable_npc = {
    list_name: npcs.npcs[npcs.activeNpc]?.name ? npcs.npcs[npcs.activeNpc]!.name : 'Default',
    npcs_data: []
  };

  body.npcs_data.push({
    name: currentNpc.name === undefined ? '' : currentNpc.name,
    nickname: currentNpc.nickname === null ? '' : currentNpc.nickname,
    gender: currentNpc.gender === undefined ? '' : currentNpc.gender,
    ancestry: currentNpc.ancestry === undefined ? '' : currentNpc.ancestry,
    job: currentNpc.job === undefined ? '' : currentNpc.job,
    level: currentNpc.level === undefined ? 1 : currentNpc.level,
    culture: currentNpc.culture === undefined ? '' : currentNpc.culture,
    class: currentNpc.class === undefined ? '' : currentNpc.class,
    game: currentGame.value
  });

  try {
    const shareableLink = await generateNpcLink(body);
    if (typeof shareableLink === 'string') {
      shareUrl.value = 'https://bybe.app/npc?game=' + currentGame.value + '&share=' + shareableLink;
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

const importNpc = () => {
  importNameInput.value.validate();
  if (!importNameInput.value.hasError && importNpcData.value?.npcs_data[0]) {
    const tmp_npc: npc = {
      name: importNpcData.value?.npcs_data[0].name,
      nickname:
        importNpcData.value.npcs_data[0].nickname === undefined
          ? ''
          : importNpcData.value.npcs_data[0].nickname,
      gender:
        importNpcData.value?.npcs_data[0].gender === undefined
          ? ''
          : importNpcData.value?.npcs_data[0].gender,
      ancestry:
        importNpcData.value?.npcs_data[0].ancestry === undefined
          ? ''
          : importNpcData.value?.npcs_data[0].ancestry,
      job:
        importNpcData.value?.npcs_data[0].job === undefined
          ? ''
          : importNpcData.value?.npcs_data[0].job,
      level:
        importNpcData.value?.npcs_data[0].level === undefined
          ? -1
          : importNpcData.value?.npcs_data[0].level,
      culture:
        importNpcData.value?.npcs_data[0].culture === undefined
          ? ''
          : importNpcData.value?.npcs_data[0].culture,
      class:
        importNpcData.value?.npcs_data[0].class === undefined
          ? ''
          : importNpcData.value?.npcs_data[0].class,
      game:
        importNpcData.value?.npcs_data[0].game === undefined
          ? currentGame.value
          : importNpcData.value?.npcs_data[0].game,
      languages: null,
      description: null,
      personality: null,
      quirk: null,
      relationships: null,
      ideology: null,
      custom_fields: [{ name: '', body: '' }]
    };

    npcs.addNpc(importNpcName.value);
    npcList.value = npcs.npcs.map((npc) => npc.name);
    npcs.updateNpc(importNpcName.value, tmp_npc);
    tmpNpc.value = {
      name: npcs.npcs[npcs.activeNpc]!.name,
      npc: npcs.npcs[npcs.activeNpc]!.npc,
      culture: npcs.npcs[npcs.activeNpc]!.culture
    };
    saveChanges();
    importNpcName.value = '';
    importNpcDialog.value = false;
  }
};

const closeDialog = () => {
  importNpcDialog.value = false;
  shareDialog.value = false;
  newNpcDialog.value = false;
  renameNpcDialog.value = false;
  npcNameInput.value = false;
  importNpcName.value = '';
  newNpcName.value = '';
  newNpcRename.value = '';
};

const addNpc = () => {
  npcNameInput.value.validate();
  if (!npcNameInput.value.hasError) {
    npcs.addNpc(newNpcName.value);
    npcList.value = npcs.npcs.map((npc) => npc.name);
    tmpNpc.value = {
      name: npcs.npcs[npcs.activeNpc]!.name,
      npc: npcs.npcs[npcs.activeNpc]!.npc,
      culture: npcs.npcs[npcs.activeNpc]!.culture
    };
    saveChanges();
    newNpcName.value = '';
    newNpcDialog.value = false;
  }
};

const renameNpc = () => {
  npcRenameInput.value.validate();
  if (!npcRenameInput.value.hasError) {
    npcs.npcs[npcs.activeNpc]!.name = newNpcRename.value;
    npcList.value = npcs.npcs.map((npc) => npc.name);
    tmpNpc.value = {
      name: npcs.npcs[npcs.activeNpc]!.name,
      npc: npcs.npcs[npcs.activeNpc]!.npc,
      culture: npcs.npcs[npcs.activeNpc]!.culture
    };
    saveChanges();
    newNpcRename.value = '';
    renameNpcDialog.value = false;
  }
};

const removeNpc = () => {
  npcs.removeNpc();
  npcList.value = npcs.npcs.map((npc) => npc.name);
  tmpNpc.value = {
    name: npcs.npcs[npcs.activeNpc]!.name,
    npc: npcs.npcs[npcs.activeNpc]!.npc,
    culture: npcs.npcs[npcs.activeNpc]!.culture
  };
  saveChanges();
  removeNpcDialog.value = false;
};

const changeActiveNpc = (selected: string) => {
  npcs.changeActiveNpc(npcs.getNpcIndex(selected));
  tmpNpc.value = {
    name: npcs.npcs[npcs.activeNpc]!.name,
    npc: npcs.npcs[npcs.activeNpc]!.npc,
    culture: npcs.npcs[npcs.activeNpc]!.culture
  };
};

const saveChanges = () => {
  npcs.updateNpc(tmpNpc.value.name, tmpNpc.value.npc);
  localStorage.setItem('npcs', JSON.stringify(npcs.npcs));
};
</script>

<template>
  <div class="q-pa-md tw:w-full tw:md:w-[34%]">
    <q-dialog
      v-model="importNpcDialog"
      aria-label="Import shared npc dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Import npc</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="importNameInput"
            v-model="importNpcName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !npcList.some((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This NPC already exists'
            ]"
            @keyup.enter="importNpc"
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
            label="Import npc"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add npc"
            @click="importNpc"
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
            A copy of your npc can be accessed via the following link:
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

    <q-dialog v-model="newNpcDialog" aria-label="New npc dialog" @escape-key="closeDialog">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">New NPC name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="npcNameInput"
            v-model="newNpcName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !npcList.some((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This NPC already exists'
            ]"
            @keyup.enter="addNpc"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Add NPC"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Add NPC"
            @click="addNpc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="renameNpcDialog" aria-label="New npc dialog" @escape-key="closeDialog">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Rename NPC</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="npcRenameInput"
            v-model="newNpcRename"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !npcList.some((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This NPC already exists'
            ]"
            @keyup.enter="renameNpc"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Rename NPC"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Rename NPC"
            @click="renameNpc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="removeNpcDialog" aria-label="Remove npc dialog" @escape-key="closeDialog">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Remove this NPC?</div>
        </q-card-section>
        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Remove"
            class="tw:text-red-600 tw:dark:text-red-400"
            aria-label="Remove NPC"
            @click="removeNpc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-layout
      id="v-step-2"
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 126px)"
      class="tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200 tw:rounded-xl tw:shadow-sm tw:bg-white tw:dark:bg-gray-800 tw:dark:border-gray-700"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:flex-wrap tw:justify-center! tw:mx-4 tw:my-1.5 tw:gap-2">
          <q-btn
            id="v-step-3"
            class="tw:grow"
            :icon="biShare"
            label="Share"
            unelevated
            push
            @click="openShare"
          />
          <div class="tw:flex">
            <div class="tw:my-auto!">
              <q-btn
                class="tw:ml-2!"
                :icon="biPlusLg"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Add new NPC"
                @click="newNpcDialog = true"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Add new NPC
                </q-tooltip>
              </q-btn>
            </div>
            <div class="tw:my-auto!">
              <q-btn
                class="tw:ml-2!"
                :icon="biInputCursorText"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Rename NPC"
                @click="renameNpcDialog = true"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Rename NPC
                </q-tooltip>
              </q-btn>
            </div>
            <div class="tw:my-auto!">
              <q-btn
                class="tw:mx-2! tw:p-2!"
                :icon="biTrash"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Remove current NPC"
                @click="removeNpcDialog = true"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Delete NPC
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <q-select
            v-model="tmpNpc.name"
            dense
            style="min-width: 120px; max-width: 120px"
            class="tw:my-auto"
            outlined
            :options="npcList"
            label="NPCs"
            @update:model-value="changeActiveNpc(tmpNpc.name)"
          />
          <q-btn flat dense aria-label="Clear npc" @click="npcs.clearNpc">CLEAR</q-btn>
        </div>
      </q-header>
      <q-page-container>
        <div class="tw:flex tw:flex-col tw:gap-4 tw:my-4 tw:mx-6">
          <div id="v-step-4" class="tw:flex tw:py-1">
            <q-btn
              v-if="npcs.locks.name"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock name"
              @click="npcs.locks.name = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock name"
              @click="npcs.locks.name = true"
            />
            <q-input
              label="Name"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.name"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npcs.locks.name"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate name"
              @click="generateNamesNpc"
            />
            <span class="tw:mx-2" />
            <q-btn
              v-if="npcs.locks.nickname"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock nickname"
              @click="npcs.locks.nickname = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock nickname"
              @click="npcs.locks.nickname = true"
            />
            <q-input
              label="Nickname"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.nickname"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npcs.locks.nickname"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate nickname"
              @click="generateParameterNpc('nickname')"
            />
          </div>
          <div class="tw:flex tw:py-1">
            <q-btn
              v-if="npcs.locks.gender"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock gender"
              @click="npcs.locks.gender = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock gender"
              @click="npcs.locks.gender = true"
            />
            <q-input
              label="Gender"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.gender"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npcs.locks.gender"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate gender"
              @click="generateParameterNpc('gender')"
            />
            <span class="tw:mx-2" />
            <span
              v-if="!npcs.npcs[npcs.activeNpc]!.culture || currentGame === 'sf'"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
            >
              <q-btn
                v-if="npcs.locks.ancestry"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock ancestry"
                @click="npcs.locks.ancestry = false"
              />
              <q-btn
                v-else
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock ancestry"
                @click="npcs.locks.ancestry = true"
              />
            </span>
            <span v-else class="tw:flex-none tw:my-auto! tw:mr-2!">
              <q-btn
                v-if="npcs.locks.culture"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock culture"
                @click="npcs.locks.culture = false"
              />
              <q-btn
                v-else
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock culture"
                @click="npcs.locks.culture = true"
              />
            </span>
            <q-input
              v-if="!npcs.npcs[npcs.activeNpc]!.culture || currentGame === 'sf'"
              label="Ancestry"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.ancestry"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npcs.locks.ancestry"
            />
            <q-input
              v-else
              label="Culture"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.culture"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npcs.locks.culture"
            />
            <q-btn
              v-if="!npcs.npcs[npcs.activeNpc]!.culture || currentGame === 'sf'"
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate ancestry"
              @click="generateParameterNpc('ancestry')"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate culture"
              @click="generateParameterNpc('culture')!"
            />
          </div>
          <div class="tw:flex tw:py-1">
            <q-btn
              v-if="npcs.locks.class"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock class"
              @click="npcs.locks.class = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock class"
              @click="npcs.locks.class = true"
            />
            <q-input
              label="Class"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.class"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npcs.locks.class"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate class"
              @click="generateParameterNpc('class')"
            />
            <span class="tw:mx-2" />
            <q-btn
              v-if="npcs.locks.job"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock job"
              @click="npcs.locks.job = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock job"
              @click="npcs.locks.job = true"
            />
            <q-input
              label="Job"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.job"
              class="tw:grow"
              stack-label
              multiple
              dense
              outlined
              :readonly="npcs.locks.job"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate job"
              @click="generateParameterNpc('job')"
            />
          </div>
          <div class="tw:flex tw:flex-col tw:mb-3">
            <span class="tw:ml-12 tw:text-gray-800 tw:dark:text-gray-200"> Level: </span>
            <div class="tw:flex">
              <q-btn
                v-if="npcs.locks.level"
                class="tw:flex-none tw:my-auto! tw:mr-2!"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock level"
                @click="npcs.locks.level = false"
              />
              <q-btn
                v-else
                class="tw:flex-none tw:my-auto! tw:mr-2!"
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock level"
                @click="npcs.locks.level = true"
              />
              <q-slider
                v-model="npcs.npcs[npcs.activeNpc]!.npc.level"
                class="tw:mx-1"
                markers
                label-always
                switch-label-side
                aria-label="Filter level"
                role="menuitem"
                :min="-1"
                :max="25"
                :readonly="npcs.locks.level"
              />
              <q-btn
                class="tw:flex-none tw:my-auto! tw:ml-2!"
                :icon="biArrowRepeat"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Generate level"
                @click="generateParameterNpc('level')"
              />
            </div>
          </div>
        </div>
        <q-separator class="tw:my-2! tw:mx-6!" style="height: 2px" />
        <div class="tw:grid tw:grid-cols-2 tw:gap-3 tw:my-4 tw:mx-6">
          <div id="v-step-5" class="tw:py-1 tw:mr-2">
            <q-input
              label="Languages"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.languages"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:ml-2">
            <q-input
              label="Quirks"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.quirk"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:mr-2">
            <q-input
              v-model="npcs.npcs[npcs.activeNpc]!.npc.description"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              label="Description"
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:ml-2">
            <q-input
              v-model="npcs.npcs[npcs.activeNpc]!.npc.personality"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              label="Personality"
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:mr-2">
            <q-input
              label="Relationships"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.relationships"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:ml-2">
            <q-input
              label="Ideology"
              v-model="npcs.npcs[npcs.activeNpc]!.npc.ideology"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
        </div>
        <q-separator class="tw:my-2! tw:mx-6!" style="height: 2px" />
        <div id="v-step-6" class="tw:mx-6">
          <div v-for="(item, index) in npcs.npcs[npcs.activeNpc]!.npc.custom_fields" :key="index">
            <div class="tw:flex tw:gap-6 tw:my-5">
              <div class="tw:flex-auto">
                <q-input
                  :label="'Custom field ' + (index + 1)"
                  v-model="item.name"
                  outlined
                  dense
                  autogrow
                  type="textarea"
                />
              </div>
              <div class="tw:flex-auto">
                <q-input
                  :label="'Custom text ' + (index + 1)"
                  v-model="item.body"
                  outlined
                  dense
                  autogrow
                  type="textarea"
                />
              </div>
              <div class="tw:flex-none tw:my-auto">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  padding="sm"
                  :icon="biTrash"
                  aria-label="Remove custom field"
                  @click="removeCustomField(index)"
                />
              </div>
            </div>
          </div>
          <div class="tw:my-5">
            <q-btn
              class="full-width"
              outline
              size="md"
              padding="sm"
              :icon="biPlusLg"
              type="button"
              aria-label="Add custom field"
              @click="addCustomField()"
            >
            </q-btn>
          </div>
        </div>
      </q-page-container>
    </q-layout>
  </div>
</template>
