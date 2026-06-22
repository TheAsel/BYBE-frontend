<script setup lang="ts">
import { trackerStore } from "@/stores/tracker";
import { computed } from "vue";

const tracker_store = trackerStore();

const detailedElement = computed(
  () => tracker_store.trackerList.list[tracker_store.trackerList.detail_index]
);
</script>

<template>
  <q-page class="tw:h-full">
    <div
      class="tw:h-full tw:text-center tw:opacity-85 tw:dark:opacity-90 tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700"
    >
      <div v-if="detailedElement !== undefined" class="tw:h-full">
        <span v-if="detailedElement.is_player">
          {{ detailedElement.element }}
        </span>
        <span v-else>
          {{
            !detailedElement.element.is_hazard &&
            (detailedElement.element.variant === "Elite" ||
              detailedElement.element.variant === "Weak")
              ? detailedElement.element.variant + " "
              : ""
          }}{{ detailedElement.element.name }}
        </span>
      </div>
    </div>
  </q-page>
</template>
