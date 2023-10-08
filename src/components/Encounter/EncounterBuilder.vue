<script setup lang="ts">
import { ref } from 'vue';

const dialog = ref(false);

const families = ['Dragon, Red', 'Kobold', 'Spawn of Rovagug'];
const filterFamily = ref('');

const alignments = ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE', 'Any', 'No Alignment'];
const filterAlignment = ref('');

const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const filterSize = ref('');

const rarities = ['Common', 'Uncommon', 'Rare', 'Unique'];
const filterRarity = ref('');

const difficulties = ['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme', 'Impossible'];
const filterDifficulty = ref('');

const generateEncounter = () => {};
</script>

<template>
  <q-btn outline label="Encounter Builder" color="primary" @click="dialog = true" />
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Encounter Builder</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 60vh" class="scroll">
        <div class="tw-space-y-4">
          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="filterFamily"
            :options="families"
            label="Family"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="filterAlignment"
            :options="alignments"
            label="Alignment"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="filterSize"
            :options="sizes"
            label="Size"
          />

          <q-select
            dense
            outlined
            clearable
            options-dense
            v-model="filterRarity"
            :options="rarities"
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

        <q-separator class="tw-mt-4" />
        <q-btn
          outline
          type="button"
          class="full-width tw-mt-4"
          color="primary"
          @click="generateEncounter"
        >
          Generate Encounter
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
