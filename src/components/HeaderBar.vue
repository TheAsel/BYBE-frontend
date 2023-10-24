<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { biList, biGithub, biSun, biMoon } from '@quasar/extras/bootstrap-icons';
import { TailwindDarkFix } from 'src/utils/tw-dark-fix';
import debounce from 'lodash/debounce';

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
  { name: 'Shop Generator', to: '/shop/' },
  { name: 'NPC Generator', to: '/npc/' }
];

const $q = useQuasar();
const theme = ref(localStorage.getItem('hs_theme'));

switch (theme.value) {
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

if (theme.value === 'dark') {
  $q.dark.set(true);
}

const themeSwitch = () => {
  $q.dark.toggle();
  if ($q.dark.isActive) {
    theme.value = 'dark';
    localStorage.setItem('hs_theme', 'dark');
  } else {
    theme.value = 'light';
    localStorage.setItem('hs_theme', 'light');
  }
};

const hidden = ref(true);
const unhide = debounce(function () {
  hidden.value = !hidden.value;
}, 50);
</script>

<template>
  <header
    class="tw-flex tw-flex-wrap sm:tw-justify-start sm:tw-flex-nowrap tw-z-50 tw-w-full tw-bg-white tw-border-b tw-border-gray-200 tw-text-sm tw-py-3 sm:tw-py-0 dark:tw-bg-gray-800 dark:tw-border-gray-700"
  >
    <nav
      class="tw-relative tw-w-full tw-mx-auto tw-px-4 sm:tw-flex sm:tw-items-center sm:tw-justify-between sm:tw-px-6 lg:tw-px-8"
      aria-label="Global"
    >
      <div class="tw-flex tw-items-center tw-justify-between">
        <router-link
          flat
          class="text-h5 tw-flex tw-flex-nowrap dark:tw-text-white tw-my-auto"
          to="/"
        >
          <q-avatar size="36px">
            <img v-if="theme === 'light'" src="/favicon-64x64-light.png" alt="Light BYBE logo" />
            <img v-else src="/favicon-64x64-dark.png" alt="Dark BYBE logo" />
          </q-avatar>
          <div class="tw-my-auto tw-ml-4">BYBE</div>
        </router-link>
        <div class="sm:tw-hidden">
          <q-btn
            flat
            unelevated
            type="button"
            aria-controls="navbar-collapse"
            aria-label="Toggle navigation"
            :icon="biList"
            @click="unhide"
          />
        </div>
      </div>
      <div
        id="navbar-collapse"
        class="tw-grow sm:tw-block"
        :class="{ 'tw-hidden': hidden, 'overflow-hidden': hidden }"
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
          <q-separator vertical inset class="sm:tw-block tw-hidden" />

          <div class="tw-flex tw-items-center tw-relative">
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              :icon="biGithub"
              href="https://github.com/TheAsel/BYBE-frontend"
              target="_blank"
              aria-label="GitHub link"
              rel="noopener"
            />
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="sm:tw-mr-2 tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              @click="themeSwitch"
              :icon="$q.dark.isActive ? biSun : biMoon"
              aria-label="Toggle theme"
            />
            <q-btn
              v-if="currentPath === '/encounter/'"
              flat
              padding="sm"
              class="tw-text-gray-800 hover:tw-bg-gray-100 dark:tw-text-gray-200 dark:hover:tw-bg-gray-700"
              @click="$tours[currentPath].start()"
              aria-label="Start help tour"
            >
              HELP
            </q-btn>
            <div v-else class="tw-mr-[50px]"></div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
