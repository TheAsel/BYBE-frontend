<script setup lang="ts">
import { matPrint, matPriorityHigh } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { isNull } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { settingsStore } from '../../stores/store';
import { requestHazardId } from '../../utils/encounter-api-calls';

import type { games } from '../../types/filters';
import type { hazard } from '../../types/hazard';

const title = ref('Hazard Sheet - BYBE');
const settings = settingsStore();

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/hazard'
    }
  ]
});

const currentGame = ref<games>(settings.getGame === 'sf' ? 'sf' : 'pf');

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

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

const pfActionSymbol = (num: number | null, action: string) => {
  if (num === 1 || num === 2 || num === 3) {
    return num;
  }
  if (action === 'free') {
    return 4;
  }
  if (action === 'reaction') {
    return 5;
  }
};

const cleanDescription = (description: string) => {
  const cleanRegex = /<\/?>|<hr ?\/>|@Localize\[.+\]/g;
  description = description.replace('<p>', '');
  description = description.replaceAll(cleanRegex, '');
  return description.replaceAll('<hr>', '<br>');
};

const actionTraitsString = (index: number) => {
  const traits = hazardData?.core_hazard.actions[index]?.traits;
  let finalString = '';
  if (traits !== undefined && traits.length > 0) {
    finalString += ' (';
    for (const trait of traits) {
      finalString += trait.toLowerCase().replaceAll('-', ' ') + ', ';
    }
    finalString = finalString.substring(0, finalString.length - 2);
    finalString += ')';
  }
  return finalString;
};

const printPage = () => {
  globalThis.print();
};
</script>

<template>
  <div
    class="hazard-sheet tw:opacity-85 tw:dark:opacity-90 q-pa-md tw:w-full tw:md:w-228! tw:mx-auto"
  >
    <div
      class="tw:items-center tw:text-left tw:max-w-220 tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700 hide-print"
    >
      <q-scroll-area style="height: calc(100vh - 128px)">
        <div class="q-gutter-y-xs tw:p-4 show-print">
          <div
            class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
            style="font-family: 'Good Pro Condensed', sans-serif; font-variant-caps: small-caps"
          >
            <a
              v-if="settings.getAonLinks && hazardData"
              class="tw:my-auto"
              :href="
                'https://2e.aonprd.com/search?q=' +
                encodeURIComponent(hazardData.core_hazard.essential.name) +
                ' type%3A(hazard)&type=eqs'
              "
              target="_blank"
              rel="noopener"
            >
              <h1
                class="tw:text-3xl! tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
              >
                {{ hazardData?.core_hazard.essential.name }}
              </h1>
            </a>
            <h1 v-else class="tw:text-3xl! tw:mr-4 tw:leading-8 tw:my-auto">
              {{ hazardData?.core_hazard.essential.name }}
            </h1>
            <q-space />
            <div class="tw:my-auto">
              HAZARD
              <span>{{ hazardData?.core_hazard.essential.level }}</span>
            </div>
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
            <div
              v-if="hazardData?.core_hazard.essential.rarity === 'Uncommon'"
              class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ hazardData?.core_hazard.essential.rarity.toUpperCase() }}
            </div>
            <div
              v-else-if="hazardData?.core_hazard.essential.rarity === 'Rare'"
              class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ hazardData?.core_hazard.essential.rarity.toUpperCase() }}
            </div>
            <div
              v-else-if="hazardData?.core_hazard.essential.rarity === 'Unique'"
              class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ hazardData?.core_hazard.essential.rarity.toUpperCase() }}
            </div>
            <div class="tw:bg-[#478c42] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1">
              {{ hazardData?.core_hazard.essential.size.toUpperCase() }}
            </div>
            <div
              v-if="hazardData?.core_hazard.essential.complexity === 'Complex'"
              class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              COMPLEX
            </div>
            <div
              v-for="item in hazardData?.core_hazard.traits"
              :key="item"
              class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ item.toUpperCase() }}
            </div>
          </div>
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div
              v-if="hazardData?.core_hazard.essential.source"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
            >
              <strong>Source </strong>
              <a
                :href="
                  'https://store.paizo.com/search.php?search_query=' +
                  encodeURIComponent(hazardData?.core_hazard.essential.source) +
                  '&section=product'
                "
                target="_blank"
                rel="noopener"
              >
                <i
                  class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
                >
                  {{ hazardData?.core_hazard.essential.source }}
                </i>
              </a>
            </div>
            <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
              <strong>Complexity </strong>
              {{ hazardData?.core_hazard.essential.complexity }}
            </div>
            <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
              <strong>Stealth</strong>
              DC {{ hazardData?.core_hazard.essential.stealth }}
              <span
                v-if="hazardData?.core_hazard.essential.stealth_detail"
                v-html="cleanDescription(hazardData?.core_hazard.essential.stealth_detail)"
              />
            </div>
            <div
              v-if="hazardData?.core_hazard.essential.description"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="
                '<strong>Description</strong> ' +
                cleanDescription(hazardData?.core_hazard?.essential.description)
              "
            />
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div
              v-if="hazardData?.core_hazard?.essential.disable_description"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="
                '<strong>Disable</strong> ' +
                cleanDescription(hazardData?.core_hazard?.essential.disable_description)
              "
            />
            <template
              v-for="(action, index) in hazardData?.core_hazard?.actions"
              :key="action.core_action.name"
            >
              <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
                <strong>{{ action.core_action.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl"
                  >{{
                    pfActionSymbol(action.core_action.n_of_actions, action.core_action.action_type)
                  }}
                </span>
                <span v-if="action.traits !== undefined && action.traits.length > 0">
                  {{ actionTraitsString(index) }}
                </span>
                <span v-html="' ' + cleanDescription(action.core_action.description)" />
              </div>
            </template>
          </div>
          <q-separator
            v-if="hazardData?.core_hazard.essential.routine_description"
            class="tw:my-2!"
            style="height: 2px"
          />
          <hr
            v-if="hazardData?.core_hazard.essential.routine_description"
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div
            v-if="hazardData?.core_hazard.essential.routine_description"
            class="tw:-indent-2 tw:pl-2 q-gutter-y-xs"
          >
            <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
              <span
                v-html="
                  '<p><strong>Routine</strong> ' +
                  cleanDescription(hazardData.core_hazard.essential.routine_description)
                "
              />
            </div>
          </div>
          <q-separator
            v-if="hazardData?.core_hazard?.essential.reset_description"
            class="tw:my-2!"
            style="height: 2px"
          />
          <hr
            v-if="hazardData?.core_hazard?.essential.reset_description"
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div
            v-if="hazardData?.core_hazard?.essential.reset_description"
            class="tw:-indent-2 tw:pl-2 q-gutter-y-xs"
          >
            <div
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="
                '<p><strong>Reset</strong> ' +
                cleanDescription(hazardData?.core_hazard?.essential.reset_description) +
                '</p>'
              "
            />
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
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

<style>
.action-glyph {
  font-family: 'Pathfinder2eActions', sans-serif;
  font-size: 24px;
  line-height: calc(2 / 1.5);
}

p {
  margin-bottom: 4px;
}
</style>

<style scoped>
.hazard-sheet {
  min-height: calc(100vh - 94px) !important;
  font-family: 'Good Pro', sans-serif;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
