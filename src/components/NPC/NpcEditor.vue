<script setup lang="ts">
import {
  biArrowRepeat,
  biInputCursorText,
  biLock,
  biPlusLg,
  biTrash,
  biUnlock
} from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';

import { npcParametersStore, npcStore } from '../../stores/store';
import { npcNamesGenerator, npcParametersGenerator } from '../../utils/npc-api-calls';

import type { npc_list } from '../../types/npcs';

const $q = useQuasar();

const npcParameters = npcParametersStore();
const npcs = npcStore();

const newNpcDialog = ref(false);
const npcNameInput = ref();
const newNpcName = ref('');

const renameNpcDialog = ref(false);
const npcRenameInput = ref();
const newNpcRename = ref('');

const removeNpcDialog = ref(false);

const tmpNpc = ref<npc_list>(npcs.getActiveNpc!);
const npcList = ref<string[]>(npcs.getNpcs.map((npc) => npc.name));

tmpNpc.value = {
  name: npcs.getActiveNpc!.name,
  npc: npcs.getActiveNpc!.npc
};

// save on npc change
watch(npcs, () => {
  tmpNpc.value = {
    name: npcs.getActiveNpc!.name,
    npc: npcs.getActiveNpc!.npc
  };
  saveChanges();
});

const generateParameterNpc = debounce(async function (
  parameter: 'ancestry' | 'class' | 'gender' | 'job' | 'nickname' | 'level'
) {
  if (
    (!npcs.getLocks.ancestry && parameter == 'ancestry') ||
    (!npcs.getLocks.class && parameter == 'class') ||
    (!npcs.getLocks.gender && parameter == 'gender') ||
    (!npcs.getLocks.job && parameter == 'job') ||
    (!npcs.getLocks.nickname && parameter == 'nickname') ||
    (!npcs.getLocks.level && parameter == 'level')
  ) {
    npcs.setGenerating(true);

    try {
      const newParameter = await npcParametersGenerator(parameter);
      if (typeof newParameter != 'undefined') {
        switch (parameter) {
          case 'ancestry':
            npcs.getActiveNpc!.npc.ancestry = newParameter.replace(/([a-z])([A-Z])/g, '$1 $2');
            break;
          case 'class':
            npcs.getActiveNpc!.npc.class = newParameter.replace(/([a-z])([A-Z])/g, '$1 $2');
            break;
          case 'gender':
            npcs.getActiveNpc!.npc.gender = newParameter.replace(/([a-z])([A-Z])/g, '$1 $2');
            break;
          case 'job':
            npcs.getActiveNpc!.npc.job = newParameter.replace(/([a-z])([A-Z])/g, '$1 $2');
            break;
          case 'nickname':
            npcs.getActiveNpc!.npc.nickname = newParameter.replace(/([a-z])([A-Z])/g, '$1 $2');
            break;

          default:
            break;
        }
      } else {
        throw new Error('Error generating npc ' + parameter);
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
const generateNamesNpc = debounce(async function () {
  if (!npcs.getLocks.name) {
    npcs.setGenerating(true);

    if (
      namesIndex >= namesList.length - 1 ||
      tmpGender != npcs.getActiveNpc!.npc.gender ||
      tmpAncestry != npcs.getActiveNpc!.npc.ancestry
    ) {
      tmpGender = npcs.getActiveNpc!.npc.gender!;
      tmpAncestry = npcs.getActiveNpc!.npc.ancestry!;

      const post: {
        gender?: string | undefined;
        ancestry?: string | undefined;
      } = {};

      if (
        npcs.getActiveNpc!.npc.gender &&
        npcParameters.getNpcParameters.genders.includes(npcs.getActiveNpc!.npc.gender)
      ) {
        post.gender = npcs.getActiveNpc!.npc.gender.replaceAll(' ', '');
      }

      if (
        npcs.getActiveNpc!.npc.ancestry &&
        npcParameters.getNpcParameters.ancestries.includes(npcs.getActiveNpc!.npc.ancestry)
      ) {
        post.ancestry = npcs.getActiveNpc!.npc.ancestry.replaceAll(' ', '');
      }

      if (post.ancestry == 'Leshy' && post.gender) {
        if (post.gender != 'NonBinary') {
          $q.notify({
            progress: true,
            type: 'warning',
            message: 'Invalid gender for this ancestry, defaulting to Non Binary',
            icon: matPriorityHigh
          });
        }
        post.gender = 'NonBinary';
      }

      try {
        const newNames = await npcNamesGenerator(post);
        if (typeof newNames != 'undefined') {
          namesIndex = 0;
          namesList = newNames;
          npcs.getActiveNpc!.npc.name = namesList[namesIndex];
        } else {
          throw new Error('Error generating npc names');
        }
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
      npcs.getActiveNpc!.npc.name = namesList[namesIndex];
    }

    npcs.setGenerating(false);
  }
}, 300);

const closeDialog = () => {
  newNpcDialog.value = false;
  renameNpcDialog.value = false;
  npcNameInput.value = false;
  newNpcName.value = '';
  newNpcRename.value = '';
};

const addNpc = () => {
  npcNameInput.value.validate();
  if (!npcNameInput.value.hasError) {
    npcs.addNpc(newNpcName.value);
    npcList.value = npcs.getNpcs.map((npc) => npc.name);
    tmpNpc.value = {
      name: npcs.getActiveNpc!.name,
      npc: npcs.getActiveNpc!.npc
    };
    saveChanges();
    newNpcName.value = '';
    newNpcDialog.value = false;
  }
};

const renameNpc = () => {
  npcRenameInput.value.validate();
  if (!npcRenameInput.value.hasError) {
    npcs.getActiveNpc!.name = newNpcRename.value;
    npcList.value = npcs.getNpcs.map((npc) => npc.name);
    tmpNpc.value = {
      name: npcs.getActiveNpc!.name,
      npc: npcs.getActiveNpc!.npc
    };
    saveChanges();
    newNpcRename.value = '';
    renameNpcDialog.value = false;
  }
};

const removeNpc = () => {
  npcs.removeNpc();
  npcList.value = npcs.getNpcs.map((npc) => npc.name);
  tmpNpc.value = {
    name: npcs.getActiveNpc!.name,
    npc: npcs.getActiveNpc!.npc
  };
  saveChanges();
  removeNpcDialog.value = false;
};

const changeActiveNpc = (selected: string) => {
  npcs.changeActiveNpc(npcs.getNpcIndex(selected));
  tmpNpc.value = {
    name: npcs.getActiveNpc!.name,
    npc: npcs.getActiveNpc!.npc
  };
};

const saveChanges = () => {
  npcs.updateNpc(tmpNpc.value.name, tmpNpc.value.npc);
  localStorage.setItem('npcs', JSON.stringify(npcs.getNpcs));
};
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-[34%]">
    <q-layout
      id="v-step-2"
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 122px)"
      class="tw-opacity-85 dark:tw-opacity-90 tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <q-header
        bordered
        class="tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800 dark:!tw-border-gray-700"
      >
        <div class="tw-flex tw-flex-wrap tw-mx-4 tw-my-0.5">
          <div class="tw-flex tw-flex-shrink">
            <span class="text-h6 tw-my-auto font-bold tw-text-gray-800 dark:tw-text-gray-200">
              NPC Editor
            </span>
          </div>
          <q-space />
          <div class="tw-flex tw-py-1">
            <q-btn
              class="tw-my-auto tw-ml-2"
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
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Add new NPC
              </q-tooltip>
            </q-btn>
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
                        !npcList.find((name) => name.toLowerCase() === val.toLowerCase()) ||
                        'This NPC already exists'
                    ]"
                    @keyup.enter="addNpc"
                  />
                </q-card-section>

                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                    @click="closeDialog"
                  />
                  <q-btn
                    flat
                    label="Add NPC"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Add NPC"
                    @click="addNpc"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn
              class="tw-my-auto tw-ml-2"
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
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Rename NPC
              </q-tooltip>
            </q-btn>
            <q-dialog
              v-model="renameNpcDialog"
              aria-label="New npc dialog"
              @escape-key="closeDialog"
            >
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
                        !npcList.find((name) => name.toLowerCase() === val.toLowerCase()) ||
                        'This NPC already exists'
                    ]"
                    @keyup.enter="renameNpc"
                  />
                </q-card-section>

                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                    @click="closeDialog"
                  />
                  <q-btn
                    flat
                    label="Rename NPC"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Rename NPC"
                    @click="renameNpc"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn
              class="tw-my-auto tw-mx-2 tw-p-2"
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
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Delete NPC
              </q-tooltip>
            </q-btn>
            <q-dialog
              v-model="removeNpcDialog"
              aria-label="Remove npc dialog"
              @escape-key="closeDialog"
            >
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Remove this NPC?</div>
                </q-card-section>
                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                    @click="closeDialog"
                  />
                  <q-btn
                    flat
                    label="Remove"
                    class="tw-text-red-600 dark:tw-text-red-400"
                    aria-label="Remove NPC"
                    @click="removeNpc"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-select
              v-model="tmpNpc.name"
              dense
              style="min-width: 120px; max-width: 120px"
              class="tw-my-auto tw-mr-2"
              outlined
              :options="npcList"
              label="NPCs"
              @update:model-value="changeActiveNpc(tmpNpc.name)"
            />
          </div>
          <q-btn flat dense aria-label="Clear npc" @click="npcs.clearNpc">CLEAR</q-btn>
        </div>
      </q-header>
      <q-page-container>
        <div class="tw-flex tw-flex-col tw-gap-4 tw-my-4 tw-mx-6">
          <div id="v-step-3" class="tw-flex tw-py-1">
            <q-btn
              v-if="npcs.getLocks.name"
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock name"
              @click="npcs.getLocks.name = false"
            />
            <q-btn
              v-else
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock name"
              @click="npcs.getLocks.name = true"
            />
            <q-input
              label="Name"
              v-model="npcs.getActiveNpc!.npc.name"
              class="tw-flex-grow"
              stack-label
              dense
              outlined
              :readonly="npcs.getLocks.name"
            />
            <q-btn
              class="tw-flex-none tw-my-auto tw-ml-2"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate name"
              @click="generateNamesNpc"
            />
            <span class="tw-mx-2" />
            <q-btn
              v-if="npcs.getLocks.nickname"
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock nickname"
              @click="npcs.getLocks.nickname = false"
            />
            <q-btn
              v-else
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock nickname"
              @click="npcs.getLocks.nickname = true"
            />
            <q-input
              label="Nickname"
              v-model="npcs.getActiveNpc!.npc.nickname"
              class="tw-flex-grow"
              stack-label
              dense
              outlined
              :readonly="npcs.getLocks.nickname"
            />
            <q-btn
              class="tw-flex-none tw-my-auto tw-ml-2"
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
          <div class="tw-flex tw-py-1">
            <q-btn
              v-if="npcs.getLocks.gender"
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock gender"
              @click="npcs.getLocks.gender = false"
            />
            <q-btn
              v-else
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock gender"
              @click="npcs.getLocks.gender = true"
            />
            <q-input
              label="Gender"
              v-model="npcs.getActiveNpc!.npc.gender"
              class="tw-flex-grow"
              stack-label
              dense
              outlined
              :readonly="npcs.getLocks.gender"
            />
            <q-btn
              class="tw-flex-none tw-my-auto tw-ml-2"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate gender"
              @click="generateParameterNpc('gender')"
            />
            <span class="tw-mx-2" />
            <q-btn
              v-if="npcs.getLocks.ancestry"
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock ancestry"
              @click="npcs.getLocks.ancestry = false"
            />
            <q-btn
              v-else
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock ancestry"
              @click="npcs.getLocks.ancestry = true"
            />
            <q-input
              label="Ancestry"
              v-model="npcs.getActiveNpc!.npc.ancestry"
              class="tw-flex-grow"
              stack-label
              dense
              outlined
              :readonly="npcs.getLocks.ancestry"
            />
            <q-btn
              class="tw-flex-none tw-my-auto tw-ml-2"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate ancestry"
              @click="generateParameterNpc('ancestry')"
            />
          </div>
          <div class="tw-flex tw-py-1">
            <q-btn
              v-if="npcs.getLocks.class"
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock class"
              @click="npcs.getLocks.class = false"
            />
            <q-btn
              v-else
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock class"
              @click="npcs.getLocks.class = true"
            />
            <q-input
              label="Class"
              v-model="npcs.getActiveNpc!.npc.class"
              class="tw-flex-grow"
              stack-label
              dense
              outlined
              :readonly="npcs.getLocks.class"
            />
            <q-btn
              class="tw-flex-none tw-my-auto tw-ml-2"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate class"
              @click="generateParameterNpc('class')"
            />
            <span class="tw-mx-2" />
            <q-btn
              v-if="npcs.getLocks.job"
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock job"
              @click="npcs.getLocks.job = false"
            />
            <q-btn
              v-else
              class="tw-flex-none tw-my-auto tw-mr-2"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock job"
              @click="npcs.getLocks.job = true"
            />
            <q-input
              label="Job"
              v-model="npcs.getActiveNpc!.npc.job"
              class="tw-flex-grow"
              stack-label
              multiple
              dense
              outlined
              :readonly="npcs.getLocks.job"
            />
            <q-btn
              class="tw-flex-none tw-my-auto tw-ml-2"
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
          <div class="tw-flex tw-flex-col tw-mb-3">
            <span class="tw-ml-12 tw-text-gray-800 dark:tw-text-gray-200"> Level: </span>
            <div class="tw-flex">
              <q-btn
                v-if="npcs.getLocks.level"
                class="tw-flex-none tw-my-auto tw-mr-2"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock level"
                @click="npcs.getLocks.level = false"
              />
              <q-btn
                v-else
                class="tw-flex-none tw-my-auto tw-mr-2"
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock level"
                @click="npcs.getLocks.level = true"
              />
              <q-slider
                v-model="npcs.getActiveNpc!.npc.level"
                class="tw-mx-1"
                markers
                label-always
                switch-label-side
                aria-label="Filter level"
                role="menuitem"
                :min="0"
                :max="20"
                :readonly="npcs.getLocks.level"
              />
              <q-btn
                class="tw-flex-none tw-my-auto tw-ml-2"
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
        <q-separator class="tw-my-2 tw-mx-6" style="height: 2px" />
        <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-my-4 tw-mx-6">
          <div id="v-step-4" class="tw-py-1 tw-mr-2">
            <q-input
              v-model="npcs.getActiveNpc!.npc.description"
              class="tw-mx-auto"
              outlined
              dense
              autogrow
              label="Description"
              type="textarea"
            />
          </div>
          <div class="tw-py-1 tw-ml-2">
            <q-input
              v-model="npcs.getActiveNpc!.npc.personality"
              class="tw-mx-auto"
              outlined
              dense
              autogrow
              label="Personality"
              type="textarea"
            />
          </div>
          <div class="tw-py-1 tw-mr-2">
            <q-input
              label="Languages"
              v-model="npcs.getActiveNpc!.npc.languages"
              class="tw-mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw-py-1 tw-ml-2">
            <q-input
              label="Quirks"
              v-model="npcs.getActiveNpc!.npc.quirk"
              class="tw-mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw-py-1 tw-mr-2">
            <q-input
              label="Relationships"
              v-model="npcs.getActiveNpc!.npc.relationships"
              class="tw-mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw-py-1 tw-ml-2">
            <q-input
              label="Ideology"
              v-model="npcs.getActiveNpc!.npc.ideology"
              class="tw-mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
        </div>
      </q-page-container>
    </q-layout>
  </div>
</template>
