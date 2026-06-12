<script setup lang="ts">
import ArmorSheet from "@/components/shop/ShopSheet/ArmorSheet.vue";
import ItemSheet from "@/components/shop/ShopSheet/ItemSheet.vue";
import ShieldSheet from "@/components/shop/ShopSheet/ShieldSheet.vue";
import WeaponSheet from "@/components/shop/ShopSheet/WeaponSheet.vue";
import { itemsStore } from "@/stores/items";

const items = itemsStore();
</script>

<template>
  <div class="item-sheet tw:h-full">
    <div
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:items-center tw:text-left tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700 hide-print"
    >
      <q-scroll-area class="tw:h-full">
        <div
          v-if="items.selectedItem && items.selectedItem.core_item"
          class="q-gutter-y-xs tw:p-4 show-print"
        >
          <ArmorSheet
            v-if="items.selectedItem.core_item.item_type === 'Armor'"
          />
          <ItemSheet
            v-if="
              items.selectedItem.core_item.item_type === 'Consumable' ||
              items.selectedItem.core_item.item_type === 'Equipment'
            "
          />
          <ShieldSheet
            v-if="items.selectedItem.core_item.item_type === 'Shield'"
          />
          <WeaponSheet
            v-if="items.selectedItem.core_item.item_type === 'Weapon'"
          />
        </div>
        <div v-else class="tw:text-center tw:text-lg tw:pt-[38vh]">
          Click on an item to display its description
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style>
.action-glyph {
  font-family: "Pathfinder2eActions", sans-serif;
  font-size: 24px;
  line-height: calc(2 / 1.5);
}
</style>

<style lang="scss">
.item-sheet {
  font-family: "Good Pro", sans-serif;
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
