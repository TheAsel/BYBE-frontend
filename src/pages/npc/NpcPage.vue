<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { scroll } from 'quasar';
import Shepherd from 'shepherd.js';
import { onMounted, onUnmounted, ref } from 'vue';

import NpcEditor from 'src/components/npc/NpcEditor.vue';
import NpcGenerator from 'src/components/npc/NpcGenerator.vue';
import NpcSheet from 'src/components/npc/NpcSheet.vue';
import { npcStore } from 'src/stores/npc';
import { settingsStore } from 'src/stores/settings';
import { updateLocalStorageNpcs } from 'src/utils/local-storage';

import type { npc } from 'src/types/npcs';

useHead({
  title: 'NPC Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/npc'
    }
  ]
});

const settings = settingsStore();
const npcs = npcStore();

const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageNpcs();

const tmpLanks: npc = {
  level: 5,
  name: '"Lucky" Lanks',
  gender: 'Male',
  ancestry: 'Halfling',
  culture: '',
  class: 'Rogue',
  job: 'God',
  nickname: '',
  languages: 'Common',
  description: 'The mascot of this site, being always on top of the list',
  personality: 'Kind and supportive, loves giving feedback',
  quirk: 'Sometimes his weapons disappear or duplicate',
  relationships: 'The frontend developer TheAsel and the backend developer RakuJa',
  ideology: 'The frontend is better than the backend',
  custom_fields: [{ name: '', body: '' }],
  game: settings.game
};

Shepherd.on('start', () => {
  const index = npcs.npcs.findIndex((obj) => obj.name === 'Example');
  if (index === -1) {
    npcs.addNpc('Example');
    npcs.updateNpc('Example', tmpLanks);
  } else {
    npcs.changeActiveNpc(index);
  }
});

['complete', 'cancel'].forEach((event) =>
  Shepherd.on(event, () => {
    npcs.removeNpc();
  })
);

const pageRef = ref<HTMLElement>();

function scrollDirection() {
  scroll.getVerticalScrollPosition(pageRef.value!);
  scrollUp.value = scroll.getVerticalScrollPosition(pageRef.value!) > 0;
}

function scrollPage() {
  const settings = settingsStore();
  settings.setHiddenNav(true);
  setTimeout(() => {
    if (scrollUp.value) {
      scroll.setVerticalScrollPosition(pageRef.value!, 0, 500);
    } else {
      scroll.setVerticalScrollPosition(pageRef.value!, pageRef.value!.scrollHeight, 500);
    }
  }, 10);
}

const handleResize = () => {
  screenWidth.value = screen.width;
};

onMounted(() => {
  pageRef.value = document.getElementById('pageRef')!;
  pageRef.value.addEventListener('scroll', scrollDirection);
  globalThis.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  pageRef.value!.removeEventListener('scroll', scrollDirection);
  globalThis.removeEventListener('resize', handleResize);
});
</script>

<template>
  <q-page id="pageRef" class="tw:h-full row items-center justify-between tw:overflow-auto">
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
