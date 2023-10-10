<script setup lang="ts">
import { ref } from 'vue';
import { encounterStore } from 'stores/store';

const cost = ref(160);
const encounter = encounterStore();
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-1/4">
    <q-list
      bordered
      separator
      class="tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: 80vh"
    >
      <q-item-label
        header
        class="text-subtitle1 font-bold tw-py-2.5 tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800"
        ><div class="row no-wrap items-center">
          Encounter cost: {{ cost }}
          <q-space />
          <q-btn flat dense @click="encounter.clearEncounter">CLEAR</q-btn>
        </div></q-item-label
      >
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <q-virtual-scroll :items="encounter.getEncounter" separator v-slot="{ item, index }">
        <q-item :key="index" dense>
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
                class="q-px-sm"
                icon="bi-trash"
                aria-label="Clear creature"
                @click="encounter.clearCreature(item)"
              />
            </div>
          </div>
        </q-item>
      </q-virtual-scroll>
    </q-list>
  </div>
</template>
