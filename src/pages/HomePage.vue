<script setup lang="ts">
import { useHead } from '@unhead/vue';

import { settingsStore } from 'src/stores/store';

useHead({
  title: 'BYBE - Homepage',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/'
    }
  ]
});

const settings = settingsStore();
</script>

<template>
  <div
    style="min-height: calc(100vh - 94px)"
    class="tw:max-w-7xl tw:px-4 tw:pb-10 tw:sm:px-6 tw:lg:px-8 tw:py-4 tw:pt-0 tw:2xl:py-14 tw:mx-auto"
  >
    <div
      class="tw:max-w-3xl tw:mx-auto tw:text-center tw:my-4 tw:mb-4 tw:2xl:mb-14 tw:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
    >
      <h1 class="tw:block tw:text-white tw:text-4xl! tw:font-bold!">Welcome to BYBE</h1>
      <h2 class="tw:mt-3 text-h6 tw:text-gray-200">
        BYBE provides tools to help Pathfinder 2e and Starfinder 2e Game Masters.
      </h2>
    </div>
    <div class="tw:max-w-4xl tw:mx-auto tw:grid tw:sm:grid-cols-1 tw:lg:grid-cols-2 tw:gap-16">
      <router-link to="/pf" @click="settings.setGame('pf')">
        <q-card
          flat
          class="tw:rounded-3xl! tw:backdrop-blur tw:border-2 tw:bg-white/5 tw:dark:bg-gray-800/20 tw:border-gray-200/20 tw:dark:border-neutral-800/20 tw:hover:border-blue-600! tw:dark:hover:border-blue-500! tw:transition-all"
        >
          <q-img src="/pf2e-banner.webp">
            <div class="absolute-bottom text-h6 text-center">Pathfinder 2e</div>
          </q-img>
        </q-card>
      </router-link>

      <router-link to="/sf" @click="settings.setGame('sf')">
        <q-card
          flat
          class="tw:rounded-3xl! tw:backdrop-blur tw:border-2 tw:bg-white/5 tw:dark:bg-gray-800/20 tw:border-gray-200/20 tw:dark:border-neutral-800/20 tw:hover:border-blue-600! tw:dark:hover:border-blue-500! tw:transition-all"
        >
          <q-img src="/sf2e-banner.webp">
            <div class="absolute-bottom text-h6 text-center">Starfinder 2e</div>
          </q-img>
        </q-card>
      </router-link>
    </div>
  </div>
</template>
