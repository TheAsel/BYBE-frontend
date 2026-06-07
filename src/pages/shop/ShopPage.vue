<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { onMounted, onUnmounted, ref } from 'vue';

import ShopList from 'src/components/shop/ShopList.vue';
import ShopSheet from 'src/components/shop/ShopSheet.vue';
import ShopTable from 'src/components/shop/ShopTable.vue';
import { itemsStore } from 'src/stores/items';
import { settingsStore } from 'src/stores/settings';
import { templateStore } from 'src/stores/template';

import type { games } from 'src/types/filters';
import type { item, min_item } from 'src/types/item';
import type { shop_list } from 'src/types/shop';
import type { template } from 'src/types/template';
import type { Step, VTourCallbacks, VTourOptions } from 'vue3-tour';

useHead({
  title: 'Shop Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.app/shop'
    }
  ]
});

const settings = settingsStore();
const shop = itemsStore();
const templatesStore = templateStore();

const currentGame = ref<games>(settings.getGame === 'sf' ? 'sf' : 'pf');

const tourActive = ref(false);
const screenWidth = ref(screen.width);

const scrollUp = ref(false);

const localShops = localStorage.getItem('shops');
if (localShops) {
  try {
    const parsedShops = JSON.parse(localShops);
    if (Array.isArray(parsedShops)) {
      const isCompatible = parsedShops.every((p) => {
        return typeof p.name === 'string' && Array.isArray(p.items);
      });
      if (isCompatible) {
        const shops: shop_list[] = parsedShops;
        const shopNames = shops.map((p) => p.name);
        if (new Set(shopNames).size !== shopNames.length) {
          throw new Error('Duplicate saved shop names');
        }
        shop.updateShops(shops);
      } else {
        throw new Error('Invalid saved shop format');
      }
    } else {
      throw new TypeError('Invalid saved shop format');
    }
  } catch (error) {
    console.error(error);
    const defaultShop = { name: 'Default', items: [] };
    localStorage.setItem('shops', JSON.stringify([defaultShop]));
    shop.updateShops([defaultShop]);
  }
}

const localTemplates = localStorage.getItem('templates');
if (localTemplates) {
  try {
    const parsedTemplates = JSON.parse(localTemplates);
    if (Array.isArray(parsedTemplates)) {
      const isCompatible = parsedTemplates.every((p) => {
        return typeof p.name === 'string' && typeof p.default === 'boolean';
      });
      if (isCompatible) {
        const templates: template[] = parsedTemplates;
        const templateNames = templates.map((p) => p.name);
        if (new Set(templateNames).size !== templateNames.length) {
          throw new Error('Duplicate saved template names');
        }
        for (const template of templates) {
          template.default = false;
        }
        templatesStore.updateTemplates(templates);
      } else {
        throw new Error('Invalid saved template format');
      }
    } else {
      throw new TypeError('Invalid saved template format');
    }
  } catch (error) {
    console.error(error);
    localStorage.setItem('shops', JSON.stringify([]));
    templatesStore.updateTemplates([]);
  }
}

const steps: Step[] = [
  {
    target: '#v-step-0',
    content:
      'This is the item list. Click on a row to show its description and double click it to add it to the shop to the right.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-1',
    content:
      'From this window you can define your preferred settings for the random shop generator and create custom templates.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '#v-step-2',
    content:
      'Clicking this button will generate a new random shop, based on the generator settings previously described.',
    params: {
      placement: 'bottom'
    }
  },
  {
    target: '.v-step-3',
    content: 'Here you can sort the columns and narrow your search with the various filters.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-4',
    content:
      'This is the shop list, where the items you added or randomly generated will be displayed. You can also increase or decrease the number of each individual item.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-5',
    content:
      'Clicking this button will generate a link to your current shop that you can copy and share.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-6',
    content: "Click here to show or hide the selected item's description.",
    params: {
      placement: 'auto'
    }
  }
];

const options: VTourOptions = {
  highlight: true,
  labels: {
    buttonSkip: 'Close Help',
    buttonPrevious: 'Previous',
    buttonNext: 'Next',
    buttonStop: 'Finish'
  }
};

// PF2E shop
const tmpCloakFull: item = {
  game: 'pf',
  core_item: {
    id: 3511,
    name: 'Cloak of Illusions',
    bulk: 0.1,
    quantity: 1,
    base_item: null,
    category: '',
    description:
      '<p>This cloak flows, covering and concealing the wearer\'s body. The cloak allows you to cast Figment as an occult innate cantrip. Although naturally a dull gray, while invested the cloak picks up colors and patterns from its surroundings, granting a +1 item bonus to Stealth checks.</p>\n<p><strong>Activate—Draw Hood</strong> <span class="action-glyph">2</span> (manipulate)</p>\n<p><strong>Frequency</strong> once per day</p>\n<hr />\n<p><strong>Effect</strong> You draw the hood up and gain the effects of Invisibility, with the spell\'s normal duration or until you pull the hood back down, whichever comes first. While you are invisible, your <em>figment</em> innate cantrip gains the subtle trait, concealing the observable effects of your spellcasting.</p>',
    hardness: 0,
    hp: 0,
    level: 7,
    price: 36000,
    usage: 'worncloak',
    group: '',
    item_type: 'Equipment',
    material_grade: '',
    material_type: '',
    number_of_uses: 0,
    license: 'ORC',
    remaster: true,
    source: 'Pathfinder GM Core',
    rarity: 'Common',
    size: 'Medium',
    traits: ['invested', 'occult']
  }
};
const tmpCloak: min_item = {
  game: 'pf',
  id: 3511,
  archive_link: 'https://2e.aonprd.com/Equipment.aspx?ID=3069',
  name: 'Cloak of Illusions',
  level: 7,
  type: 'Equipment',
  price: 36000,
  quantity: 1
};
const tmpPotion: min_item = {
  game: 'pf',
  id: 2967,
  archive_link: 'https://2e.aonprd.com/Equipment.aspx?ID=2943',
  name: 'Healing Potion (Moderate)',
  level: 6,
  type: 'Consumable',
  price: 5000,
  quantity: 3
};

