<script setup lang="ts">
import { ref } from 'vue';
import { party } from 'src/types/party';
import { biXLg, biPlusLg, biDashLg, biTrash } from '@quasar/extras/bootstrap-icons';
import { matArrowDropDown } from '@quasar/extras/material-icons';

import { partyStore } from 'stores/store';

const party = partyStore();
const tmpParty = ref<party>({
  name: party.getActiveParty.name,
  members: [...party.getActiveParty.members]
});
const parties = ref(party.getParties.map((party) => party.name));

const dialog = ref(false);

const newPartyDialog = ref(false);
const partyNameInput = ref();
const newPartyName = ref('');

const removePartyDialog = ref(false);

const restoreParty = () => {
  dialog.value = true;
  tmpParty.value = {
    name: party.getActiveParty.name,
    members: [...party.getActiveParty.members]
  };
};

const validateLevel = (index: number) => {
  const value = tmpParty.value.members[index];
  if (value < 1) {
    tmpParty.value.members[index] = 1;
  }
  if (value > 20) {
    tmpParty.value.members[index] = 20;
  }
};

const addPlayer = () => {
  tmpParty.value.members.push(1);
};

const removePlayer = (index: number) => {
  if (tmpParty.value.members.length > 1) {
    tmpParty.value.members.splice(index, 1);
  }
};

const closeDialog = () => {
  newPartyDialog.value = false;
  removePartyDialog.value = false;
  newPartyName.value = '';
};

const addParty = () => {
  partyNameInput.value.validate();
  if (!partyNameInput.value.hasError) {
    party.addParty(newPartyName.value);
    parties.value = party.getParties.map((party) => party.name);
    tmpParty.value = {
      name: party.getActiveParty.name,
      members: [...party.getActiveParty.members]
    };
    saveChanges();
    newPartyName.value = '';
    newPartyDialog.value = false;
  }
};

const removeParty = () => {
  party.removeParty();
  parties.value = party.getParties.map((party) => party.name);
  tmpParty.value = {
    name: party.getActiveParty.name,
    members: [...party.getActiveParty.members]
  };
  saveChanges();
  removePartyDialog.value = false;
};

const changeActiveParty = (selected: string) => {
  party.changeActiveParty(party.getPartyIndex(selected));
  tmpParty.value = {
    name: party.getActiveParty.name,
    members: [...party.getActiveParty.members]
  };
};

const saveChanges = () => {
  party.updateParty(tmpParty.value.name, tmpParty.value.members);
  localStorage.setItem('parties', JSON.stringify(party.getParties));
};
</script>

<template>
  <q-btn push label="Party Builder" @click="restoreParty" id="v-step-1" />
  <q-dialog v-model="dialog" aria-label="Player builder">
    <q-card flat bordered>
      <q-card-section class="items-center">
        <div class="row">
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
        </div>
        <div class="row">
          <q-select
            style="width: 180px"
            outlined
            v-model="tmpParty.name"
            :options="parties"
            label="Active Party"
            :dropdown-icon="matArrowDropDown"
            @update:model-value="changeActiveParty(tmpParty.name)"
          />
          <q-space />
          <q-btn
            class="tw-my-auto"
            :icon="biPlusLg"
            size="sm"
            padding="sm"
            flat
            round
            dense
            aria-label="Add new party"
            @click="newPartyDialog = true"
          />
          <q-dialog
            v-model="newPartyDialog"
            aria-label="New party dialog"
            @escape-key="closeDialog"
          >
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">New party name</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-input
                  ref="partyNameInput"
                  dense
                  v-model="newPartyName"
                  autofocus
                  @keyup.enter="addParty"
                  :rules="[
                    (val) => !!val || 'Field is required',
                    (val) => !parties.find((name) => name === val) || 'This party already exists'
                  ]"
                  :no-error-icon="true"
                />
              </q-card-section>

              <q-card-actions align="center" class="text-primary">
                <q-btn flat label="Cancel" @click="closeDialog" />
                <q-btn flat label="Add party" @click="addParty" />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-btn
            class="tw-m-auto"
            :icon="biTrash"
            size="sm"
            padding="sm"
            flat
            round
            dense
            aria-label="Remove current party"
            @click="removePartyDialog = true"
          />
          <q-dialog
            v-model="removePartyDialog"
            aria-label="Remove party dialog"
            @escape-key="closeDialog"
          >
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Remove this party?</div>
              </q-card-section>
              <q-card-actions align="center" class="text-primary">
                <q-btn flat label="Cancel" @click="closeDialog" />
                <q-btn flat label="Remove" @click="removeParty" color="red" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 60vh" class="scroll">
        <div class="tw-space-y-4">
          <div v-for="(_, index) in tmpParty.members" :key="index" class="row no-wrap items-center">
            <div class="col-grow">
              <q-input
                outlined
                type="number"
                min="1"
                max="20"
                :label="'Player ' + (index + 1)"
                v-model.number="tmpParty.members[index]"
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

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
