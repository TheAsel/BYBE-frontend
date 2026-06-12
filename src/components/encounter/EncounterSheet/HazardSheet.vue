<script setup lang="ts">
import { biBoxArrowUpRight, biXLg } from "@quasar/extras/bootstrap-icons";
import { useRouter } from "vue-router";

import { encounterStore } from "@/stores/encounter";
import { settingsStore } from "@/stores/settings";
import {
  actionTraitsString,
  getGameFont,
  getGameFontSize,
  openSheet,
  pfActionSymbol
} from "@/utils/sheet";

const router = useRouter();

const encounter = encounterStore();
const settings = settingsStore();

const cleanDescription = (description: string) => {
  const cleanRegex = /<\/?>|<hr ?\/>|@Localize\[.+\]/g;
  description = description.replace("<p>", "");
  description = description.replaceAll(cleanRegex, "");
  return description.replaceAll("<hr>", "<br>");
};
</script>

<template>
  <div
    class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
    :style="
      'font-family: ' +
      getGameFont(encounter.selectedHazard?.game ?? settings.game) +
      ', sans-serif; font-variant-caps: small-caps'
    "
  >
    <div class="tw:my-auto!">
      <q-btn
        :icon="biBoxArrowUpRight"
        flat
        round
        dense
        size="sm"
        padding="sm"
        class="tw:mr-1 tw:my-auto only-screen encounter-page-element"
        aria-label="Open hazard sheet"
        @click="
          openSheet(
            router,
            'hazard',
            encounter.selectedHazard?.game ?? settings.game,
            encounter.selectedHazard!.core_hazard.essential.id
          )
        "
      >
        <q-tooltip
          class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
          anchor="top middle"
          self="bottom middle"
        >
          Open hazard sheet
        </q-tooltip>
      </q-btn>
    </div>
    <a
      v-if="settings.is_aon_links_on && encounter.selectedHazard"
      class="tw:my-auto"
      :href="
        'https://2e.aonprd.com/search?q=' +
        encodeURIComponent(
          encounter.selectedHazard.core_hazard.essential.name
        ) +
        ' type%3A(hazard)&type=eqs'
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        :class="
          getGameFontSize(encounter.selectedHazard?.game ?? settings.game) +
          ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
        "
      >
        {{ encounter.selectedHazard?.core_hazard.essential.name }}
      </h1>
    </a>
    <h1
      v-else
      :class="
        getGameFontSize(encounter.selectedHazard?.game ?? settings.game) +
        ' tw:mr-4 tw:leading-8 tw:my-auto'
      "
    >
      {{ encounter.selectedHazard?.core_hazard.essential.name }}
    </h1>
    <q-space />
    <div class="tw:my-1">
      Hazard
      <span>{{ encounter.selectedHazard?.core_hazard.essential.level }}</span>
    </div>
    <div class="tw:my-auto!">
      <q-btn
        class="tw:ml-2! only-screen encounter-page-element"
        :icon="biXLg"
        size="sm"
        padding="sm"
        flat
        round
        dense
        aria-label="Remove selected hazard"
        @click="encounter.removeSelectedHazard()"
      />
    </div>
  </div>
  <q-separator class="tw:my-2!" style="height: 2px" />
  <hr
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
  <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
    <div
      v-if="
        encounter.selectedHazard?.core_hazard.essential.rarity === 'Uncommon'
      "
      class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ encounter.selectedHazard?.core_hazard.essential.rarity.toUpperCase() }}
    </div>
    <div
      v-else-if="
        encounter.selectedHazard?.core_hazard.essential.rarity === 'Rare'
      "
      class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ encounter.selectedHazard?.core_hazard.essential.rarity.toUpperCase() }}
    </div>
    <div
      v-else-if="
        encounter.selectedHazard?.core_hazard.essential.rarity === 'Unique'
      "
      class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ encounter.selectedHazard?.core_hazard.essential.rarity.toUpperCase() }}
    </div>
    <div class="tw:bg-[#478c42] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1">
      {{ encounter.selectedHazard?.core_hazard.essential.size.toUpperCase() }}
    </div>
    <div
      v-if="
        encounter.selectedHazard?.core_hazard.essential.complexity === 'Complex'
      "
      class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      COMPLEX
    </div>
    <div
      v-for="item in encounter.selectedHazard?.core_hazard.traits"
      :key="item"
      class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      {{ item.toUpperCase() }}
    </div>
  </div>
  <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
    <div
      v-if="encounter.selectedHazard?.core_hazard.essential.source"
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Source </strong>
      <a
        :href="
          'https://store.paizo.com/search.php?search_query=' +
          encodeURIComponent(
            encounter.selectedHazard?.core_hazard.essential.source
          ) +
          '&section=product'
        "
        target="_blank"
        rel="noopener"
      >
        <i
          class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
        >
          {{ encounter.selectedHazard?.core_hazard.essential.source }}
        </i>
      </a>
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <strong>Complexity </strong>
      {{ encounter.selectedHazard?.core_hazard.essential.complexity }}
    </div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <strong>Stealth</strong>
      DC {{ encounter.selectedHazard?.core_hazard.essential.stealth }}
      <span
        v-if="encounter.selectedHazard?.core_hazard.essential.stealth_detail"
        class="v-html"
        v-html="
          cleanDescription(
            encounter.selectedHazard?.core_hazard.essential.stealth_detail
          )
        "
      />
    </div>
    <div
      v-if="encounter.selectedHazard?.core_hazard.essential.description"
      class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="
        '<strong>Description</strong> ' +
        cleanDescription(
          encounter.selectedHazard?.core_hazard?.essential.description
        )
      "
    />
  </div>
  <q-separator class="tw:my-2!" style="height: 2px" />
  <hr
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
  <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
    <div
      v-if="
        encounter.selectedHazard?.core_hazard?.essential.disable_description
      "
      class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="
        '<strong>Disable</strong> ' +
        cleanDescription(
          encounter.selectedHazard?.core_hazard?.essential.disable_description
        )
      "
    />
    <template
      v-for="action in encounter.selectedHazard?.core_hazard?.actions"
      :key="action.core_action.name"
    >
      <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
        <strong>{{ action.core_action.name + " " }}</strong>
        <span
          style="font-family: Pathfinder2eActions, sans-serif"
          class="tw:text-2xl"
          >{{
            pfActionSymbol(
              action.core_action.n_of_actions,
              action.core_action.action_type
            )
          }}
        </span>
        <span v-if="action.traits !== undefined && action.traits.length > 0">
          {{ actionTraitsString(action.traits) }}
        </span>
        <span
          class="v-html"
          v-html="' ' + cleanDescription(action.core_action.description)"
        />
      </div>
    </template>
  </div>
  <q-separator
    v-if="encounter.selectedHazard?.core_hazard.essential.routine_description"
    class="tw:my-2!"
    style="height: 2px"
  />
  <hr
    v-if="encounter.selectedHazard?.core_hazard.essential.routine_description"
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
  <div
    v-if="encounter.selectedHazard?.core_hazard.essential.routine_description"
    class="tw:-indent-2 tw:pl-2 q-gutter-y-xs"
  >
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <span
        class="v-html"
        v-html="
          '<p><strong>Routine</strong> ' +
          cleanDescription(
            encounter.selectedHazard.core_hazard.essential.routine_description
          )
        "
      />
    </div>
  </div>
  <q-separator
    v-if="encounter.selectedHazard?.core_hazard?.essential.reset_description"
    class="tw:my-2!"
    style="height: 2px"
  />
  <hr
    v-if="encounter.selectedHazard?.core_hazard?.essential.reset_description"
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
  <div
    v-if="encounter.selectedHazard?.core_hazard?.essential.reset_description"
    class="tw:-indent-2 tw:pl-2 q-gutter-y-xs"
  >
    <div
      class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="
        '<p><strong>Reset</strong> ' +
        cleanDescription(
          encounter.selectedHazard?.core_hazard?.essential.reset_description
        ) +
        '</p>'
      "
    />
  </div>
</template>

<style>
.action-glyph {
  font-family: "Pathfinder2eActions", sans-serif;
  font-size: 24px;
  line-height: calc(2 / 1.5);
}

.v-html > p {
  margin: 0 0 4px !important;
}
</style>

<style scoped>
.hazard-sheet {
  font-family: "Good Pro", sans-serif;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
