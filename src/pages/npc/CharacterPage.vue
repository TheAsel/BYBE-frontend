<script setup lang="ts">
import { matPrint, matPriorityHigh } from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import NpcSheet from "@/components/npc/NpcSheet.vue";
import { npcStore } from "@/stores/npc";
import { settingsStore } from "@/stores/settings";
import { updateLocalStorageNpcs } from "@/utils/local-storage";

const title = ref("NPC Sheet - BYBE");

useHead({
  link: [
    {
      href: "https://bybe.app/character",
      rel: "canonical"
    }
  ],
  title
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const npc_store = npcStore();
const settings_store = settingsStore();

const npcId = Number(route.query.id);

updateLocalStorageNpcs();

if (Number.isNaN(npcId) || npcId < 0 || npcId >= npc_store.npcs.length) {
  console.error("Missing NPC ID");
  $q.notify({
    icon: matPriorityHigh,
    message: "Missing NPC ID",
    progress: true,
    type: "warning"
  });
  await router.push({ name: "npc", query: { game: settings_store.game } });
} else {
  npc_store.setActiveNpc(npcId);
}

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
    <q-btn
      fab
      :icon="matPrint"
      color="primary"
      aria-label="Print item sheet"
      @click="printPage"
    />
  </q-page-sticky>
</template>
