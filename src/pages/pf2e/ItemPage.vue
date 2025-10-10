<script setup lang="ts">
import { matPrint, matPriorityHigh } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { isNull } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ShopSheet from '../../components/pf2e/Shop/ShopSheet.vue';
import { itemsStore } from '../../stores/store';
import { requestItemId } from '../../utils/shop-api-calls';

import type { item } from '../../types/item';

const title = ref('Item Sheet - BYBE');

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/pf/item'
    }
  ]
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const items = itemsStore();

const itemId = Number(route.query.id);

let itemData: item | undefined;
try {
  if (itemId !== undefined && !Number.isNaN(itemId)) {
    itemData = await requestItemId('pf', itemId);
    if (isNull(itemData) || itemData === undefined) {
      console.error('Missing item ID');
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing item ID',
        icon: matPriorityHigh
      });
      await router.push({ name: 'pf/shop' });
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
    await router.push({ name: 'pf/shop' });
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
