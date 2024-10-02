<script setup lang="ts">
import { ref } from 'vue';
import type { party } from 'src/types/party';
import { biXLg, biPlusLg, biDashLg, biTrash } from '@quasar/extras/bootstrap-icons';
import { partyStore } from 'stores/store';

const partyStores = partyStore();
const tmpParty = ref<party>({
  name: partyStores.getActiveParty.name,
  members: [...partyStores.getActiveParty.members]
});
const parties = ref(partyStores.getParties.map((party) => party.name));

const dialog = ref(false);

const newPartyDialog = ref(false);
const partyNameInput = ref();
const newPartyName = ref('');

const removePartyDialog = ref(false);

const restoreParty = () => {
  dialog.value = true;
  tmpParty.value = {
    name: partyStores.getActiveParty.name,
    members: [...partyStores.getActiveParty.members]
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
  tmpParty.value.members[index] = Math.round(tmpParty.value.members[index]);
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
    partyStores.addParty(newPartyName.value);
    parties.value = partyStores.getParties.map((party) => party.name);
    tmpParty.value = {
      name: partyStores.getActiveParty.name,
      members: [...partyStores.getActiveParty.members]
    };
    saveChanges();
    newPartyName.value = '';
    newPartyDialog.value = false;
  }
};

const removeParty = () => {
  partyStores.removeParty();
  parties.value = partyStores.getParties.map((party) => party.name);
  tmpParty.value = {
    name: partyStores.getActiveParty.name,
    members: [...partyStores.getActiveParty.members]
  };
  saveChanges();
  removePartyDialog.value = false;
};

const changeActiveParty = (selected: string) => {
  partyStores.changeActiveParty(partyStores.getPartyIndex(selected));
  tmpParty.value = {
    name: partyStores.getActiveParty.name,
    members: [...partyStores.getActiveParty.members]
  };
};

const saveChanges = () => {
  partyStores.updateParty(tmpParty.value.name, tmpParty.value.members);
  localStorage.setItem('parties', JSON.stringify(partyStores.getParties));
};
</script>

<template>
  <q-btn id="v-step-1" push label="Party Builder" @click="restoreParty" />
  <q-dialog v-model="dialog" aria-label="Player builder">
    <q-card flat bordered>
      <q-card-section class="items-center">
        <div class="row tw-mb-2">
          <div class="text-h6 tw-mr-4 tw-my-auto">Party Builder</div>
          <q-space />
          <q-btn
            v-close-popup
            :icon="biXLg"
            size="md"
            padding="sm"
            flat
            round
            dense
            aria-label="Close dialog"
          />
        </div>
        <div class="row">
          <q-select
            v-model="tmpParty.name"
            dense
            style="width: 180px"
            outlined
            :options="parties"
            label="Active Party"
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
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Add new party
            </q-tooltip>
          </q-btn>
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
                  v-model="newPartyName"
                  dense
                  autofocus
                  :no-error-icon="true"
                  :rules="[
                    (val) => !!val || 'Field is required',
                    (val) => !parties.find((name) => name === val) || 'This party already exists'
                  ]"
                  @keyup.enter="addParty"
                />
              </q-card-section>

              <q-card-actions align="center" class="text-primary">
                <q-btn
                  flat
                  label="Cancel"
                  class="tw-text-blue-600 dark:tw-text-blue-400"
                  @click="closeDialog"
                />
                <q-btn
                  flat
                  label="Add party"
                  class="tw-text-blue-600 dark:tw-text-blue-400"
                  @click="addParty"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-space />
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
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Delete party
            </q-tooltip>
          </q-btn>
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
                <q-btn
                  flat
                  label="Cancel"
                  class="tw-text-blue-600 dark:tw-text-blue-400"
                  @click="closeDialog"
                />
                <q-btn
                  flat
                  label="Remove"
                  class="tw-text-red-600 dark:tw-text-red-400"
                  @click="removeParty"
                />
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
                v-model.number="tmpParty.members[index]"
                dense
                outlined
                type="number"
                min="1"
                max="20"
                :label="'Player ' + (index + 1)"
                @update:model-value="validateLevel(index)"
              />
            </div>
            <div class="col-shrink tw-pl-3">
              <q-btn
                flat
                round
                type="button"
                :icon="biDashLg"
                size="md"
                padding="sm"
                aria-label="Remove player"
                @click="removePlayer(index)"
              >
              </q-btn>
            </div>
          </div>
        </div>
        <q-btn
          outline
          type="button"
          class="full-width tw-mt-4 tw-text-blue-600 dark:tw-text-blue-400"
          :icon="biPlusLg"
          size="md"
          padding="sm"
          aria-label="Add player"
          @click="addPlayer"
        >
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-card-actions>
        <q-btn
          v-close-popup
          unelevated
          label="Save changes"
          type="button"
          class="full-width tw-text-blue-600 dark:tw-text-blue-400"
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
