<script setup lang="ts">
import {
  matArrowDownward,
  matArrowUpward
} from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { scroll } from "quasar";
import Shepherd from "shepherd.js";
import { onMounted, onUnmounted, ref } from "vue";

import EncounterList from "@/components/encounter/EncounterList.vue";
import EncounterSheet from "@/components/encounter/EncounterSheet.vue";
import EncounterTable from "@/components/encounter/EncounterTable.vue";
import { encounterStore } from "@/stores/encounter";
import { settingsStore } from "@/stores/settings";
import {
  updateLocalStorageEncounters,
  updateLocalStorageParties
} from "@/utils/local-storage";

import type { min_creature_hazard } from "@/types/encounter";

useHead({
  link: [
    {
      href: "https://bybe.app/encounter",
      rel: "canonical"
    }
  ],
  title: "Encounter Builder - BYBE"
});

const settings_store = settingsStore();
const encounter_store = encounterStore();
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageParties();
updateLocalStorageEncounters();

// PF2E encounter
const tmpKoboldMage: min_creature_hazard = {
  archive_link: "https://2e.aonprd.com/npcs?id=3074",
  game: "pf",
  id: 5009,
  is_hazard: false,
  level: 2,
  name: "Kobold Cavern Mage",
  variant: "Base"
};
const tmpKoboldWarrior: min_creature_hazard = {
  archive_link: "https://2e.aonprd.com/npcs?id=3072",
  game: "pf",
  id: 4977,
  is_hazard: false,
  level: -1,
  name: "Kobold Warrior",
  variant: "Base"
};
const tmpMirrorDoor: min_creature_hazard = {
  archive_link: "https://2e.aonprd.com/npcs?id=626",
  complexity: "Simple",
  game: "pf",
  id: 459,
  is_hazard: true,
  level: -1,
  name: "Mirror Door"
};

//SF2E encounter
const tmpFerrofluidOoze: min_creature_hazard = {
  archive_link: "https://2e.aonsrd.com/creatures/66-ferrofluid-ooze",
  game: "sf",
  id: 157,
  is_hazard: false,
  level: 2,
  name: "Ferrofluid Ooze",
  variant: "Base"
};
const tmpAnaciteWingbot: min_creature_hazard = {
  archive_link: "https://2e.aonsrd.com/creatures/2-anacite-wingbot",
  game: "sf",
  id: 11,
  is_hazard: false,
  level: -1,
  name: "Anacite Wingbot",
  variant: "Base"
};
const tmpAntiGravityPulse: min_creature_hazard = {
  archive_link: "https://2e.aonsrd.com/hazards/5-anti-gravity-pulse",
  complexity: "Simple",
  game: "sf",
  id: 18,
  is_hazard: true,
  level: 0,
  name: "Anti-Gravity Pulse"
};

Shepherd.on("start", () => {
  const index = encounter_store.encounters.findIndex(
    obj => obj.name === "Example"
  );
  if (index === -1) {
    encounter_store.addEncounter("Example");
    if (settings_store.game === "sf") {
      encounter_store.addToEncounter(tmpFerrofluidOoze);
      encounter_store.addToEncounter(tmpAnaciteWingbot);
      encounter_store.addToEncounter(tmpAntiGravityPulse);
    } else {
      encounter_store.addToEncounter(tmpKoboldMage);
      encounter_store.addToEncounter(tmpKoboldWarrior);
      encounter_store.addToEncounter(tmpMirrorDoor);
    }
  } else {
    encounter_store.changeActiveEncounter(index);
  }
});

for (const event of ["complete", "cancel"]) {
  Shepherd.on(event, () => {
    encounter_store.removeEncounter();
  });
}

const pageRef = ref<HTMLElement>();

function scrollDirection(): void {
  scroll.getVerticalScrollPosition(pageRef.value!);
  scrollUp.value = scroll.getVerticalScrollPosition(pageRef.value!) > 0;
}

function scrollPage(): void {
  settings_store.setHiddenNav(true);
  setTimeout(() => {
    if (scrollUp.value) {
      scroll.setVerticalScrollPosition(pageRef.value!, 0, 500);
    } else {
      scroll.setVerticalScrollPosition(
        pageRef.value!,
        pageRef.value!.scrollHeight,
        500
      );
    }
  }, 10);
}

const handleResize = (): void => {
  screenWidth.value = screen.width;
};

onMounted(() => {
  pageRef.value = document.getElementById("pageRef")!;
  pageRef.value.addEventListener("scroll", scrollDirection);
  globalThis.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  pageRef.value!.removeEventListener("scroll", scrollDirection);
  globalThis.removeEventListener("resize", handleResize);
});

const sheetVisible = ref(true);
const sheetWidth = ref("tw:md:w-[27%] tw:p-4!");
const tableWidth = ref("tw:md:w-[46%] tw:pl-4! tw:md:pl-0!");

const toggleSheetView = (): void => {
  sheetVisible.value = !sheetVisible.value;
  if (sheetVisible.value) {
    sheetWidth.value = "tw:md:w-[27%] tw:p-4!";
    tableWidth.value = "tw:md:w-[46%] tw:pl-4! tw:md:pl-0!";
  } else {
    sheetWidth.value = "tw:md:w-[0%] tw:p-0! tw:collapse";
    tableWidth.value = "tw:md:w-[73%] tw:pl-4!";
  }
};
</script>

<template>
  <q-page
    id="pageRef"
    class="tw:h-full row items-center justify-between tw:overflow-auto"
  >
    <EncounterSheet
      v-if="screenWidth >= 768"
      class="tw:py-4 tw:pl-4 tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <EncounterTable
      id="table"
      class="tw:p-4 tw:md:px-0 tw:w-full tw:transition-all tw:duration-300"
      :class="tableWidth"
      :toggle-sheet-view="toggleSheetView"
      :sheet-visible="sheetVisible"
    />
    <EncounterSheet
      v-if="screenWidth < 768"
      v-show="sheetVisible"
      class="tw:md:px-0 tw:md:py-4 tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <EncounterList id="list" class="tw:p-4 tw:w-full tw:md:w-[27%]" />
    <q-page-sticky
      v-if="screenWidth < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw:z-10 tw:opacity-85 only-screen"
    >
      <q-btn
        fab
        :icon="scrollUp ? matArrowUpward : matArrowDownward"
        padding="sm"
        color="primary"
        @click="scrollPage"
      />
    </q-page-sticky>
  </q-page>
</template>
