<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { TailwindDarkFix } from '../utils/tw-dark-fix';

TailwindDarkFix();

const route = useRoute();
const currentPath = ref(route.path);

watch(
  () => route.path,
  () => {
    currentPath.value = route.path;
  }
);

const navigation = [
  { name: 'Encounter Builder', to: '/encounter/' },
  { name: 'NPC Generator', to: '/npc/' },
  { name: 'Shop Generator', to: '/shop/' }
];

const $q = useQuasar();
let theme = localStorage.getItem('hs_theme');

switch (theme) {
  case 'dark':
    $q.dark.set(true);
    break;
  case 'light':
    $q.dark.set(false);
    break;

  default:
    localStorage.setItem('hs_theme', 'dark');
    $q.dark.set(true);
    break;
}

if (theme === 'dark') {
  $q.dark.set(true);
}

const themeSwitch = () => {
  $q.dark.toggle();
  if ($q.dark.isActive) {
    localStorage.setItem('hs_theme', 'dark');
  } else {
    localStorage.setItem('hs_theme', 'light');
  }
};
</script>

<template>
  <header
    class="tw-flex tw-flex-wrap sm:tw-justify-start sm:tw-flex-nowrap tw-z-50 tw-w-full tw-bg-white tw-border-b tw-border-gray-200 tw-text-sm tw-py-3 sm:tw-py-0 dark:tw-bg-gray-800 dark:tw-border-gray-700"
  >
    <nav
      class="tw-relative tw-max-w-7xl tw-w-full tw-mx-auto tw-px-4 sm:tw-flex sm:tw-items-center sm:tw-justify-between sm:tw-px-6 lg:tw-px-8"
      aria-label="Global"
    >
      <div class="tw-flex tw-items-center tw-justify-between">
        <router-link flat class="text-h6 tw-flex-none tw-font-xl dark:tw-text-white" to="/">
          BYBE
        </router-link>
        <div class="sm:tw-hidden">
          <q-btn
            flat
            unelevated
            type="button"
            data-hs-collapse="#navbar-collapse-with-animation"
            aria-controls="navbar-collapse-with-animation"
            aria-label="Toggle navigation"
            icon="bi-list"
          />
        </div>
      </div>
      <div
        id="navbar-collapse-with-animation"
        class="tw-hs-collapse:tw-hidden tw-overflow-hidden tw-transition-all tw-duration-300 tw-basis-full tw-grow sm:tw-block"
      >
        <div
          class="tw-flex tw-flex-col tw-gap-y-4 tw-gap-x-0 tw-mt-5 sm:tw-flex-row sm:tw-items-center sm:tw-justify-end sm:tw-gap-y-0 sm:tw-gap-x-7 sm:tw-mt-0 sm:tw-pl-7"
        >
          <router-link
            flat
            no-caps
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            :class="
              currentPath === item.to
                ? 'tw-text-blue-600 sm:tw-py-4 dark:tw-text-blue-400'
                : 'tw-text-gray-500 hover:tw-text-gray-400 sm:tw-py-4 dark:tw-text-gray-400 dark:hover:tw-text-gray-500'
            "
            :aria-current="item.to ? 'page' : undefined"
            >{{ item.name }}
          </router-link>
          <q-separator vertical inset />

          <div class="tw-flex tw-items-center tw-relative">
            <q-btn
              flat
              round
              class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              icon="bi-github"
              size="12px"
              href="https://github.com/TheAsel/BYBE-frontend"
              target="_blank"
              aria-label="GitHub link"
            />
            <q-btn
              flat
              round
              size="11px"
              class="tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              @click="themeSwitch"
              :icon="$q.dark.isActive ? 'bi-sun' : 'bi-moon'"
              aria-label="Toggle theme"
            />
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
