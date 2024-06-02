<script setup lang="ts">
import { useHead } from '@unhead/vue';
import ShopTable from 'src/components/Shop/ShopTable.vue';
import ItemSheet from 'src/components/Shop/ItemSheet.vue';
import ShopList from 'src/components/Shop/ShopList.vue';
import { shop_list } from 'src/types/shop';
import { itemsStore } from 'src/stores/store';

useHead({
  title: 'Shop Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/shop'
    }
  ]
});

const shop = itemsStore();

const localShops = localStorage.getItem('shops');
if (localShops) {
  try {
    const parsedShops = JSON.parse(localShops);
    if (Array.isArray(parsedShops)) {
      const isCompatible = parsedShops.every((p) => {
        return typeof p.name === 'string' && Array.isArray(p.items);
      });
      if (isCompatible) {
        const shops: shop_list[] = parsedShops;
        const shopNames = shops.map((p) => p.name);
        if (new Set(shopNames).size !== shopNames.length) {
          throw new Error('Duplicate saved shop names');
        }
        shop.updateShops(shops);
      } else {
        throw new Error('Invalid saved shop format');
      }
    } else {
      throw new Error('Invalid saved shop format');
    }
  } catch (error) {
    const defaultShop = { name: 'Default', items: [] };
    localStorage.setItem('shops', JSON.stringify([defaultShop]));
    shop.updateShops([defaultShop]);
  }
}
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <ItemSheet class="q-pa-md tw-w-full md:tw-w-[30%]" />
    <ShopTable />
    <ShopList />
  </q-page>
</template>
