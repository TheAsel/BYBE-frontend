<script setup lang="ts">
import {
  matArrowDownward,
  matArrowUpward
} from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { scroll } from "quasar";
import Shepherd from "shepherd.js";
import { onMounted, onUnmounted, ref } from "vue";

import NpcEditor from "@/components/npc/NpcEditor.vue";
import NpcGenerator from "@/components/npc/NpcGenerator.vue";
import NpcSheet from "@/components/npc/NpcSheet.vue";
import { npcStore } from "@/stores/npc";
import { settingsStore } from "@/stores/settings";
import { updateLocalStorageNpcs } from "@/utils/local-storage";

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

const settings_store = settingsStore();
const npc_store = npcStore();

const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageNpcs();

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

const pageRef = ref<HTMLElement>();

function scrollDirection(): void {
  scroll.getVerticalScrollPosition(pageRef.value!);
  scrollUp.value = scroll.getVerticalScrollPosition(pageRef.value!) > 0;
}

function scrollPage(): void {
  settings_store.setHiddenNav(true);
  setTimeout(() => {
    if (scrollUp.value) {
      scroll.setVerticalScrollPosition(pageRef.value!, 0, 500);
    } else {
      scroll.setVerticalScrollPosition(
        pageRef.value!,
        pageRef.value!.scrollHeight,
        500
      );
    }
  }, 10);
}

const handleResize = (): void => {
  screenWidth.value = screen.width;
};

onMounted(() => {
  pageRef.value = document.querySelector("#pageRef")!;
  pageRef.value.addEventListener("scroll", scrollDirection);
  globalThis.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  pageRef.value!.removeEventListener("scroll", scrollDirection);
  globalThis.removeEventListener("resize", handleResize);
});
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
      v-if="screenWidth < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw:z-10 tw:opacity-85 only-screen"
    >
      <q-btn
        fab
        :icon="scrollUp ? matArrowUpward : matArrowDownward"
        padding="sm"
        color="primary"
        @click="scrollPage"
      />
    </q-page-sticky>
  </q-page>
</template>
