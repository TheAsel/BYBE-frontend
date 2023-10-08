<script setup lang="ts">
import CreaturesTable from 'src/components/Encounter/CreaturesTable.vue';
import CreatureList from 'src/components/Encounter/CreatureList.vue';
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <CreaturesTable />
    <CreatureList />
  </q-page>
</template>
