<script setup>
import { useHead } from '@unhead/vue';
import {
  biCalculator,
  biShop,
  biPersonVcard,
  biArrowRightShort
} from '@quasar/extras/bootstrap-icons';

useHead({
  title: 'BYBE - Pathfinder 2e GM Tools',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev'
    }
  ]
});

const cards = [
  {
    name: 'Encounter Builder',
    to: '/encounter',
    description: 'Balance or randomly create combat encounters.',
    subtext: 'Try it out',
    icon: biCalculator
  },
  {
    name: 'Shop Generator',
    to: '/shop',
    description: 'Create various types of shops of a specific level.',
    subtext: 'Work in progress...',
    icon: biShop
  },
  {
    name: 'NPC Generator',
    to: '/npc',
    description: "Quickly generate an NPC's name, ancestry, background and quirks.",
    subtext: 'Work in progress...',
    icon: biPersonVcard
  }
];
</script>

<template>
  <div class="tw-max-w-[85rem] tw-px-4 tw-pb-10 sm:tw-px-6 lg:tw-px-8 lg:tw-py-14 tw-mx-auto">
    <div class="tw-max-w-2xl tw-mx-auto tw-text-center tw-my-4 lg:tw-mb-14">
      <h2 class="tw-block text-h4 text-bold tw-text-gray-800 dark:tw-text-white sm:tw-text-4xl">
        Welcome to BYBE
      </h2>
      <p class="tw-mt-3 text-h6 tw-text-gray-600 dark:tw-text-gray-300">
        BYBE provides tools to help Pathfinder 2e Game Masters.
      </p>
    </div>
    <div class="tw-grid sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
      <!-- Cards -->
      <router-link
        v-for="item in cards"
        :key="item.to"
        flat
        class="tw-group tw-flex tw-gap-y-6 tw-w-full tw-h-full hover:tw-bg-gray-100 tw-rounded-lg tw-p-5 tw-transition-all dark:hover:tw-bg-white/[.075]"
        :to="item.to"
      >
        <q-icon
          :name="item.icon"
          class="tw-flex-shrink-0 tw-w-8 tw-h-8 tw-text-gray-800 tw-mt-4 tw-mr-6 dark:tw-text-gray-200"
        />

        <div>
          <div>
            <h3 class="tw-block text-bold tw-text-gray-800 dark:tw-text-white">
              {{ item.name }}
            </h3>
            <p class="tw-text-gray-600 dark:tw-text-gray-400">
              {{ item.description }}
            </p>
          </div>

          <p
            class="tw-mt-3 tw-inline-flex tw-items-center tw-gap-x-2 tw-text-sm text-medium tw-text-gray-800 dark:tw-text-gray-200"
          >
            {{ item.subtext }}
            <q-icon
              :name="biArrowRightShort"
              class="tw-transition tw-ease-in-out group-hover:tw-translate-x-1"
              size="sm"
            />
          </p>
        </div>
      </router-link>
      <!-- Ends Card -->
    </div>
  </div>
</template>
