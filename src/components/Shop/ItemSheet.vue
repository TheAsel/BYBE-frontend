<script setup lang="ts">
import { itemsStore } from 'src/stores/store';
import {
  cleanEffect,
  cleanCompendium,
  cleanDamage,
  cleanTemplate,
  cleanSave,
  cleanRoll,
  cleanSymbols
} from 'src/utils/clean-regex';
import { biBoxArrowUpRight, biXLg } from '@quasar/extras/bootstrap-icons';
import { useRouter } from 'vue-router';

const items = itemsStore();

const router = useRouter();

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

const openItemSheet = (id: number) => {
  const routeData = router.resolve({ name: 'item', query: { id: id } });
  window.open(routeData.href, '_blank');
};
</script>

<template>
  <div class="item-sheet">
    <div
      class="tw-items-center tw-text-left tw-max-w-[55rem] tw-rounded-xl tw-border tw-bg-white tw-border-gray-200 dark:tw-bg-gray-800 dark:tw-border-gray-700 hide-print"
      id="v-step-5"
    >
      <q-scroll-area style="height: calc(100vh - 137px)">
        <div
          class="q-gutter-y-xs tw-p-4 show-print"
          v-if="items.getSelectedItem && items.getSelectedItem.core_item"
        >
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
              @click="openItemSheet(items.getSelectedItem.core_item.id)"
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
              {{ items.getSelectedItem.core_item.name.toUpperCase() }}
            </h1>
            <q-space />
            <div class="tw-my-auto">ITEM {{ items.getSelectedItem.core_item.level }}</div>
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
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw-flex tw-flex-wrap tw-font-bold tw-text-sm tw-text-white">
            <div
              v-if="items.getSelectedItem.core_item.rarity === 'Uncommon'"
              class="tw-bg-[#c45500] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ items.getSelectedItem.core_item.rarity.toUpperCase() }}
            </div>
            <div
              v-else-if="items.getSelectedItem.core_item.rarity === 'Rare'"
              class="tw-bg-[#0c1466] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ items.getSelectedItem.core_item.rarity.toUpperCase() }}
            </div>
            <div
              v-else-if="items.getSelectedItem.core_item.rarity === 'Unique'"
              class="tw-bg-[#800080] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ items.getSelectedItem.core_item.rarity.toUpperCase() }}
            </div>
            <div
              v-for="item in items.getSelectedItem.core_item.traits"
              :key="item"
              class="tw-bg-[#522e2c] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
              {{ item.toUpperCase() }}
            </div>
          </div>
          <div class="tw-indent-[-0.5rem] tw-pl-2 q-gutter-y-xs">
            <div
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-if="items.getSelectedItem.core_item.source"
            >
              <strong>Source </strong>
              <a
                :href="
                  'https://paizo.com/search?q=' +
                  encodeURIComponent(items.getSelectedItem.core_item.source) +
                  '&what=products&includeUnrated=true&includeUnavailable=true'
                "
                target="_blank"
                rel="noopener"
              >
                <i
                  class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
                >
                  {{ items.getSelectedItem.core_item.source }}
                </i>
              </a>
            </div>
            <div
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-if="items.getSelectedItem.core_item.price"
            >
              <strong>Price</strong>
              {{ items.getFormattedPrice(items.getSelectedItem.core_item.price) }}
            </div>
            <div class="tw-text-base tw-text-gray-800 dark:tw-text-white">
              <strong>Usage</strong>
              {{ items.getFormattedUsage(items.getSelectedItem.core_item.usage) }};
              <strong>Bulk</strong>
              {{ items.getFormattedBulk(items.getSelectedItem.core_item.bulk) }}
            </div>
          </div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div
            class="tw-text-base tw-text-gray-800 dark:tw-text-white"
            v-html="cleanDescription(items.getSelectedItem.core_item.description)"
          ></div>
        </div>
        <div class="tw-text-center tw-text-lg tw-pt-[38vh]" v-else>
          Click on an item to display its description
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style lang="scss">
.item-sheet {
  min-height: calc(100vh - 103px) !important;
  font-family: 'Good Pro', sans-serif;
}

.item-page {
  .item-page-element {
    display: none !important;
  }
}

table.pf2e,
table.pf2-table {
  border-collapse: collapse;
  font-size: 13pt;
  margin-top: 10px;
  margin-bottom: 10px;

  thead,
  tbody,
  th,
  td {
    box-sizing: border-box;
  }

  th,
  td {
    border: solid 1px #374151;
    text-align: center;
  }

  th {
    font-weight: bold;
    padding: 0.5rem 0.25rem;
  }

  td {
    padding: 0.25rem;
  }
}

body.body--dark {
  tr:nth-child(even) {
    background-color: #374151 !important;
  }

  td > span,
  th > span {
    color: #fff !important;
  }
}
</style>
