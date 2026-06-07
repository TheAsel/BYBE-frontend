<script setup lang="ts">
import { matPrint, matPriorityHigh } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { isNull } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { requestItemId } from 'src/api/shop-api-calls';
import ShopSheet from 'src/components/shop/ShopSheet.vue';
import { itemsStore } from 'src/stores/items';
import { settingsStore } from 'src/stores/settings';

import type { games } from 'src/types/filters';
import type { item } from 'src/types/item';

const title = ref('Item Sheet - BYBE');

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/item'
    }
  ]
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const items = itemsStore();
const settings = settingsStore();

const currentGame = ref<games>(settings.game === 'sf' ? 'sf' : 'pf');

const itemId = Number(route.query.id);

let itemData: item | undefined;
try {
  if (itemId !== undefined && !Number.isNaN(itemId)) {
    itemData = await requestItemId(currentGame.value, itemId);
    if (isNull(itemData) || itemData === undefined) {
      console.error('Missing item ID');
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing item ID',
        icon: matPriorityHigh
      });
      await router.push({ name: 'shop', query: { game: currentGame.value } });
    } else {
      title.value = itemData?.core_item.name + ' - BYBE';
      items.setSelectedItem(itemData);
    }
  } else {
    console.error('Invalid item ID');
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Invalid item ID',
      icon: matPriorityHigh
    });
    await router.push({ name: 'shop', query: { game: currentGame.value } });
  }
} catch (error) {
  console.error(error);
}

const printPage = () => {
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
    <q-btn fab :icon="matPrint" color="primary" aria-label="Print item sheet" @click="printPage" />
  </q-page-sticky>
</template>
