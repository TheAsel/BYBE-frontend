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
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <component :is="currentComponent" />
    <CreatureList />
  </q-page>
</template>
