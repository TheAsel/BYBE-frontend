<script setup lang="ts">
import { matPrint } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import NpcSheet from 'src/components/npc/NpcSheet.vue';
import { npcStore } from 'src/stores/npc';
import { updateLocalStorageNpcs } from 'src/utils/local-storage';

const title = ref('NPC Sheet - BYBE');

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/character'
    }
  ]
});

const route = useRoute();
const npcs = npcStore();

const npcId = Number(route.query.id);

updateLocalStorageNpcs();

npcs.setActiveNpc(npcId);

const printPage = () => {
  globalThis.print();
};
</script>

<template>
  <NpcSheet class="tw:mx-auto character-page q-pa-md tw:w-full tw:md:w-228!" />
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw:z-10 only-screen tw:opacity-85"
  >
    <q-btn fab :icon="matPrint" color="primary" aria-label="Print item sheet" @click="printPage" />
  </q-page-sticky>
</template>
