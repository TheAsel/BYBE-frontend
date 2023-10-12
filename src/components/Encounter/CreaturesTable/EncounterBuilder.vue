<script setup lang="ts">
import { ref } from 'vue';
import { filtersStore } from 'src/stores/store';

const filters = filtersStore();

const dialog = ref(false);

const family = ref();
const alignment = ref();
const size = ref();
const rarity = ref();

const difficulties = ['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme', 'Impossible'];
const filterDifficulty = ref('');

const generateEncounter = () => {};
</script>

<template>
  <q-btn
    outline
    label="Encounter Builder"
    class="tw-text-blue-600 dark:tw-text-blue-400"
    @click="dialog = true"
  />
  <q-dialog v-model="dialog" aria-label="Encounter builder">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6 tw-mr-4">Encounter Builder</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup aria-label="Close dialog" />
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 60vh" class="scroll">
        <div class="tw-space-y-4">
          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="family"
            :options="Object.freeze(filters.getFilters.family)"
            label="Family"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="alignment"
            :options="Object.freeze(filters.getFilters.alignment)"
            label="Alignment"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="size"
            :options="Object.freeze(filters.getFilters.size)"
            label="Size"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="rarity"
            :options="Object.freeze(filters.getFilters.rarity)"
            label="Rarity"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="filterDifficulty"
            :options="difficulties"
            label="Difficulty"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn
          unelevated
          label="Generate Encounter"
          type="submit"
          class="full-width tw-text-blue-600 dark:tw-text-blue-400"
          v-close-popup
          @click="generateEncounter"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
