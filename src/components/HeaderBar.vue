<script setup lang="ts">
import { biGithub, biList, biMoon, biSun } from '@quasar/extras/bootstrap-icons';
import { debounce } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SettingsMenu from 'src/components/SettingsMenu.vue';
import { settingsStore } from 'src/stores/settings';
import { createTourEncounter, createTourNpc, createTourShop } from 'src/utils/tours';
import { TailwindDarkFix } from 'src/utils/tw-dark-fix';

import type { games } from 'src/types/filters';

const settings = settingsStore();
const isApp = process.env.IS_APP === 'true';
const repoUrl = 'https://github.com/' + process.env.REPO_URL;

TailwindDarkFix();

const route = useRoute();
const router = useRouter();
const currentPath = ref(route.path);
const isTourPage = ref(
  currentPath.value.startsWith('/encounter') ||
    currentPath.value.startsWith('/shop') ||
    currentPath.value.startsWith('/npc')
);

watch(
  () => route.path,
  () => {
    currentPath.value = route.path;
    isTourPage.value =
      currentPath.value.startsWith('/encounter') ||
      currentPath.value.startsWith('/shop') ||
      currentPath.value.startsWith('/npc');
  }
);

const navigation = [
  { name: 'Encounter Builder', to: 'encounter' },
  { name: 'Shop Generator', to: 'shop' },
  { name: 'NPC Generator', to: 'npc' },
  { name: 'Creature Generator', to: 'creature' },
  { name: 'City Planner', to: 'city' }
];

const gameOptions = [
  {
    label: 'Pathfinder 2e',
    value: 'pf',
    src: '/pf2e-logo.webp'
  },
  {
    label: 'Starfinder 2e',
    value: 'sf',
    src: '/sf2e-logo.webp'
  }
];

function changeGame(value: games) {
  settings.setGame(value);
  if (value === 'sf') {
    const routeData = router.resolve({
      path: route.path,
      query: { game: 'sf' }
    });
    globalThis.open(routeData.href, '_self');
  } else {
    const routeData = router.resolve({
      path: route.path,
      query: { game: 'pf' }
    });
    globalThis.open(routeData.href, '_self');
  }
}

const $q = useQuasar();
const theme = ref(localStorage.getItem('theme'));

switch (theme.value) {
  case 'dark':
    $q.dark.set(true);
    break;
  case 'light':
    $q.dark.set(false);
    break;

  default:
    localStorage.setItem('theme', 'dark');
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
    localStorage.setItem('theme', 'dark');
  } else {
    theme.value = 'light';
    localStorage.setItem('theme', 'light');
  }
};

const unhide = debounce(function () {
  settings.setHiddenNav(!settings.hidden_nav);
}, 50);
</script>

