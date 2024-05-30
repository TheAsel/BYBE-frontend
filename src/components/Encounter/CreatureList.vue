<script setup lang="ts">
import { ref, watch } from 'vue';
import { biPlus, biDash, biTrash, biPlusLg } from '@quasar/extras/bootstrap-icons';
import { debounce } from 'lodash';
import { partyStore, encounterStore, infoStore } from 'stores/store';
import { encounterInfo } from 'src/utils/api-calls';
import type { encounterList } from 'src/types/encounter';

const party = partyStore();
const encounter = encounterStore();
const info = infoStore();

const newEncounterDialog = ref(false);
const encounterNameInput = ref();
const newEncounterName = ref('');

const removeEncounterDialog = ref(false);

const tmpEncounter = ref<encounterList>(encounter.getActiveEncounter);
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
          enemyLevels.push(creature.level - 1);
          break;
        case 'Elite':
          enemyLevels.push(creature.level + 1);
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
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-[27%]">
    <div
      style="height: calc(100vh - 135px)"
      class="tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
      id="v-step-6"
    >
      <div class="tw-flex tw-mx-4 tw-my-0.5">
        <div
          class="text-subtitle1 font-bold tw-whitespace-nowrap tw-py-2.5 tw-pr-4 tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800"
        >
          Cost: {{ info.getInfo.experience }} XP
        </div>
        <q-space />
        <q-btn
          class="tw-my-auto tw-ml-2 tw-p-2"
          :icon="biPlusLg"
          size="sm"
          flat
          rounded
          dense
          aria-label="Add new encounter"
          @click="newEncounterDialog = true"
        />
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
                dense
                v-model="newEncounterName"
                autofocus
                @keyup.enter="addEncounter"
                :rules="[
                  (val) => !!val || 'Field is required',
                  (val) =>
                    !encounters.find((name) => name === val) || 'This encounter already exists'
                ]"
                :no-error-icon="true"
              />
            </q-card-section>

            <q-card-actions align="center" class="text-primary">
              <q-btn
                flat
                label="Cancel"
                @click="closeDialog"
                class="tw-text-blue-600 dark:tw-text-blue-400"
                aria-label="Close dialog"
              />
              <q-btn
                flat
                label="Add encounter"
                @click="addEncounter"
                class="tw-text-blue-600 dark:tw-text-blue-400"
                aria-label="Add encounter"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-btn
          class="tw-my-auto tw-mx-2 tw-p-2"
          :icon="biTrash"
          size="sm"
          flat
          rounded
          dense
          aria-label="Remove current encounter"
          @click="removeEncounterDialog = true"
        />
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
                @click="closeDialog"
                class="tw-text-blue-600 dark:tw-text-blue-400"
                aria-label="Close dialog"
              />
              <q-btn
                flat
                label="Remove"
                @click="removeEncounter"
                class="tw-text-red-600 dark:tw-text-red-400"
                aria-label="Remove encounter"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-select
          dense
          style="min-width: 120px; max-width: 120px"
          class="tw-my-auto tw-mr-2"
          outlined
          v-model="tmpEncounter.name"
          :options="encounters"
          label="Encounters"
          @update:model-value="changeActiveEncounter(tmpEncounter.name)"
        />
        <q-btn flat dense @click="encounter.clearEncounter" aria-label="Clear encounter"
          >CLEAR</q-btn
        >
      </div>
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <q-scroll-area
        v-if="encounter.getGenerating == false"
        visible
        style="height: calc(100% - 103px)"
      >
        <div v-for="(item, index) in encounter.getActiveEncounter.creatures" :key="index">
          <div class="tw-flex tw-grow tw-flex-wrap justify-end">
            <div class="tw-flex-initial tw-w-12 tw-my-auto tw-mx-1">
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
            <div class="tw-flex-1 tw-my-auto tw-mx-1" style="min-width: 100px">
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
            </div>
            <div class="tw-flex-initial tw-my-auto tw-mx-1">
              <q-btn-group unelevated flat spread>
                <q-btn
                  flat
                  label="Weak"
                  size="15px"
                  :color="item.variant === 'Weak' ? 'positive' : 'grey-4'"
                  padding="xs"
                  class="text-weight-bold"
                  @click="encounter.changeVariant(index, 'Weak')"
                />
                <q-btn
                  flat
                  label="Base"
                  size="15px"
                  :color="item.variant === 'Base' ? 'primary' : 'grey-4'"
                  padding="xs"
                  class="text-weight-bold"
                  @click="encounter.changeVariant(index, 'Base')"
                />
                <q-btn
                  flat
                  label="Elite"
                  size="15px"
                  :color="item.variant === 'Elite' ? 'negative' : 'grey-4'"
                  padding="xs"
                  class="text-weight-bold"
                  @click="encounter.changeVariant(index, 'Elite')"
                />
              </q-btn-group>
            </div>
            <div class="tw-flex-initial tw-my-auto tw-ml-1 tw-mr-3">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-sm"
                :icon="biTrash"
                aria-label="Clear creature"
                @click="encounter.clearCreature(item)"
              />
            </div>
          </div>
          <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
        </div>
      </q-scroll-area>
      <div v-else class="tw-flex" style="height: calc(100% - 103px)">
        <div class="tw-m-auto">
          <q-spinner-gears class="tw-mx-auto" color="white" size="5em" />
        </div>
      </div>
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <div class="tw-flex tw-mx-4 tw-my-1.5">
        <q-linear-progress
          rounded
          size="35px"
          :value="1"
          :color="info.getInfo.color"
          aria-label="Encounter challenge"
          id="v-step-7"
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
    </div>
  </div>
</template>

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
