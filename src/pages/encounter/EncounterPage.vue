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
  title: "Encounter Builder - BYBE",
  link: [
    {
      rel: "canonical",
      href: "https://bybe.app/encounter"
    }
  ]
});

const settings = settingsStore();
const encounter = encounterStore();
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageParties();
updateLocalStorageEncounters();

// PF2E encounter
const tmpKoboldMage: min_creature_hazard = {
  game: "pf",
  id: 5009,
  archive_link: "https://2e.aonprd.com/NPCs.aspx?ID=3074",
  name: "Kobold Cavern Mage",
  level: 2,
  variant: "Base",
  is_hazard: false
};
const tmpKoboldWarrior: min_creature_hazard = {
  game: "pf",
  id: 4977,
  archive_link: "https://2e.aonprd.com/NPCs.aspx?ID=3072",
  name: "Kobold Warrior",
  level: -1,
  variant: "Base",
  is_hazard: false
};
const tmpMirrorDoor: min_creature_hazard = {
  game: "pf",
  id: 459,
  archive_link: "https://2e.aonprd.com/Hazards.aspx?ID=626",
  name: "Mirror Door",
  level: -1,
  is_hazard: true,
  complexity: "Simple"
};

//SF2E encounter
const tmpFerrofluidOoze: min_creature_hazard = {
  game: "sf",
  id: 157,
  archive_link: "https://2e.aonsrd.com/creatures/66-ferrofluid-ooze",
  name: "Ferrofluid Ooze",
  level: 2,
  variant: "Base",
  is_hazard: false
};
const tmpAnaciteWingbot: min_creature_hazard = {
  game: "sf",
  id: 11,
  archive_link: "https://2e.aonsrd.com/creatures/2-anacite-wingbot",
  name: "Anacite Wingbot",
  level: -1,
  variant: "Base",
  is_hazard: false
};
const tmpAntiGravityPulse: min_creature_hazard = {
  game: "sf",
  id: 18,
  archive_link: "https://2e.aonsrd.com/hazards/5-anti-gravity-pulse",
  name: "Anti-Gravity Pulse",
  level: 0,
  is_hazard: true,
  complexity: "Simple"
};

Shepherd.on("start", () => {
  const index = encounter.encounters.findIndex(obj => obj.name === "Example");
  if (index === -1) {
    encounter.addEncounter("Example");
    if (settings.game === "sf") {
      encounter.addToEncounter(tmpFerrofluidOoze);
      encounter.addToEncounter(tmpAnaciteWingbot);
      encounter.addToEncounter(tmpAntiGravityPulse);
    } else {
      encounter.addToEncounter(tmpKoboldMage);
      encounter.addToEncounter(tmpKoboldWarrior);
      encounter.addToEncounter(tmpMirrorDoor);
    }
  } else {
    encounter.changeActiveEncounter(index);
  }
});

["complete", "cancel"].forEach(event =>
  Shepherd.on(event, () => {
    encounter.removeEncounter();
  })
);

const pageRef = ref<HTMLElement>();

function scrollDirection() {
  scroll.getVerticalScrollPosition(pageRef.value!);
  scrollUp.value = scroll.getVerticalScrollPosition(pageRef.value!) > 0;
}

function scrollPage() {
  const settings = settingsStore();
  settings.setHiddenNav(true);
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

const handleResize = () => {
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

const toggleSheetView = () => {
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
