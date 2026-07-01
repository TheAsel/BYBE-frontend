<script setup lang="ts">
import {
  biDash,
  biInputCursorText,
  biPlayFill,
  biPlus,
  biPlusLg,
  biShare,
  biTrash,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { fasDragon, fasLandMineOn } from "@quasar/extras/fontawesome-v7";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { debounce } from "lodash-es";
import { copyToClipboard, useQuasar } from "quasar";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  decodeEncounterLink,
  encounterInfo,
  generateEncounterLink,
  requestCreatureId,
  requestHazardId
} from "@/api/encounter-api-calls";
import { encounterStore } from "@/stores/encounter";
import { infoStore } from "@/stores/info";
import { partyStore } from "@/stores/party";
import { settingsStore } from "@/stores/settings";
import { getGameAonLink, openSheet } from "@/utils/sheet";

import type {
  encounter_info,
  encounter_list,
  min_creature_hazard,
  shareable_encounter
} from "@/types/encounter";
import type { complexities, games, variants } from "@/types/filters";

const isApp = import.meta.env.IS_APP;

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const is_pwl_on = ref(false);

const party_store = partyStore();
const encounter_store = encounterStore();
const info_store = infoStore();
const settings_store = settingsStore();

const importEncounterDialog = ref(false);
const importNameInput = ref();
const importEncounterName = ref("");
const importEncounterData = ref<shareable_encounter>();

const shareDialog = ref(false);
const shareUrl = ref("");
const sharedLink = ref("");
const isGenerating = ref(false);

const newEncounterDialog = ref(false);
const encounterNameInput = ref();
const newEncounterName = ref("");

const renameEncounterDialog = ref(false);
const encounterRenameInput = ref();
const newEncounterRename = ref("");

const removeEncounterDialog = ref(false);

const tmpEncounter = ref<encounter_list>(
  encounter_store.encounters[encounter_store.activeEncounter]!
);
const encounters = ref<string[]>(
  encounter_store.encounters.map(encounter => encounter.name)
);

tmpEncounter.value = {
  creatures:
    encounter_store.encounters[encounter_store.activeEncounter]!.creatures,
  name: encounter_store.encounters[encounter_store.activeEncounter]!.name
};

const debouncedCall = debounce(async () => {
  const encounterList =
    encounter_store.encounters[encounter_store.activeEncounter]!.creatures;
  const creatureLevels: number[] = [];
  const hazardLevels: { complexity: complexities; level: number }[] = [];
  for (const item of encounterList) {
    for (let j = 0; j < item.quantity!; j += 1) {
      if (item.is_hazard === false) {
        switch (item.variant) {
          case "Weak": {
            if (item.level === 1) {
              creatureLevels.push(item.level - 2);
            } else {
              creatureLevels.push(item.level - 1);
            }
            break;
          }
          case "Elite": {
            if (item.level === -1 || item.level === 0) {
              creatureLevels.push(item.level + 2);
            } else {
              creatureLevels.push(item.level + 1);
            }
            break;
          }
          default: {
            creatureLevels.push(item.level);
            break;
          }
        }
      } else {
        hazardLevels.push({ complexity: item.complexity!, level: item.level });
      }
    }
  }
  const partyLevels = party_store.parties[party_store.activeParty]!.members.map(
    player => player.level
  );
  const localPwl = ref(localStorage.getItem("is_pwl_on"));
  switch (localPwl.value) {
    case "true": {
      is_pwl_on.value = true;
      break;
    }
    case "false": {
      is_pwl_on.value = false;
      break;
    }
    default: {
      is_pwl_on.value = false;
      localStorage.setItem("is_pwl_on", "false");
      break;
    }
  }
  const body: encounter_info = {
    creatures_params: {
      enemy_levels: creatureLevels,
      is_pwl_on: is_pwl_on.value
    },
    hazards_params: { hazards: hazardLevels },
    party_levels: partyLevels
  };
  try {
    if (!encounter_store.generating) {
      const returnedEncounterInfo = await encounterInfo(
        settings_store.game,
        body
      );
      if (!returnedEncounterInfo) {
        throw new TypeError("Error calculating encounter challenge");
      }
      info_store.setInfo(returnedEncounterInfo);
    }
  } catch (error) {
    console.error(error);
  }
}, 300);

