<script setup lang="ts">
import { matPrint, matPriorityHigh } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { isNull } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { requestHazardId } from 'src/api/encounter-api-calls';
import EncounterSheet from 'src/components/encounter/EncounterSheet.vue';
import { encounterStore } from 'src/stores/encounter';
import { settingsStore } from 'src/stores/settings';

import type { games } from 'src/types/filters';
import type { hazard } from 'src/types/hazard';

const title = ref('Hazard Sheet - BYBE');

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/hazard'
    }
  ]
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const encounters = encounterStore();
const settings = settingsStore();

const currentGame = ref<games>(settings.getGame === 'sf' ? 'sf' : 'pf');

const hazardId = Number(route.query.id);

let hazardData: hazard | undefined;
try {
  if (hazardId !== undefined && !Number.isNaN(hazardId)) {
    hazardData = await requestHazardId(currentGame.value, hazardId);
    if (isNull(hazardData) || hazardData === undefined) {
      console.error('Missing hazard ID');
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing hazard ID',
        icon: matPriorityHigh
      });
      await router.push({ name: 'encounter', query: { game: currentGame.value } });
    } else {
      title.value = hazardData?.core_hazard.essential.name + ' - BYBE';
      encounters.setSelectedHazard(hazardData);
    }
  } else {
    console.error('Invalid hazard ID');
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Invalid hazard ID',
      icon: matPriorityHigh
    });
    await router.push({ name: 'encounter', query: { game: currentGame.value } });
  }
} catch (error) {
  console.error(error);
}

const printPage = () => {
  globalThis.print();
};
</script>

<template>
  <EncounterSheet class="tw:mx-auto encounter-page q-pa-md tw:w-full tw:md:w-228" />
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw:z-10 only-screen tw:opacity-85"
  >
    <q-btn
      fab
      :icon="matPrint"
      color="primary"
      aria-label="Print hazard sheet"
      @click="printPage"
    />
  </q-page-sticky>
</template>