<template>
  <q-header
    class="tw:flex tw:flex-wrap tw:lg:justify-start tw:lg:flex-nowrap tw:z-50 tw:w-full tw:bg-white tw:border-b tw:border-gray-200 tw:text-sm tw:py-3 tw:lg:py-0 tw:dark:bg-gray-800 tw:dark:border-gray-700 tw:opacity-100 tw:lg:opacity-85 tw:dark:opacity-100 tw:lg:dark:opacity-90"
  >
    <div
      class="tw:relative tw:w-full tw:mx-auto tw:px-4 tw:lg:flex tw:lg:items-center tw:lg:justify-between tw:lg:px-6"
      aria-label="Global"
    >
      <div class="tw:flex tw:items-center tw:justify-between">
        <router-link
          v-if="currentPath === '/' || currentPath === '/download'"
          class="tw:my-2.5 text-h5 tw:flex tw:flex-nowrap tw:dark:text-white"
          to="/"
        >
          <q-avatar size="36px">
            <img
              v-if="theme === 'light'"
              width="36px"
              height="36px"
              src="/favicon-64x64-light.webp"
              alt="Light BYBE logo"
            />
            <img
              v-else
              width="36px"
              height="36px"
              src="/favicon-64x64-dark.webp"
              alt="Dark BYBE logo"
            />
          </q-avatar>
          <div class="tw:my-auto tw:ml-4 tw:text-gray-800 tw:dark:text-gray-200">BYBE</div>
        </router-link>
        <router-link
          v-else
          flat
          class="text-h5 tw:flex tw:flex-nowrap tw:dark:text-white tw:my-auto"
          :to="'/'"
        >
          <q-avatar size="36px">
            <img
              v-if="theme === 'light'"
              width="36px"
              height="36px"
              src="/favicon-64x64-light.webp"
              alt="Light BYBE logo"
            />
            <img
              v-else
              width="36px"
              height="36px"
              src="/favicon-64x64-dark.webp"
              alt="Dark BYBE logo"
            />
          </q-avatar>
          <div
            class="tw:hidden tw:lg:block tw:my-auto tw:ml-4 tw:text-gray-800 tw:dark:text-gray-200"
          >
            BYBE
          </div>
        </router-link>
        <q-select
          v-if="currentPath !== '/download'"
          class="tw:ml-6"
          v-model="settings.game"
          :options="gameOptions"
          :readonly="
            currentPath === '/bestiary' || currentPath === '/item' || currentPath === '/character'
          "
          emit-value
          map-options
          borderless
        >
          <!-- How the selected item appears -->
          <template #selected-item="scope">
            <img
              :src="scope.opt.src"
              :alt="scope.opt.label"
              style="width: 160px; height: 40px; object-fit: contain"
            />
          </template>

          <!-- How each dropdown option appears -->
          <template #option="scope">
            <q-item clickable v-ripple @click="changeGame(scope.opt.value)">
              <q-item-section avatar>
                <img
                  :src="scope.opt.src"
                  :alt="scope.opt.label"
                  style="width: 160px; height: 40px; object-fit: contain"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div class="tw:lg:hidden">
          <q-btn
            flat
            unelevated
            type="button"
            class="tw:lg:mr-2 tw:text-gray-800! tw:dark:text-gray-200!"
            aria-controls="navbar-collapse"
            aria-label="Toggle navigation"
            :icon="biList"
            @click="unhide"
          />
        </div>
      </div>
      <div
        id="navbar-collapse"
        class="tw:grow tw:lg:block"
        :class="{ 'tw:hidden': settings.hidden_nav, 'overflow-hidden': settings.hidden_nav }"
      >
        <div class="tw:flex tw:flex-col tw:lg:flex-row">
          <div
            v-if="currentPath !== '/' && currentPath !== '/download'"
            class="tw:flex tw:flex-col tw:lg:flex-row tw:lg:items-center tw:lg:justify-start tw:gap-y-4 tw:lg:gap-y-0 tw:gap-x-0 tw:lg:gap-x-7 tw:mt-5 tw:lg:mt-0"
          >
            <q-separator
              v-if="currentPath !== '/' && currentPath !== '/download'"
              vertical
              inset
              class="tw:lg:block tw:hidden tw:ml-4!"
            />

            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="'/' + item.to"
              :class="
                currentPath === '/' + item.to
                  ? 'tw:text-blue-600 tw:lg:py-4 tw:dark:text-blue-400'
                  : 'tw:lg:py-4 tw:text-gray-800 tw:hover:text-blue-600  tw:dark:text-neutral-200 tw:dark:hover:text-neutral-400'
              "
              :aria-current="currentPath === item.to ? 'page' : undefined"
              >{{ item.name }}
            </router-link>
          </div>

          <q-space class="tw:lg:block tw:hidden" />

          <q-separator class="tw:block tw:lg:hidden tw:my-4!" />

          <router-link
            v-if="!isApp"
            to="/download"
            class="tw:flex tw:items-center tw:mb-4! tw:lg:mb-0! tw:ml-0! tw:lg:ml-6!"
            :class="
              currentPath === '/download'
                ? 'tw:text-blue-600 tw:lg:py-4 tw:dark:text-blue-400'
                : 'tw:lg:py-4 tw:text-gray-800 tw:hover:text-blue-600  tw:dark:text-neutral-200 tw:dark:hover:text-neutral-400'
            "
            :aria-current="currentPath === '/download' ? 'page' : undefined"
            >Download
          </router-link>

          <q-separator vertical inset class="tw:lg:block tw:hidden tw:lg:mx-7!" />

          <div class="tw:flex tw:items-center tw:gap-x-2! tw:lg:gap-x-2! tw:relative">
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="tw:text-gray-800! tw:dark:text-gray-200!"
              :icon="biGithub"
              :href="repoUrl"
              target="_blank"
              aria-label="GitHub link"
              rel="noopener"
            />
            <q-btn
              flat
              round
              size="sm"
              padding="sm"
              class="tw:lg:mr-2 tw:text-gray-800! tw:dark:text-gray-200!"
              :icon="$q.dark.isActive ? biSun : biMoon"
              aria-label="Toggle theme"
              @click="themeSwitch"
            />
            <SettingsMenu />

            <q-btn
              v-if="isTourPage"
              flat
              class="tw:text-gray-800! tw:dark:text-gray-200!"
              aria-label="Start help tour"
              @click="
                settings.setHiddenNav(true);
                switch (currentPath) {
                  case '/encounter':
                    createTourEncounter().start();
                    break;
                  case '/shop':
                    createTourShop().start();
                    break;
                  case '/npc':
                    createTourNpc().start();
                    break;
                  default:
                    break;
                }
              "
            >
              HELP
            </q-btn>
            <span v-else class="tw:mr-[66.2px]!" />
          </div>
        </div>
      </div>
    </div>
  </q-header>
</template>
