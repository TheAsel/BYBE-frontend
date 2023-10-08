<script setup lang="ts">
import { ref } from 'vue';
import { partyStore } from 'stores/store';

const party = ref(partyStore().getParty);
var tmpParty = ref([...party.value]);

const dialog = ref(false);

const restoreParty = () => {
  dialog.value = true;
  tmpParty.value = [...party.value];
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
  party.value = tmpParty.value;
};
</script>

<template>
  <q-btn outline label="Party Builder" color="primary" @click="restoreParty" />
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Party Builder</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
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
                v-model="tmpParty[index]"
                @update:model-value="validateLevel(index)"
                dense
              />
            </div>
            <div class="col-shrink tw-pl-3">
              <q-btn flat round type="button" @click="removePlayer(index)" icon="bi-dash"> </q-btn>
            </div>
          </div>
        </div>
        <q-btn
          outline
          type="button"
          class="full-width tw-mt-4"
          color="primary"
          @click="addPlayer"
          icon="bi-plus"
        >
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-card-actions class="float-right">
        <q-btn
          unelevated
          label="Save changes"
          type="submit"
          color="primary"
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
