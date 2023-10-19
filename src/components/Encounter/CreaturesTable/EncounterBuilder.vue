<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { matArrowDropDown, matCancel } from '@quasar/extras/material-icons';
import { biXLg } from '@quasar/extras/bootstrap-icons';
import { partyStore, filtersStore, encounterStore } from 'src/stores/store';
import { encounterGenerator } from 'src/utils/api-calls';

const $q = useQuasar();

const party = partyStore();
const filters = filtersStore();
const encounter = encounterStore();

const dialog = ref(false);

const challenges = ['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme', 'Impossible'];

const family = ref();
const alignment = ref();
const size = ref();
const rarity = ref();
const challenge = ref();

const tmpFilters = ref({
  family: family.value,
  alignment: alignment.value,
  size: size.value,
  rarity: rarity.value,
  challenge: challenge.value
});

const restoreSettings = () => {
  dialog.value = true;
  tmpFilters.value.family = family.value;
  tmpFilters.value.alignment = alignment.value;
  tmpFilters.value.rarity = rarity.value;
  tmpFilters.value.size = size.value;
  tmpFilters.value.challenge = challenge.value;
};

const generateEncounter = async () => {
  saveChanges();
  const partyLevels = party.getParty;
  const post = {
    party_levels: partyLevels
  };
  try {
    const randomEncounter = await encounterGenerator(
      post,
      tmpFilters.value.family,
      tmpFilters.value.alignment,
      tmpFilters.value.size,
      tmpFilters.value.rarity,
      tmpFilters.value.challenge
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
          message: 'No encounter could be generated from the current filters',
          icon: matPriorityHigh
        });
      }
    } else {
      throw 'Error generating random encounter';
    }
  } catch (error) {
    console.error(error);
  }
};

const saveChanges = () => {
  family.value = tmpFilters.value.family;
  alignment.value = tmpFilters.value.alignment;
  rarity.value = tmpFilters.value.rarity;
  size.value = tmpFilters.value.size;
  challenge.value = tmpFilters.value.challenge;
};

defineExpose({ generateEncounter });
</script>

<template>
  <q-btn push label="Generator Settings" @click="restoreSettings" id="v-step-2" />
  <q-dialog v-model="dialog" aria-label="Generator Settings">
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-h6 tw-mr-4">Generator Settings</div>
        <q-space />
        <q-btn
          :icon="biXLg"
          size="md"
          padding="sm"
          flat
          round
          dense
          v-close-popup
          aria-label="Close dialog"
        />
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 60vh" class="scroll">
        <div class="tw-space-y-4">
          <q-select
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.family"
            :options="Object.freeze(filters.getFilters.family)"
            label="Family"
            :dropdown-icon="matArrowDropDown"
          />

          <q-select
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.alignment"
            :options="Object.freeze(filters.getFilters.alignment)"
            label="Alignment"
            :dropdown-icon="matArrowDropDown"
          />

          <q-select
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.size"
            :options="Object.freeze(filters.getFilters.size)"
            label="Size"
            :dropdown-icon="matArrowDropDown"
          />

          <q-select
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.rarity"
            :options="Object.freeze(filters.getFilters.rarity)"
            label="Rarity"
            :dropdown-icon="matArrowDropDown"
          />

          <q-select
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.challenge"
            :options="Object.freeze(challenges)"
            label="Challenge"
            :dropdown-icon="matArrowDropDown"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn-group>
          <q-btn
            unelevated
            label="Save changes"
            type="submit"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            v-close-popup
            @click="saveChanges"
          />
          <q-btn
            unelevated
            label="Generate Encounter"
            type="submit"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            v-close-popup
            @click="generateEncounter"
          />
        </q-btn-group>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
