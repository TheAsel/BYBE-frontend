<script setup lang="ts">
import {
  biArrowRepeat,
  biInputCursorText,
  biLock,
  biPlusLg,
  biShare,
  biTrash,
  biUnlock,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { debounce } from "lodash-es";
import { copyToClipboard, useQuasar } from "quasar";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  decodeNpcLink,
  generateNpcLink,
  npcLevelGenerator,
  npcNamesGenerator,
  npcParametersGenerator
} from "@/api/npc-api-calls";
import { npcStore } from "@/stores/npc";
import { npcParametersStore } from "@/stores/npc_parameters";
import { settingsStore } from "@/stores/settings";

import type { npc, npc_list, shareable_npc } from "@/types/npc";

const isApp = import.meta.env.IS_APP;

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const npc_parameters_store = npcParametersStore();
const npc_store = npcStore();
const settings_store = settingsStore();

const importNpcDialog = ref(false);
const importNameInput = ref();
const importNpcName = ref("");
const importNpcData = ref<shareable_npc>();

const shareDialog = ref(false);
const shareUrl = ref("");
const isGenerating = ref(false);

const newNpcDialog = ref(false);
const npcNameInput = ref();
const newNpcName = ref("");

const renameNpcDialog = ref(false);
const npcRenameInput = ref();
const newNpcRename = ref("");

const removeNpcDialog = ref(false);

const tmpNpc = ref<npc_list>(npc_store.npcs[npc_store.activeNpc]!);
const npcList = ref<string[]>(npc_store.npcs.map(npc => npc.name));

tmpNpc.value = {
  has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
  name: npc_store.npcs[npc_store.activeNpc]!.name,
  core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
};

const generateParameterNpc = debounce(
  async (
    parameter:
      | "ancestry"
      | "class"
      | "gender"
      | "job"
      | "nickname"
      | "level"
      | "culture"
  ) => {
    if (
      (!npc_store.locks.ancestry && parameter === "ancestry") ||
      (!npc_store.locks.culture && parameter === "culture") ||
      (!npc_store.locks.class && parameter === "class") ||
      (!npc_store.locks.gender && parameter === "gender") ||
      (!npc_store.locks.job && parameter === "job") ||
      (!npc_store.locks.nickname && parameter === "nickname") ||
      (!npc_store.locks.level && parameter === "level")
    ) {
      npc_store.setGenerating(true);

      try {
        if (parameter === "level") {
          const newLevel = await npcLevelGenerator(settings_store.game);
          if (!newLevel) {
            throw new TypeError("Error generating npc level");
          }
          npc_store.npcs[npc_store.activeNpc]!.core_npc.level = newLevel;
        } else {
          const newParameter = await npcParametersGenerator(
            settings_store.game,
            parameter
          );
          if (!newParameter) {
            throw new TypeError(`Error generating npc ${parameter}`);
          }
          // Regex: adds spaces between words
          switch (parameter) {
            case "ancestry": {
              npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry =
                newParameter.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
              break;
            }
            case "culture": {
              npc_store.npcs[npc_store.activeNpc]!.core_npc.culture =
                newParameter.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
              break;
            }
            case "class": {
              npc_store.npcs[npc_store.activeNpc]!.core_npc.class =
                newParameter.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
              break;
            }
            case "gender": {
              npc_store.npcs[npc_store.activeNpc]!.core_npc.gender =
                newParameter.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
              break;
            }
            case "job": {
              npc_store.npcs[npc_store.activeNpc]!.core_npc.job =
                newParameter.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
              break;
            }
            case "nickname": {
              npc_store.npcs[npc_store.activeNpc]!.core_npc.nickname =
                newParameter.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
              break;
            }

            default: {
              break;
            }
          }
        }
      } catch (error) {
        console.error(error);
        $q.notify({
          icon: matPriorityHigh,
          message: `Error generating random npc ${parameter}`,
          progress: true,
          type: "warning"
        });
      }

      npc_store.setGenerating(false);
    }
  },
  300
);

