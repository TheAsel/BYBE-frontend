<script setup lang="ts">
import { itemsStore } from 'src/stores/store';
import ArmorSheet from 'src/components/Shop/ShopSheet/ArmorSheet.vue';
import ItemSheet from 'src/components/Shop/ShopSheet/ItemSheet.vue';
import ShieldSheet from 'src/components/Shop/ShopSheet/ShieldSheet.vue';
import WeaponSheet from 'src/components/Shop/ShopSheet/WeaponSheet.vue';

const items = itemsStore();
</script>

<template>
  <div class="item-sheet">
    <div
      class="tw-opacity-85 dark:tw-opacity-90 tw-items-center tw-text-left tw-rounded-xl tw-border tw-bg-white tw-border-gray-200 dark:tw-bg-gray-800 dark:tw-border-gray-700 hide-print"
      id="v-step-5"
    >
      <q-scroll-area style="height: calc(100vh - 124px)">
        <div
          class="q-gutter-y-xs tw-p-4 show-print"
          v-if="items.getSelectedItem && items.getSelectedItem.core_item"
        >
          <ArmorSheet v-if="items.getSelectedItem.core_item.item_type === 'Armor'" />
          <ItemSheet
            v-if="
              items.getSelectedItem.core_item.item_type === 'Consumable' ||
              items.getSelectedItem.core_item.item_type === 'Equipment'
            "
          />
          <ShieldSheet v-if="items.getSelectedItem.core_item.item_type === 'Shield'" />
          <WeaponSheet v-if="items.getSelectedItem.core_item.item_type === 'Weapon'" />
        </div>
        <div v-else class="tw-text-center tw-text-lg tw-pt-[38vh]">
          Click on an item to display its description
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style lang="scss">
.item-sheet {
  min-height: calc(100vh - 92px) !important;
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
