<script setup lang="ts">
import { shallowRef } from 'vue';
import { requestCreatures, requestFilters } from 'src/utils/api-calls';
import { filtersStore, creaturesStore } from 'stores/store';
import CreatureList from 'src/components/Encounter/CreatureList.vue';

const filters = filtersStore();
const creatures = creaturesStore();
const currentComponent = shallowRef();

import('src/components/Encounter/SkeletonTable.vue').then((module) => {
  currentComponent.value = module.default;
});
// ---- API requests
try {
  if (filters.getFilters.family.length === 0) {
    const familyList = await requestFilters('families');
    if (typeof familyList != 'undefined') {
      filters.updateFamilies(familyList);
    } else {
      throw 'Error loading families';
    }
  }

  if (filters.getFilters.alignment.length === 0) {
    const alignmentList = await requestFilters('alignments');
    if (typeof alignmentList != 'undefined') {
      filters.updateAlignments(alignmentList);
    } else {
      throw 'Error loading alignments';
    }
  }

  if (filters.getFilters.size.length === 0) {
    const sizeList = await requestFilters('sizes');
    if (typeof sizeList != 'undefined') {
      filters.updateSizes(sizeList);
    } else {
      throw 'Error loading sizes';
    }
  }

  if (filters.getFilters.rarity.length === 0) {
    const rarityList = await requestFilters('rarities');
    if (typeof rarityList != 'undefined') {
      filters.updateRarities(rarityList);
    } else {
      throw 'Error loading rarities';
    }
  }

  if (creatures.getCreatures.length === 0) {
    const creatureList = await requestCreatures(0, -1);
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
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <component :is="currentComponent" />
    <CreatureList />
  </q-page>
</template>
