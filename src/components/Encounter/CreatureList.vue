<script setup lang="ts">
import { ref, watch } from 'vue';
import { biPlus, biDash, biTrash, biPlusLg } from '@quasar/extras/bootstrap-icons';
import { fasScroll } from '@quasar/extras/fontawesome-v6';
import { debounce } from 'lodash-es';
import { partyStore, encounterStore, infoStore, settingsStore } from 'stores/store';
import { encounterInfo } from 'src/utils/encounter-api-calls';
import type { encounter_list } from 'src/types/encounter';
import { useRouter } from 'vue-router';

const router = useRouter();

const settings = settingsStore();
const party = partyStore();
const encounter = encounterStore();
const info = infoStore();

const newEncounterDialog = ref(false);
const encounterNameInput = ref();
const newEncounterName = ref('');

const removeEncounterDialog = ref(false);

const tmpEncounter = ref<encounter_list>(encounter.getActiveEncounter);
const encounters = ref<string[]>(encounter.getEncounters.map((encounter) => encounter.name));

tmpEncounter.value = {
  name: encounter.getActiveEncounter.name,
  creatures: encounter.getActiveEncounter.creatures
};

const debouncedCall = debounce(async function () {
  const encounterList = encounter.getActiveEncounter.creatures;
  const enemyLevels: number[] = [];
  for (const creature of encounterList) {
    for (let j = 0; j < creature.quantity!; j++) {
      switch (creature.variant) {
        case 'Weak':
          if (creature.level === 1) {
            enemyLevels.push(creature.level - 2);
          } else {
            enemyLevels.push(creature.level - 1);
          }
          break;
        case 'Elite':
          if (creature.level === -1 || creature.level === 0) {
            enemyLevels.push(creature.level + 2);
          } else {
            enemyLevels.push(creature.level + 1);
          }
          break;
        default:
          enemyLevels.push(creature.level);
          break;
      }
    }
  }
  const partyLevels = party.getActiveParty.members;
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
  const post = {
    enemy_levels: enemyLevels,
    party_levels: partyLevels,
    is_pwl_on: is_pwl_on.value
  };
  try {
    if (!encounter.getGenerating) {
      const returnedEncounterInfo = await encounterInfo(post);
      if (typeof returnedEncounterInfo != 'undefined') {
        info.setInfo(returnedEncounterInfo);
      } else {
        throw new Error('Error calculating encounter challenge');
      }
    }
  } catch (error) {
    console.error(error);
  }
}, 300);

// get info on creature list change
watch(encounter, () => {
  tmpEncounter.value = {
    name: encounter.getActiveEncounter.name,
    creatures: encounter.getActiveEncounter.creatures
  };
  saveChanges();
  debouncedCall();
});

// get info on party change
watch(party, () => {
  debouncedCall();
});

// get info on page load
debouncedCall();

const closeDialog = () => {
  newEncounterDialog.value = false;
  removeEncounterDialog.value = false;
  newEncounterName.value = '';
};

const addEncounter = () => {
  encounterNameInput.value.validate();
  if (!encounterNameInput.value.hasError) {
    encounter.addEncounter(newEncounterName.value);
    encounters.value = encounter.getEncounters.map((encounter) => encounter.name);
    tmpEncounter.value = {
      name: encounter.getActiveEncounter.name,
      creatures: [...encounter.getActiveEncounter.creatures]
    };
    saveChanges();
    newEncounterName.value = '';
    newEncounterDialog.value = false;
  }
};

const removeEncounter = () => {
  encounter.removeEncounter();
  encounters.value = encounter.getEncounters.map((encounter) => encounter.name);
  tmpEncounter.value = {
    name: encounter.getActiveEncounter.name,
    creatures: [...encounter.getActiveEncounter.creatures]
  };
  saveChanges();
  removeEncounterDialog.value = false;
};

const changeActiveEncounter = (selected: string) => {
  encounter.changeActiveEncounter(encounter.getEncounterIndex(selected));
  tmpEncounter.value = {
    name: encounter.getActiveEncounter.name,
    creatures: [...encounter.getActiveEncounter.creatures]
  };
};

const saveChanges = () => {
  encounter.updateEncounter(tmpEncounter.value.name, tmpEncounter.value.creatures);
  localStorage.setItem('encounters', JSON.stringify(encounter.getEncounters));
};

