<script setup lang="ts">
import { matPrint, matPriorityHigh } from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { isNull } from "lodash-es";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { requestItemId } from "@/api/shop-api-calls";
import ShopSheet from "@/components/shop/ShopSheet.vue";
import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";

import type { item } from "@/types/item";

const title = ref("Item Sheet - BYBE");

useHead({
  link: [
    {
      href: "https://bybe.app/item",
      rel: "canonical"
    }
  ],
  title
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const items_store = itemsStore();
const settings_store = settingsStore();

const itemId = Number(route.query.id);

let itemData: item | null;
try {
  if (itemId && !Number.isNaN(itemId)) {
    itemData = await requestItemId(settings_store.game, itemId);
    if (!itemData) {
      console.error("Missing item ID");
      $q.notify({
        icon: matPriorityHigh,
        message: "Missing item ID",
        progress: true,
        type: "warning"
      });
      await router.push({ name: "shop", query: { game: settings_store.game } });
    } else {
      title.value = `${itemData?.core_item.name} - BYBE`;
      items_store.setSelectedItem(itemData);
    }
  } else {
    console.error("Invalid item ID");
    $q.notify({
      icon: matPriorityHigh,
      message: "Invalid item ID",
      progress: true,
      type: "warning"
    });
    await router.push({ name: "shop", query: { game: settings_store.game } });
  }
} catch (error) {
  console.error(error);
}

const printPage = (): void => {
  globalThis.print();
};
</script>

<template>
  <ShopSheet class="tw:mx-auto item-page q-pa-md tw:w-full tw:md:w-228" />
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw:z-10 only-screen tw:opacity-85"
  >
    <q-btn
      fab
      :icon="matPrint"
      color="primary"
      aria-label="Print item sheet"
      @click="printPage"
    />
  </q-page-sticky>
</template>
