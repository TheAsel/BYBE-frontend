<script setup lang="ts">
import { ref } from 'vue';

const cost = ref(160);

const creatures = [
  { name: 'Kobold Warrior', level: -1, quantity: 4 },
  {
    name: 'Ancient Red Dragon',
    level: 19,
    quantity: 2
  },
  { name: 'Tarrasque', level: 25, quantity: 1 }
];
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-1/4">
    <q-list
      bordered
      separator
      class="tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: 80vh"
    >
      <q-item-label
        header
        class="text-subtitle1 font-bold tw-py-2.5 tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800"
        ><div class="row no-wrap items-center">
          Encounter cost: {{ cost }}
          <q-space />
          <q-btn flat dense>CLEAR</q-btn>
        </div></q-item-label
      >
      <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
      <q-scroll-area style="height: 100%">
        <q-item v-for="item in creatures" :key="item.name">
          <q-item-section>
            <div class="row no-wrap items-center">
              {{ item.quantity }} {{ item.name }} Lv. {{ item.level }}
              <q-space />
              <q-btn-group unelevated flat>
                <q-btn flat label="Weak" size="15px" color="grey" padding="xs" />
                <q-btn flat label="Base" size="15px" color="primary" padding="xs" />
                <q-btn flat label="Elite" size="15px" color="grey" padding="xs" />
              </q-btn-group>
            </div>
          </q-item-section>
        </q-item>
      </q-scroll-area>
    </q-list>
  </div>
</template>