let namesIndex = 10;
let namesList: string[] = [];
let tmpGender: string;
let tmpAncestry: string;
let tmpCulture: string;
const generateNamesNpc = debounce(async (): Promise<void> => {
  if (!npc_store.locks.name) {
    npc_store.setGenerating(true);

    if (
      namesIndex >= namesList.length - 1 ||
      tmpGender !== npc_store.npcs[npc_store.activeNpc]!.core_npc.gender ||
      tmpAncestry !== npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry ||
      tmpCulture !== npc_store.npcs[npc_store.activeNpc]!.core_npc.culture
    ) {
      tmpGender = npc_store.npcs[npc_store.activeNpc]!.core_npc.gender!;
      tmpAncestry = npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry!;
      if (settings_store.game === "pf") {
        tmpCulture = npc_store.npcs[npc_store.activeNpc]!.core_npc.culture!;
      }

      const body: {
        gender?: string;
        origin?: {
          FromAncestry?: string;
          FromCulture?: string;
        };
      } = {};

      if (
        npc_store.npcs[npc_store.activeNpc]!.core_npc.gender &&
        npc_parameters_store.npcParameters.genders.includes(
          npc_store.npcs[npc_store.activeNpc]!.core_npc.gender!
        )
      ) {
        body.gender = npc_store.npcs[
          npc_store.activeNpc
        ]!.core_npc.gender!.replaceAll(" ", "");
      }

      if (settings_store.game === "sf") {
        if (
          npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry &&
          npc_parameters_store.npcParameters.ancestries.includes(
            npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry!
          )
        ) {
          body.origin = {
            FromAncestry: npc_store.npcs[
              npc_store.activeNpc
            ]!.core_npc.ancestry!.replaceAll(" ", "")
          };
        }
      } else {
        if (
          !npc_store.npcs[npc_store.activeNpc]!.has_culture &&
          npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry &&
          npc_parameters_store.npcParameters.ancestries.includes(
            npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry!
          )
        ) {
          body.origin = {
            FromAncestry: npc_store.npcs[
              npc_store.activeNpc
            ]!.core_npc.ancestry!.replaceAll(" ", "")
          };
        }

        if (
          npc_store.npcs[npc_store.activeNpc]!.has_culture &&
          npc_store.npcs[npc_store.activeNpc]!.core_npc.culture &&
          npc_parameters_store.npcParameters.cultures.includes(
            npc_store.npcs[npc_store.activeNpc]!.core_npc.culture!
          )
        ) {
          body.origin = {
            FromCulture: npc_store.npcs[
              npc_store.activeNpc
            ]!.core_npc.culture!.replaceAll(" ", "")
          };
        }

        if (body.origin?.FromAncestry === "Leshy" && body.gender) {
          if (body.gender !== "NonBinary") {
            $q.notify({
              icon: matPriorityHigh,
              message:
                "Invalid gender for this ancestry, defaulting to Non Binary",
              progress: true,
              type: "warning"
            });
          }
          body.gender = "NonBinary";
        }
      }

      try {
        const newNames = await npcNamesGenerator(settings_store.game, body);
        if (!newNames) {
          throw new TypeError("Error generating npc names");
        }
        namesIndex = 0;
        namesList = newNames;
        npc_store.npcs[npc_store.activeNpc]!.core_npc.name =
          namesList[namesIndex]!;
      } catch (error) {
        console.error(error);
        $q.notify({
          icon: matPriorityHigh,
          message: "Error generating random npc names",
          progress: true,
          type: "warning"
        });
      }
    } else {
      namesIndex += 1;
      npc_store.npcs[npc_store.activeNpc]!.core_npc.name =
        namesList[namesIndex]!;
    }

    npc_store.setGenerating(false);
  }
}, 300);

const closeDialog = (): void => {
  importNpcDialog.value = false;
  shareDialog.value = false;
  newNpcDialog.value = false;
  renameNpcDialog.value = false;
  npcNameInput.value = false;
  importNpcName.value = "";
  newNpcName.value = "";
  newNpcRename.value = "";
};

const saveChanges = (): void => {
  npc_store.updateNpc(tmpNpc.value.name, tmpNpc.value.core_npc);
  localStorage.setItem("npcs", JSON.stringify(npc_store.npcs));
};

