<script setup lang="ts">
import HeaderBar from 'components/HeaderBar.vue';
</script>

<template>
  <q-layout view="hHh lpr fFf">
    <q-page-container>
      <HeaderBar />
      <router-view style="min-height: auto" />
      <footer class="tw-relative tw-bottom-0 tw-inset-x-0 tw-text-center tw-py-5">
        <div class="tw-max-w-[85rem] tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
          <p class="tw-text-sm dark:tw-text-white/50 tw-text-black/70">
            This website is not published, endorsed, or specifically approved by Paizo Inc. We are
            expressly prohibited from charging you to use or access this content.
          </p>
        </div>
      </footer>
    </q-page-container>
  </q-layout>
</template>
