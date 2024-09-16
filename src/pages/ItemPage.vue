<script setup lang="ts">
import ShopSheet from 'src/components/Shop/ShopSheet.vue';
import { ref } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { item } from 'src/types/item';
import { matPriorityHigh, matPrint } from '@quasar/extras/material-icons';
import { isNull } from 'lodash-es';
import { requestItemId } from 'src/utils/shop-api-calls';
import { itemsStore } from 'src/stores/store';

const title = ref('Item Sheet - BYBE');

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/bestiary'
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
  if (itemId !== undefined && !isNaN(itemId)) {
    itemData = await requestItemId(itemId);
    if (isNull(itemData) || itemData === undefined) {
      console.error('Missing item ID');
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing item ID',
        icon: matPriorityHigh
      });
      router.push({ name: 'shop' });
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
    router.push({ name: 'shop' });
  }
} catch (error) {
  console.error(error);
}

const printPage = () => {
  window.print();
};
</script>

<template>
  <ShopSheet class="tw-mx-auto item-page q-pa-md tw-w-full md:tw-w-[57rem]" />
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw-z-10 only-screen tw-opacity-85"
  >
    <q-btn fab :icon="matPrint" color="primary" aria-label="Print item sheet" @click="printPage" />
  </q-page-sticky>
</template>
