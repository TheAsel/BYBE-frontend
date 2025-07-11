<script setup lang="ts">
import { fabApple, fabLinux, fabWindows } from '@quasar/extras/fontawesome-v6';
import { matDownload } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { onMounted, ref } from 'vue';

import { requestRepoInfo } from '../utils/github-api';

useHead({
  title: 'Download - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/download'
    }
  ]
});

const tab = ref('windows');

if (navigator.userAgent.includes('Windows')) {
  tab.value = 'windows';
} else if (navigator.userAgent.includes('Linux')) {
  tab.value = 'linux';
} else if (navigator.userAgent.includes('Mac')) {
  tab.value = 'macos';
}

const latestVersion = ref('unknown');
const latestTag = ref('unknown');

onMounted(async () => {
  try {
    const repoInfo = await requestRepoInfo('RakuJa/BYBE-Portable');
    if (repoInfo) {
      latestVersion.value = repoInfo.name.substring(1);
      latestTag.value = repoInfo.tag_name;
    } else {
      throw new Error('Error fetching repository info');
    }
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <q-tabs v-model="tab" inline-label no-caps class="text-white tw-backdrop-blur" align="justify">
    <q-tab name="windows" :icon="fabWindows" label="Windows" />
    <q-tab name="macos" :icon="fabApple" label="macOS" />
    <q-tab name="linux" :icon="fabLinux" label="Linux" />
  </q-tabs>
  <q-separator />

  <div class="tw-opacity-85 dark:tw-opacity-90 q-pa-md tw-w-full md:tw-w-[57rem] tw-mx-auto">
    <div
      class="tw-items-center tw-text-left tw-max-w-[55rem] tw-rounded-xl tw-border tw-bg-white tw-border-gray-200 dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <q-tab-panels v-model="tab" animated class="tw-bg-white/0">
        <q-tab-panel name="windows">
          <div style="height: calc(100vh - 234px)" class="row items-center justify-evenly">
            <div class="tw-text-center tw-py-10 tw-px-4 sm:tw-px-6 lg:tw-px-8">
              <h1
                class="tw-block tw-text-2xl tw-font-bold tw-text-gray-800 dark:tw-text-neutral-200 sm:tw-text-4xl"
              >
                Download BYBE for Windows
              </h1>
              <p class="tw-text-gray-800 dark:tw-text-neutral-200 tw-text-md">
                Latest version: {{ latestVersion }}
              </p>
              <q-btn
                rounded
                no-caps
                color="primary"
                label="Download for Windows"
                class="tw-mt-8 tw-text-lg"
                :icon="matDownload"
                :href="
                  'https://github.com/RakuJa/BYBE-Portable/releases/download/' +
                  latestTag +
                  '/BYBE-Portable_' +
                  latestVersion +
                  '_x64-setup.exe'
                "
              />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="macos">
          <div style="min-height: calc(100vh - 234px)" class="row items-center justify-evenly">
            <div class="tw-text-center tw-py-10 tw-px-4 sm:tw-px-6 lg:tw-px-8">
              <h1
                class="tw-block tw-text-2xl tw-font-bold tw-text-gray-800 dark:tw-text-neutral-200 sm:tw-text-4xl"
              >
                Download BYBE for macOS
              </h1>
              <p class="tw-text-gray-800 dark:tw-text-neutral-200 tw-text-md">
                Latest version: {{ latestVersion }}
              </p>
              <q-btn-dropdown
                rounded
                no-caps
                color="primary"
                label="Download for macOS"
                class="tw-mt-8 tw-text-lg"
                :icon="matDownload"
              >
                <q-list>
                  <q-item
                    v-close-popup
                    clickable
                    :href="
                      'https://github.com/RakuJa/BYBE-Portable/releases/download/' +
                      latestTag +
                      '/BYBE-Portable_' +
                      latestVersion +
                      '_aarch64.dmg'
                    "
                  >
                    <q-item-section>
                      <q-item-label>arm64 (Apple Silicon)</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    clickable
                    :href="
                      'https://github.com/RakuJa/BYBE-Portable/releases/download/' +
                      latestTag +
                      '/BYBE-Portable_' +
                      latestVersion +
                      '_x64.dmg'
                    "
                  >
                    <q-item-section>
                      <q-item-label>x86_64 (Intel)</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="linux">
          <div style="min-height: calc(100vh - 234px)" class="row items-center justify-evenly">
            <div class="tw-text-center tw-py-10 tw-px-4 sm:tw-px-6 lg:tw-px-8">
              <h1
                class="tw-block tw-text-2xl tw-font-bold tw-text-gray-800 dark:tw-text-neutral-200 sm:tw-text-4xl"
              >
                Download BYBE for Linux
              </h1>
              <p class="tw-text-gray-800 dark:tw-text-neutral-200 tw-text-md">
                Latest version: {{ latestVersion }}
              </p>
              <q-btn-dropdown
                rounded
                no-caps
                color="primary"
                label="Download for Linux"
                class="tw-mt-8 tw-text-lg"
                :icon="matDownload"
              >
                <q-list>
                  <q-item
                    v-close-popup
                    clickable
                    :href="
                      'https://github.com/RakuJa/BYBE-Portable/releases/download/' +
                      latestTag +
                      '/BYBE-Portable_' +
                      latestVersion +
                      '_amd64.AppImage'
                    "
                  >
                    <q-item-section>
                      <q-item-label>AppImage</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    clickable
                    :href="
                      'https://github.com/RakuJa/BYBE-Portable/releases/download/' +
                      latestTag +
                      '/BYBE-Portable_' +
                      latestVersion +
                      '_amd64.deb'
                    "
                  >
                    <q-item-section>
                      <q-item-label>.deb (Ubuntu, Debian...)</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    v-close-popup
                    clickable
                    :href="
                      'https://github.com/RakuJa/BYBE-Portable/releases/download/' +
                      latestTag +
                      '/BYBE-Portable-' +
                      latestVersion +
                      '-1.x86_64.rpm'
                    "
                  >
                    <q-item-section>
                      <q-item-label>.rpm (Fedora, CentOS...)</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
      <div class="tw-text-center tw-px-4 tw-pb-2 sm:tw-px-6 lg:tw-px-8">
        <a
          class="tw-text-blue-600 dark:tw-text-blue-500 tw-decoration-2 hover:tw-underline"
          href="https://github.com/RakuJa/BYBE-Portable/releases"
          target="_blank"
          rel="noopener"
          >Looking for a previous version?</a
        >
      </div>
    </div>
  </div>
</template>
