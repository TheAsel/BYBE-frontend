<script setup lang="ts">
import { biBoxArrowUpRight, biXLg } from "@quasar/extras/bootstrap-icons";
import { computed } from "vue";
import { useRouter } from "vue-router";

import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import {
  cleanDescription,
  getGameAonLink,
  getGameFont,
  getGameFontSize,
  getGameFontSizeSmall,
  openSheet
} from "@/utils/sheet";

const router = useRouter();

const settings_store = settingsStore();
const items_store = itemsStore();

const selectedItem = computed(() => items_store.selectedItem);
const coreItem = computed(() => selectedItem.value?.core_item);
const game = computed(() => selectedItem.value?.game ?? settings_store.game);
</script>

<template>
  <div
    v-if="coreItem"
    class="tw:flex tw:font-bold tw:text-gray-800 tw:dark:text-white"
    :style="
      'font-family: ' +
      getGameFont(game) +
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
        @click="openSheet(router, 'item', game, coreItem.id)"
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
      class="tw:my-auto"
      :href="
        'https://2e.' +
        getGameAonLink(game) +
        '.com/search?type=eqs&q=type%3A(item) ' +
        encodeURIComponent(coreItem.name)
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        :class="
          getGameFontSize(game) +
          ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
        "
      >
        {{ coreItem.name }}
      </h1>
    </a>
    <q-space />
    <div class="tw:my-auto" :class="getGameFontSizeSmall(game)"
      >Item {{ coreItem.level }}</div
    >
    <div class="tw:my-auto!">
      <q-btn
        class="only-screen item-page-element"
        :icon="biXLg"
        size="sm"
        padding="sm"
        flat
        round
        dense
        aria-label="Remove selected item"
        @click="items_store.removeSelectedItem()"
      />
    </div>
  </div>
  <div v-if="coreItem">
    <q-separator class="tw:my-2!" style="height: 2px" />
    <hr
      class="only-print"
      style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
    />
    <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
      <div
        v-if="coreItem.rarity === 'Uncommon'"
        class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ coreItem.rarity.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ coreItem.rarity.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "Something of uncommon rarity requires special training or comes from a particular culture or part of the world. Some character choices give access to uncommon options, and the GM can choose to allow access for anyone. Less is known about uncommon creatures than common creatures. They typically can't be summoned. The DC of Recall Knowledge checks related to these creature is increased by 2."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        v-else-if="coreItem.rarity === 'Rare'"
        class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ coreItem.rarity.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ coreItem.rarity.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "This rarity indicates that a rules element is very difficult to find in the game world. A rare feat, spell, item or the like is available to players only if the GM decides to include it in the game, typically through discovery during play. Creatures with this trait are rare. They typically can't be summoned. The DC of Recall Knowledge checks related to these creatures is increased by 5."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        v-else-if="coreItem.rarity === 'Unique'"
        class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ coreItem.rarity.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ coreItem.rarity.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "A rules element with this trait is one-of-a-kind. The DC of Recall Knowledge checks related to creatures with this trait is increased by 10."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        v-for="item in coreItem.traits"
        :key="item.name"
        class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span
          v-if="item.description !== null"
          class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{
            (item.display_name ?? item.name.replaceAll("-", " ")).toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{
              (
                item.display_name ?? item.name.replaceAll("-", " ")
              ).toUpperCase()
            }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span v-html="cleanDescription(item.description)" /> </q-tooltip
        ></span>
        <span v-else>{{
          (item.display_name ?? item.name.replaceAll("-", " ")).toUpperCase()
        }}</span>
      </div>
    </div>
  </div>
  <div v-if="coreItem" class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
    <div
      v-if="coreItem.source"
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Source </strong>
      <a
        :href="
          'https://store.paizo.com/search.php?section=product&search_query=' +
          encodeURIComponent(coreItem.source)
        "
        target="_blank"
        rel="noopener"
      >
        <i
          class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
        >
          {{ coreItem.source }}
        </i>
      </a>
    </div>
    <div
      v-if="coreItem.price"
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Price</strong>
      {{ items_store.getFormattedPrice(coreItem.price, settings_store.game) }};
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <span v-if="coreItem.usage">
        <strong>Usage</strong>
        {{ items_store.getFormattedUsage(coreItem.usage) }};
      </span>
      <strong>Bulk</strong>
      {{ items_store.getFormattedBulk(coreItem.bulk) }}
    </div>
  </div>
  <div v-if="coreItem">
    <q-separator class="tw:my-2!" style="height: 2px" />
    <hr
      class="only-print"
      style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
    />
    <div
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="cleanDescription(coreItem.description)"
    ></div>
  </div>
</template>