const openCreatureSheet = (id: number) => {
  const routeData = router.resolve({ name: 'bestiary', query: { id: id } });
  window.open(routeData.href, '_blank');
};
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-[27%]">
    <q-layout
      id="v-step-6"
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
          <div
            class="text-subtitle1 font-bold tw-whitespace-nowrap tw-py-2.5 tw-pr-4 tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800"
          >
            Cost: {{ info.getInfo.experience }} XP
          </div>
          <q-space />
          <div class="tw-flex">
            <q-btn
              class="tw-my-auto tw-ml-2 tw-p-2"
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
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Add new encounter
              </q-tooltip>
            </q-btn>
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
                    :rules="[
                      (val) => !!val || 'Field is required',
                      (val) =>
                        !encounters.find((name) => name === val) || 'This encounter already exists'
                    ]"
                    :no-error-icon="true"
                    @keyup.enter="addEncounter"
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
                    label="Add encounter"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Add encounter"
                    @click="addEncounter"
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
              aria-label="Remove current encounter"
              @click="removeEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Delete encounter
              </q-tooltip>
            </q-btn>
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
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                    @click="closeDialog"
                  />
                  <q-btn
                    flat
                    label="Remove"
                    class="tw-text-red-600 dark:tw-text-red-400"
                    aria-label="Remove encounter"
                    @click="removeEncounter"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-select
              v-model="tmpEncounter.name"
              dense
              style="min-width: 120px; max-width: 120px"
              class="tw-my-auto tw-mr-2"
              outlined
              :options="encounters"
              label="Encounters"
              @update:model-value="changeActiveEncounter(tmpEncounter.name)"
            />
          </div>
          <q-btn flat dense aria-label="Clear encounter" @click="encounter.clearEncounter"
            >CLEAR</q-btn
          >
        </div>
      </q-header>
      <q-page-container v-if="encounter.getGenerating == false">
        <div v-for="(item, index) in encounter.getActiveEncounter.creatures" :key="index">
          <div class="tw-flex">
            <div class="tw-flex-none tw-w-12 tw-my-auto tw-mx-1">
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
            <div class="tw-flex tw-flex-row tw-flex-grow tw-flex-wrap">
              <div class="tw-flex-1 tw-my-auto tw-mx-1" style="min-width: 100px">
                <q-btn
                  v-if="settings.getCreatureSheets"
                  round
                  unelevated
                  :icon="fasScroll"
                  size="sm"
                  class="tw-mr-2"
                  target="_blank"
                  aria-label="Open creature sheet"
                  @click="openCreatureSheet(item.id)"
                >
                  <q-tooltip
                    class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Open creature sheet
                  </q-tooltip>
                </q-btn>
                <span class="tw-align-middle">
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
                      class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
                      >{{ item.name }}</span
                    >
                  </a>
                  <span v-else>{{ item.name }}</span>
                  — Lv. {{ item.level }}
                </span>
              </div>
              <div class="tw-flex-initial tw-my-auto tw-mx-1">
                <q-btn-group unelevated flat spread>
                  <q-btn
                    flat
                    label="Weak"
                    size="15px"
                    :class="
                      item.variant === 'Weak'
                        ? 'tw-text-green-500'
                        : 'dark:tw-text-gray-200 tw-text-gray-400'
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
                        ? 'tw-text-blue-500'
                        : 'dark:tw-text-gray-200 tw-text-gray-400'
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
                        ? 'tw-text-orange-500'
                        : 'dark:tw-text-gray-200 tw-text-gray-400'
                    "
                    padding="xs"
                    class="text-weight-bold"
                    @click="encounter.changeVariant(index, 'Elite')"
                  />
                </q-btn-group>
              </div>
            </div>
            <div class="tw-flex-initial tw-my-auto tw-ml-1 tw-mr-3">
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
          <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
        </div>
      </q-page-container>
      <q-page-container v-else class="tw-flex" style="height: 78vh">
        <div class="tw-m-auto">
          <q-spinner-gears class="tw-mx-auto tw-text-black dark:tw-text-white" size="5em" />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800 dark:!tw-border-gray-700"
      >
        <div class="tw-flex tw-mx-4 tw-my-1.5">
          <q-linear-progress
            id="v-step-7"
            rounded
            size="35px"
            :value="1"
            :color="info.getInfo.color"
            aria-label="Encounter challenge"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                class="tw-absolute tw-text-base"
                transparent
                color="grey-10"
                text-color="white"
                :label="'Challenge: ' + info.getInfo.challenge"
              />
            </div>
          </q-linear-progress>
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
