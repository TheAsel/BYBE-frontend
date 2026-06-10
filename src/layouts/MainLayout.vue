<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { requestRepoInfo } from 'src/api/github-api';
import HeaderBar from 'src/components/HeaderBar.vue';
import { settingsStore } from 'src/stores/settings';

import { version } from '../../package.json';

const newestVersion = ref(version);
const isApp = process.env.IS_APP === 'true';
const repoUrl = process.env.REPO_URL;
const latestRelease = 'https://github.com/' + repoUrl + '/releases/latest';

const settings = settingsStore();

const route = useRoute();
const isDownload = computed(() => {
  return route.path === '/download';
});

const queryGame: string = String(route.query.game).toLowerCase();
if (queryGame === 'sf') {
  settings.setGame('sf');
} else {
  settings.setGame('pf');
}

const backgroundStyle = computed(() => {
  let imageUrl: string;

  if (isDownload.value) {
    imageUrl = '/home-background.webp';
  } else {
    imageUrl = settings.game === 'sf' ? '/sf2e-background.webp' : '/pf2e-background.webp';
  }
  return {
    backgroundImage: `url('${imageUrl}')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    position: 'absolute'
  };
});

try {
  if (process.env.REPO_URL) {
    const repoInfo = await requestRepoInfo(process.env.REPO_URL);
    if (repoInfo) {
      newestVersion.value = repoInfo.name.substring(1);
    } else {
      throw new Error('Error fetching repository info');
    }
  } else {
    throw new Error('.env variable REPO_URL not set');
  }
} catch (error) {
  console.error(error);
}
</script>

<template>
  <q-layout view="hHh lpr fFf" :style="backgroundStyle" class="tw:h-full">
    <HeaderBar class="tw:backdrop-blur-2xl tw:bg-white/90! tw:dark:bg-black/70!" />

    <q-page-container class="tw:flex tw:flex-col tw:h-full">
      <router-view />
    </q-page-container>
    <q-footer
      class="tw:text-center tw:py-2 tw:my-0! tw:border-t tw:border-gray-200 tw:dark:border-gray-700 tw:backdrop-blur-2xl tw:bg-white/90! tw:dark:bg-black/70!"
    >
      <div class="tw:max-w-340 tw:mx-auto tw:px-4 tw:sm:px-6 tw:lg:px-8">
        <p class="tw:text-sm tw:text-neutral-500 tw:dark:text-neutral-400 tw:mb-0!">
          BYBE - v{{ version }}
          <a
            v-if="version !== newestVersion && !isApp"
            class="tw:text-blue-600 tw:dark:text-blue-400 tw:decoration-2 tw:hover:underline"
            :href="latestRelease"
            target="_blank"
            rel="noopener"
          >
            (Update Available!)</a
          >
          |
          <span v-if="!isDownload">
            <router-link
              :to="{ path: '/license', query: { game: settings.game } }"
              class="tw:hover:text-gray-900 tw:dark:hover:text-neutral-300"
              >Licenses and Policies</router-link
            >
            |
          </span>
          <a
            class="tw:hover:text-gray-900 tw:dark:hover:text-neutral-300"
            :href="latestRelease"
            target="_blank"
            rel="noopener"
          >
            What's new
          </a>
        </p>
      </div>
    </q-footer>
  </q-layout>
</template>

<style lang="scss">
@media screen {
  .only-print {
    display: none !important;
  }

  .only-screen {
    display: block !important;
  }
}

@media print {
  header,
  footer {
    display: none !important;
  }

  .q-scrollarea {
    height: 120vh !important;
    padding-top: 3vh !important;
  }

  .hide-print {
    visibility: hidden !important;
  }

  .show-print {
    visibility: visible !important;
  }

  .only-print {
    display: block !important;
  }

  .only-screen {
    display: none !important;
  }

  h1,
  span,
  i {
    color: black !important;
  }

  .tw\:flex-wrap > * {
    margin: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 1 !important;
    padding-right: 1 !important;
  }

  .q-gutter-y-xs * {
    margin-top: 0.2rem !important;
    line-height: 1.2rem !important;
  }

  .tw\:text-2xl {
    font-size: 18px !important;
    padding-top: 1vh !important;
    line-height: 0.2rem !important;
    color: black !important;
  }

  .tw\:text-sm {
    font-size: 12px !important;
    color: black !important;
  }

  .tw\:text-base {
    font-size: 14px !important;
    color: black !important;
  }

  body {
    width: 95vh !important;
    padding-right: 30vh !important;
    padding-left: 5vh !important;
  }

  html,
  body {
    height: 99% !important;
    overflow: hidden !important;
  }
}

@-moz-document url-prefix() {
  @media print {
    body {
      padding-right: 0 !important;
      padding-left: 0 !important;
    }

    html,
    body {
      height: 120vh !important;
    }
  }
}
</style>
