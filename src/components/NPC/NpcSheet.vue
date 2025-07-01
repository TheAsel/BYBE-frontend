<script setup lang="ts">
import { npcStore } from '../../stores/store';
import { biBoxArrowUpRight } from '@quasar/extras/bootstrap-icons';
import { useRouter } from 'vue-router';

const npcs = npcStore();

const router = useRouter();

const openNpcSheet = (id: number) => {
  const routeData = router.resolve({ name: 'character', query: { id: id } });
  if (process.env.IS_APP === 'true') {
    window.open(routeData.href, '_self');
  } else {
    window.open(routeData.href, '_blank');
  }
};
</script>

<template>
  <div class="npc-sheet q-pa-md tw-w-full md:tw-w-[33%]">
    <div
      id="v-step-4"
      class="tw-opacity-85 dark:tw-opacity-90 tw-items-center tw-text-left tw-rounded-xl tw-border tw-bg-white tw-border-gray-200 dark:tw-bg-gray-800 dark:tw-border-gray-700 hide-print"
    >
      <q-scroll-area style="height: calc(100vh - 124px)">
        <div class="q-gutter-y-xs tw-p-4 show-print">
          <div
            class="tw-flex tw-font-bold tw-text-2xl tw-text-gray-800 dark:tw-text-white"
            style="font-family: 'Good Pro Condensed', sans-serif"
          >
            <q-btn
              :icon="biBoxArrowUpRight"
              flat
              round
              dense
              size="sm"
              padding="sm"
              class="tw-mr-1 tw-my-auto only-screen character-page-element"
              aria-label="Open item sheet"
              @click="openNpcSheet(npcs.getActive)"
            >
              <q-tooltip
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Open item sheet
              </q-tooltip>
            </q-btn>
            <span class="tw-my-auto">
              <span v-if="npcs.getActiveNpc!.npc.name" class="tw-leading-8 tw-my-auto">
                {{ npcs.getActiveNpc!.npc.name.toUpperCase() }}
              </span>
              <span v-if="npcs.getActiveNpc!.npc.nickname" class="tw-leading-8 tw-my-auto">
                {{ '&nbsp;"' + npcs.getActiveNpc!.npc.nickname.toUpperCase() + '"' }}
              </span>
            </span>
            <q-space />
            <div class="tw-my-1">NPC</div>
          </div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw-flex tw-flex-wrap tw-font-bold tw-text-sm tw-text-white">
            <div
              v-if="npcs.getActiveNpc!.npc.gender"
              class="tw-bg-[#6d5f9d] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ npcs.getActiveNpc!.npc.gender.toUpperCase() }}
            </div>
            <div
              v-if="npcs.getActiveNpc!.npc.ancestry"
              class="tw-bg-[#28765d] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ npcs.getActiveNpc!.npc.ancestry.toUpperCase() }}
            </div>
            <div
              v-if="npcs.getActiveNpc!.npc.class"
              class="tw-bg-[#820d00] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ npcs.getActiveNpc!.npc.class.toUpperCase() }}
            </div>
            <div
              v-if="npcs.getActiveNpc!.npc.job"
              class="tw-bg-[#522e2c] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ npcs.getActiveNpc!.npc.job.toUpperCase() }}
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style lang="scss">
.npc-sheet {
  min-height: calc(100vh - 92px) !important;
  font-family: 'Good Pro', sans-serif;
}

.character-page {
  .character-page-element {
    display: none !important;
  }
}
</style>
