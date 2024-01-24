<script lang="ts">
import { useHead } from '@unhead/vue';

useHead({
  title: '404 Not Found - BYBE'
});
</script>

<template>
  <div class="fullscreen bg-blue-8 text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue-8"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>
