<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { scroll } from 'quasar';
import { onMounted, onUnmounted, ref } from 'vue';

import NpcEditor from 'src/components/npc/NpcEditor.vue';
import NpcGenerator from 'src/components/npc/NpcGenerator.vue';
import NpcSheet from 'src/components/npc/NpcSheet.vue';
import { npcStore } from 'src/stores/npc';
import { settingsStore } from 'src/stores/settings';
import { updateLocalStorageNpcs } from 'src/utils/local-storage';
import { getTourCallbacks, getTourOptions } from 'src/utils/vue-tour';

import type { npc } from 'src/types/npcs';
import type { Step } from 'vue3-tour';

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

const tourActive = ref(false);
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageNpcs();

const steps: Step[] = [
  {
    target: '#v-step-0',
    content:
      'This is the NPC generator. Here you can define your preferred setting for the random NPC generator.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-1',
    content: 'After having picked your settings of choice, click here to generate an NPC.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-2',
    content:
      'From here you can modify the individual parameters of your NPC. You can also save or delete the NPCs you created.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-3',
    content:
      'Clicking this button will generate a link to your current NPC that you can copy and share.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-4',
    content: 'Each of these fields can be manually locked, edited or randomly generated.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-5',
    content: 'These fields below can only be manually edited instead.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-6',
    content: 'Here you can modify custom fields. Add new ones by clicking the "+" button.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-7',
    content:
      'This is where the final result of your NPC will be displayed. Click on the icon to the left of the name to open a new page with the fullscreen sheet.',
    params: {
      placement: 'auto'
    }
  }
];

const startTour = () => {
  if (!tourActive.value) {
    tourActive.value = true;
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

    npcs.addNpc('Example');
    npcs.updateNpc('Example', tmpLanks);
  }
};

const stopTour = () => {
  if (tourActive.value) {
    npcs.removeNpc();
    tourActive.value = false;
  }
};

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
    <v-tour
      name="/npc"
      :steps="steps"
      :options="getTourOptions()"
      :callbacks="getTourCallbacks(startTour, stopTour)"
    />
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