const closeDialog = (): void => {
  importEncounterDialog.value = false;
  shareDialog.value = false;
  newEncounterDialog.value = false;
  renameEncounterDialog.value = false;
  removeEncounterDialog.value = false;
  sharedLink.value = "";
  importEncounterName.value = "";
  newEncounterName.value = "";
  newEncounterRename.value = "";
};

const saveChanges = (): void => {
  encounter_store.updateEncounter(
    tmpEncounter.value.name,
    tmpEncounter.value.creatures
  );
  localStorage.setItem(
    "encounters",
    JSON.stringify(encounter_store.encounters)
  );
};

// Read the "share" query and decode it
const encodedData = ref(route.query.share ?? "");

const decodeData = async (): Promise<void> => {
  if (encodedData.value !== "") {
    isGenerating.value = true;
    importEncounterDialog.value = true;
    try {
      const decodedData = await decodeEncounterLink(String(encodedData.value));
      if (!decodedData) {
        importEncounterDialog.value = false;
        throw new TypeError("Error importing encounter");
      }
      importEncounterData.value = decodedData;
      importEncounterName.value = decodedData.encounter_name;
    } catch (error) {
      importEncounterDialog.value = false;
      console.error(error);
      $q.notify({
        icon: matPriorityHigh,
        message: "Error importing encounter",
        progress: true,
        type: "warning"
      });
    }
    isGenerating.value = false;
  }
};
await decodeData();

// Clean and check the link for manual app import
const cleanLink = async (): Promise<void> => {
  try {
    const parsedUrl = new URL(sharedLink.value);
    const path = parsedUrl.pathname;
    if (path !== route.path) {
      closeDialog();
      $q.notify({
        icon: matPriorityHigh,
        message: "Invalid page for this link",
        progress: true,
        type: "warning"
      });
      throw new Error("Invalid page for this link");
    }
    const share = parsedUrl.searchParams.get("share");
    if (share === null || share === "") {
      closeDialog();
      $q.notify({
        icon: matPriorityHigh,
        message: "Missing share hash",
        progress: true,
        type: "warning"
      });
      throw new TypeError("Missing share code");
    }
    encodedData.value = share;
    closeDialog();
    await decodeData();
  } catch (error) {
    console.error(error);
  }
};

// Clean the url from queries
await router.replace({
  path: route.path,
  query: { game: settings_store.game }
});

// Open the share dialog and generate the shareable link
const openShare = async (): Promise<void> => {
  isGenerating.value = true;
  shareDialog.value = true;
  const encounterList =
    encounter_store.encounters[encounter_store.activeEncounter]!.creatures;
  const body: shareable_encounter = {
    creatures_data: [],
    encounter_name: encounter_store.encounters[encounter_store.activeEncounter]
      ?.name
      ? encounter_store.encounters[encounter_store.activeEncounter]!.name
      : "Default",
    hazards_data: []
  };

  for (const item of encounterList) {
    if (item.game !== "pf" && item.game !== "sf") {
      shareDialog.value = false;
      $q.notify({
        icon: matPriorityHigh,
        message: "This legacy list cannot be shared",
        progress: true,
        type: "warning"
      });
      return;
    }

    if (item.is_hazard === false) {
      const tmp_variant: variants = item.variant ? item.variant : "Base";
      const tmp_qty: number = item.quantity ? item.quantity : 1;
      const tmp_game: games = item.game;

      body.creatures_data.push({
        game: tmp_game,
        id: item.id,
        qty: tmp_qty,
        variant: tmp_variant
      });
    } else {
      const tmp_qty: number = item.quantity ? item.quantity : 1;
      const tmp_game: games = item.game;

      body.hazards_data.push({
        game: tmp_game,
        id: item.id,
        qty: tmp_qty
      });
    }
  }

  try {
    const shareableLink = await generateEncounterLink(body);
    if (typeof shareableLink === "string") {
      shareUrl.value = `https://bybe.app/encounter?game=${
        settings_store.game
      }&share=${shareableLink}`;
    } else {
      shareDialog.value = false;
      $q.notify({
        icon: matPriorityHigh,
        message: "Error generating shared link",
        progress: true,
        type: "warning"
      });
    }
  } catch (error) {
    shareDialog.value = false;
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error generating shared link",
      progress: true,
      type: "warning"
    });
  }
  isGenerating.value = false;
};

