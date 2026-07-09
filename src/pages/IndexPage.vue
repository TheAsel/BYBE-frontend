<script setup lang="ts">
import {
  biArrowRightShort,
  biCalculator,
  biHouses,
  biPencil,
  biPersonVcard,
  biShop
} from "@quasar/extras/bootstrap-icons";
import { useHead } from "@unhead/vue";

import { settingsStore } from "@/stores/settings";

useHead({
  link: [
    {
      href: "https://bybe.app",
      rel: "canonical"
    }
  ],
  title: "BYBE - Pathfinder & Starfinder 2e GM Tools"
});

const settings_store = settingsStore();

const cards = [
  {
    description: "Balance or randomly create combat encounters.",
    icon: biCalculator,
    name: "Encounter Builder",
    subtext: "Try it out",
    to: "/encounter"
  },
  {
    description: "Create various types of shops of a specific level.",
    icon: biShop,
    name: "Shop Generator",
    subtext: "Try it out",
    to: "/shop"
  },
  {
    description:
      "Quickly generate an NPC's name, ancestry, background and quirks.",
    icon: biPersonVcard,
    name: "NPC Generator",
    subtext: "Try it out",
    to: "/npc"
  },
  {
    description: "Create custom creatures with the help of custom generation.",
    icon: biPencil,
    name: "Creature Generator",
    subtext: "Work in progress...",
    to: "/creature"
  },
  {
    description:
      "Combine what you created with the other tools to plan an entire city.",
    icon: biHouses,
    name: "City Planner",
    subtext: "Work in progress...",
    to: "/city"
  }
];
</script>

<template>
  <div
    class="tw:place-content-center tw:overflow-auto tw:h-full tw:w-full! tw:px-4 tw:sm:px-6 tw:lg:px-8 tw:py-4 tw:pt-0 tw:2xl:py-14 tw:mx-auto"
  >
    <div
      class="tw:max-w-3xl tw:mx-auto tw:text-center tw:my-4 tw:2xl:mb-14 tw:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
    >
      <h1 class="tw:block tw:text-white tw:text-4xl! tw:font-bold!">
        Welcome to BYBE
      </h1>
      <h2 class="tw:mt-3 text-h6 tw:text-gray-200">
        BYBE provides tools to help Pathfinder 2e and Starfinder 2e Game
        Masters.
      </h2>
    </div>
    <div
      class="tw:grid tw:sm:grid-cols-2 tw:lg:grid-cols-3 tw:gap-6 tw:mx-auto tw:max-w-7xl"
    >
      <!-- Cards -->
      <router-link
        v-for="item in cards"
        :key="item.to"
        flat
        class="tw:group tw:backdrop-blur tw:border-2 tw:bg-white/5 tw:dark:bg-gray-800/20 tw:border-gray-200/20 tw:dark:border-neutral-800/20 tw:hover:border-blue-600 tw:dark:hover:border-blue-500 tw:flex tw:gap-y-6! tw:w-full tw:h-full tw:rounded-lg tw:p-5! tw:transition-all"
        :to="{ path: item.to, query: { game: settings_store.game } }"
      >
        <q-icon
          :name="item.icon"
          size="md"
          class="tw:shrink-0 tw:w-8! tw:h-8! tw:mt-4! tw:mr-6! tw:text-gray-200 tw:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
        />

        <div class="tw:drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          <div>
            <h3
              class="tw:text-sm! tw:mt-3! tw:block tw:font-bold! tw:text-white"
            >
              {{ item.name }}
            </h3>
            <p class="tw:text-gray-300 tw:mt-3!">
              {{ item.description }}
            </p>
          </div>

          <p
            class="tw:inline-flex tw:items-center tw:gap-x-2 tw:text-sm text-medium tw:text-gray-200"
          >
            {{ item.subtext }}
            <q-icon
              :name="biArrowRightShort"
              class="tw:transition tw:ease-in-out tw:group-hover:translate-x-1"
              size="sm"
            />
          </p>
        </div>
      </router-link>
      <!-- Ends Card -->
    </div>
  </div>
</template>
