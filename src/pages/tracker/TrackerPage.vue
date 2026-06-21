<script setup lang="ts">
import { useHead } from "@unhead/vue";

import TrackerSheet from "@/components/tracker/TrackerSheet.vue";
import TrackerDashboard from "@/components/tracker/TrackerDashboard.vue";
import TrackerList from "@/components/tracker/TrackerList.vue";

useHead({
  link: [
    {
      href: "https://bybe.app/tracker",
      rel: "canonical"
    }
  ],
  title: "Tracker - BYBE"
});
</script>

<template>
  <q-page
    id="pageRef"
    class="tw:h-full row items-center justify-between tw:overflow-auto"
  >
    <TrackerList />
    <TrackerDashboard
      class="tw:md:w-[46%] tw:py-0! tw:md:py-4! tw:pl-4! tw:md:pl-0!"
    />
    <TrackerSheet
      class="tw:md:w-[27%] tw:p-4! tw:md:px-0 tw:md:py-4 tw:w-full"
    />
  </q-page>
</template>