const importEncounter = async (): Promise<void> => {
  importNameInput.value.validate();
  if (!importNameInput.value.hasError) {
    const tmp_encounter: min_creature_hazard[] = [];

    const creatures = await Promise.all(
      (importEncounterData.value?.creatures_data ?? []).map(
        async (
          creature
        ): Promise<
          { success: true; creature: min_creature_hazard } | { success: false }
        > => {
          try {
            const fetchedCreatureData = await requestCreatureId(
              creature.game,
              creature.id,
              creature.variant,
              is_pwl_on.value
            );
            if (!fetchedCreatureData) {
              console.error("Missing creature ID");
              return { success: false };
            }
            return {
              creature: {
                archive_link:
                  fetchedCreatureData.core_data.derived.archive_link,
                game: creature.game,
                id: creature.id,
                is_hazard: false,
                level: fetchedCreatureData.core_data.essential.base_level,
                name: fetchedCreatureData.core_data.essential.name,
                quantity: creature.qty,
                variant: creature.variant
              },
              success: true
            };
          } catch (error) {
            console.error(error);
            return { success: false };
          }
        }
      )
    );

    if (creatures.some(c => !c.success)) {
      $q.notify({
        icon: matPriorityHigh,
        message: "Some creatures could not be loaded",
        progress: true,
        type: "warning"
      });
    }

    tmp_encounter.push(
      ...creatures
        .filter((c): c is Extract<typeof c, { success: true }> => c.success)
        .map(c => c.creature)
    );

    const hazards = await Promise.all(
      (importEncounterData.value?.hazards_data ?? []).map(
        async (
          hazard
        ): Promise<
          { success: true; hazard: min_creature_hazard } | { success: false }
        > => {
          try {
            const fetchedHazardsData = await requestHazardId(
              hazard.game,
              hazard.id
            );
            if (!fetchedHazardsData) {
              console.error("Missing hazard ID");
              return { success: false };
            }
            return {
              hazard: {
                archive_link: `https://2e.${getGameAonLink(
                  hazard.game
                )}.com/search?q=${encodeURIComponent(
                  fetchedHazardsData.core_hazard.essential.name
                )} type%3A(hazard)&type=eqs`,
                complexity: fetchedHazardsData.core_hazard.essential.complexity,
                game: hazard.game,
                id: hazard.id,
                is_hazard: true,
                level: fetchedHazardsData.core_hazard.essential.level,
                name: fetchedHazardsData.core_hazard.essential.name,
                quantity: hazard.qty
              },
              success: true
            };
          } catch (error) {
            console.error(error);
            return { success: false };
          }
        }
      )
    );

    if (hazards.some(h => !h.success)) {
      $q.notify({
        icon: matPriorityHigh,
        message: "Some hazards could not be loaded",
        progress: true,
        type: "warning"
      });
    }

    tmp_encounter.push(
      ...hazards
        .filter((h): h is Extract<typeof h, { success: true }> => h.success)
        .map(h => h.hazard)
    );

    encounter_store.addEncounter(importEncounterName.value);
    encounters.value = encounter_store.encounters.map(
      encounter => encounter.name
    );
    encounter_store.updateEncounter(importEncounterName.value, tmp_encounter);
    tmpEncounter.value = {
      creatures: [
        ...encounter_store.encounters[encounter_store.activeEncounter]!
          .creatures
      ],
      name: encounter_store.encounters[encounter_store.activeEncounter]!.name
    };
    saveChanges();
    importEncounterName.value = "";
    importEncounterDialog.value = false;
  }
};

