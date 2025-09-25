<script setup lang="ts">
import { matPrint } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import NpcSheet from '../../components/sf2e/NPC/NpcSheet.vue';
import { npcStore } from '../../stores/store';

import type { npc_list } from '../../types/npcs';

const title = ref('NPC Sheet - BYBE');

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/sf2e/character'
    }
  ]
});

const route = useRoute();
const npcs = npcStore();

const npcId = Number(route.query.id);

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

npcs.setActiveNpc(npcId);

const printPage = () => {
  window.print();
};
</script>

<template>
  <NpcSheet class="tw-mx-auto character-page q-pa-md tw-w-full md:tw-w-[57rem]" />
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw-z-10 only-screen tw-opacity-85"
  >
    <q-btn fab :icon="matPrint" color="primary" aria-label="Print item sheet" @click="printPage" />
  </q-page-sticky>
</template>
