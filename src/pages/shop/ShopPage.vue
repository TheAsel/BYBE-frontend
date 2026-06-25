<script setup lang="ts">
import {
  matArrowDownward,
  matArrowUpward,
  matPriorityHigh
} from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { scroll, useQuasar } from "quasar";
import Shepherd from "shepherd.js";
import { onMounted, onUnmounted, ref } from "vue";

import ShopList from "@/components/shop/ShopList.vue";
import ShopSheet from "@/components/shop/ShopSheet.vue";
import ShopTable from "@/components/shop/ShopTable.vue";
import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import { templateStore } from "@/stores/template";
import { validateShops, validateTemplates } from "@/utils/local-storage";

import type { item, min_item } from "@/types/item";

useHead({
  link: [
    {
      href: "https://bybe.app/shop",
      rel: "canonical"
    }
  ],
  title: "Shop Generator - BYBE"
});

const $q = useQuasar();

const items_store = itemsStore();
const settings_store = settingsStore();
const template_store = templateStore();

const localShops = localStorage.getItem("shops");
if (localShops !== null && !validateShops(localShops)) {
  $q.notify({
    icon: matPriorityHigh,
    message: "Invalid loaded shops format",
    progress: true,
    type: "warning"
  });
}

const localTemplates = localStorage.getItem("templates");
if (localTemplates !== null && !validateTemplates(localTemplates)) {
  $q.notify({
    icon: matPriorityHigh,
    message: "Invalid loaded templates format",
    progress: true,
    type: "warning"
  });
}

const screenWidth = ref(screen.width);

const scrollUp = ref(false);

// PF2E shop
const tmpCloakFull: item = {
  core_item: {
    base_item: null,
    bulk: 0.1,
    category: "",
    description:
      "<p>This cloak flows, covering and concealing the wearer's body. The cloak allows you to cast Figment as an occult innate cantrip. Although naturally a dull gray, while invested the cloak picks up colors and patterns from its surroundings, granting a +1 item bonus to Stealth checks.</p>\n<p><strong>Activate—Draw Hood</strong> <span class=\"action-glyph\">2</span> (manipulate)</p>\n<p><strong>Frequency</strong> once per day</p>\n<hr />\n<p><strong>Effect</strong> You draw the hood up and gain the effects of Invisibility, with the spell's normal duration or until you pull the hood back down, whichever comes first. While you are invisible, your <em>figment</em> innate cantrip gains the subtle trait, concealing the observable effects of your spellcasting.</p>",
    group: "",
    hardness: 0,
    hp: 0,
    id: 3511,
    item_type: "Equipment",
    level: 7,
    license: "ORC",
    material_grade: "",
    material_type: "",
    name: "Cloak of Illusions",
    number_of_uses: 0,
    price: 36_000,
    quantity: 1,
    rarity: "Common",
    remaster: true,
    size: "Medium",
    source: "Pathfinder GM Core",
    traits: [
      { description: "", display_name: "", name: "invested" },
      { description: "", display_name: "", name: "occult" }
    ],
    usage: "worncloak"
  },
  game: "pf"
};
const tmpCloak: min_item = {
  archive_link: "https://2e.aonprd.com/equipment?id=3069",
  game: "pf",
  id: 3511,
  level: 7,
  name: "Cloak of Illusions",
  price: 36_000,
  quantity: 1,
  type: "Equipment"
};
const tmpPotion: min_item = {
  archive_link: "https://2e.aonprd.com/equipment?id=2943",
  game: "pf",
  id: 2967,
  level: 6,
  name: "Healing Potion (Moderate)",
  price: 5000,
  quantity: 3,
  type: "Consumable"
};

// SF2E shop
const tmpLaserRifleFull: item = {
  core_item: {
    base_item: "laser-rifle",
    bulk: 2,
    category: "simple",
    description:
      "<p><strong>Upgrades:</strong> 1</p><hr /><p>These dependable, mass-produced rifles shoot concentrated beams of energy out of square-shaped barrels. The universal standard Pact Worlds model is highly modifiable and designed to function with a variety of accessories and upgrades, with wielders adapting the laser rifle to their preferences and even kit-bashing it into a nearly unrecognizable weapon.</p>",
    group: "laser",
    hardness: 0,
    hp: 0,
    id: 402,
    item_type: "Weapon",
    level: 0,
    license: "ORC",
    material_grade: "",
    material_type: "",
    name: "Laser Rifle",
    number_of_uses: 0,
    price: 450,
    quantity: 1,
    rarity: "Common",
    remaster: true,
    size: "Medium",
    source: "Starfinder Player Core",
    traits: [{ description: "", display_name: "", name: "tech" }],
    usage: "held-in-two-hands"
  },
  game: "sf"
};
const tmpLaserRifle: min_item = {
  archive_link: "https://2e.aonsrd.com/equipment/weapons/41-laser-rifle",
  game: "sf",
  id: 402,
  level: 0,
  name: "Laser Rifle",
  price: 450,
  quantity: 1,
  type: "Weapon"
};
const tmpFlightSuit: min_item = {
  archive_link: "https://2e.aonsrd.com/equipment/armor/2-flight-suit",
  game: "sf",
  id: 328,
  level: 1,
  name: "Flight Suit",
  price: 100,
  quantity: 1,
  type: "Armor"
};

Shepherd.on("start", () => {
  const index = items_store.shops.findIndex(obj => obj.name === "Example");
  if (index === -1) {
    items_store.addShop("Example");
    if (settings_store.game === "sf") {
      items_store.setSelectedItem(tmpLaserRifleFull);
      items_store.addToShop(tmpLaserRifle);
      items_store.addToShop(tmpFlightSuit);
    } else {
      items_store.setSelectedItem(tmpCloakFull);
      items_store.addToShop(tmpCloak);
      items_store.addToShop(tmpPotion);
    }
  } else {
    items_store.changeActiveShop(index);
  }
});

for (const event of ["complete", "cancel"]) {
  Shepherd.on(event, () => {
    items_store.removeShop();
    items_store.removeSelectedItem();
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
  pageRef.value = document.querySelector("#pageRef")!;
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
    sheetWidth.value = "tw:md:w-[0%] tw:p-0! tw:collapse tw:none";
    tableWidth.value = "tw:md:w-[73%] tw:pl-4!";
  }
};
</script>

<template>
  <q-page
    id="pageRef"
    class="tw:h-full row items-center justify-between tw:overflow-auto"
  >
    <ShopSheet
      v-if="screenWidth >= 768"
      class="tw:py-4 tw:pl-4 tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <ShopTable
      id="table"
      class="tw:p-4 tw:md:px-0 tw:w-full tw:transition-all tw:duration-300"
      :class="tableWidth"
      :toggle-sheet-view="toggleSheetView"
      :sheet-visible="sheetVisible"
    />
    <ShopSheet
      v-if="screenWidth < 768"
      v-show="sheetVisible"
      class="tw:md:px-0 tw:md:py-4 tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <ShopList id="list" class="tw:p-4 tw:w-full tw:md:w-[27%]" />
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