const addEncounter = (): void => {
  encounterNameInput.value.validate();
  if (!encounterNameInput.value.hasError) {
    encounter_store.addEncounter(newEncounterName.value);
    encounters.value = encounter_store.encounters.map(
      encounter => encounter.name
    );
    tmpEncounter.value = {
      creatures: [
        ...encounter_store.encounters[encounter_store.activeEncounter]!
          .creatures
      ],
      name: encounter_store.encounters[encounter_store.activeEncounter]!.name
    };
    saveChanges();
    newEncounterName.value = "";
    newEncounterDialog.value = false;
  }
};

const renameEncounter = (): void => {
  encounterRenameInput.value.validate();
  if (!encounterRenameInput.value.hasError) {
    encounter_store.encounters[encounter_store.activeEncounter]!.name =
      newEncounterRename.value;
    encounters.value = encounter_store.encounters.map(
      encounter => encounter.name
    );
    tmpEncounter.value = {
      creatures: [
        ...encounter_store.encounters[encounter_store.activeEncounter]!
          .creatures
      ],
      name: encounter_store.encounters[encounter_store.activeEncounter]!.name
    };
    saveChanges();
    newEncounterRename.value = "";
    renameEncounterDialog.value = false;
  }
};

const removeEncounter = (): void => {
  encounter_store.removeEncounter();
  encounters.value = encounter_store.encounters.map(
    encounter => encounter.name
  );
  tmpEncounter.value = {
    creatures: [
      ...encounter_store.encounters[encounter_store.activeEncounter]!.creatures
    ],
    name: encounter_store.encounters[encounter_store.activeEncounter]!.name
  };
  saveChanges();
  removeEncounterDialog.value = false;
};

const changeActiveEncounter = (selected: string): void => {
  encounter_store.changeActiveEncounter(
    encounter_store.getEncounterIndex(selected)
  );
  tmpEncounter.value = {
    creatures: [
      ...encounter_store.encounters[encounter_store.activeEncounter]!.creatures
    ],
    name: encounter_store.encounters[encounter_store.activeEncounter]!.name
  };
};

