<script setup lang="ts">
import { biBoxArrowUpRight } from '@quasar/extras/bootstrap-icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { npcStore } from 'src/stores/npc';
import { settingsStore } from 'src/stores/settings';

import type { games } from 'src/types/filters';

const npcs = npcStore();
const settings = settingsStore();

const currentGame = ref<games>(settings.game === 'sf' ? 'sf' : 'pf');
const currentFont = ref(currentGame.value === 'sf' ? 'Orbitron Bold' : 'Good Pro Condensed');

const router = useRouter();

const openNpcSheet = (id: number) => {
  const routeData = router.resolve({
    name: 'character',
    query: { game: currentGame.value, id: id }
  });
  if (process.env.IS_APP === 'true') {
    globalThis.open(routeData.href, '_self');
  } else {
    globalThis.open(routeData.href, '_blank');
  }
};
</script>

<template>
  <div class="npc-sheet q-pa-md tw:w-full tw:md:w-[33%]">
    <div
      id="v-step-7"
      class="tw:opacity-85 tw:dark:opacity-90 tw:items-center tw:text-left tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700 hide-print"
    >
      <q-scroll-area style="height: calc(100vh - 128px)">
        <div class="q-gutter-y-xs tw:p-4 show-print">
          <div
            class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
            :style="'font-family: ' + currentFont + ', sans-serif; font-variant-caps: small-caps'"
          >
            <div class="tw:my-auto!">
              <q-btn
                :icon="biBoxArrowUpRight"
                flat
                round
                dense
                size="sm"
                padding="sm"
                class="tw:mr-1! only-screen character-page-element"
                aria-label="Open NPC sheet"
                @click="openNpcSheet(npcs.activeNpc)"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Open NPC sheet
                </q-tooltip>
              </q-btn>
            </div>
            <span class="tw:my-auto">
              <span v-if="npcs.npcs[npcs.activeNpc]!.npc.name" class="tw:leading-8 tw:my-auto">
                {{ npcs.npcs[npcs.activeNpc]!.npc.name }}
              </span>
              <span v-if="npcs.npcs[npcs.activeNpc]!.npc.nickname" class="tw:leading-8 tw:my-auto">
                {{ '&nbsp;"' + npcs.npcs[npcs.activeNpc]!.npc.nickname + '"' }}
              </span>
            </span>
            <q-space />
            <div class="tw:ml-4 tw:my-1">NPC {{ npcs.npcs[npcs.activeNpc]!.npc.level }}</div>
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.gender"
              class="tw:bg-[#6d5f9d] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ npcs.npcs[npcs.activeNpc]!.npc.gender!.toUpperCase() }}
            </div>
            <div
              v-if="
                (!npcs.npcs[npcs.activeNpc]!.culture || currentGame === 'sf') &&
                npcs.npcs[npcs.activeNpc]!.npc.ancestry
              "
              class="tw:bg-[#28765d] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ npcs.npcs[npcs.activeNpc]!.npc.ancestry!.toUpperCase() }}
            </div>
            <div
              v-if="
                currentGame === 'pf' &&
                npcs.npcs[npcs.activeNpc]!.culture &&
                npcs.npcs[npcs.activeNpc]!.npc.culture
              "
              class="tw:bg-[#28765d] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ npcs.npcs[npcs.activeNpc]!.npc.culture!.toUpperCase() }}
            </div>
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.class"
              class="tw:bg-[#820d00] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ npcs.npcs[npcs.activeNpc]!.npc.class!.toUpperCase() }}
            </div>
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.job"
              class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ npcs.npcs[npcs.activeNpc]!.npc.job!.toUpperCase() }}
            </div>
          </div>
          <div
            v-if="npcs.npcs[npcs.activeNpc]!.npc.languages"
            class="tw:text-base tw:text-gray-800 tw:dark:text-white"
          >
            <strong>Languages </strong>
            {{ npcs.npcs[npcs.activeNpc]!.npc.languages }}
          </div>
          <div
            v-if="npcs.npcs[npcs.activeNpc]!.npc.quirk"
            class="tw:text-base tw:text-gray-800 tw:dark:text-white"
          >
            <strong>Quirks </strong>
            {{ npcs.npcs[npcs.activeNpc]!.npc.quirk }}
          </div>
          <q-separator
            v-if="
              (npcs.npcs[npcs.activeNpc]!.npc.languages || npcs.npcs[npcs.activeNpc]!.npc.quirk) &&
              (npcs.npcs[npcs.activeNpc]!.npc.description ||
                npcs.npcs[npcs.activeNpc]!.npc.personality ||
                npcs.npcs[npcs.activeNpc]!.npc.relationships ||
                npcs.npcs[npcs.activeNpc]!.npc.ideology)
            "
            class="tw:my-2!"
            style="height: 2px"
          />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.description"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
            >
              <strong>Description </strong>
              {{ npcs.npcs[npcs.activeNpc]!.npc.description }}
            </div>
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.personality"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
            >
              <strong>Personality </strong>
              {{ npcs.npcs[npcs.activeNpc]!.npc.personality }}
            </div>
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.relationships"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
            >
              <strong>Relationships </strong>
              {{ npcs.npcs[npcs.activeNpc]!.npc.relationships }}
            </div>
            <div
              v-if="npcs.npcs[npcs.activeNpc]!.npc.ideology"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
            >
              <strong>Ideology </strong>
              {{ npcs.npcs[npcs.activeNpc]!.npc.ideology }}
            </div>
          </div>
          <q-separator
            v-if="
              (npcs.npcs[npcs.activeNpc]!.npc.languages ||
                npcs.npcs[npcs.activeNpc]!.npc.quirk ||
                npcs.npcs[npcs.activeNpc]!.npc.description ||
                npcs.npcs[npcs.activeNpc]!.npc.personality ||
                npcs.npcs[npcs.activeNpc]!.npc.relationships ||
                npcs.npcs[npcs.activeNpc]!.npc.ideology) &&
              (npcs.npcs[npcs.activeNpc]!.npc.custom_fields.some((item) => item.name) ||
                npcs.npcs[npcs.activeNpc]!.npc.custom_fields.some((item) => item.body))
            "
            class="tw:my-2!"
            style="height: 2px"
          />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div v-for="(item, index) in npcs.npcs[npcs.activeNpc]!.npc.custom_fields" :key="index">
              <div v-if="item" class="tw:text-base tw:text-gray-800 tw:dark:text-white">
                <strong>{{ item.name }} </strong>
                {{ item.body }}
              </div>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style lang="scss">
.npc-sheet {
  min-height: calc(100vh - 96px) !important;
  font-family: 'Good Pro', sans-serif;
}

.character-page {
  .character-page-element {
    display: none !important;
  }
}
</style>
