<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { ref } from 'vue';

import CreatureList from '../../components/sf2e/Encounter/CreatureList.vue';
import CreaturesTable from '../../components/sf2e/Encounter/CreaturesTable.vue';
import { encounterStore, partyStore, settingsStore } from '../../stores/store';

import type { min_creature } from '../../types/creature';
import type { encounter_list } from '../../types/encounter';
import type { party } from '../../types/party';
import type { Step, VTourCallbacks, VTourOptions } from 'vue3-tour';

useHead({
  title: 'Encounter Builder - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/sf/encounter'
    }
  ]
});

const settings = settingsStore();
const partyStores = partyStore();
const encounter = encounterStore();
const tourActive = ref(false);
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

// read party local storage
const localParty = localStorage.getItem('parties');
if (localParty) {
  try {
    const parsedParties = JSON.parse(localParty);
    if (Array.isArray(parsedParties)) {
      const isCompatible = parsedParties.every((p) => {
        return (
          typeof p.name === 'string' &&
          Array.isArray(p.members) &&
          p.members.every((member) => typeof member === 'number')
        );
      });
      if (isCompatible) {
        const parties: party[] = parsedParties;
        for (const party of parties) {
          if (!party || !party.members.every((player) => player >= 1 && player <= 20)) {
            throw new Error('Invalid saved party levels');
          }
        }
        const partyNames = parties.map((p) => p.name);
        if (new Set(partyNames).size !== partyNames.length) {
          throw new Error('Duplicate saved party names');
        }
        partyStores.updateParties(parties);
      } else {
        throw new Error('Invalid saved party format');
      }
    } else {
      throw new TypeError('Invalid saved party format');
    }
  } catch (error) {
    console.error(error);
    const defaultParty = { name: 'Default', members: [1, 1, 1, 1] };
    localStorage.setItem('parties', JSON.stringify([defaultParty]));
    partyStores.updateParties([defaultParty]);
  }
}

// read encounter local storage
const localEncounters = localStorage.getItem('encounters');
if (localEncounters) {
  try {
    const parsedEncounters = JSON.parse(localEncounters);
    if (Array.isArray(parsedEncounters)) {
      const isCompatible = parsedEncounters.every((p) => {
        return typeof p.name === 'string' && Array.isArray(p.creatures);
      });
      if (isCompatible) {
        const encounters: encounter_list[] = parsedEncounters;
        const encounterNames = encounters.map((p) => p.name);
        if (new Set(encounterNames).size !== encounterNames.length) {
          throw new Error('Duplicate saved encounter names');
        }
        encounter.updateEncounters(encounters);
      } else {
        throw new Error('Invalid saved encounter format');
      }
    } else {
      throw new TypeError('Invalid saved encounter format');
    }
  } catch (error) {
    console.error(error);
    const defaultEncounter = { name: 'Default', creatures: [] };
    localStorage.setItem('encounters', JSON.stringify([defaultEncounter]));
    encounter.updateEncounters([defaultEncounter]);
  }
}

const steps: Step[] = [
  {
    target: '#v-step-0',
    content:
      'This is the creature list. Double click on a row to add it to the encounter list to the right.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-1',
    content:
      'Here you can change your party size and the level of the individual players. You can also add multiple parties and select the active one.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-2',
    content:
      'From this window you can define your preferred settings for the random encounter generator.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-3',
    content:
      'Clicking this button will generate a new random encounter, based on the generator settings previously described and the currently active party.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-4',
    content: 'From this dropdown you can select which columns of the table to show and hide.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '.v-step-5',
    content: 'Here you can sort the columns and narrow your search with the various filters.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-6',
    content:
      'This is the encounter list, where the creatures you added will be displayed. You can increase or decrease the number of each creature and change them to their Weak/Elite variant.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-7',
    content:
      'Clicking this button will generate a link to your current encounter that you can copy and share.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-8',
    content:
      'This is where the challenge of the encounter will be displayed, adjusted according to your party level and size.',
    params: {
      placement: 'top'
    }
  },
  {
    target: '#v-step-9',
    content:
      'You can enable the variant rule for Proficiency without Level by clicking here and going to the "Encounter" tab.',
    params: {
      placement: 'top'
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
    const tmpBeyondTerror: min_creature = {
      game: 'sf',
      id: 20,
      // TODO: update link when added to AoN
      archive_link: '',
      name: 'Beyond Terror',
      level: 2,
      variant: 'Base'
    };
    const tmpAnaciteWingbot: min_creature = {
      game: 'sf',
      id: 11,
      // TODO: update link when added to AoN
      archive_link: '',
      name: 'Anacite Wingbot',
      level: -1,
      variant: 'Base'
    };
    encounter.addEncounter('Example');
    encounter.addToEncounter(tmpBeyondTerror);
    encounter.addToEncounter(tmpAnaciteWingbot);
  }
};

const stopTour = () => {
  if (tourActive.value) {
    encounter.removeEncounter();
    tourActive.value = false;
  }
};

const callbacks: VTourCallbacks = {
  onStart: startTour,
  onStop: stopTour
};

function scrollDirection() {
  const footers = Array.from(document.querySelectorAll('footer'));
  const footer = footers.at(-1);
  const top = footer?.getBoundingClientRect().top;
  if (top) {
    scrollUp.value = top < globalThis.innerHeight;
  }
}

const scrollPage = (up: boolean) => {
  settings.setHiddenNav(true);
  setTimeout(() => {
    let offset: number | undefined = 0;
    if (up) {
      offset = document.getElementById('table')?.offsetTop;
    } else {
      offset = document.getElementById('list')?.offsetTop;
    }
    if (typeof offset === 'number') {
      globalThis.scrollTo({
        top: offset - 60,
        behavior: 'smooth'
      });
    }
  }, 10);
};
</script>

<template>
  <div class="row items-center justify-between">
    <v-tour name="/sf/encounter" :steps="steps" :options="options" :callbacks="callbacks" />
    <CreaturesTable id="table" />
    <q-space />
    <CreatureList id="list" />
    <q-page-sticky
      v-if="screenWidth < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw:z-10 tw:opacity-85 only-screen"
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
