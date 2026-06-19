<script setup lang="ts">
import {
  matArrowDownward,
  matArrowUpward
} from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { scroll } from "quasar";
import Shepherd from "shepherd.js";
import { onMounted, onUnmounted, ref } from "vue";

import ShopList from "@/components/shop/ShopList.vue";
import ShopSheet from "@/components/shop/ShopSheet.vue";
import ShopTable from "@/components/shop/ShopTable.vue";
import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import {
  updateLocalStorageShops,
  updateLocalStorageTemplates
} from "@/utils/local-storage";

import type { item, min_item } from "@/types/item";

useHead({
  title: "Shop Generator - BYBE",
  link: [
    {
      rel: "canonical",
      href: "https://bybe.app/shop"
    }
  ]
});

const settings = settingsStore();
const items = itemsStore();

const screenWidth = ref(screen.width);

const scrollUp = ref(false);

updateLocalStorageShops();
updateLocalStorageTemplates();

// PF2E shop
const tmpCloakFull: item = {
  game: "pf",
  core_item: {
    id: 3511,
    name: "Cloak of Illusions",
    bulk: 0.1,
    quantity: 1,
    base_item: null,
    category: "",
    description:
      "<p>This cloak flows, covering and concealing the wearer's body. The cloak allows you to cast Figment as an occult innate cantrip. Although naturally a dull gray, while invested the cloak picks up colors and patterns from its surroundings, granting a +1 item bonus to Stealth checks.</p>\n<p><strong>Activate—Draw Hood</strong> <span class=\"action-glyph\">2</span> (manipulate)</p>\n<p><strong>Frequency</strong> once per day</p>\n<hr />\n<p><strong>Effect</strong> You draw the hood up and gain the effects of Invisibility, with the spell's normal duration or until you pull the hood back down, whichever comes first. While you are invisible, your <em>figment</em> innate cantrip gains the subtle trait, concealing the observable effects of your spellcasting.</p>",
    hardness: 0,
    hp: 0,
    level: 7,
    price: 36000,
    usage: "worncloak",
    group: "",
    item_type: "Equipment",
    material_grade: "",
    material_type: "",
    number_of_uses: 0,
    license: "ORC",
    remaster: true,
    source: "Pathfinder GM Core",
    rarity: "Common",
    size: "Medium",
    traits: [
      { name: "invested", description: "", display_name: "" },
      { name: "occult", description: "", display_name: "" }
    ]
  }
};
const tmpCloak: min_item = {
  game: "pf",
  id: 3511,
  archive_link: "https://2e.aonprd.com/equipment?id=3069",
  name: "Cloak of Illusions",
  level: 7,
  type: "Equipment",
  price: 36000,
  quantity: 1
};
const tmpPotion: min_item = {
  game: "pf",
  id: 2967,
  archive_link: "https://2e.aonprd.com/equipment?id=2943",
  name: "Healing Potion (Moderate)",
  level: 6,
  type: "Consumable",
  price: 5000,
  quantity: 3
};

// SF2E shop
const tmpLaserRifleFull: item = {
  game: "sf",
  core_item: {
    id: 402,
    name: "Laser Rifle",
    bulk: 2,
    quantity: 1,
    base_item: "laser-rifle",
    category: "simple",
    description:
      "<p><strong>Upgrades:</strong> 1</p><hr /><p>These dependable, mass-produced rifles shoot concentrated beams of energy out of square-shaped barrels. The universal standard Pact Worlds model is highly modifiable and designed to function with a variety of accessories and upgrades, with wielders adapting the laser rifle to their preferences and even kit-bashing it into a nearly unrecognizable weapon.</p>",
    hardness: 0,
    hp: 0,
    level: 0,
    price: 450,
    usage: "held-in-two-hands",
    group: "laser",
    item_type: "Weapon",
    material_grade: "",
    material_type: "",
    number_of_uses: 0,
    license: "ORC",
    remaster: true,
    source: "Starfinder Player Core",
    rarity: "Common",
    size: "Medium",
    traits: [{ name: "tech", description: "", display_name: "" }]
  }
};
const tmpLaserRifle: min_item = {
  game: "sf",
  id: 402,
  archive_link: "https://2e.aonsrd.com/equipment/weapons/41-laser-rifle",
  name: "Laser Rifle",
  level: 0,
  type: "Weapon",
  price: 450,
  quantity: 1
};
const tmpFlightSuit: min_item = {
  game: "sf",
  id: 328,
  archive_link: "https://2e.aonsrd.com/equipment/armor/2-flight-suit",
  name: "Flight Suit",
  level: 1,
  type: "Armor",
  price: 100,
  quantity: 1
};

Shepherd.on("start", () => {
  const index = items.shops.findIndex(obj => obj.name === "Example");
  if (index === -1) {
    items.addShop("Example");
    if (settings.game === "sf") {
      items.setSelectedItem(tmpLaserRifleFull);
      items.addToShop(tmpLaserRifle);
      items.addToShop(tmpFlightSuit);
    } else {
      items.setSelectedItem(tmpCloakFull);
      items.addToShop(tmpCloak);
      items.addToShop(tmpPotion);
    }
  } else {
    items.changeActiveShop(index);
  }
});

["complete", "cancel"].forEach(event =>
  Shepherd.on(event, () => {
    items.removeShop();
    items.removeSelectedItem();
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