const addCustomField = (): void => {
  npc_store.npcs[npc_store.activeNpc]!.core_npc.custom_fields.push({
    body: "",
    name: ""
  });
};

const removeCustomField = (index: number): void => {
  npc_store.npcs[npc_store.activeNpc]!.core_npc.custom_fields.splice(index, 1);
  if (
    npc_store.npcs[npc_store.activeNpc]!.core_npc.custom_fields.length === 0
  ) {
    npc_store.npcs[npc_store.activeNpc]!.core_npc.custom_fields = [
      { body: "", name: "" }
    ];
  }
};

// Read the "share" query and decode it
const encodedData = ref(route.query.share ?? "");

const decodeData = async (): Promise<void> => {
  if (encodedData.value !== "") {
    isGenerating.value = true;
    importNpcDialog.value = true;
    try {
      const decodedData = await decodeNpcLink(String(encodedData.value));
      if (!decodedData) {
        importNpcDialog.value = false;
        throw new TypeError("Error importing npc");
      }
      importNpcData.value = decodedData;
      importNpcName.value = decodedData.list_name;
    } catch (error) {
      importNpcDialog.value = false;
      console.error(error);
      $q.notify({
        icon: matPriorityHigh,
        message: "Error importing npc",
        progress: true,
        type: "warning"
      });
    }
    isGenerating.value = false;
  }
};
await decodeData();

// Clean and check the link for manual app import
const sharedLink = ref("");
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
  query: {}
});

