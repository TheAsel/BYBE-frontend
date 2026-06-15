<script setup lang="ts">
import { biBoxArrowUpRight, biXLg } from "@quasar/extras/bootstrap-icons";
import { useRouter } from "vue-router";

import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import {
  cleanDescription,
  getGameAonLink,
  getGameFont,
  getGameFontSize,
  openSheet
} from "@/utils/sheet";

const router = useRouter();

const settings = settingsStore();
const items = itemsStore();
</script>

<template>
  <div
    class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
    :style="
      'font-family: ' +
      getGameFont(items.selectedItem?.game ?? settings.game) +
      ', sans-serif; font-variant-caps: small-caps'
    "
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
          openSheet(
            router,
            'item',
            items.selectedItem?.game ?? settings.game,
            items.selectedItem!.core_item.id
          )
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
        'https://2e.' +
        getGameAonLink(items.selectedItem!.game) +
        '.com/search?q=' +
        encodeURIComponent(items.selectedItem!.core_item.name) +
        '&type=eqs'
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        :class="
          getGameFontSize(items.selectedItem?.game ?? settings.game) +
          ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
        "
      >
        {{ items.selectedItem!.core_item.name }}
      </h1>
    </a>
    <h1
      v-else
      :class="
        getGameFontSize(items.selectedItem?.game ?? settings.game) +
        ' tw:mr-4 tw:leading-8 tw:my-auto'
      "
    >
      {{ items.selectedItem!.core_item.name }}
    </h1>
    <q-space />
    <div class="tw:my-1">Item {{ items.selectedItem!.core_item.level }}</div>
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
  <hr
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
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
      :key="item.name"
      class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      <span
        v-if="item.description !== null"
        class="tw:decoration-2 tw:hover:underline"
        >{{ item.name.toUpperCase().replaceAll("-", " ")
        }}<q-tooltip
          style="
            font-family:
              Good Pro,
              sans-serif;
          "
          class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
        >
          <strong>{{
            item.name
              .toUpperCase()
              .replaceAll("-", " ")
              .replace("ADDITIVE", "ADDITIVE ")
          }}</strong>
          <hr class="tw:my-1!" />
          <span v-html="cleanDescription(item.description)" /> </q-tooltip
      ></span>
      <span v-else>{{
        item.name
          .toUpperCase()
          .replaceAll("-", " ")
          .replace("ADDITIVE", "ADDITIVE ")
      }}</span>
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
        <i
          class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
        >
          {{ items.selectedItem!.core_item.source }}
        </i>
      </a>
    </div>
    <div
      v-if="items.selectedItem!.core_item.price"
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Price</strong>
      {{
        items.getFormattedPrice(
          items.selectedItem!.core_item.price,
          settings.game
        )
      }};
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <span v-if="items.selectedItem!.core_item.usage">
        <strong>Usage</strong>
        {{ items.getFormattedUsage(items.selectedItem!.core_item.usage) }};
      </span>
      <strong>Bulk</strong>
      {{ items.getFormattedBulk(items.selectedItem!.core_item.bulk) }}
    </div>
  </div>
  <q-separator class="tw:my-2!" style="height: 2px" />
  <hr
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
  <div
    class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    v-html="cleanDescription(items.selectedItem!.core_item.description)"
  ></div>
</template>
