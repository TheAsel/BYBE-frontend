<script setup lang="ts">
import { ref } from 'vue';
import { biXLg, biPlusLg, biDashLg } from '@quasar/extras/bootstrap-icons';
import { partyStore } from 'stores/store';

const party = partyStore();
let tmpParty = ref(party.getParty);

const dialog = ref(false);

const restoreParty = () => {
  dialog.value = true;
  tmpParty.value = [...party.getParty];
};

const validateLevel = (index: number) => {
  const value = tmpParty.value[index];
  if (value < 1) {
    tmpParty.value[index] = 1;
  }
  if (value > 20) {
    tmpParty.value[index] = 20;
  }
};

const addPlayer = () => {
  tmpParty.value.push(1);
};

const removePlayer = (index: number) => {
  if (tmpParty.value.length > 1) {
    tmpParty.value.splice(index, 1);
  }
};

const saveChanges = () => {
  party.updateParty(tmpParty.value);
};
</script>

<template>
  <q-btn push label="Party Builder" @click="restoreParty" />
  <q-dialog v-model="dialog" aria-label="Player builder">
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-h6 tw-mr-4">Party Builder</div>
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
          <div v-for="(_, index) in tmpParty" :key="index" class="row no-wrap items-center">
            <div class="col-grow">
              <q-input
                outlined
                type="number"
                min="1"
                max="20"
                :label="'Player ' + (index + 1)"
                v-model.number="tmpParty[index]"
                @update:model-value="validateLevel(index)"
                dense
              />
            </div>
            <div class="col-shrink tw-pl-3">
              <q-btn
                flat
                round
                type="button"
                @click="removePlayer(index)"
                :icon="biDashLg"
                size="md"
                padding="sm"
                aria-label="Remove player"
              >
              </q-btn>
            </div>
          </div>
        </div>
        <q-btn
          outline
          type="button"
          class="full-width tw-mt-4 tw-text-blue-600 dark:tw-text-blue-400"
          aria-label="Add player"
          @click="addPlayer"
          :icon="biPlusLg"
          size="md"
          padding="sm"
        >
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-card-actions>
        <q-btn
          unelevated
          label="Save changes"
          type="submit"
          class="full-width tw-text-blue-600 dark:tw-text-blue-400"
          v-close-popup
          @click="saveChanges"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield;
}
</style>