// Open the share dialog and generate the shareable link
const openShare = async (): Promise<void> => {
  isGenerating.value = true;
  shareDialog.value = true;
  const currentNpc = npc_store.npcs[npc_store.activeNpc]!.core_npc;
  const body: shareable_npc = {
    list_name: npc_store.npcs[npc_store.activeNpc]?.name
      ? npc_store.npcs[npc_store.activeNpc]!.name
      : "Default",
    npcs_data: []
  };

  body.npcs_data.push({
    ancestry: currentNpc.ancestry,
    class: currentNpc.class,
    culture: currentNpc.culture,
    game: settings_store.game,
    gender: currentNpc.gender,
    job: currentNpc.job,
    level: currentNpc.level,
    name: currentNpc.name,
    nickname: currentNpc.nickname === null ? "" : currentNpc.nickname
  });

  try {
    const shareableLink = await generateNpcLink(body);
    if (typeof shareableLink === "string") {
      shareUrl.value = `https://bybe.app/npc?game=${
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

const importNpc = (): void => {
  importNameInput.value.validate();
  if (!importNameInput.value.hasError && importNpcData.value?.npcs_data[0]) {
    const tmp_npc: npc = {
      ancestry: importNpcData.value?.npcs_data[0].ancestry,
      class: importNpcData.value?.npcs_data[0].class,
      culture: importNpcData.value?.npcs_data[0].culture,
      custom_fields: [{ body: "", name: "" }],
      description: "",
      game: importNpcData.value?.npcs_data[0].game,
      gender: importNpcData.value?.npcs_data[0].gender,
      ideology: "",
      job: importNpcData.value?.npcs_data[0].job,
      languages: "",
      level: importNpcData.value?.npcs_data[0].level,
      name: importNpcData.value?.npcs_data[0].name,
      nickname: importNpcData.value.npcs_data[0].nickname ?? "",
      personality: "",
      quirk: "",
      relationships: ""
    };

    npc_store.addNpc(importNpcName.value);
    npcList.value = npc_store.npcs.map(npc => npc.name);
    npc_store.updateNpc(importNpcName.value, tmp_npc);
    tmpNpc.value = {
      has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
      name: npc_store.npcs[npc_store.activeNpc]!.name,
      core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
    };
    saveChanges();
    importNpcName.value = "";
    importNpcDialog.value = false;
  }
};

const addNpc = (): void => {
  npcNameInput.value.validate();
  if (!npcNameInput.value.hasError) {
    npc_store.addNpc(newNpcName.value);
    npcList.value = npc_store.npcs.map(npc => npc.name);
    tmpNpc.value = {
      has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
      name: npc_store.npcs[npc_store.activeNpc]!.name,
      core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
    };
    saveChanges();
    newNpcName.value = "";
    newNpcDialog.value = false;
  }
};

const renameNpc = (): void => {
  npcRenameInput.value.validate();
  if (!npcRenameInput.value.hasError) {
    npc_store.npcs[npc_store.activeNpc]!.name = newNpcRename.value;
    npcList.value = npc_store.npcs.map(npc => npc.name);
    tmpNpc.value = {
      has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
      name: npc_store.npcs[npc_store.activeNpc]!.name,
      core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
    };
    saveChanges();
    newNpcRename.value = "";
    renameNpcDialog.value = false;
  }
};

const removeNpc = (): void => {
  npc_store.removeNpc();
  npcList.value = npc_store.npcs.map(npc => npc.name);
  tmpNpc.value = {
    has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
    name: npc_store.npcs[npc_store.activeNpc]!.name,
    core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
  };
  saveChanges();
  removeNpcDialog.value = false;
};

const changeActiveNpc = (selected: string): void => {
  npc_store.changeActiveNpc(npc_store.getNpcIndex(selected));
  tmpNpc.value = {
    has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
    name: npc_store.npcs[npc_store.activeNpc]!.name,
    core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
  };
};

// Save on npc change
watch(npc_store, () => {
  tmpNpc.value = {
    has_culture: npc_store.npcs[npc_store.activeNpc]!.has_culture,
    name: npc_store.npcs[npc_store.activeNpc]!.name,
    core_npc: npc_store.npcs[npc_store.activeNpc]!.core_npc
  };
  saveChanges();
});
</script>

<template>
  <div class="tw:h-full">
    <q-dialog
      v-model="importNpcDialog"
      aria-label="Import shared npc dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Import npc</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="importNameInput"
            v-model="importNpcName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !npcList.some(
                  name => name.toLowerCase() === val.toLowerCase()
                ) || 'This NPC already exists'
            ]"
            @keyup.enter="importNpc"
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
            label="Import npc"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add npc"
            @click="importNpc"
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
            A copy of your npc can be accessed via the following link:
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
      v-model="newNpcDialog"
      aria-label="New npc dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">New NPC name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="npcNameInput"
            v-model="newNpcName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !npcList.some(
                  name => name.toLowerCase() === val.toLowerCase()
                ) || 'This NPC already exists'
            ]"
            @keyup.enter="addNpc"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Add NPC"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Add NPC"
            @click="addNpc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="renameNpcDialog"
      aria-label="New npc dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Rename NPC</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="npcRenameInput"
            v-model="newNpcRename"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !npcList.some(
                  name => name.toLowerCase() === val.toLowerCase()
                ) || 'This NPC already exists'
            ]"
            @keyup.enter="renameNpc"
          />
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Rename NPC"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Rename NPC"
            @click="renameNpc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="removeNpcDialog"
      aria-label="Remove npc dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Remove this NPC?</div>
        </q-card-section>
        <q-card-actions align="center" class="text-primary">
          <q-btn
            flat
            label="Cancel"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Close dialog"
            @click="closeDialog"
          />
          <q-btn
            flat
            label="Remove"
            class="tw:text-red-600 tw:dark:text-red-400"
            aria-label="Remove NPC"
            @click="removeNpc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-layout
      id="shepherd-2"
      view="lHh lpr lFf"
      container
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200 tw:rounded-xl tw:shadow-sm tw:bg-white tw:dark:bg-gray-800 tw:dark:border-gray-700"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div
          class="tw:flex tw:flex-wrap tw:justify-center! tw:mx-4 tw:my-1.5 tw:gap-2"
        >
          <q-btn
            id="shepherd-3"
            class="tw:grow"
            :icon="biShare"
            label="Share"
            unelevated
            push
            @click="openShare"
          />
          <div class="tw:flex">
            <div class="tw:my-auto!">
              <q-btn
                class="tw:ml-2!"
                :icon="biPlusLg"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Add new NPC"
                @click="newNpcDialog = true"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Add new NPC
                </q-tooltip>
              </q-btn>
            </div>
            <div class="tw:my-auto!">
              <q-btn
                class="tw:ml-2!"
                :icon="biInputCursorText"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Rename NPC"
                @click="renameNpcDialog = true"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Rename NPC
                </q-tooltip>
              </q-btn>
            </div>
            <div class="tw:my-auto!">
              <q-btn
                class="tw:mx-2! tw:p-2!"
                :icon="biTrash"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Remove current NPC"
                @click="removeNpcDialog = true"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Delete NPC
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <q-select
            v-model="tmpNpc.name"
            dense
            style="min-width: 120px; max-width: 120px"
            class="tw:my-auto"
            outlined
            :options="npcList"
            label="NPCs"
            @update:model-value="changeActiveNpc(tmpNpc.name)"
          />
          <q-btn flat dense aria-label="Clear npc" @click="npc_store.clearNpc"
            >CLEAR</q-btn
          >
        </div>
      </q-header>
      <q-page-container>
        <div class="tw:flex tw:flex-col tw:gap-4 tw:my-4 tw:mx-6">
          <div id="shepherd-4" class="tw:flex tw:py-1">
            <q-btn
              v-if="npc_store.locks.name"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock name"
              @click="npc_store.locks.name = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock name"
              @click="npc_store.locks.name = true"
            />
            <q-input
              label="Name"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.name"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npc_store.locks.name"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate name"
              @click="generateNamesNpc"
            />
            <span class="tw:mx-2" />
            <q-btn
              v-if="npc_store.locks.nickname"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock nickname"
              @click="npc_store.locks.nickname = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock nickname"
              @click="npc_store.locks.nickname = true"
            />
            <q-input
              label="Nickname"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.nickname"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npc_store.locks.nickname"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate nickname"
              @click="generateParameterNpc('nickname')"
            />
          </div>
          <div class="tw:flex tw:py-1">
            <q-btn
              v-if="npc_store.locks.gender"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock gender"
              @click="npc_store.locks.gender = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock gender"
              @click="npc_store.locks.gender = true"
            />
            <q-input
              label="Gender"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.gender"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npc_store.locks.gender"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate gender"
              @click="generateParameterNpc('gender')"
            />
            <span class="tw:mx-2" />
            <span
              v-if="
                !npc_store.npcs[npc_store.activeNpc]!.has_culture ||
                settings_store.game === 'sf'
              "
              class="tw:flex-none tw:my-auto! tw:mr-2!"
            >
              <q-btn
                v-if="npc_store.locks.ancestry"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock ancestry"
                @click="npc_store.locks.ancestry = false"
              />
              <q-btn
                v-else
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock ancestry"
                @click="npc_store.locks.ancestry = true"
              />
            </span>
            <span v-else class="tw:flex-none tw:my-auto! tw:mr-2!">
              <q-btn
                v-if="npc_store.locks.culture"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock culture"
                @click="npc_store.locks.culture = false"
              />
              <q-btn
                v-else
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock culture"
                @click="npc_store.locks.culture = true"
              />
            </span>
            <q-input
              v-if="
                !npc_store.npcs[npc_store.activeNpc]!.has_culture ||
                settings_store.game === 'sf'
              "
              label="Ancestry"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npc_store.locks.ancestry"
            />
            <q-input
              v-else
              label="Culture"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.culture"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npc_store.locks.culture"
            />
            <q-btn
              v-if="
                !npc_store.npcs[npc_store.activeNpc]!.has_culture ||
                settings_store.game === 'sf'
              "
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate ancestry"
              @click="generateParameterNpc('ancestry')"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate culture"
              @click="generateParameterNpc('culture')!"
            />
          </div>
          <div class="tw:flex tw:py-1">
            <q-btn
              v-if="npc_store.locks.class"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock class"
              @click="npc_store.locks.class = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock class"
              @click="npc_store.locks.class = true"
            />
            <q-input
              label="Class"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.class"
              class="tw:grow"
              stack-label
              dense
              outlined
              :readonly="npc_store.locks.class"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate class"
              @click="generateParameterNpc('class')"
            />
            <span class="tw:mx-2" />
            <q-btn
              v-if="npc_store.locks.job"
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biLock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Unlock job"
              @click="npc_store.locks.job = false"
            />
            <q-btn
              v-else
              class="tw:flex-none tw:my-auto! tw:mr-2!"
              :icon="biUnlock"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Lock job"
              @click="npc_store.locks.job = true"
            />
            <q-input
              label="Job"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.job"
              class="tw:grow"
              stack-label
              multiple
              dense
              outlined
              :readonly="npc_store.locks.job"
            />
            <q-btn
              class="tw:flex-none tw:my-auto! tw:ml-2!"
              :icon="biArrowRepeat"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Generate job"
              @click="generateParameterNpc('job')"
            />
          </div>
          <div class="tw:flex tw:flex-col tw:mb-3">
            <span class="tw:ml-12 tw:text-gray-800 tw:dark:text-gray-200">
              Level:
            </span>
            <div class="tw:flex">
              <q-btn
                v-if="npc_store.locks.level"
                class="tw:flex-none tw:my-auto! tw:mr-2!"
                :icon="biLock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Unlock level"
                @click="npc_store.locks.level = false"
              />
              <q-btn
                v-else
                class="tw:flex-none tw:my-auto! tw:mr-2!"
                :icon="biUnlock"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Lock level"
                @click="npc_store.locks.level = true"
              />
              <q-slider
                v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.level"
                class="tw:mx-1"
                markers
                label-always
                switch-label-side
                aria-label="Filter level"
                role="menuitem"
                :min="-1"
                :max="25"
                :readonly="npc_store.locks.level"
              />
              <q-btn
                class="tw:flex-none tw:my-auto! tw:ml-2!"
                :icon="biArrowRepeat"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Generate level"
                @click="generateParameterNpc('level')"
              />
            </div>
          </div>
        </div>
        <q-separator class="tw:my-2! tw:mx-6!" style="height: 2px" />
        <div class="tw:grid tw:grid-cols-2 tw:gap-3 tw:my-4 tw:mx-6">
          <div id="shepherd-5" class="tw:py-1 tw:mr-2">
            <q-input
              label="Languages"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.languages"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:ml-2">
            <q-input
              label="Quirks"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.quirk"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:mr-2">
            <q-input
              v-model="
                npc_store.npcs[npc_store.activeNpc]!.core_npc.description
              "
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              label="Description"
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:ml-2">
            <q-input
              v-model="
                npc_store.npcs[npc_store.activeNpc]!.core_npc.personality
              "
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              label="Personality"
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:mr-2">
            <q-input
              label="Relationships"
              v-model="
                npc_store.npcs[npc_store.activeNpc]!.core_npc.relationships
              "
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
          <div class="tw:py-1 tw:ml-2">
            <q-input
              label="Ideology"
              v-model="npc_store.npcs[npc_store.activeNpc]!.core_npc.ideology"
              class="tw:mx-auto"
              outlined
              dense
              autogrow
              type="textarea"
            />
          </div>
        </div>
        <q-separator class="tw:my-2! tw:mx-6!" style="height: 2px" />
        <div id="shepherd-6" class="tw:mx-6">
          <div
            v-for="(item, index) in npc_store.npcs[npc_store.activeNpc]!
              .core_npc.custom_fields"
            :key="index"
          >
            <div class="tw:flex tw:gap-6 tw:my-5">
              <div class="tw:flex-auto">
                <q-input
                  :label="'Custom field ' + (index + 1)"
                  v-model="item.name"
                  outlined
                  dense
                  autogrow
                  type="textarea"
                />
              </div>
              <div class="tw:flex-auto">
                <q-input
                  :label="'Custom text ' + (index + 1)"
                  v-model="item.body"
                  outlined
                  dense
                  autogrow
                  type="textarea"
                />
              </div>
              <div class="tw:flex-none tw:my-auto">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  padding="sm"
                  :icon="biTrash"
                  aria-label="Remove custom field"
                  @click="removeCustomField(index)"
                />
              </div>
            </div>
          </div>
          <div class="tw:my-5">
            <q-btn
              class="full-width"
              outline
              size="md"
              padding="sm"
              :icon="biPlusLg"
              type="button"
              aria-label="Add custom field"
              @click="addCustomField()"
            >
            </q-btn>
          </div>
        </div>
      </q-page-container>
    </q-layout>
  </div>
</template>