const showItem = debounce(async (item: min_creature_hazard) => {
  if (item.is_hazard) {
    try {
      const itemData = await requestHazardId(item.game, item.id);
      if (itemData === null) {
        console.error("Missing hazard ID");
        $q.notify({
          icon: matPriorityHigh,
          message: "Missing hazard ID",
          progress: true,
          type: "warning"
        });
      } else {
        encounter_store.setSelectedHazard(itemData);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      const itemData = await requestCreatureId(
        item.game,
        item.id,
        item.variant!,
        settings_store.is_pwl_on
      );
      if (itemData === null) {
        console.error("Missing creature ID");
        $q.notify({
          icon: matPriorityHigh,
          message: "Missing creature ID",
          progress: true,
          type: "warning"
        });
        await router.push({ name: "encounter", query: { game: item.game } });
      } else {
        encounter_store.setSelectedCreature(itemData);
      }
    } catch (error) {
      console.error(error);
    }
  }
}, 300);

const startTracker = (): void => {
  const routeData = router.resolve({
    name: "tracker",
    query: { game: settings_store.game }
  });

  if (import.meta.env.IS_APP === true) {
    localStorage.removeItem("tracker_data");
    localStorage.setItem(
      "tracker_data",
      JSON.stringify({
        encounter_list:
          encounter_store.encounters[encounter_store.activeEncounter],
        party: party_store.parties[party_store.activeParty]
      })
    );
    globalThis.open(routeData.href, "_self");
  } else {
    sessionStorage.removeItem("tracker_data");
    sessionStorage.setItem(
      "tracker_data",
      JSON.stringify({
        encounter_list:
          encounter_store.encounters[encounter_store.activeEncounter],
        party: party_store.parties[party_store.activeParty]
      })
    );
    globalThis.open(routeData.href, "_blank");
    sessionStorage.removeItem("tracker_data");
  }
};

// Get info on creature list change
watch(
  [
    (): encounter_list[] => encounter_store.encounters,
    (): number => encounter_store.activeEncounter,
    (): boolean => settings_store.is_pwl_on
  ],
  async () => {
    tmpEncounter.value = {
      creatures:
        encounter_store.encounters[encounter_store.activeEncounter]!.creatures,
      name: encounter_store.encounters[encounter_store.activeEncounter]!.name
    };
    saveChanges();
    await debouncedCall();
  },
  { deep: true }
);

// Get info on party change
watch(party_store, async () => {
  await debouncedCall();
});

// Get info on page load
await debouncedCall();
</script>

<template>
  <div class="tw:h-full">
    <q-dialog
      v-model="importEncounterDialog"
      aria-label="Import shared encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Import encounter</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="importNameInput"
            v-model="importEncounterName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !encounters.some(
                  name => name.toLowerCase() === val.toLowerCase()
                ) || 'This encounter already exists'
            ]"
            @keyup.enter="importEncounter"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Import encounter"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add encounter"
            @click="importEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="shareDialog"
      aria-label="Share dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered style="min-height: 210px; width: 320px">
        <q-card-section>
          <div class="row">
            <div class="text-h6 tw:mr-4 tw:my-auto">Share</div>
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
        </q-card-section>
        <div v-if="isApp">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            Paste a shared link here to import it:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-input
                v-model="sharedLink"
                class="tw:w-44 tw:text-gray-800! tw:dark:text-gray-200!"
                outlined
                dense
              />
              <q-btn label="Import" @click="cleanLink" />
            </div>
          </q-card-section>
          <q-separator
            inset
            class="tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-700!"
          />
        </div>
        <div v-if="!isGenerating">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            A copy of your encounter can be accessed via the following link:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-field
                class="tw:w-48 tw:text-gray-800! tw:dark:text-gray-200!"
                outlined
                dense
              >
                <template v-slot:control>
                  <div class="tw:text-nowrap tw:overflow-x-scroll tw:py-4!">
                    {{ shareUrl }}
                  </div>
                </template>
              </q-field>
              <q-btn
                label="Copy"
                @click="
                  copyToClipboard(shareUrl);
                  $q.notify({
                    message: 'Link copied to clipboard',
                    progress: true,
                    type: 'positive',
                    timeout: 1000
                  });
                "
              />
            </div>
          </q-card-section>
        </div>
        <q-inner-loading showing v-else style="z-index: 2">
          <q-spinner-gears
            class="tw:mx-auto tw:mt-8! tw:text-gray-800! tw:dark:text-white!"
            size="5em"
          />
        </q-inner-loading>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="newEncounterDialog"
      aria-label="New encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">New encounter name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="encounterNameInput"
            v-model="newEncounterName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !encounters.some(
                  name => name.toLowerCase() === val.toLowerCase()
                ) || 'This encounter already exists'
            ]"
            @keyup.enter="addEncounter"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Add encounter"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add encounter"
            @click="addEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="renameEncounterDialog"
      aria-label="New encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Rename encounter</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="encounterRenameInput"
            v-model="newEncounterRename"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !encounters.some(
                  name => name.toLowerCase() === val.toLowerCase()
                ) || 'This encounter already exists'
            ]"
            @keyup.enter="renameEncounter"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Rename encounter"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Rename encounter"
            @click="renameEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="removeEncounterDialog"
      aria-label="Remove encounter dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Remove this encounter?</div>
        </q-card-section>
        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Remove"
            class="tw:text-red-600! tw:dark:text-red-400!"
            aria-label="Remove encounter"
            @click="removeEncounter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-layout
      id="shepherd-7"
      view="lHh lpr lFf"
      container
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:border tw:border-gray-200! tw:rounded-xl tw:shadow-sm tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div
          class="tw:flex tw:flex-wrap tw:justify-center! tw:mx-4 tw:my-1.5 tw:gap-2"
        >
          <q-btn
            id="shepherd-10"
            class="tw:grow"
            :icon="biShare"
            label="Share"
            unelevated
            push
            @click="openShare"
          />
          <div class="tw:flex">
            <q-btn
              class="tw:my-auto! tw:max-h-[33.15px]!"
              :icon="biPlusLg"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Add new encounter"
              @click="newEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Add new encounter
              </q-tooltip>
            </q-btn>
            <q-btn
              class="tw:my-auto! tw:ml-2! tw:max-h-[33.15px]!"
              :icon="biInputCursorText"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Rename encounter"
              @click="renameEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Rename encounter
              </q-tooltip>
            </q-btn>
            <q-btn
              class="tw:my-auto! tw:mx-2! tw:max-h-[33.15px]!"
              :icon="biTrash"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Remove current encounter"
              @click="removeEncounterDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Delete encounter
              </q-tooltip>
            </q-btn>
          </div>
          <q-select
            v-model="tmpEncounter.name"
            dense
            style="min-width: 120px; max-width: 120px"
            class="tw:my-auto"
            outlined
            :options="encounters"
            label="Encounters"
            @update:model-value="changeActiveEncounter(tmpEncounter.name)"
          />
          <q-btn
            flat
            dense
            aria-label="Clear encounter"
            @click="encounter_store.clearEncounter"
            >CLEAR</q-btn
          >
        </div>
      </q-header>
      <q-page-container v-if="encounter_store.generating === false">
        <q-page class="tw:min-h-auto!">
          <div
            v-for="(item, index) in encounter_store.encounters[
              encounter_store.activeEncounter
            ]!.creatures"
            :key="index"
          >
            <div class="tw:flex tw:item-center">
              <div
                id="shepherd-8"
                class="tw:flex-none tw:w-12 tw:my-auto tw:mx-1"
              >
                <q-btn
                  unelevated
                  :ripple="false"
                  size="sm"
                  class="q-px-md"
                  :icon="biPlus"
                  aria-label="Add creature"
                  @click="encounter_store.addToEncounter(item, index)"
                />
                <q-btn
                  unelevated
                  :ripple="false"
                  size="sm"
                  class="q-px-md"
                  :icon="biDash"
                  aria-label="Remove creature"
                  @click="encounter_store.removeFromEncounter(index)"
                />
              </div>
              <div
                class="tw:flex tw:flex-wrap tw:flex-row tw:grow cursor-pointer"
                @click="showItem(item)"
              >
                <div
                  class="tw:flex-1 tw:my-auto tw:mx-1"
                  style="min-width: 100px"
                >
                  <q-chip
                    v-if="item.is_hazard === false"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Creature type"
                    @click="
                      if (!item.is_hazard) {
                        openSheet(
                          router,
                          'bestiary',
                          item.game ?? settings_store.game,
                          item.id,
                          item.variant
                        );
                      }
                    "
                  >
                    <q-avatar class="tw:visible" :icon="fasDragon" color="blue">
                      <q-tooltip
                        class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Creature
                      </q-tooltip>
                    </q-avatar>
                  </q-chip>
                  <q-chip
                    v-if="item.is_hazard === true"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Hazard type"
                    @click="
                      openSheet(
                        router,
                        'hazard',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="fasLandMineOn"
                      color="red"
                    >
                      <q-tooltip
                        class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Hazard
                      </q-tooltip>
                    </q-avatar>
                  </q-chip>
                  <span class="tw:align-middle">
                    {{ item.quantity }}
                    <a
                      v-if="item.archive_link"
                      :href="
                        item.archive_link +
                        (!item.is_hazard
                          ? '&Weak=' +
                            (item.variant === 'Weak') +
                            '&Elite=' +
                            (item.variant === 'Elite')
                          : '')
                      "
                      target="_blank"
                      rel="noopener"
                    >
                      <span
                        class="tw:text-blue-600! tw:decoration-2 tw:hover:underline tw:dark:text-blue-400!"
                        >{{ item.name }}</span
                      >
                    </a>
                    <span v-else>{{ item.name }}</span>
                    — Lv. {{ item.level }}
                  </span>
                </div>
                <div
                  id="shepherd-9"
                  v-if="item.is_hazard === false"
                  class="tw:flex-initial tw:my-auto tw:mx-1"
                >
                  <q-btn-group unelevated flat spread>
                    <q-btn
                      flat
                      label="Weak"
                      size="15px"
                      :class="
                        item.variant === 'Weak'
                          ? 'tw:text-green-500!'
                          : 'tw:dark:text-gray-200! tw:text-gray-400!'
                      "
                      padding="xs"
                      class="text-weight-bold"
                      @click="encounter_store.changeVariant(index, 'Weak')"
                    />
                    <q-btn
                      flat
                      label="Base"
                      size="15px"
                      :class="
                        item.variant === 'Base'
                          ? 'tw:text-blue-500!'
                          : 'tw:dark:text-gray-200! tw:text-gray-400!'
                      "
                      padding="xs"
                      class="text-weight-bold"
                      @click="encounter_store.changeVariant(index, 'Base')"
                    />
                    <q-btn
                      flat
                      label="Elite"
                      size="15px"
                      :class="
                        item.variant === 'Elite'
                          ? 'tw:text-orange-500!'
                          : 'tw:dark:text-gray-200! tw:text-gray-400!'
                      "
                      padding="xs"
                      class="text-weight-bold"
                      @click="encounter_store.changeVariant(index, 'Elite')"
                    />
                  </q-btn-group>
                </div>
                <div v-else class="tw:flex-initial tw:my-auto tw:mx-1">
                  <span
                    v-if="item.complexity === 'Simple'"
                    flat
                    size="15px"
                    padding="xs"
                    class="tw:text-green-500! text-weight-bold"
                  >
                    SIMPLE
                  </span>
                  <span
                    v-else
                    flat
                    size="15px"
                    padding="xs"
                    class="tw:text-orange-500! text-weight-bold"
                  >
                    COMPLEX
                  </span>
                </div>
              </div>
              <div class="tw:flex-initial tw:my-auto tw:ml-1 tw:mr-3">
                <q-btn
                  unelevated
                  :ripple="false"
                  size="sm"
                  padding="sm"
                  :icon="biTrash"
                  round
                  aria-label="Clear creature"
                  @click="encounter_store.clearCreature(item)"
                />
              </div>
            </div>
            <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
          </div>
        </q-page>
      </q-page-container>
      <q-page-container v-else class="tw:flex" style="height: 78vh">
        <div class="tw:m-auto">
          <q-spinner-gears
            class="tw:mx-auto tw:text-gray-800! tw:dark:text-white!"
            size="5em"
          />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:mx-4 tw:my-1.5">
          <q-btn
            id="shepherd-12"
            class="tw:w-48!"
            :icon-right="biPlayFill"
            color="positive"
            label="Start"
            unelevated
            dense
            push
            aria-label="Start encounter tracking"
            @click="startTracker"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Start encounter tracker
            </q-tooltip>
          </q-btn>
          <q-separator
            vertical
            class="tw:mx-4! tw:bg-gray-200! tw:dark:bg-gray-700!"
          />
          <q-linear-progress
            id="shepherd-11"
            class="tw:my-auto"
            rounded
            size="35px"
            :value="1"
            :color="info_store.info.color"
            aria-label="Encounter challenge"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                class="tw:absolute tw:text-base! tw:flex!"
                color="grey-10"
                text-color="white"
                :label="info_store.info.challenge"
              />
            </div>
          </q-linear-progress>
          <q-separator
            vertical
            class="tw:mx-4! tw:bg-gray-200! tw:dark:bg-gray-700!"
          />
          <div
            class="flex flex-center text-subtitle1 font-bold tw:whitespace-nowrap tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800!"
          >
            Cost: {{ info_store.info.experience }} XP
          </div>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
