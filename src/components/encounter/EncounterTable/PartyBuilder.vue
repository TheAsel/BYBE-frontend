<script setup lang="ts">
import {
  biDashLg,
  biPlusLg,
  biTrash,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { useQuasar } from "quasar";
import { ref } from "vue";

import { partyStore } from "@/stores/party";

import type { party } from "@/types/party";

const $q = useQuasar();

const party_store = partyStore();

// Upgrade legacy parties
if (party_store.parties[party_store.activeParty]!.advanced === undefined) {
  const legacyParties = party_store.parties;
  for (let i = 0; i < legacyParties.length; i++) {
    legacyParties[i] = {
      advanced: true,
      level: party_store.parties[party_store.activeParty]!.members[0],
      members: [...legacyParties[i]!.members],
      name: legacyParties[i]!.name,
      size: party_store.parties[party_store.activeParty]!.members.length
    };
  }
  party_store.updateParties(legacyParties);
  localStorage.setItem("parties", JSON.stringify(party_store.parties));
}

const tmpParty = ref<party>({
  advanced: party_store.parties[party_store.activeParty]!.advanced,
  level: party_store.parties[party_store.activeParty]!.level,
  members: [...party_store.parties[party_store.activeParty]!.members],
  name: party_store.parties[party_store.activeParty]!.name,
  size: party_store.parties[party_store.activeParty]!.size
});
const parties = ref(party_store.parties.map(party => party.name));
const selectedParty = ref(party_store.parties[party_store.activeParty]!.name);

const dialog = ref(false);

const newPartyDialog = ref(false);
const partyNameInput = ref();
const newPartyName = ref("");

const removePartyDialog = ref(false);

const restoreParty = () => {
  dialog.value = true;
  tmpParty.value = {
    advanced: party_store.parties[party_store.activeParty]!.advanced,
    level: party_store.parties[party_store.activeParty]!.level,
    members: [...party_store.parties[party_store.activeParty]!.members],
    name: party_store.parties[party_store.activeParty]!.name,
    size: party_store.parties[party_store.activeParty]!.size
  };
};

const validateLevel = (index: number) => {
  const value = tmpParty.value.members[index];
  if (typeof value !== "number" || value < 1 || value === 0) {
    tmpParty.value.members[index] = 1;
  } else if (value > 20) {
    tmpParty.value.members[index] = 20;
  }
  tmpParty.value.members[index] = Math.round(tmpParty.value.members[index]!);
};

const validateSimpleParty = () => {
  if (
    typeof tmpParty.value.size !== "number" ||
    tmpParty.value.size < 1 ||
    tmpParty.value.size === 0
  ) {
    tmpParty.value.size = 1;
  } else if (tmpParty.value.size > 20) {
    tmpParty.value.size = 20;
  }
  tmpParty.value.size = Math.round(tmpParty.value.size);

  if (
    typeof tmpParty.value.level !== "number" ||
    tmpParty.value.level < 1 ||
    tmpParty.value.level === 0
  ) {
    tmpParty.value.level = 1;
  } else if (tmpParty.value.level && tmpParty.value.level > 20) {
    tmpParty.value.level = 20;
  }
  tmpParty.value.level = Math.round(tmpParty.value.level);

  tmpParty.value.members = Array.from<number>({
    length: tmpParty.value.size
  }).fill(tmpParty.value.level);
};

const updateAdvanced = () => {
  if (tmpParty.value.advanced) {
    if (tmpParty.value.size && tmpParty.value.level) {
      tmpParty.value.members = Array.from<number>({
        length: tmpParty.value.size
      }).fill(tmpParty.value.level);
    } else {
      tmpParty.value.members = [1, 1, 1, 1];
    }
  } else if (
    tmpParty.value.members.every((member, _, arr) => member === arr[0])
  ) {
    tmpParty.value.size = tmpParty.value.members.length;
    tmpParty.value.level = tmpParty.value.members[0];
  } else {
    tmpParty.value.size = 4;
    tmpParty.value.level = 1;
  }
};

const addPlayer = () => {
  if (tmpParty.value.members.length >= 20) {
    $q.notify({
      icon: matPriorityHigh,
      message: "Maximum player number reached",
      progress: true,
      type: "warning"
    });
    return;
  }
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
  newPartyName.value = "";
};

const addParty = () => {
  partyNameInput.value.validate();
  if (!partyNameInput.value.hasError) {
    party_store.addParty(newPartyName.value);
    selectedParty.value = newPartyName.value;
    parties.value = party_store.parties.map(party => party.name);
    tmpParty.value = {
      advanced: party_store.parties[party_store.activeParty]!.advanced,
      level: party_store.parties[party_store.activeParty]!.level,
      members: [...party_store.parties[party_store.activeParty]!.members],
      name: party_store.parties[party_store.activeParty]!.name,
      size: party_store.parties[party_store.activeParty]!.size
    };
    saveChanges();
    newPartyName.value = "";
    newPartyDialog.value = false;
  }
};

const removeParty = () => {
  party_store.removeParty();
  selectedParty.value = party_store.parties[party_store.activeParty]!.name;
  parties.value = party_store.parties.map(party => party.name);
  tmpParty.value = {
    advanced: party_store.parties[party_store.activeParty]!.advanced,
    level: party_store.parties[party_store.activeParty]!.level,
    members: [...party_store.parties[party_store.activeParty]!.members],
    name: party_store.parties[party_store.activeParty]!.name,
    size: party_store.parties[party_store.activeParty]!.size
  };
  saveChanges();
  removePartyDialog.value = false;
};

const changeActiveParty = (selected: string) => {
  party_store.changeActiveParty(party_store.getPartyIndex(selected));
  tmpParty.value = {
    advanced: party_store.parties[party_store.activeParty]!.advanced,
    level: party_store.parties[party_store.activeParty]!.level,
    members: [...party_store.parties[party_store.activeParty]!.members],
    name: party_store.parties[party_store.activeParty]!.name,
    size: party_store.parties[party_store.activeParty]!.size
  };
};

const saveChanges = () => {
  if (tmpParty.value.advanced) {
    tmpParty.value.size = tmpParty.value.members.length;
    tmpParty.value.level = tmpParty.value.members[0];
  } else if (tmpParty.value.size && tmpParty.value.level) {
    tmpParty.value.members = Array.from<number>({
      length: tmpParty.value.size
    }).fill(tmpParty.value.level);
  } else {
    tmpParty.value.members = [1, 1, 1, 1];
  }
  party_store.updateParty(tmpParty.value);
  localStorage.setItem("parties", JSON.stringify(party_store.parties));
};
</script>

<template>
  <q-btn id="shepherd-1" push label="Party" @click="restoreParty" />
  <q-dialog v-model="dialog" aria-label="Player">
    <q-card flat bordered>
      <q-card-section class="items-center">
        <div class="row tw:mb-2">
          <div class="text-h6 tw:mr-4 tw:my-auto">Party</div>
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
            v-model="selectedParty"
            dense
            style="width: 180px"
            outlined
            :options="parties"
            label="Active Party"
            @update:model-value="changeActiveParty"
          />
          <q-btn
            class="tw:my-auto! tw:mx-2! tw:max-h-[33.15px]!"
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
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
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
                  counter
                  :maxlength="50"
                  :no-error-icon="true"
                  :rules="[
                    (val: string) => !!val || 'Field is required',
                    (val: string) =>
                      !parties.some(
                        name => name.toLowerCase() === val.toLowerCase()
                      ) || 'This party already exists'
                  ]"
                  @keyup.enter="addParty"
                />
              </q-card-section>

              <q-card-actions align="center" class="text-primary">
                <q-btn
                  flat
                  label="Cancel"
                  class="tw:text-blue-600! tw:dark:text-blue-400!"
                  @click="closeDialog"
                />
                <q-btn
                  flat
                  label="Add party"
                  class="tw:text-blue-600! tw:dark:text-blue-400!"
                  @click="addParty"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-btn
            class="tw:my-auto! tw:max-h-[33.15px]!"
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
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
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
                  class="tw:text-blue-600! tw:dark:text-blue-400!"
                  @click="closeDialog"
                />
                <q-btn
                  flat
                  label="Remove"
                  class="tw:text-red-600! tw:dark:text-red-400!"
                  @click="removeParty"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
        <div class="tw:grid">
          <q-toggle
            v-model="tmpParty.advanced"
            label="Use advanced party"
            class="tw:mt-4 tw:justify-center"
            aria-label="Use advanced party"
            @click="updateAdvanced()"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section
        v-if="tmpParty.advanced"
        style="max-height: 60vh"
        class="scroll"
      >
        <div class="tw:space-y-4">
          <div
            v-for="(_, index) in tmpParty.members"
            :key="index"
            class="row no-wrap items-center"
          >
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
            <div class="col-shrink tw:pl-3">
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
          class="full-width tw:mt-4! tw:text-blue-600! tw:dark:text-blue-400!"
          :icon="biPlusLg"
          size="md"
          padding="sm"
          aria-label="Add player"
          @click="addPlayer"
        >
        </q-btn>
      </q-card-section>

      <q-card-section v-else class="tw:space-y-3">
        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <q-badge outline class="tw:text-sm! tw:justify-end">
            Party size:
          </q-badge>
          <q-input
            v-model.number="tmpParty.size"
            dense
            outlined
            class="tw:w-16 tw:justify-start"
            type="number"
            min="1"
            max="20"
            label="Size"
            @update:model-value="validateSimpleParty()"
          />
          <q-badge outline class="tw:text-sm! tw:justify-end">
            Party level:
          </q-badge>
          <q-input
            v-model.number="tmpParty.level"
            dense
            outlined
            class="tw:w-16 tw:justify-start"
            type="number"
            min="1"
            max="20"
            label="Level"
            @update:model-value="validateSimpleParty()"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions>
        <q-btn
          v-close-popup
          unelevated
          label="Save changes"
          type="button"
          class="full-width tw:text-blue-600! tw:dark:text-blue-400!"
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
input[type="number"] {
  appearance: textfield;
}
</style>

<style scoped>
.q-badge {
  border-color: #ffffff;
  color: #666666;
}

.q-dark .q-badge {
  border-color: #1f2937;
  color: #bcbfc3;
}

.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
