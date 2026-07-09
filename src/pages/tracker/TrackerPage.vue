<script setup lang="ts">
import {
  matArrowDownward,
  matArrowUpward
} from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { onMounted, onUnmounted, ref } from "vue";

import TrackerSheet from "@/components/tracker/TrackerSheet.vue";
import TrackerDashboard from "@/components/tracker/TrackerDashboard.vue";
import TrackerList from "@/components/tracker/TrackerList.vue";
import { getScreenWidth, scrollDirection, scrollPage } from "@/utils/screen";

useHead({
  link: [
    {
      href: "https://bybe.app/tracker",
      rel: "canonical"
    }
  ],
  title: "Tracker - BYBE"
});

const { width } = getScreenWidth();
const scrollUp = ref(false);
const pageRef = ref<HTMLElement | null>(null);

const updateScrollUp = (): void => {
  scrollUp.value = scrollDirection(pageRef.value);
};

onMounted(() => {
  pageRef.value = document.querySelector("#pageRef")!;
  if (pageRef.value !== null) {
    pageRef.value.addEventListener("scroll", updateScrollUp);
  }
});

onUnmounted(() => {
  if (pageRef.value !== null) {
    pageRef.value.removeEventListener("scroll", updateScrollUp);
  }
});
</script>

<template>
  <q-page
    id="pageRef"
    class="tw:h-full row items-center justify-between tw:overflow-auto"
  >
    <TrackerList class="tw:h-full tw:w-full tw:md:w-[36.5%] tw:p-4" />
    <TrackerDashboard
      class="tw:h-full tw:w-full tw:md:w-[36.5%] tw:py-0! tw:md:py-4! tw:px-4! tw:md:px-0!"
    />
    <TrackerSheet
      class="tw:h-full tw:w-full tw:md:w-[27%] tw:p-4! tw:md:px-0 tw:md:py-4"
    />
    <q-page-sticky
      v-if="width < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw:z-10 tw:opacity-85 only-screen"
    >
      <q-btn
        fab
        :icon="scrollUp ? matArrowUpward : matArrowDownward"
        padding="sm"
        color="primary"
        @click="scrollPage(pageRef, scrollUp)"
      />
    </q-page-sticky>
  </q-page>
</template>
