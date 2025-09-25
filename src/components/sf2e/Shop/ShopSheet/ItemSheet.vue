<script setup lang="ts">
import { biBoxArrowUpRight, biXLg } from '@quasar/extras/bootstrap-icons';
import { useRouter } from 'vue-router';

import { itemsStore, settingsStore } from '../../../../stores/store';

import type { games } from 'src/types/filters';

const settings = settingsStore();
const items = itemsStore();

const router = useRouter();

const cleanSymbols = (description: string) => {
  const symbolsRegex = /<span class="action-glyph">(\w)<\/span>/g;

  const symbol = description.matchAll(symbolsRegex);
  for (const i of symbol) {
    if (i) {
      description = description.replaceAll(
        i[0],
        '<span style="font-family: Pathfinder2eActions, sans-serif" class="tw-text-2xl">' +
          i[1] +
          '</span>'
      );
    }
  }
  return description;
};

const cleanDescription = (description: string) => {
  const cleanRegex = /<\/?(?:li)?(?:ul)?>|@Localize\[.+\]/g;

  let finalString = cleanSymbols(description);

  finalString = finalString.replaceAll('<hr />', '<hr class="tw-my-2"/>');

  finalString = finalString.replaceAll('\n', '<br style="display: block; margin-top: 0px;">');

  return finalString.replaceAll(cleanRegex, '');
};

const openShopSheet = (game: games, id: number) => {
  if (game === 'sf2e') {
    const routeData = router.resolve({ name: 'sf2e_item', query: { id: id } });
    if (process.env.IS_APP === 'true') {
      window.open(routeData.href, '_self');
    } else {
      window.open(routeData.href, '_blank');
    }
  } else {
    const routeData = router.resolve({ name: 'pf2e_item', query: { id: id } });
    if (process.env.IS_APP === 'true') {
      window.open(routeData.href, '_self');
    } else {
      window.open(routeData.href, '_blank');
    }
  }
};
</script>

<template>
  <div
    class="tw-flex tw-font-bold tw-text-2xl tw-text-gray-800 dark:tw-text-white"
    style="font-family: 'Orbitron Bold', sans-serif; font-variant-caps: small-caps"
  >
    <q-btn
      :icon="biBoxArrowUpRight"
      flat
      round
      dense
      size="sm"
      padding="sm"
      class="tw-mr-1 tw-my-auto only-screen item-page-element"
      aria-label="Open item sheet"
      @click="openShopSheet('sf2e', items.getSelectedItem!.core_item.id)"
    >
      <!-- TODO: use items.getSelectedItem!.core_item.game instead of hardcoded -->
      <q-tooltip
        class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
        anchor="top middle"
        self="bottom middle"
      >
        Open item sheet
      </q-tooltip>
    </q-btn>
    <!-- TODO: check for items.getSelectedItem!.core_item.game to query the correct AoN -->
    <a
      v-if="settings.getAonLinks"
      class="tw-my-auto"
      :href="
        'https://2e.aonsrd.com/search?q=' +
        encodeURIComponent(items.getSelectedItem!.core_item.name) +
        '&type=eqs'
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        class="tw-leading-8 tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
      >
        {{ items.getSelectedItem!.core_item.name }}
      </h1>
    </a>
    <h1 v-else class="tw-leading-8 tw-my-auto">
      {{ items.getSelectedItem!.core_item.name }}
    </h1>
    <q-space />
    <div class="tw-my-1">Item {{ items.getSelectedItem!.core_item.level }}</div>
    <q-btn
      class="tw-ml-2 tw-my-auto only-screen item-page-element"
      :icon="biXLg"
      size="sm"
      padding="sm"
      flat
      round
      dense
      aria-label="Remove selected item"
      @click="items.removeSelectedItem()"
    />
  </div>
  <q-separator class="tw-my-2" style="height: 2px" />
  <hr class="only-print" style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px" />
  <div class="tw-flex tw-flex-wrap tw-font-bold tw-text-sm tw-text-white">
    <div
      v-if="items.getSelectedItem!.core_item.rarity === 'Uncommon'"
      class="tw-bg-[#c45500] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
    >
      {{ items.getSelectedItem!.core_item.rarity.toUpperCase() }}
    </div>
    <div
      v-else-if="items.getSelectedItem!.core_item.rarity === 'Rare'"
      class="tw-bg-[#0c1466] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
    >
      {{ items.getSelectedItem!.core_item.rarity.toUpperCase() }}
    </div>
    <div
      v-else-if="items.getSelectedItem!.core_item.rarity === 'Unique'"
      class="tw-bg-[#800080] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
    >
      {{ items.getSelectedItem!.core_item.rarity.toUpperCase() }}
    </div>
    <div
      v-for="item in items.getSelectedItem!.core_item.traits"
      :key="item"
      class="tw-bg-[#522e2c] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
    >
      {{ item.toUpperCase().replaceAll('-', ' ').replace('ADDITIVE', 'ADDITIVE ') }}
    </div>
  </div>
  <div class="tw-indent-[-0.5rem] tw-pl-2 q-gutter-y-xs">
    <div
      v-if="items.getSelectedItem!.core_item.source"
      class="tw-text-base tw-text-gray-800 dark:tw-text-white"
    >
      <strong>Source </strong>
      <a
        :href="
          'https://paizo.com/search?q=' +
          encodeURIComponent(items.getSelectedItem!.core_item.source) +
          '&what=products&includeUnrated=true&includeUnavailable=true'
        "
        target="_blank"
        rel="noopener"
      >
        <i class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400">
          {{ items.getSelectedItem!.core_item.source }}
        </i>
      </a>
    </div>
    <div
      v-if="items.getSelectedItem!.core_item.price"
      class="tw-text-base tw-text-gray-800 dark:tw-text-white"
    >
      <strong>Price</strong>
      {{ items.getSelectedItem!.core_item.price / 10 + ' credits' }};
    </div>
    <div class="tw-text-base tw-text-gray-800 dark:tw-text-white">
      <span v-if="items.getSelectedItem!.core_item.usage">
        <strong>Usage</strong>
        {{ items.getFormattedUsage(items.getSelectedItem!.core_item.usage) }};
      </span>
      <strong>Bulk</strong>
      {{ items.getFormattedBulk(items.getSelectedItem!.core_item.bulk) }}
    </div>
  </div>
  <q-separator class="tw-my-2" style="height: 2px" />
  <hr class="only-print" style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px" />
  <div
    class="tw-text-base tw-text-gray-800 dark:tw-text-white"
    v-html="cleanDescription(items.getSelectedItem!.core_item.description)"
  ></div>
</template>
