<script setup lang="ts">
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { onMounted, onUnmounted, ref } from 'vue';

import ShopList from '../../components/sf2e/Shop/ShopList.vue';
import ShopSheet from '../../components/sf2e/Shop/ShopSheet.vue';
import ShopTable from '../../components/sf2e/Shop/ShopTable.vue';
import { itemsStore, settingsStore, templateStore } from '../../stores/store';

import type { item, min_item } from '../../types/item';
import type { shop_list } from '../../types/shop';
import type { template } from '../../types/template';
import type { Step, VTourCallbacks, VTourOptions } from 'vue3-tour';

useHead({
  title: 'Shop Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/sf/shop'
    }
  ]
});

const settings = settingsStore();
const shop = itemsStore();
const templatesStore = templateStore();
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
      throw new Error('Invalid saved shop format');
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
        templates.forEach((template) => (template.default = false));
        templatesStore.updateTemplates(templates);
      } else {
        throw new Error('Invalid saved template format');
      }
    } else {
      throw new Error('Invalid saved template format');
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
    content: "This is where the selected item's description will be displayed.",
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

const startTour = () => {
  if (!tourActive.value) {
    tourActive.value = true;
    const tmpLaserRifleFull: item = {
      core_item: {
        id: 402,
        name: 'Laser Rifle',
        bulk: 2.0,
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
    shop.setSelectedItem(tmpLaserRifleFull);
    shop.addShop('Example');
    shop.addToShop(tmpLaserRifle);
    shop.addToShop(tmpFlightSuit);
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
  const footers = document.querySelectorAll('footer');
  const footer = footers[footers.length - 1];
  const top = footer?.getBoundingClientRect().top;
  if (top) {
    scrollUp.value = top < window.innerHeight;
  }
}

const scrollPage = (up: boolean) => {
  settings.setHiddenNav(true);
  setTimeout(() => {
    let offset: number | undefined = 0;
    if (up) {
      offset = document.getElementById('table')?.offsetTop;
    } else {
      offset = document.getElementById('list')?.offsetTop;
    }
    if (typeof offset === 'number') {
      window.scrollTo({
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
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="row items-center justify-between">
    <v-tour name="/sf/shop" :steps="steps" :options="options" :callbacks="callbacks" />
    <ShopSheet v-if="screenWidth >= 768" class="q-pa-md tw:w-full tw:md:w-[27%]" />
    <ShopTable id="table" />
    <q-space />
    <ShopSheet v-if="screenWidth < 768" class="q-pa-md tw:w-full tw:md:w-[27%]" />
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
