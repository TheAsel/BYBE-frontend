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
  title: title,
  link: [
    {
      rel: "canonical",
      href: "https://bybe.app/character"
    }
  ]
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const npcs = npcStore();
const settings = settingsStore();

const npcId = Number(route.query.id);

updateLocalStorageNpcs();

if (Number.isNaN(npcId) || npcId < 0 || npcId >= npcs.npcs.length) {
  console.error("Missing NPC ID");
  $q.notify({
    progress: true,
    type: "warning",
    message: "Missing NPC ID",
    icon: matPriorityHigh
  });
  await router.push({ name: "npc", query: { game: settings.game } });
} else {
  npcs.setActiveNpc(npcId);
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
