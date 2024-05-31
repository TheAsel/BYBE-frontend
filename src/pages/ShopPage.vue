<script setup lang="ts">
import { useHead } from '@unhead/vue';
import ShopTable from 'src/components/Shop/ShopTable.vue';
import ShopList from 'src/components/Shop/ShopList.vue';

useHead({
  title: 'Shop Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/shop'
    }
  ]
});
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <ShopTable />
    <ShopList />
  </q-page>
</template>
