<script setup lang="ts">
import { biBoxArrowUpRight, biXLg } from '@quasar/extras/bootstrap-icons';
import { upperFirst } from 'lodash-es';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { itemsStore } from 'src/stores/items';
import { settingsStore } from 'src/stores/settings';

import type { games } from 'src/types/filters';

const settings = settingsStore();
const items = itemsStore();

const currentGame = ref<games>(settings.game === 'sf' ? 'sf' : 'pf');
const currentFont = ref(currentGame.value === 'sf' ? 'Orbitron Bold' : 'Good Pro Condensed');
const currentFontSize = ref(currentGame.value === 'sf' ? 'tw:text-2xl!' : 'tw:text-3xl!');

const router = useRouter();

const addPlus = (value: number | undefined) => {
  if (value !== undefined && value >= 0) {
    return '+' + value;
  } else {
    return value;
  }
};

const cleanSymbols = (description: string) => {
  const symbolsRegex = /<span class="action-glyph">(\w)<\/span>/g;

  const symbol = description.matchAll(symbolsRegex);
  for (const i of symbol) {
    if (i) {
      description = description.replaceAll(
        i[0],
        '<span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl">' +
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

  finalString = finalString.replaceAll('<p>', '<p class="tw:my-0!">');

  finalString = finalString.replaceAll(
    '<hr />',
    '<hr class="q-separator q-separator--horizontal tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-500!" style="height: 2px;" aria-orientation="horizontal">'
  );

  finalString = finalString.replaceAll('\n', '<br style="display: block; margin-top: 0px;">');

  return finalString.replaceAll(cleanRegex, '');
};

const openShopSheet = (game: games, id: number) => {
  const routeData = router.resolve({ name: 'item', query: { game: game, id: id } });
  if (process.env.IS_APP === 'true') {
    globalThis.open(routeData.href, '_self');
  } else {
    globalThis.open(routeData.href, '_blank');
  }
};
</script>

<template>
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
        class="tw:mr-1 tw:my-auto only-screen item-page-element"
        aria-label="Open item sheet"
        @click="
          openShopSheet(items.selectedItem?.game ?? currentGame, items.selectedItem!.core_item.id)
        "
      >
        <q-tooltip
          class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
          anchor="top middle"
          self="bottom middle"
        >
          Open item sheet
        </q-tooltip>
      </q-btn>
    </div>
    <a
      v-if="settings.is_aon_links_on"
      class="tw:my-auto"
      :href="
        items.selectedItem!.game === 'pf'
          ? 'https://2e.aonprd.com/Search.aspx?q=' +
            encodeURIComponent(items.selectedItem!.core_item.name) +
            '&type=eqs'
          : 'https://2e.aonsrd.com/search?q=' +
            encodeURIComponent(items.selectedItem!.core_item.name) +
            '&type=eqs'
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        :class="
          currentFontSize +
          ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
        "
      >
        {{ items.selectedItem!.core_item.name }}
      </h1>
    </a>
    <h1 v-else :class="currentFontSize + ' tw:mr-4 tw:leading-8 tw:my-auto'">
      {{ items.selectedItem!.core_item.name }}
    </h1>
    <q-space />
    <div class="tw:my-1">Armor {{ items.selectedItem!.core_item.level }}</div>
    <div class="tw:my-auto!">
      <q-btn
        class="tw:ml-2! only-screen item-page-element"
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
  </div>
  <q-separator class="tw:my-2!" style="height: 2px" />
  <hr class="only-print" style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px" />
  <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
    <div
      v-if="items.selectedItem!.core_item.rarity === 'Uncommon'"
      class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ items.selectedItem!.core_item.rarity.toUpperCase() }}
    </div>
    <div
      v-else-if="items.selectedItem!.core_item.rarity === 'Rare'"
      class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ items.selectedItem!.core_item.rarity.toUpperCase() }}
    </div>
    <div
      v-else-if="items.selectedItem!.core_item.rarity === 'Unique'"
      class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ items.selectedItem!.core_item.rarity.toUpperCase() }}
    </div>
    <div
      v-for="item in items.selectedItem!.core_item.traits"
      :key="item"
      class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ item.toUpperCase().replaceAll('-', ' ') }}
    </div>
  </div>
  <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
    <div
      v-if="items.selectedItem!.core_item.source"
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Source </strong>
      <a
        :href="
          'https://store.paizo.com/search.php?search_query=' +
          encodeURIComponent(items.selectedItem!.core_item.source) +
          '&section=product'
        "
        target="_blank"
        rel="noopener"
      >
        <i class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400">
          {{ items.selectedItem!.core_item.source }}
        </i>
      </a>
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <strong>Price</strong>
      {{ items.getFormattedPrice(items.selectedItem!.core_item.price, currentGame) }};
      <span v-if="items.selectedItem!.armor_data">
        <strong>AC Bonus</strong>
        {{ addPlus(items.selectedItem!.armor_data.ac_bonus) }};
        <strong>Dex Cap</strong>
        {{ addPlus(items.selectedItem!.armor_data.dex_cap) }};
        <strong>Check Penalty </strong>
        <span v-if="items.selectedItem!.armor_data.check_penalty === 0">—; </span>
        <span v-else> {{ items.selectedItem!.armor_data.check_penalty }}; </span>
        <strong>Speed Penalty </strong>
        <span v-if="items.selectedItem!.armor_data.speed_penalty === 0">—</span>
        <span v-else> {{ items.selectedItem!.armor_data.speed_penalty }} ft.</span>
      </span>
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <span v-if="items.selectedItem!.armor_data">
        <strong>Strenght </strong>
        <span v-if="items.selectedItem!.armor_data.strength_required !== null"
          >{{ addPlus(items.selectedItem!.armor_data.strength_required) }};
        </span>
        <span v-else>—; </span>
      </span>
      <strong>Bulk</strong>
      {{ items.getFormattedBulk(items.selectedItem!.core_item.bulk) }};
      <span v-if="items.selectedItem!.core_item.category">
        <strong>Category</strong>
        {{ upperFirst(items.selectedItem!.core_item.category) }};
      </span>
      <span v-if="items.selectedItem!.core_item.group">
        <strong>Group</strong>
        {{ upperFirst(items.selectedItem!.core_item.group) }}
      </span>
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <span
        v-if="
          items.selectedItem!.core_item.base_item &&
          items.selectedItem!.core_item.base_item.toLowerCase().replaceAll('-', ' ') !=
            items.selectedItem!.core_item.name.toLowerCase() &&
          items.selectedItem!.core_item.base_item !== 'explorers-clothing'
        "
      >
        <strong>Base Armor</strong>
        {{ upperFirst(items.selectedItem!.core_item.base_item).replaceAll('-', ' ') }}
      </span>
    </div>
  </div>
  <q-separator class="tw:my-2!" style="height: 2px" />
  <hr class="only-print" style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px" />
  <div
    class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    v-html="cleanDescription(items.selectedItem!.core_item.description)"
  ></div>
</template>
