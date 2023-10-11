<script setup lang="ts">
import { ref } from 'vue';
import { encounterStore } from 'stores/store';

const cost = ref(160);
const encounter = encounterStore();
const progress = ref(0.4);
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-1/4">
    <div
      style="height: 80vh"
      class="tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <div class="tw-flex tw-mx-4 tw-my-0.5">
        <div
          class="text-subtitle1 font-bold tw-whitespace-nowrap tw-py-2.5 tw-pr-4 tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800"
        >
          Encounter cost: {{ cost }}
        </div>
        <q-space />
        <q-btn flat dense @click="encounter.clearEncounter">CLEAR</q-btn>
      </div>
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <q-scroll-area visible style="height: calc(100% - 106px)">
        <div v-for="(item, index) in encounter.getEncounter" :key="index" dense>
          <div class="tw-flex tw-grow tw-flex-wrap">
            <div class="tw-flex-initial tw-w-12 tw-my-auto tw-mr-2">
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
            <div class="tw-flex-1 tw-grow tw-my-auto tw-mr-2">
              {{ item.quantity }} {{ item.name }}
            </div>
            <div class="tw-flex-initial tw-my-auto tw-mr-2">
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
            <div class="tw-flex-initial tw-my-auto">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-sm tw-mr-3"
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
      <div class="tw-flex tw-mx-4 tw-my-0.5">
        <q-linear-progress rounded size="16px" :value="progress" color="negative" class="tw-my-4" />
      </div>
    </div>
  </div>
</template>
