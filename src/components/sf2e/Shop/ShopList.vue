<script setup lang="ts">
import {
  biDash,
  biInputCursorText,
  biPlus,
  biPlusLg,
  biShare,
  biTrash,
  biXLg
} from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import {
  mdiFoodDrumstick,
  mdiRing,
  mdiShield,
  mdiSword,
  mdiTshirtCrew
} from '@quasar/extras/mdi-v7';
import { debounce, isNull } from 'lodash-es';
import { copyToClipboard, useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { itemsStore, settingsStore } from '../../../stores/store';
import { decodeShopLink, generateShopLink, requestItemId } from '../../../utils/shop-api-calls';

import type { games } from '../../../types/filters';
import type { min_item } from '../../../types/item';
import type { shareable_shop, shop_list } from '../../../types/shop';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const settings = settingsStore();
const shop = itemsStore();

const importShopDialog = ref(false);
const importNameInput = ref();
const importShopName = ref('');
const importShopData = ref<shareable_shop>();

const shareDialog = ref(false);
const shareUrl = ref('');
const isGenerating = ref(false);

const newShopDialog = ref(false);
const shopNameInput = ref();
const newShopName = ref('');

const renameShopDialog = ref(false);
const shopRenameInput = ref();
const newShopRename = ref('');

const removeShopDialog = ref(false);

const tmpShop = ref<shop_list>(shop.getActiveShop!);
const shops = ref<string[]>(shop.getShops.map((shop) => shop.name));

const lastItemId = ref<number>();
const lastItemGame = ref<games>('sf');

tmpShop.value = {
  name: shop.getActiveShop!.name,
  items: shop.getActiveShop!.items
};

// save on shop list change
watch(shop, () => {
  tmpShop.value = {
    name: shop.getActiveShop!.name,
    items: shop.getActiveShop!.items
  };
  saveChanges();
});

// read the "share" query and decode it
const encodedData = String(route.query.share);
if (encodedData !== 'undefined' && encodedData !== 'null' && encodedData !== '') {
  isGenerating.value = true;
  importShopDialog.value = true;
  try {
    const decodedData = await decodeShopLink(encodedData);
    if (typeof decodedData !== 'undefined') {
      importShopData.value = decodedData;
      importShopName.value = decodedData.shop_name;
    } else {
      importShopDialog.value = false;
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error importing shop',
        icon: matPriorityHigh
      });
    }
  } catch (error) {
    importShopDialog.value = false;
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error importing shop',
      icon: matPriorityHigh
    });
  }
  isGenerating.value = false;
}

// clean the url from queries
await router.replace({
  path: route.path,
  query: {}
});

// open the share dialog and generate the shareable link
const openShare = async () => {
  isGenerating.value = true;
  shareDialog.value = true;
  const shopList = shop.getActiveShop!.items;
  const post: shareable_shop = {
    shop_name: shop.getActiveShop?.name ? shop.getActiveShop.name : 'Default',
    items_data: []
  };

  shopList.forEach((item) => {
    const tmp_qty: number = item.quantity ? item.quantity : 1;
    const tmp_game: 'Pathfinder' | 'Starfinder' = item.game === 'sf' ? 'Starfinder' : 'Pathfinder';

    post.items_data.push({
      id: item.id,
      qty: tmp_qty,
      game: tmp_game
    });
  });

  try {
    const shareableLink = await generateShopLink(post);
    if (typeof shareableLink === 'string') {
      shareUrl.value = 'https://bybe.fly.dev/sf/shop?share=' + shareableLink;
    } else {
      shareDialog.value = false;
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error generating shared link',
        icon: matPriorityHigh
      });
    }
  } catch (error) {
    shareDialog.value = false;
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error generating shared link',
      icon: matPriorityHigh
    });
  }
  isGenerating.value = false;
};

