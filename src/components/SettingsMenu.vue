<script setup lang="ts">
import {
  biCloudArrowDown,
  biCloudArrowUp,
  biGear,
  biQuestionCircle,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { useQuasar } from "quasar";
import { ref } from "vue";

import { settingsStore } from "@/stores/settings";
import {
  validateEncounters,
  validateNpcs,
  validateParties,
  validateShops,
  validateTemplates
} from "@/utils/local-storage";

const $q = useQuasar();

const settings_store = settingsStore();

const settingsDialog = ref(false);
const tab = ref("General");

const gameVersion = ref("Any");
const localGameVersion = ref(localStorage.getItem("game_version"));

switch (localGameVersion.value?.toLowerCase()) {
  case "any": {
    gameVersion.value = "Any";
    break;
  }
  case "legacy": {
    gameVersion.value = "Legacy";
    break;
  }
  case "remaster": {
    gameVersion.value = "Remaster";
    break;
  }
  default: {
    gameVersion.value = "Any";
    localStorage.setItem("game_version", "Any");
    break;
  }
}

settings_store.setGameVersion(gameVersion.value);

const toggleGameVersion = (): void => {
  localStorage.setItem("game_version", gameVersion.value);
  globalThis.location.reload();
};

const hideSupport = ref(false);
const localSupport = ref(localStorage.getItem("hide_support"));

switch (localSupport.value) {
  case "true": {
    hideSupport.value = true;
    break;
  }
  case "false": {
    hideSupport.value = false;
    break;
  }
  default: {
    hideSupport.value = false;
    localStorage.setItem("hide_support", "false");
    break;
  }
}

interface Widget {
  draw: (
    username: string,
    type: {
      type: string;
      [key: string]: string;
    }
  ) => void;
}
declare let kofiWidgetOverlay: Widget;

const loadKofiWidget = (): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    const kofiWidget = document.createElement("script");
    kofiWidget.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";
    kofiWidget.integrity =
      "sha512-lcOFkHZZIXe4UQdsL95YQNPTGWRzMBlh4CU8XRt0E1TLqeoJG5i7WgGZ0cSPB1Uua5EF4gy6UibwS8kBuHU8hg==";
    kofiWidget.crossOrigin = "anonymous";
    kofiWidget.async = true;
    kofiWidget.addEventListener("load", () => {
      resolve();
    });
    kofiWidget.addEventListener("error", () => {
      reject(new Error("Failed to load script"));
    });
    document.body.append(kofiWidget);
  });

if (!hideSupport.value) {
  try {
    await loadKofiWidget();
    if (kofiWidgetOverlay && typeof kofiWidgetOverlay.draw === "function") {
      kofiWidgetOverlay.draw("theasel", {
        "floating-chat.donateButton.background-color": "#00b9fe",
        "floating-chat.donateButton.text": "Support Us",
        "floating-chat.donateButton.text-color": "#fff",
        type: "floating-chat"
      });
      const supportButton = document
        .querySelectorAll("[id^=kofi-widget-overlay-]")
        .item(0) as HTMLElement;

      supportButton.classList.add("hide-print");
    } else {
      throw new Error("Error loading Ko-Fi widget");
    }
  } catch (error) {
    console.error(error);
  }
}

const toggleSupport = (): void => {
  localStorage.setItem("hide_support", JSON.stringify(hideSupport.value));
  globalThis.location.reload();
};

const is_pwl_on = ref(false);
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

settings_store.setPwL(is_pwl_on.value);

const togglePwL = (): void => {
  localStorage.setItem("is_pwl_on", JSON.stringify(is_pwl_on.value));
  settings_store.setPwL(is_pwl_on.value);
};

const table_links = ref(true);
const localTableLinks = ref(localStorage.getItem("table_links"));

switch (localTableLinks.value) {
  case "true": {
    table_links.value = true;
    break;
  }
  case "false": {
    table_links.value = false;
    break;
  }
  default: {
    table_links.value = true;
    localStorage.setItem("table_links", "true");
    break;
  }
}

settings_store.setTableLinks(table_links.value);

const toggleTableLinks = (): void => {
  localStorage.setItem("table_links", JSON.stringify(table_links.value));
  settings_store.setTableLinks(table_links.value);
};

