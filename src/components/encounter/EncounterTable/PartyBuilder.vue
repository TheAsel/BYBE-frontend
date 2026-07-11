<script setup lang="ts">
import {
  biDashLg,
  biPlusLg,
  biTrash,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { QInput, useQuasar } from "quasar";
import { ref } from "vue";

import { partyStore } from "@/stores/party";

import type { party } from "@/types/party";

const $q = useQuasar();

const party_store = partyStore();

const tmpParty = ref<party>({
  advanced: party_store.parties[party_store.activeParty]?.advanced ?? false,
  name: party_store.parties[party_store.activeParty]?.name ?? "Default",
  level: party_store.parties[party_store.activeParty]?.level ?? 1,
  size: party_store.parties[party_store.activeParty]?.size ?? 4,
  members: (
    party_store.parties[party_store.activeParty]?.members ?? [
      { level: 1, name: "Player 1" },
      { level: 1, name: "Player 2" },
      { level: 1, name: "Player 3" },
      { level: 1, name: "Player 4" }
    ]
  ).map(m => ({ ...m }))
});

const parties = ref(party_store.parties.map(party => party.name));
const selectedParty = ref(party_store.parties[party_store.activeParty]!.name);

const dialog = ref(false);

const newPartyDialog = ref(false);
const partyNameInput = ref<InstanceType<typeof QInput> | null>(null);
const newPartyName = ref("");

const removePartyDialog = ref(false);

const resetParty = (): party => {
  const activeParty = party_store.parties[party_store.activeParty];
  if (activeParty) {
    return {
      ...activeParty,
      members: activeParty.members.map(m => ({ ...m }))
    };
  }

  return {
    advanced: false,
    name: "Default",
    level: 1,
    size: 4,
    members: [
      { level: 1, name: "Player 1" },
      { level: 1, name: "Player 2" },
      { level: 1, name: "Player 3" },
      { level: 1, name: "Player 4" }
    ]
  };
};

const restoreParty = (): void => {
  dialog.value = true;
  tmpParty.value = resetParty();
};

const validateLevel = (newValue: unknown): number => {
  const val = Number(newValue);
  if (Number.isNaN(val) || val < 1) {
    return 1;
  } else if (val > 20) {
    return 20;
  }
  return Math.round(val);
};

const validateSimpleParty = (): void => {
  if (typeof tmpParty.value.size !== "number" || tmpParty.value.size === 0) {
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

  const level = tmpParty.value.level;
  tmpParty.value.members = Array.from<
    unknown,
    {
      name: string;
      level: number;
    }
  >({ length: tmpParty.value.size }, (_, index) => ({
    name: `Player ${index + 1}`,
    level
  }));
};

const updateAdvanced = (): void => {
  if (tmpParty.value.advanced) {
    const level = tmpParty.value.level;
    tmpParty.value.members = Array.from<
      unknown,
      {
        name: string;
        level: number;
      }
    >({ length: tmpParty.value.size }, (_, index) => ({
      name: `Player ${index + 1}`,
      level
    }));
  } else if (
    tmpParty.value.members.every(
      (member, _, arr) => member.level === arr[0]?.level
    )
  ) {
    tmpParty.value.size = tmpParty.value.members.length;
    tmpParty.value.level = tmpParty.value.members[0]?.level ?? 1;
  } else {
    tmpParty.value.size = 4;
    tmpParty.value.level = 1;
  }
};

const addPlayer = (): void => {
  if (tmpParty.value.advanced) {
    if (tmpParty.value.members.length >= 20) {
      $q.notify({
        icon: matPriorityHigh,
        message: "Maximum player number reached",
        progress: true,
        type: "warning"
      });
      return;
    }
    tmpParty.value.members.push({
      level: 1,
      name: `Player ${tmpParty.value.members.length + 1}`
    });
  }
};

const removePlayer = (index: number): void => {
  if (tmpParty.value.advanced && tmpParty.value.members.length > 1) {
    tmpParty.value.members.splice(index, 1);
  }
};

const closeDialog = (): void => {
  newPartyDialog.value = false;
  removePartyDialog.value = false;
  newPartyName.value = "";
};

const saveChanges = (): void => {
  party_store.updateParty(tmpParty.value);
  localStorage.setItem("parties", JSON.stringify(party_store.parties));
};

const addParty = (): void => {
  partyNameInput.value?.validate();
  if (!partyNameInput.value?.hasError) {
    party_store.addParty(newPartyName.value);
    selectedParty.value = newPartyName.value;
    parties.value = party_store.parties.map(party => party.name);
    tmpParty.value = resetParty();
    saveChanges();
    newPartyName.value = "";
    newPartyDialog.value = false;
  }
};

const removeParty = (): void => {
  party_store.removeParty();
  selectedParty.value = party_store.parties[party_store.activeParty]!.name;
  parties.value = party_store.parties.map(party => party.name);
  tmpParty.value = resetParty();
  saveChanges();
  removePartyDialog.value = false;
};

const changeActiveParty = (selected: string): void => {
  party_store.changeActiveParty(party_store.getPartyIndex(selected));
  tmpParty.value = resetParty();
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
              Remove party
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

      <q-card-section v-if="tmpParty.advanced" class="scroll tw:max-h-102">
        <div class="tw:space-y-4">
          <div
            v-for="(member, index) in tmpParty.members"
            :key="index"
            class="row no-wrap items-center"
          >
            <div class="col-grow">
              <q-input
                :model-value="member.name"
                dense
                outlined
                min="1"
                max="20"
                label="Name"
                class="tw:max-w-35"
                @update:model-value="
                  (v: unknown) => (member.name = String(v ?? ''))
                "
              />
            </div>
            <div class="col-shrink">
              <q-input
                :model-value="member.level"
                dense
                outlined
                type="number"
                min="1"
                max="20"
                label="Level"
                class="tw:w-13 tw:ml-4"
                @update:model-value="
                  (v: unknown) => (member.level = validateLevel(v))
                "
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
