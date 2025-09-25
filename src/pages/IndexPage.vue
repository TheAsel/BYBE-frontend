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
    class="tw-max-w-[80rem] tw-px-4 tw-pb-10 sm:tw-px-6 lg:tw-px-8 lg:tw-py-14 tw-mx-auto"
  >
    <div class="tw-max-w-3xl tw-mx-auto tw-text-center tw-my-4 lg:tw-mb-14">
      <h1 class="tw-block text-h4 text-bold tw-text-white sm:tw-text-4xl">Welcome to BYBE</h1>
      <h2 class="tw-mt-3 text-h6 tw-text-gray-200">
        BYBE provides tools to help Pathfinder 2e and Starfinder 2e Game Masters.
      </h2>
    </div>
    <div class="tw-max-w-[56rem] tw-mx-auto tw-grid sm:tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-16">
      <router-link to="/pf2e" @click="settings.setGame('pf2e')">
        <q-card
          class="tw-rounded-3xl tw-backdrop-blur tw-border-2 tw-bg-white/5 dark:tw-bg-gray-800/20 tw-border-gray-200/20 dark:tw-border-neutral-800/20 hover:tw-border-blue-600 hover:dark:tw-border-blue-500 tw-transition-all"
        >
          <q-img src="/pf2e-banner.webp">
            <div class="absolute-bottom text-h6 text-center">Pathfinder 2e</div>
          </q-img>
        </q-card>
      </router-link>

      <router-link to="/sf2e" @click="settings.setGame('sf2e')">
        <q-card
          class="tw-rounded-3xl tw-backdrop-blur tw-border-2 tw-bg-white/5 dark:tw-bg-gray-800/20 tw-border-gray-200/20 dark:tw-border-neutral-800/20 hover:tw-border-blue-600 hover:dark:tw-border-blue-500 tw-transition-all"
        >
          <q-img src="/sf2e-banner.webp">
            <div class="absolute-bottom text-h6 text-center">Starfinder 2e</div>
          </q-img>
        </q-card>
      </router-link>
    </div>
  </div>
</template>