const validateData = (result: string): void => {
  try {
    const parsedData = JSON.parse(result);
    for (const key of Object.keys(parsedData)) {
      switch (key) {
        case "encounters": {
          if (!validateEncounters(parsedData[key])) {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded encounter format",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "shops": {
          if (!validateShops(parsedData[key])) {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded shop format",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "npcs": {
          if (!validateNpcs(parsedData[key])) {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded npcs format",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "templates": {
          if (!validateTemplates(parsedData[key])) {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded template format",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "game_version": {
          if (
            !["any", "legacy", "remaster"].includes(
              parsedData[key].toLowerCase()
            )
          ) {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded game version value",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "parties": {
          if (!validateParties(parsedData[key])) {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded party format",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "theme": {
          if (parsedData[key] !== "light" && parsedData[key] !== "dark") {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded theme value",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "is_pwl_on": {
          if (parsedData[key] !== "true" && parsedData[key] !== "false") {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded pwl value",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "hide_support": {
          if (parsedData[key] !== "true" && parsedData[key] !== "false") {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded hide support value",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        case "table_links": {
          if (parsedData[key] !== "true" && parsedData[key] !== "false") {
            $q.notify({
              icon: matPriorityHigh,
              message: "Invalid loaded table links value",
              progress: true,
              type: "warning"
            });
          }
          break;
        }
        default: {
          console.error(`Unknown loaded key: ${key}`);
          continue;
        }
      }
    }
    globalThis.location.reload();
  } catch (error) {
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error reading the uploaded file",
      progress: true,
      type: "warning"
    });
  }
};

const uploadData = (): void => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", async event => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const arrayBuffer = await file.text();
      validateData(arrayBuffer);
    }
  });
  input.click();
};

const downloadData = (): void => {
  const localStorageData = { ...localStorage };
  const jsonData = JSON.stringify(localStorageData, null, "\t");
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bybe_data.json";
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <q-btn
    id="shepherd-14"
    flat
    round
    size="sm"
    padding="sm"
    class="tw:sm:mr-2 tw:text-gray-800! tw:dark:text-gray-200!"
    :icon="biGear"
    aria-label="Open settings"
    @click="settingsDialog = true"
  />
  <q-dialog v-model="settingsDialog" aria-label="Settings dialog">
    <q-card flat bordered style="min-height: 410px; min-width: 260px">
      <q-card-section>
        <div class="row">
          <div class="text-h6 tw:mr-4 tw:my-auto">Settings</div>
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
      <q-separator />
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab name="General" label="General" />
        <q-tab name="Encounter" label="Encounter" />
        <q-tab name="Links" label="Links" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="General" class="tw:space-y-3!">
          <q-card-actions class="tw:items-center">
            <q-btn
              outline
              label="Export Data"
              no-caps
              :icon="biCloudArrowDown"
              class="tw:mx-auto!"
              @click="downloadData"
            />
          </q-card-actions>
          <q-card-actions>
            <q-btn
              outline
              label="Import Data"
              no-caps
              :icon="biCloudArrowUp"
              class="tw:mx-auto!"
              @click="uploadData"
            >
              <q-tooltip
                class="text-caption tw:bg-amber-400! tw:text-gray-800! tw:rounded-md tw:shadow-sm tw:dark:bg-amber-400!"
                anchor="top middle"
                self="bottom middle"
              >
                Remember to backup your data by exporting first!
              </q-tooltip>
            </q-btn>
          </q-card-actions>
          <q-separator />
          <q-card-actions>
            <div class="q-gutter-y-md tw:mx-auto">
              <q-select
                v-model="gameVersion"
                outlined
                dense
                options-dense
                :options="['Any', 'Legacy', 'Remaster']"
                label="Game Version"
                @update:model-value="toggleGameVersion"
              />
              <q-toggle
                v-model="hideSupport"
                label="Hide support button"
                aria-label="Toggle support button visibility"
                @update:model-value="toggleSupport"
              />
            </div>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="Encounter" class="tw:space-y-3">
          <q-card-actions>
            <q-toggle
              v-model="is_pwl_on"
              label="Prof. without Level"
              class="tw:mx-auto"
              aria-label="Toggle proficiency without level"
              @update:model-value="togglePwL"
            >
            </q-toggle>
            <q-space />
            <q-btn
              flat
              round
              size="sm"
              :icon="biQuestionCircle"
              :href="
                settings_store.game === 'sf'
                  ? 'https://2e.aonsrd.com/rules/839-proficiency-without-level'
                  : 'https://2e.aonprd.com/rules?id=2762'
              "
              target="_blank"
              rel="noopener"
              aria-label="Link to explanation for proficiency without level"
            >
              <q-tooltip
                class="text-caption text-center tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>Proficiency without Level</strong> <br />
                Click to learn more
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="Links" class="tw:space-y-3">
          <q-card-actions>
            <q-toggle
              v-model="table_links"
              label="Show links in Tables"
              class="tw:mx-auto"
              aria-label="Toggle table links"
              @update:model-value="toggleTableLinks"
            >
            </q-toggle>
          </q-card-actions>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>
