<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { ref } from 'vue';

import NpcEditor from '../../components/sf2e/NPC/NpcEditor.vue';
import NpcGenerator from '../../components/sf2e/NPC/NpcGenerator.vue';
import NpcSheet from '../../components/sf2e/NPC/NpcSheet.vue';
import { npcStore, settingsStore } from '../../stores/store';

import type { npc, npc_list } from '../../types/npcs';
import type { Step, VTourCallbacks, VTourOptions } from 'vue3-tour';

useHead({
  title: 'NPC Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/sf2e/npc'
    }
  ]
});

const settings = settingsStore();
const npcs = npcStore();
const tourActive = ref(false);
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

const localNpcs = localStorage.getItem('npcs');
if (localNpcs) {
  try {
    const parsedNpcs = JSON.parse(localNpcs);
    if (Array.isArray(parsedNpcs)) {
      const isCompatible = parsedNpcs.every((p) => {
        return typeof p.name === 'string';
      });
      if (isCompatible) {
        const npcList: npc_list[] = parsedNpcs;
        const npcNames = npcList.map((p) => p.name);
        if (new Set(npcNames).size !== npcNames.length) {
          throw new Error('Duplicate saved npc names');
        }
        npcs.updateNpcs(npcList);
      } else {
        throw new Error('Invalid saved npc format');
      }
    } else {
      throw new Error('Invalid saved npc format');
    }
  } catch (error) {
    console.error(error);
    const defaultNpc = {
      name: 'Default',
      npc: {
        level: 0,
        gender: '',
        ancestry: '',
        culture: '',
        class: '',
        job: '',
        name: '',
        nickname: '',
        languages: '',
        description: '',
        personality: '',
        quirk: '',
        relationships: '',
        ideology: '',
        custom_fields: [{ name: '', body: '' }]
      },
      culture: false
    };
    localStorage.setItem('npcs', JSON.stringify([defaultNpc]));
    npcs.updateNpcs([defaultNpc]);
  }
}

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
    content: 'Each of these fields can be manually locked, edited or randomly generated.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-4',
    content: 'These fields below can only be manually edited instead.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-5',
    content: 'Here you can modify custom fields. Add new ones by clicking the "+" button.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-6',
    content:
      'This is where the final result of your NPC will be displayed. Click on the icon to the left of the name to open a new page with the fullscreen sheet.',
    params: {
      placement: 'auto'
    }
  }
];

const options: VTourOptions = {
  highlight: true,
  labels: {
    buttonSkip: 'Close Help',
    buttonPrevious: 'Previous',
    buttonNext: 'Next',
    buttonStop: 'Finish'
  }
};

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
      custom_fields: [{ name: '', body: '' }]
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

const callbacks: VTourCallbacks = {
  onStart: startTour,
  onStop: stopTour
};

function scrollDirection() {
  const footers = document.querySelectorAll('footer');
  const footer = footers[footers.length - 1];
  const top = footer?.getBoundingClientRect().top;
  if (top) {
    scrollUp.value = top < window.innerHeight;
  }
}

const scrollPage = (up: boolean) => {
  settings.setHiddenNav(true);
  setTimeout(() => {
    let offset: number | undefined = 0;
    if (up) {
      offset = document.getElementById('generator')?.offsetTop;
    } else {
      offset = document.getElementById('sheet')?.offsetTop;
    }
    if (typeof offset === 'number') {
      window.scrollTo({
        top: offset - 60,
        behavior: 'smooth'
      });
    }
  }, 10);
};
</script>

<template>
  <div class="row items-center justify-between">
    <v-tour name="/sf2e/npc" :steps="steps" :options="options" :callbacks="callbacks" />
    <NpcGenerator id="generator" />
    <q-space />
    <NpcEditor />
    <q-space />
    <NpcSheet id="sheet" />
    <q-page-sticky
      v-if="screenWidth < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw-z-10 tw-opacity-85 only-screen"
    >
      <q-btn
        v-if="scrollUp"
        fab
        :icon="matArrowUpward"
        padding="sm"
        color="primary"
        @click="scrollPage(true)"
      />
      <q-btn
        v-else
        fab
        :icon="matArrowDownward"
        padding="sm"
        color="primary"
        @click="scrollPage(false)"
      />
    </q-page-sticky>
    <q-scroll-observer @scroll="scrollDirection" />
  </div>
</template>
