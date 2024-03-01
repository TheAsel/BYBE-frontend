<script setup lang="ts">
import { shallowRef } from 'vue';
import { useHead } from '@unhead/vue';
import { requestCreatures, requestFilters } from 'src/utils/api-calls';
import { partyStore, filtersStore, creaturesStore, encounterStore } from 'stores/store';
import { party } from 'src/types/party';
import { creature_encounter } from 'src/types/creature';
import { encounterList } from 'src/types/encounter';
import CreatureList from 'src/components/Encounter/CreatureList.vue';

useHead({
  title: 'Encounter Builder - BYBE'
});

const party = partyStore();
const filters = filtersStore();
const creatures = creaturesStore();
const encounter = encounterStore();
const currentComponent = shallowRef();

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
          p.members.every((member: any) => typeof member === 'number')
        );
      });
      if (isCompatible) {
        const parties: party[] = parsedParties;
        parties.forEach((p) => {
          if (!p || !p.members.every((player) => player >= 1 && player <= 20)) {
            throw 'Invalid saved party levels';
          }
        });
        const partyNames = parties.map((p) => p.name);
        if (new Set(partyNames).size !== partyNames.length) {
          throw 'Duplicate saved party names';
        }
        party.updateParties(parties);
      } else {
        throw 'Invalid saved party format';
      }
    } else {
      throw 'Invalid saved party format';
    }
  } catch (error) {
    console.error(error);
    const defaultParty = { name: 'Default', members: [1, 1, 1, 1] };
    localStorage.setItem('parties', JSON.stringify([defaultParty]));
    party.updateParties([defaultParty]);
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
        const encounters: encounterList[] = parsedEncounters;
        const encounterNames = encounters.map((p) => p.name);
        if (new Set(encounterNames).size !== encounterNames.length) {
          throw 'Duplicate saved encounter names';
        }
        encounter.updateEncounters(encounters);
      } else {
        throw 'Invalid saved encounter format';
      }
    } else {
      throw 'Invalid saved encounter format';
    }
  } catch (error) {
    const defaultEncounter = { name: 'Default', creatures: [] };
    localStorage.setItem('encounters', JSON.stringify([defaultEncounter]));
    encounter.updateEncounters([defaultEncounter]);
  }
}

import('src/components/Encounter/SkeletonTable.vue').then((module) => {
  currentComponent.value = module.default;
});
// ---- API requests
try {
  if (
    filters.getFilters.traits.length === 0 ||
    filters.getFilters.alignments.length === 0 ||
    filters.getFilters.sizes.length === 0 ||
    filters.getFilters.rarities.length === 0 ||
    filters.getFilters.families.length === 0 ||
    filters.getFilters.sources.length === 0 ||
    creatures.getCreatures.length === 0
  ) {
    let [
      traitsList,
      alignmentList,
      sizeList,
      rarityList,
      familyList,
      creatureTypeList,
      sourceList,
      creatureList
    ] = await Promise.all([
      requestFilters('traits'),
      requestFilters('alignments'),
      requestFilters('sizes'),
      requestFilters('rarities'),
      requestFilters('families'),
      requestFilters('creature_types'),
      requestFilters('sources'),
      requestCreatures(0, -1)
    ]);

    if (typeof traitsList != 'undefined') {
      filters.updateTraits(traitsList);
    } else {
      throw 'Error loading traits';
    }

    if (typeof alignmentList != 'undefined') {
      filters.updateAlignments(alignmentList);
    } else {
      throw 'Error loading alignments';
    }

    if (typeof sizeList != 'undefined') {
      filters.updateSizes(sizeList);
    } else {
      throw 'Error loading sizes';
    }

    if (typeof rarityList != 'undefined') {
      filters.updateRarities(rarityList);
    } else {
      throw 'Error loading rarities';
    }

    if (typeof familyList != 'undefined') {
      filters.updateFamilies(familyList);
    } else {
      throw 'Error loading families';
    }

    if (typeof creatureTypeList != 'undefined') {
      filters.updateCreatureType(creatureTypeList);
    } else {
      throw 'Error loading creature types';
    }

    if (typeof sourceList != 'undefined') {
      filters.updateSources(sourceList);
    } else {
      throw 'Error loading creature sources';
    }

    if (typeof creatureList != 'undefined') {
      creatures.updateCreatures(creatureList);
    } else {
      throw 'Error loading creatures';
    }
  }

  import('src/components/Encounter/CreaturesTable.vue').then((module) => {
    currentComponent.value = module.default;
  });
} catch (error) {
  console.error(error);
}

const steps = [
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
      'This is where the challenge of the encounter will be displayed, adjusted according to your party level and size.',
    params: {
      placement: 'top'
    }
  },
  {
    target: '#v-step-8',
    content:
      'You can change some settings from here, like enabling Proficiency without Level or switching to the Legacy version.',
    params: {
      placement: 'top'
    }
  }
];

const options = {
  highlight: true,
  labels: {
    buttonSkip: 'Close Help',
    buttonPrevious: 'Previous',
    buttonNext: 'Next',
    buttonStop: 'Finish'
  }
};

const startTour = () => {
  const tmpKoboldMage: creature_encounter = {
    archive_link: 'https://2e.aonprd.com/Monsters.aspx?ID=274',
    name: 'Kobold Dragon Mage',
    level: 2,
    variant: 'Base'
  };
  const tmpKoboldWarrior: creature_encounter = {
    archive_link: 'https://2e.aonprd.com/Monsters.aspx?ID=272',
    name: 'Kobold Warrior',
    level: -1,
    variant: 'Base'
  };
  encounter.addToEncounter(tmpKoboldMage);
  encounter.addToEncounter(tmpKoboldWarrior);
};

const stopTour = () => {
  encounter.removeFromEncounter(encounter.getActiveEncounter.creatures.length - 1);
  encounter.removeFromEncounter(encounter.getActiveEncounter.creatures.length - 1);
};

const callbacks = {
  onStart: startTour,
  onStop: stopTour
};
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <v-tour name="/encounter/" :steps="steps" :options="options" :callbacks="callbacks" />
    <component :is="currentComponent" />
    <CreatureList />
  </q-page>
</template>
