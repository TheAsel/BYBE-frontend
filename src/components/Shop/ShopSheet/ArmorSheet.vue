<script setup lang="ts">
import { itemsStore } from 'src/stores/store';
import { biBoxArrowUpRight, biXLg } from '@quasar/extras/bootstrap-icons';
import {
  cleanEffect,
  cleanCompendium,
  cleanDamage,
  cleanTemplate,
  cleanSave,
  cleanRoll,
  cleanSymbols
} from 'src/utils/clean-regex';
import { useRouter } from 'vue-router';
import _ from 'lodash';

const items = itemsStore();

const router = useRouter();

const addPlus = (value: number | undefined) => {
  if (value != undefined && value >= 0) {
    return '+' + value;
  } else {
    return value;
  }
};

const cleanDescription = (description: string) => {
  const cleanRegex = /<\/?(?:li)?(?:ul)?>|@Localize\[.+\]/g;

  let finalString = cleanSymbols(description);
  finalString = finalString.replaceAll('<hr />', '<hr class="tw-my-2"/>');
  finalString = finalString.replace(cleanRegex, '');

  finalString = cleanEffect(finalString);

  finalString = cleanCompendium(finalString);

  finalString = cleanDamage(finalString);

  finalString = cleanTemplate(finalString);

  finalString = cleanSave(finalString);

  return cleanRoll(finalString);
};

const openShopSheet = (id: number) => {
  const routeData = router.resolve({ name: 'item', query: { id: id } });
  window.open(routeData.href, '_blank');
};
</script>

<template>
  <div
    class="tw-flex tw-font-bold tw-text-2xl tw-text-gray-800 dark:tw-text-white"
    style="font-family: 'Good Pro Condensed', sans-serif"
  >
    <q-btn
      :icon="biBoxArrowUpRight"
      flat
      rounded
      dense
      size="sm"
      padding="sm"
      class="tw-mr-1 only-screen item-page-element"
      aria-label="Open item sheet"
      @click="openShopSheet(items.getSelectedItem!.core_item.id)"
    >
      <q-tooltip
        class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
        anchor="top middle"
        self="bottom middle"
      >
        Open item sheet
      </q-tooltip>
    </q-btn>
    <h1 class="tw-leading-8 tw-my-auto">
      {{ items.getSelectedItem!.core_item.name.toUpperCase() }}
    </h1>
    <q-space />
    <div class="tw-my-auto">ARMOR {{ items.getSelectedItem!.core_item.level }}</div>
    <q-btn
      class="tw-ml-2 only-screen item-page-element"
      :icon="biXLg"
      size="sm"
      padding="sm"
      flat
      round
      dense
      @click="items.removeSelectedItem()"
      aria-label="Remove selected item"
    ></q-btn>
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
      {{ item.toUpperCase() }}
    </div>
  </div>
  <div class="tw-indent-[-0.5rem] tw-pl-2 q-gutter-y-xs">
    <div
      class="tw-text-base tw-text-gray-800 dark:tw-text-white"
      v-if="items.getSelectedItem!.core_item.source"
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
    <div class="tw-text-base tw-text-gray-800 dark:tw-text-white">
      <strong>Price</strong>
      {{ items.getFormattedPrice(items.getSelectedItem!.core_item.price) }};
      <span v-if="items.getSelectedItem!.armor_data">
        <strong>AC Bonus</strong>
        {{ addPlus(items.getSelectedItem!.armor_data.ac_bonus) }};
        <strong>Dex Cap</strong>
        {{ addPlus(items.getSelectedItem!.armor_data.dex_cap) }};
        <strong>Check Penalty </strong>
        <span v-if="items.getSelectedItem!.armor_data.check_penalty === 0">—; </span>
        <span v-else> {{ items.getSelectedItem!.armor_data.check_penalty }}; </span>
        <strong>Speed Penalty </strong>
        <span v-if="items.getSelectedItem!.armor_data.speed_penalty === 0">—</span>
        <span v-else> {{ items.getSelectedItem!.armor_data.speed_penalty }} ft.</span>
      </span>
    </div>
    <div class="tw-text-base tw-text-gray-800 dark:tw-text-white">
      <span v-if="items.getSelectedItem!.armor_data">
        <strong>Strenght </strong>
        <span v-if="items.getSelectedItem!.armor_data.strength_required != null"
          >{{ addPlus(items.getSelectedItem!.armor_data.strength_required) }};
        </span>
        <span v-else>—; </span>
      </span>
      <strong>Bulk</strong>
      {{ items.getFormattedBulk(items.getSelectedItem!.core_item.bulk) }};
      <span v-if="items.getSelectedItem!.core_item.category">
        <strong>Category</strong>
        {{ _.upperFirst(items.getSelectedItem!.core_item.category) }};
      </span>
      <span v-if="items.getSelectedItem!.core_item.group">
        <strong>Group</strong>
        {{ _.upperFirst(items.getSelectedItem!.core_item.group) }}
      </span>
    </div>
    <div class="tw-text-base tw-text-gray-800 dark:tw-text-white">
      <span
        v-if="
          items.getSelectedItem!.core_item.base_item &&
          items.getSelectedItem!.core_item.base_item.toLowerCase().replaceAll('-', ' ') !=
            items.getSelectedItem!.core_item.name.toLowerCase() &&
          items.getSelectedItem!.core_item.base_item != 'explorers-clothing'
        "
      >
        <strong>Base Armor</strong>
        {{ _.upperFirst(items.getSelectedItem!.core_item.base_item).replaceAll('-', ' ') }}
      </span>
    </div>
  </div>
  <q-separator class="tw-my-2" style="height: 2px" />
  <hr class="only-print" style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px" />
  <div
    class="tw-text-base tw-text-gray-800 dark:tw-text-white"
    v-html="cleanDescription(items.getSelectedItem!.core_item.description)"
  ></div>
</template>
