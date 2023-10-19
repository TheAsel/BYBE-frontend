<script setup lang="ts">
import { shallowRef } from 'vue';
import { requestCreatures, requestFilters } from 'src/utils/api-calls';
import { filtersStore, creaturesStore, encounterStore } from 'stores/store';
import { creature } from 'src/types/creature';
import CreatureList from 'src/components/Encounter/CreatureList.vue';

const filters = filtersStore();
const creatures = creaturesStore();
const encounter = encounterStore();
const currentComponent = shallowRef();

import('src/components/Encounter/SkeletonTable.vue').then((module) => {
  currentComponent.value = module.default;
});
// ---- API requests
try {
  if (
    filters.getFilters.family.length === 0 ||
    filters.getFilters.alignment.length === 0 ||
    filters.getFilters.size.length === 0 ||
    filters.getFilters.rarity.length === 0 ||
    creatures.getCreatures.length === 0
  ) {
    let [familyList, alignmentList, sizeList, rarityList, creatureList] = await Promise.all([
      requestFilters('families'),
      requestFilters('alignments'),
      requestFilters('sizes'),
      requestFilters('rarities'),
      requestCreatures(0, -1)
    ]);

    if (typeof familyList != 'undefined') {
      filters.updateFamilies(familyList);
    } else {
      throw 'Error loading families';
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
    content: 'You can change your party size and the level of the individual players here.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-2',
    content:
      'From this dialog you can define your preferred filters for the random encounter generator.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-3',
    content:
      'Clicking this button will generate a new random encounter, using the filters previously described.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-4',
    content: 'From this dropdown you can select which colums to show and hide.',
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
      'This is the encounter list, where the creatures you added will be displayed. You can increase or decrease the number of creatures and change them to their Weak/Elite variant.',
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
  const tmpKoboldMage: creature = {
    id: 274,
    name: 'Kobold Dragon Mage',
    level: 2,
    hp: 25,
    family: 'Kobold',
    alignment: 'LE',
    size: 'Small',
    rarity: 'Common',
    is_melee: true,
    is_ranged: false,
    is_spell_caster: true,
    sources: ['Bestiary']
  };
  const tmpKoboldWarrior: creature = {
    id: 272,
    name: 'Kobold Warrior',
    level: -1,
    hp: 8,
    family: 'Kobold',
    alignment: 'LE',
    size: 'Small',
    rarity: 'Common',
    is_melee: true,
    is_ranged: true,
    is_spell_caster: false,
    sources: ['Bestiary']
  };
  encounter.addToEncounter(tmpKoboldMage);
  encounter.addToEncounter(tmpKoboldWarrior);
};

const stopTour = () => {
  encounter.clearEncounter();
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