const importShop = async () => {
  importNameInput.value.validate();
  if (!importNameInput.value.hasError) {
    const tmp_items: min_item[] = [];
    for (const item of importShopData.value?.items_data ?? []) {
      try {
        const fetchedItemData = await requestItemId(
          item.game === 'Starfinder' ? 'sf' : 'pf',
          item.id
        );

        if (typeof fetchedItemData !== 'undefined') {
          tmp_items.push({
            game: item.game === 'Starfinder' ? 'sf' : 'pf',
            id: item.id,
            archive_link:
              item.game === 'Starfinder'
                ? 'https://2e.aonsrd.com/search?q=' +
                  encodeURIComponent(fetchedItemData.core_item.name) +
                  '&type=eqs'
                : 'https://2e.aonprd.com/Search.aspx?q=' +
                  encodeURIComponent(fetchedItemData.core_item.name) +
                  '&type=eqs',
            name: fetchedItemData.core_item.name,
            level: fetchedItemData.core_item.level,
            type: fetchedItemData.core_item.item_type,
            price: fetchedItemData.core_item.price,
            quantity: item.qty
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    shop.addShop(importShopName.value);
    shops.value = shop.getShops.map((shop) => shop.name);
    shop.updateShop(importShopName.value, tmp_items);
    tmpShop.value = {
      name: shop.getActiveShop!.name,
      items: [...shop.getActiveShop!.items]
    };
    saveChanges();
    importShopName.value = '';
    importShopDialog.value = false;
  }
};

const closeDialog = () => {
  importShopDialog.value = false;
  shareDialog.value = false;
  newShopDialog.value = false;
  renameShopDialog.value = false;
  removeShopDialog.value = false;
  importShopName.value = '';
  newShopName.value = '';
  newShopRename.value = '';
};

const addShop = () => {
  shopNameInput.value.validate();
  if (!shopNameInput.value.hasError) {
    shop.addShop(newShopName.value);
    shops.value = shop.getShops.map((shop) => shop.name);
    tmpShop.value = {
      name: shop.getActiveShop!.name,
      items: [...shop.getActiveShop!.items]
    };
    saveChanges();
    newShopName.value = '';
    newShopDialog.value = false;
  }
};

const renameShop = () => {
  shopRenameInput.value.validate();
  if (!shopRenameInput.value.hasError) {
    shop.getActiveShop!.name = newShopRename.value;
    shops.value = shop.getShops.map((shop) => shop.name);
    tmpShop.value = {
      name: shop.getActiveShop!.name,
      items: [...shop.getActiveShop!.items]
    };
    saveChanges();
    newShopRename.value = '';
    renameShopDialog.value = false;
  }
};

const removeShop = () => {
  shop.removeShop();
  shops.value = shop.getShops.map((shop) => shop.name);
  tmpShop.value = {
    name: shop.getActiveShop!.name,
    items: [...shop.getActiveShop!.items]
  };
  saveChanges();
  removeShopDialog.value = false;
};

const changeActiveShop = (selected: string) => {
  shop.changeActiveShop(shop.getShopIndex(selected));
  tmpShop.value = {
    name: shop.getActiveShop!.name,
    items: [...shop.getActiveShop!.items]
  };
};

const saveChanges = () => {
  shop.updateShop(tmpShop.value.name, tmpShop.value.items);
  localStorage.setItem('shops', JSON.stringify(shop.getShops));
};

const showItem = debounce(async function (item: min_item) {
  if (lastItemId.value != item.id || lastItemGame.value != item.game) {
    lastItemId.value = item.id;
    lastItemGame.value = item.game;
    try {
      const itemData = await requestItemId(item.game, item.id);
      if (isNull(itemData) || itemData === undefined) {
        console.error('Missing item ID');
        $q.notify({
          progress: true,
          type: 'warning',
          message: 'Missing item ID',
          icon: matPriorityHigh
        });
        await router.push({ name: 'shop' });
      } else {
        shop.setSelectedItem(itemData);
      }
    } catch (error) {
      console.error(error);
    }
  }
}, 300);
</script>

<template>
  <div class="q-pa-md tw:w-full tw:md:w-[27%] only-screen">
    <q-dialog
      v-model="importShopDialog"
      aria-label="Import shared shop dialog"
      @escape-key="closeDialog"
    >
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Import shop</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="importNameInput"
            v-model="importShopName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !shops.find((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This shop already exists'
            ]"
            @keyup.enter="importShop"
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
            label="Import shop"
            class="tw:text-blue-600! tw:dark:text-blue-400!"
            aria-label="Add shop"
            @click="importShop"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="shareDialog" aria-label="Share dialog" @escape-key="closeDialog">
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
        <div v-if="!isGenerating">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            A copy of your shop can be accessed via the following link:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-field class="tw:w-48 tw:text-gray-800! tw:dark:text-gray-200!" outlined dense>
                <template v-slot:control>
                  <div class="tw:text-nowrap tw:overflow-x-scroll tw:py-4!" tabindex="0">
                    {{ shareUrl }}
                  </div>
                </template>
              </q-field>
              <q-btn label="Copy" @click="copyToClipboard(shareUrl)" />
            </div>
          </q-card-section>
        </div>
        <q-inner-loading showing v-else style="z-index: 2">
          <q-spinner-gears
            class="tw:mx-auto tw:mt-8! tw:text-black tw:dark:text-white"
            size="5em"
          />
        </q-inner-loading>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newShopDialog" aria-label="New shop dialog" @escape-key="closeDialog">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">New shop name</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="shopNameInput"
            v-model="newShopName"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !shops.find((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This shop already exists'
            ]"
            @keyup.enter="addShop"
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
            label="Add shop"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Add shop"
            @click="addShop"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="renameShopDialog" aria-label="New shop dialog" @escape-key="closeDialog">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Rename shop</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            ref="shopRenameInput"
            v-model="newShopRename"
            dense
            autofocus
            counter
            :maxlength="50"
            :no-error-icon="true"
            :rules="[
              (val) => !!val || 'Field is required',
              (val) =>
                !shops.find((name) => name.toLowerCase() === val.toLowerCase()) ||
                'This shop already exists'
            ]"
            @keyup.enter="renameShop"
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
            label="Rename shop"
            class="tw:text-blue-600 tw:dark:text-blue-400"
            aria-label="Rename shop"
            @click="renameShop"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="removeShopDialog" aria-label="Remove shop dialog" @escape-key="closeDialog">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Remove this shop?</div>
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
            aria-label="Remove shop"
            @click="removeShop"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-layout
      id="v-step-4"
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 126px)"
      class="tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200! tw:rounded-xl tw:shadow-sm tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:flex-wrap tw:justify-center! tw:mx-4 tw:my-1.5 tw:gap-2">
          <q-btn
            id="v-step-5"
            class="tw:grow"
            :icon="biShare"
            label="Share"
            unelevated
            push
            @click="openShare"
          />
          <div class="tw:flex">
            <q-btn
              class="tw:my-auto! tw:max-h-[33.15px]!"
              :icon="biPlusLg"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Add new shop"
              @click="newShopDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Add new shop
              </q-tooltip>
            </q-btn>
            <q-btn
              class="tw:my-auto! tw:ml-2! tw:max-h-[33.15px]!"
              :icon="biInputCursorText"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Rename shop"
              @click="renameShopDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Rename shop
              </q-tooltip>
            </q-btn>
            <q-btn
              class="tw:my-auto! tw:mx-2! tw:max-h-[33.15px]!"
              :icon="biTrash"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Remove current shop"
              @click="removeShopDialog = true"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Delete shop
              </q-tooltip>
            </q-btn>
          </div>
          <q-select
            v-model="tmpShop.name"
            dense
            style="min-width: 120px; max-width: 120px"
            class="tw:my-auto"
            outlined
            :options="shops"
            label="Shops"
            @update:model-value="changeActiveShop(tmpShop.name)"
          />
          <q-btn flat dense aria-label="Clear shop" @click="shop.clearShop">CLEAR</q-btn>
        </div>
      </q-header>
      <q-page-container v-if="shop.getGenerating == false">
        <div v-for="(item, index) in shop.getActiveShop!.items" :key="index">
          <div class="tw:flex">
            <div class="tw:flex-none tw:w-12 tw:my-auto tw:mx-1">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-md"
                :icon="biPlus"
                aria-label="Add item"
                @click="shop.addToShop(item, index)"
              />
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                class="q-px-md"
                :icon="biDash"
                aria-label="Remove item"
                @click="shop.removeFromShop(index)"
              />
            </div>
            <div class="tw:flex tw:flex-row tw:grow cursor-pointer" @click="showItem(item)">
              <div class="tw:grow tw:my-auto tw:mx-1" style="min-width: 100px">
                <q-chip
                  v-if="item.type === 'Armor'"
                  text-color="white"
                  :clickable="false"
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Armor item type"
                >
                  <q-avatar class="tw:visible" :icon="mdiTshirtCrew" color="blue">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Armor
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <q-chip
                  v-if="item.type === 'Consumable'"
                  text-color="white"
                  :clickable="false"
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Consumable item type"
                >
                  <q-avatar class="tw:visible" :icon="mdiFoodDrumstick" color="orange">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Consumable
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <q-chip
                  v-if="item.type === 'Equipment'"
                  text-color="white"
                  :clickable="false"
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Equipment item type"
                >
                  <q-avatar class="tw:visible" :icon="mdiRing" color="green">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Equipment
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <q-chip
                  v-if="item.type === 'Shield'"
                  text-color="white"
                  :clickable="false"
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Shield item type"
                >
                  <q-avatar class="tw:visible" :icon="mdiShield" color="purple">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Shield
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <q-chip
                  v-if="item.type === 'Weapon'"
                  text-color="white"
                  :clickable="false"
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Weapon item type"
                >
                  <q-avatar class="tw:visible" :icon="mdiSword" color="red">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Weapon
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <span class="tw:align-middle">
                  {{ item.quantity }}
                  <a
                    v-if="item.archive_link && settings.getAonLinks"
                    :href="item.archive_link"
                    target="_blank"
                    rel="noopener"
                  >
                    <span
                      class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
                      >{{ item.name }}</span
                    >
                  </a>
                  <span v-else>{{ item.name }}</span>
                  — Lv. {{ item.level }}
                </span>
              </div>
              <div class="tw:shrink tw:text-nowrap tw:my-auto tw:mx-1">
                {{ (item.price * item.quantity!) / 10 + ' credits' }}
              </div>
            </div>
            <div class="tw:flex-none tw:my-auto tw:ml-1 tw:mr-3">
              <q-btn
                unelevated
                :ripple="false"
                size="sm"
                padding="sm"
                class="q-px-sm"
                :icon="biTrash"
                round
                aria-label="Clear item"
                @click="shop.clearItem(item)"
              />
            </div>
          </div>
          <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
        </div>
      </q-page-container>
      <q-page-container v-else class="tw:flex" style="height: 78vh">
        <div class="tw:m-auto">
          <q-spinner-gears class="tw:mx-auto tw:text-black tw:dark:text-white" size="5em" />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:mx-4">
          <div class="text-subtitle1 font-bold tw:whitespace-nowrap tw:py-2.5 tw:pr-4">
            Total cost: {{ shop.getTotalCost / 10 + ' credits' }}
          </div>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
