<script setup lang="ts">
import { ref } from 'vue';
import { requestCreatures, requestFilters } from 'src/utils/api-calls';
import { filtersStore, creaturesStore } from 'stores/store';
import SkeletonTable from 'src/components/Encounter/SkeletonTable.vue';
import CreaturesTable from 'src/components/Encounter/CreaturesTable.vue';
import CreatureList from 'src/components/Encounter/CreatureList.vue';

const filters = filtersStore();
const creatures = creaturesStore();
const ready = ref(false);

// ---- API requests
try {
  if (filters.getFilters.family.length === 0) {
    filters.updateFamilies(await requestFilters('families'));
  }

  if (filters.getFilters.alignment.length === 0) {
    filters.updateAlignments(await requestFilters('alignments'));
  }

  if (filters.getFilters.size.length === 0) {
    filters.updateSizes(await requestFilters('sizes'));
  }

  if (filters.getFilters.rarity.length === 0) {
    filters.updateRarities(await requestFilters('rarities'));
  }

  if (creatures.getCreatures.length === 0) {
    creatures.updateCreatures(await requestCreatures(0, -1));
  }
  ready.value = true;
} catch (error) {
  console.debug(error);
}
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <CreaturesTable v-if="ready" />
    <SkeletonTable v-else />
    <CreatureList />
  </q-page>
</template>
