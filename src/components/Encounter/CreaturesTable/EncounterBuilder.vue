<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { partyStore, filtersStore, encounterStore } from 'src/stores/store';
import { encounterGenerator } from 'src/utils/api-calls';

const $q = useQuasar();

const party = partyStore();
const filters = filtersStore();
const encounter = encounterStore();

const dialog = ref(false);

const family = ref();
const alignment = ref();
const size = ref();
const rarity = ref();

const challenges = ['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme', 'Impossible'];
const filterChallenge = ref('');

const generateEncounter = async () => {
  const partyLevels = party.getParty;
  const post = {
    party_levels: partyLevels
  };
  try {
    const randomEncounter = await encounterGenerator(
      post,
      family.value,
      alignment.value,
      size.value,
      rarity.value
    );
    if (typeof randomEncounter != 'undefined') {
      if (randomEncounter.count > 0 && randomEncounter.results) {
        encounter.clearEncounter();
        for (var i = 0; i < randomEncounter.count; i++) {
          encounter.addToEncounter(randomEncounter.results[i]);
        }
      } else {
        $q.notify({
          progress: true,
          type: 'warning',
          message: 'No encounter could be generated from the current filters'
        });
      }
    } else {
      throw 'Error generating random encounter';
    }
  } catch (error) {
    console.error(error);
  }
};

defineExpose({ generateEncounter });
</script>

<template>
  <q-btn push label="Encounter Builder" @click="dialog = true" />
  <q-dialog v-model="dialog" aria-label="Encounter builder">
    <q-card flat bordered>
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
            v-model="filterChallenge"
            :options="challenges"
            label="Challenge"
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