// SF2E shop
const tmpLaserRifleFull: item = {
  game: 'sf',
  core_item: {
    id: 402,
    name: 'Laser Rifle',
    bulk: 2,
    quantity: 1,
    base_item: 'laser-rifle',
    category: 'simple',
    description:
      '<p><strong>Upgrades:</strong> 1</p><hr /><p>These dependable, mass-produced rifles shoot concentrated beams of energy out of square-shaped barrels. The universal standard Pact Worlds model is highly modifiable and designed to function with a variety of accessories and upgrades, with wielders adapting the laser rifle to their preferences and even kit-bashing it into a nearly unrecognizable weapon.</p>',
    hardness: 0,
    hp: 0,
    level: 0,
    price: 450,
    usage: 'held-in-two-hands',
    group: 'laser',
    item_type: 'Weapon',
    material_grade: '',
    material_type: '',
    number_of_uses: 0,
    license: 'ORC',
    remaster: true,
    source: 'Starfinder Player Core',
    rarity: 'Common',
    size: 'Medium',
    traits: ['tech']
  }
};
const tmpLaserRifle: min_item = {
  game: 'sf',
  id: 402,
  archive_link: 'https://2e.aonsrd.com/equipment/weapons/41-laser-rifle',
  name: 'Laser Rifle',
  level: 0,
  type: 'Weapon',
  price: 450,
  quantity: 1
};
const tmpFlightSuit: min_item = {
  game: 'sf',
  id: 328,
  archive_link: 'https://2e.aonsrd.com/equipment/armor/2-flight-suit',
  name: 'Flight Suit',
  level: 1,
  type: 'Armor',
  price: 100,
  quantity: 1
};

const startTour = () => {
  if (!tourActive.value) {
    tourActive.value = true;
    shop.addShop('Example');
    if (currentGame.value === 'sf') {
      shop.setSelectedItem(tmpLaserRifleFull);
      shop.addToShop(tmpLaserRifle);
      shop.addToShop(tmpFlightSuit);
    } else {
      shop.setSelectedItem(tmpCloakFull);
      shop.addToShop(tmpCloak);
      shop.addToShop(tmpPotion);
    }
  }
};

const stopTour = () => {
  if (tourActive.value) {
    shop.removeShop();
    shop.removeSelectedItem();
    tourActive.value = false;
  }
};

const callbacks: VTourCallbacks = {
  onStart: startTour,
  onStop: stopTour
};

function scrollDirection() {
  const footers = Array.from(document.querySelectorAll('footer'));
  const footer = footers.at(-1);
  const top = footer?.getBoundingClientRect().top;
  if (top) {
    scrollUp.value = top < globalThis.innerHeight;
  }
}

const scrollPage = (up: boolean) => {
  settings.setHiddenNav(true);
  setTimeout(() => {
    let offset;
    if (up) {
      offset = document.getElementById('table')?.offsetTop;
    } else {
      offset = document.getElementById('list')?.offsetTop;
    }
    if (typeof offset === 'number') {
      globalThis.scrollTo({
        top: offset - 60,
        behavior: 'smooth'
      });
    }
  }, 10);
};

const handleResize = () => {
  screenWidth.value = screen.width;
};

onMounted(() => {
  globalThis.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  globalThis.removeEventListener('resize', handleResize);
});

const sheetVisible = ref(true);
const sheetWidth = ref('tw:md:w-[27%]!');
const tableWidth = ref('tw:md:w-[46%]!');

const toggleSheetView = () => {
  sheetVisible.value = !sheetVisible.value;
  if (sheetVisible.value) {
    sheetWidth.value = 'tw:md:w-[27%]!';
    tableWidth.value = 'tw:md:w-[46%]!';
  } else {
    sheetWidth.value = 'tw:md:w-[0%]! tw:px-0! tw:collapse';
    tableWidth.value = 'tw:md:w-[73%]!';
  }
};
</script>

<template>
  <div class="row items-center justify-between">
    <v-tour name="/shop" :steps="steps" :options="options" :callbacks="callbacks" />
    <ShopSheet
      v-if="screenWidth >= 768"
      class="q-pa-md tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <ShopTable
      id="table"
      class="q-pa-md tw:w-full tw:transition-all tw:duration-300"
      :class="tableWidth"
      :toggle-sheet-view="toggleSheetView"
      :sheet-visible="sheetVisible"
    />
    <q-space />
    <ShopSheet
      v-if="screenWidth < 768"
      class="q-pa-md tw:w-full tw:transition-all tw:duration-300"
      :class="sheetWidth"
    />
    <ShopList id="list" />
    <q-page-sticky
      v-if="screenWidth < 768"
      position="bottom-right"
      :offset="[18, 18]"
      class="tw:z-10 tw:opacity-85 only-screen"
    >
      <q-btn
        v-if="scrollUp"
        fab
        :icon="matArrowUpward"
        padding="sm"
        color="primary"
        @click="scrollPage(true)"
      />
      <q-btn
        v-else
        fab
        :icon="matArrowDownward"
        padding="sm"
        color="primary"
        @click="scrollPage(false)"
      />
    </q-page-sticky>
    <q-scroll-observer @scroll="scrollDirection" />
  </div>
</template>
