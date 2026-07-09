<script setup lang="ts">
import { matPrint, matPriorityHigh } from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { requestHazardId } from "@/api/encounter-api-calls";
import EncounterSheet from "@/components/encounter/EncounterSheet.vue";
import { encounterStore } from "@/stores/encounter";
import { settingsStore } from "@/stores/settings";

import type { hazard } from "@/types/hazard";

const title = ref("Hazard Sheet - BYBE");

useHead({
  link: [
    {
      href: "https://bybe.app/hazard",
      rel: "canonical"
    }
  ],
  title
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const encounters = encounterStore();
const settings_store = settingsStore();

const hazardId = Number(route.query.id);

let hazardData: hazard | null;
try {
  if (hazardId && !Number.isNaN(hazardId)) {
    hazardData = await requestHazardId(settings_store.game, hazardId);
    if (hazardData === null) {
      console.error("Missing hazard ID");
      $q.notify({
        icon: matPriorityHigh,
        message: "Missing hazard ID",
        progress: true,
        type: "warning"
      });
      await router.push({
        name: "encounter",
        query: { game: settings_store.game }
      });
    } else {
      title.value = `${hazardData?.core_hazard.essential.name} - BYBE`;
      encounters.setSelectedHazard(hazardData);
    }
  } else {
    console.error("Invalid hazard ID");
    $q.notify({
      icon: matPriorityHigh,
      message: "Invalid hazard ID",
      progress: true,
      type: "warning"
    });
    await router.push({
      name: "encounter",
      query: { game: settings_store.game }
    });
  }
} catch (error) {
  console.error(error);
}

const printPage = (): void => {
  globalThis.print();
};
</script>

<template>
  <EncounterSheet
    class="tw:mx-auto encounter-page q-pa-md tw:w-full tw:md:w-228"
  />
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
