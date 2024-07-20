<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useHead } from '@unhead/vue';
import ShopTable from 'src/components/Shop/ShopTable.vue';
import ShopSheet from 'src/components/Shop/ShopSheet.vue';
import ShopList from 'src/components/Shop/ShopList.vue';
import { shop_list } from 'src/types/shop';
import { itemsStore, settingsStore } from 'src/stores/store';
import { Step, VTourCallbacks, VTourOptions } from 'vue3-tour';
import { matArrowDownward, matArrowUpward } from '@quasar/extras/material-icons';
import { item, min_item } from 'src/types/item';

useHead({
  title: 'Shop Generator - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/shop'
    }
  ]
});

const settings = settingsStore();
const shop = itemsStore();
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
    const defaultShop = { name: 'Default', items: [] };
    localStorage.setItem('shops', JSON.stringify([defaultShop]));
    shop.updateShops([defaultShop]);
  }
}

const steps: Step[] = [
  {
    target: '#v-step-0',
    content:
      'This is the item list. Click on a row to show its description and on the + to add it to the shop to the right.',
    params: {
      placement: 'auto'
    }
  },
  {
    target: '#v-step-1',
    content:
      'From this window you can define your preferred settings for the random shop generator.',
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
    const tmpCloakFull: item = {
      core_item: {
        id: 762,
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
      id: 3029,
      archive_link: 'https://2e.aonprd.com/Equipment.aspx?ID=3069',
      name: 'Cloak of Illusions',
      level: 7,
      type: 'Equipment',
      price: 36000,
      quantity: 1
    };
    const tmpPotion: min_item = {
      id: 3029,
      archive_link: 'https://2e.aonprd.com/Equipment.aspx?ID=2943',
      name: 'Healing Potion (Moderate)',
      level: 6,
      type: 'Consumable',
      price: 5000,
      quantity: 3
    };
    shop.setSelectedItem(tmpCloakFull);
    shop.addShop('Example');
    shop.addToShop(tmpCloak);
    shop.addToShop(tmpPotion);
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
  const footer = document.querySelector('footer');
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
    <v-tour name="/shop" :steps="steps" :options="options" :callbacks="callbacks" />
    <ShopSheet v-if="screenWidth >= 768" class="q-pa-md tw-w-full md:tw-w-[27%]" />
    <ShopTable id="table" />
    <ShopSheet v-if="screenWidth < 768" class="q-pa-md tw-w-full md:tw-w-[27%]" />
    <ShopList id="list" />
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      class="tw-z-10 tw-opacity-85 tw-block md:tw-hidden"
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
