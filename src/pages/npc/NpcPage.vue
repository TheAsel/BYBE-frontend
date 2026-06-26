<script setup lang="ts">
import {
  matArrowDownward,
  matArrowUpward,
  matPriorityHigh
} from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { useQuasar } from "quasar";
import Shepherd from "shepherd.js";
import { onMounted, onUnmounted, ref } from "vue";

import NpcEditor from "@/components/npc/NpcEditor.vue";
import NpcGenerator from "@/components/npc/NpcGenerator.vue";
import NpcSheet from "@/components/npc/NpcSheet.vue";
import { npcStore } from "@/stores/npc";
import { settingsStore } from "@/stores/settings";
import { validateNpcs } from "@/utils/local-storage";
import { getScreenWidth, scrollDirection, scrollPage } from "@/utils/screen";

import type { npc } from "@/types/npc";

useHead({
  link: [
    {
      href: "https://bybe.app/npc",
      rel: "canonical"
    }
  ],
  title: "NPC Generator - BYBE"
});

const $q = useQuasar();

const settings_store = settingsStore();
const npc_store = npcStore();

const { width } = getScreenWidth();
const scrollUp = ref(false);
const pageRef = ref<HTMLElement | null>(null);

const updateScrollUp = (): void => {
  scrollUp.value = scrollDirection(pageRef.value);
};

onMounted(() => {
  pageRef.value = document.querySelector("#pageRef")!;
  if (pageRef.value !== null) {
    pageRef.value.addEventListener("scroll", updateScrollUp);
  }
});

onUnmounted(() => {
  if (pageRef.value !== null) {
    pageRef.value.removeEventListener("scroll", updateScrollUp);
  }
});

const localNpc = localStorage.getItem("npcs");
if (localNpc !== null && !validateNpcs(localNpc)) {
  $q.notify({
    icon: matPriorityHigh,
    message: "Invalid loaded npcs format",
    progress: true,
    type: "warning"
  });
}

const tmpLanks: npc = {
  ancestry: "Halfling",
  class: "Rogue",
  culture: "",
  custom_fields: [{ body: "", name: "" }],
  description: "The mascot of this site, being always on top of the list",
  game: settings_store.game,
  gender: "Male",
  ideology: "The frontend is better than the backend",
  job: "God",
  languages: "Common",
  level: 5,
  name: '"Lucky" Lanks',
  nickname: "",
  personality: "Kind and supportive, loves giving feedback",
  quirk: "Sometimes his weapons disappear or duplicate",
  relationships:
    "The frontend developer TheAsel and the backend developer RakuJa"
};

Shepherd.on("start", () => {
  const index = npc_store.npcs.findIndex(obj => obj.name === "Example");
  if (index === -1) {
    npc_store.addNpc("Example");
    npc_store.updateNpc("Example", tmpLanks);
  } else {
    npc_store.changeActiveNpc(index);
  }
});

for (const event of ["complete", "cancel"]) {
  Shepherd.on(event, () => {
    npc_store.removeNpc();
  });
}
</script>

<template>
  <q-page
    id="pageRef"
    class="tw:h-full row items-center justify-between tw:overflow-auto"
  >
    <NpcGenerator id="generator" class="tw:p-4 tw:w-full tw:md:w-[33%]" />
    <NpcEditor class="tw:p-4 tw:md:px-0 tw:md:py-4 tw:w-full tw:md:w-[34%]" />
    <NpcSheet id="sheet" class="tw:p-4 tw:md:px-4 tw:w-full tw:md:w-[33%]" />
    <q-page-sticky
      v-if="width < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw:z-10 tw:opacity-85 only-screen"
    >
      <q-btn
        fab
        :icon="scrollUp ? matArrowUpward : matArrowDownward"
        padding="sm"
        color="primary"
        @click="scrollPage(pageRef, scrollUp)"
      />
    </q-page-sticky>
  </q-page>
</template>
