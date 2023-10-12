<script setup lang="ts">
import debounce from 'lodash-es/debounce';
import { ref, watch } from 'vue';
import { partyStore, encounterStore, infoStore } from 'stores/store';
import { encounterInfo } from 'src/utils/api-calls';

const party = partyStore();
const encounter = encounterStore();
const info = infoStore();

const barFill = ref(1);

/*
const barValue = (xp: number, xpLevels: number[]) => {
  const xpIndex = xpLevels.indexOf(xp);
  if (xpIndex === xpLevels.length) {
  }
  const high = xpLevels[xpIndex + 1];
  const low = xpLevels[xpIndex - 1];
  return (xp - low) / (high - low);
};
*/

const debouncedCall = debounce(async function () {
  const encounterList = encounter.getEncounter;
  const enemyLevels: number[] = [];
  for (var i = 0; i < encounterList.length; i++) {
    for (var j = 0; j < encounterList[i].quantity!; j++) {
      enemyLevels.push(encounterList[i].level);
      switch (encounterList[i].variant) {
        case 'weak':
          enemyLevels[i]--;
          break;
        case 'elite':
          enemyLevels[i]++;
          break;
        default:
          break;
      }
    }
  }
  const partyLevels = party.getParty;
  const post = {
    enemy_levels: enemyLevels,
    party_levels: partyLevels
  };
  try {
    info.setInfo(await encounterInfo(post));
  } catch (error) {
    console.debug(error);
  }

  /*
  const xpLevels = Object.values(info.encounter_exp_levels).filter(
    (value) => typeof value === 'number'
  ) as number[];
  xpLevels.sort((a, b) => a - b);

  barFill.value = barValue(info.experience, xpLevels); */
}, 500);

watch(encounter, () => {
  debouncedCall();
});

watch(party, () => {
  debouncedCall();
});
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-1/4">
    <div
      style="height: 85vh"
      class="tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <div class="tw-flex tw-mx-4 tw-my-0.5">
        <div
          class="text-subtitle1 font-bold tw-whitespace-nowrap tw-py-2.5 tw-pr-4 tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800"
        >
          Encounter cost: {{ info.getInfo.experience }} XP
        </div>
        <q-space />
        <q-btn flat dense @click="encounter.clearEncounter">CLEAR</q-btn>
      </div>
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <q-scroll-area visible style="height: calc(100% - 106px)">
        <div v-for="(item, index) in encounter.getEncounter" :key="index" dense>
          <div class="tw-flex tw-grow tw-flex-wrap justify-end">
            <div class="tw-flex-initial tw-w-12 tw-my-auto tw-mx-1">
              <q-btn
                unelevated
                :ripple="false"
                size="xs"
                icon="add"
                aria-label="Add creature"
                @click="encounter.addToEncounter(item, index)"
              />
              <q-btn
                unelevated
                :ripple="false"
                size="xs"
                icon="remove"
                aria-label="Remove creature"
                @click="encounter.removeFromEncounter(index)"
              />
            </div>
            <div class="tw-flex-1 tw-my-auto tw-mx-1" style="min-width: 100px">
              {{ item.quantity }} {{ item.name }}
            </div>
            <div class="tw-flex-initial tw-my-auto tw-mx-1">
              <q-btn-group unelevated flat spread>
                <q-btn
                  flat
                  label="Weak"
                  size="15px"
                  :color="item.variant === 'weak' ? 'positive' : 'grey-4'"
                  padding="xs"
                  class="text-weight-bold"
                  @click="encounter.changeVariant(index, 'weak')"
                />
                <q-btn
                  flat
                  label="Base"
                  size="15px"
                  :color="item.variant === 'base' ? 'primary' : 'grey-4'"
                  padding="xs"
                  class="text-weight-bold"
                  @click="encounter.changeVariant(index, 'base')"
                />
                <q-btn
                  flat
                  label="Elite"
                  size="15px"
                  :color="item.variant === 'elite' ? 'negative' : 'grey-4'"
                  padding="xs"
                  class="text-weight-bold"
                  @click="encounter.changeVariant(index, 'elite')"
                />
              </q-btn-group>
            </div>
            <div class="tw-flex-initial tw-my-auto tw-ml-1 tw-mr-3">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-sm"
                icon="bi-trash"
                aria-label="Clear creature"
                @click="encounter.clearCreature(item)"
              />
            </div>
          </div>
          <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
        </div>
      </q-scroll-area>
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <div class="tw-flex tw-mx-4 tw-my-2">
        <q-linear-progress
          rounded
          size="35px"
          :value="barFill"
          :color="info.getInfo.color"
          aria-label="Encounter difficulty"
        >
          <div class="absolute-full flex flex-center">
            <q-badge
              class="tw-absolute tw-text-base"
              transparent
              color="grey-10"
              text-color="white"
              :label="info.getInfo.difficulty"
            />
          </div>
        </q-linear-progress>
      </div>
    </div>
  </div>
</template>
