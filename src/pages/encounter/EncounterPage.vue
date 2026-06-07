<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { onMounted, onUnmounted, ref } from 'vue';

import EncounterList from 'src/components/encounter/EncounterList.vue';
import EncounterSheet from 'src/components/encounter/EncounterSheet.vue';
import EncounterTable from 'src/components/encounter/EncounterTable.vue';
import { encounterStore } from 'src/stores/encounter';
import { settingsStore } from 'src/stores/settings';
import { updateLocalStorageEncounters, updateLocalStorageParties } from 'src/utils/local-storage';

import type { min_creature_hazard } from 'src/types/encounter';
import type { Step, VTourCallbacks, VTourOptions } from 'vue3-tour';

useHead({
  title: 'Encounter Builder - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/encounter'
    }
  ]
});

const settings = settingsStore();
const encounter = encounterStore();

const tourActive = ref(false);
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageParties();
updateLocalStorageEncounters();

const steps: Step[] = [
  {
    target: '#v-step-0',
    content:
      'This is the Creature/Hazard List. Double click on a row to add it to the Encounter List to the right.',
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
    content: 'Click these buttons to toggle between the Creatures and Hazards Lists.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-5',
    content: 'From this dropdown you can select which columns of the table to show and hide.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '.v-step-6',
    content: 'Here you can sort the columns and narrow your search with the various filters.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-7',
    content:
      'This is the Encounter List, where the creatures and hazards you added will be displayed.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-8',
    content: 'You can increase or decrease the number creatures and hazards.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-9',
    content: 'You can also change creatures to their Weak/Elite variant.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-10',
    content:
      'Clicking this button will generate a link to your current encounter that you can copy and share.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-11',
    content:
      'This is where the challenge of the encounter will be displayed, adjusted according to your party level and size.',
    params: {
      placement: 'top'
    }
  },
  {
    target: '#v-step-12',
    content: "Click here to show or hide the selected item's description.",
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-13',
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

// PF2E encounter
const tmpKoboldMage: min_creature_hazard = {
  game: 'pf',
  id: 5009,
  archive_link: 'https://2e.aonprd.com/NPCs.aspx?ID=3074',
  name: 'Kobold Cavern Mage',
  level: 2,
  variant: 'Base',
  is_hazard: false
};
const tmpKoboldWarrior: min_creature_hazard = {
  game: 'pf',
  id: 4977,
  archive_link: 'https://2e.aonprd.com/NPCs.aspx?ID=3072',
  name: 'Kobold Warrior',
  level: -1,
  variant: 'Base',
  is_hazard: false
};
const tmpMirrorDoor: min_creature_hazard = {
  game: 'pf',
  id: 459,
  archive_link: 'https://2e.aonprd.com/Hazards.aspx?ID=626',
  name: 'Mirror Door',
  level: -1,
  is_hazard: true,
  complexity: 'Simple'
};

//SF2E encounter
const tmpFerrofluidOoze: min_creature_hazard = {
  game: 'sf',
  id: 157,
  archive_link: 'https://2e.aonsrd.com/creatures/66-ferrofluid-ooze',
  name: 'Ferrofluid Ooze',
  level: 2,
  variant: 'Base',
  is_hazard: false
};
const tmpAnaciteWingbot: min_creature_hazard = {
  game: 'sf',
  id: 11,
  archive_link: 'https://2e.aonsrd.com/creatures/2-anacite-wingbot',
  name: 'Anacite Wingbot',
  level: -1,
  variant: 'Base',
  is_hazard: false
};
const tmpAntiGravityPulse: min_creature_hazard = {
  game: 'sf',
  id: 18,
  archive_link: 'https://2e.aonsrd.com/hazards/5-anti-gravity-pulse',
  name: 'Anti-Gravity Pulse',
  level: 0,
  is_hazard: true,
  complexity: 'Simple'
};

const startTour = () => {
  if (!tourActive.value) {
    tourActive.value = true;
    encounter.addEncounter('Example');
    if (settings.game === 'sf') {
      encounter.addToEncounter(tmpFerrofluidOoze);
      encounter.addToEncounter(tmpAnaciteWingbot);
      encounter.addToEncounter(tmpAntiGravityPulse);
    } else {
      encounter.addToEncounter(tmpKoboldMage);
      encounter.addToEncounter(tmpKoboldWarrior);
      encounter.addToEncounter(tmpMirrorDoor);
    }
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
    let offset;
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

const handleResize = () => {
  screenWidth.value = screen.width;
};

onMounted(() => {
  globalThis.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  globalThis.removeEventListener('resize', handleResize);
});

const sheetVisible = ref(true);
const sheetWidth = ref('tw:md:w-[27%]!');
const tableWidth = ref('tw:md:w-[46%]!');

const toggleSheetView = () => {
  sheetVisible.value = !sheetVisible.value;
  if (sheetVisible.value) {
    sheetWidth.value = 'tw:md:w-[27%]!';
    tableWidth.value = 'tw:md:w-[46%]!';
  } else {
    sheetWidth.value = 'tw:md:w-[0%]! tw:px-0! tw:collapse';
    tableWidth.value = 'tw:md:w-[73%]!';
  }
};
</script>

<template>
  <div class="row items-center justify-between">
    <v-tour name="/encounter" :steps="steps" :options="options" :callbacks="callbacks" />
    <EncounterSheet
      v-if="screenWidth >= 768"
      class="q-pa-md tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <EncounterTable
      id="table"
      class="q-pa-md tw:w-full tw:transition-all tw:duration-300"
      :class="tableWidth"
      :toggle-sheet-view="toggleSheetView"
      :sheet-visible="sheetVisible"
    />
    <q-space />
    <EncounterSheet
      v-if="screenWidth < 768"
      class="q-pa-md tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <EncounterList id="list" />
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
