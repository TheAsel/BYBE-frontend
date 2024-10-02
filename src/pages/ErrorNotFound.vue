<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '@unhead/vue';

useHead({
  title: '404 Not Found - BYBE',
  meta: [
    {
      name: 'robots',
      content: 'noindex'
    }
  ]
});

const supportButton = ref(
  document.querySelectorAll('[id^=kofi-widget-overlay-]').item(0) as HTMLElement
);

supportButton.value.style.display = 'none';
</script>

<template>
  <main class="fullscreen bg-blue-8 text-white text-center q-pa-md flex flex-center">
    <div class="q-gutter-y-md">
      <h1 class="tw tw-text-9xl">404</h1>
      <h2 class="tw-text-3xl tw-opacity-80">You critically failed your Stealth check.</h2>
      <p class="tw-text-xl tw-opacity-80">
        The guards notice you and tell you that you're at the wrong address.
      </p>
      <q-btn
        class="q-mt-xl tw-text-lg"
        color="white"
        text-color="blue-8"
        unelevated
        to="/"
        label="Go to home page"
        no-caps
      />
    </div>
  </main>
</template>
