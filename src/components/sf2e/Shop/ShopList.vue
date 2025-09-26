<script setup lang="ts">
import {
  biDash,
  biInputCursorText,
  biPlus,
  biPlusLg,
  biTrash
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
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { itemsStore, settingsStore } from '../../../stores/store';
import { requestItemId } from '../../../utils/shop-api-calls';

import type { min_item } from '../../../types/item';
import type { shop_list } from '../../../types/shop';
import type { games } from 'src/types/filters';

const $q = useQuasar();

const router = useRouter();

const settings = settingsStore();
const shop = itemsStore();

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
const lastItemGame = ref<games>('sf2e');

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

const closeDialog = () => {
  newShopDialog.value = false;
  renameShopDialog.value = false;
  removeShopDialog.value = false;
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
        <div class="tw:flex tw:flex-wrap tw:mx-4 tw:my-0.5">
          <div class="tw:flex tw:shrink">
            <span class="text-h6 tw:my-auto font-bold tw:text-gray-800! tw:dark:text-gray-200!">
              Shop
            </span>
          </div>
          <q-space />
          <div class="tw:flex tw:py-1">
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
            <q-dialog
              v-model="newShopDialog"
              aria-label="New shop dialog"
              @escape-key="closeDialog"
            >
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
            <q-dialog
              v-model="renameShopDialog"
              aria-label="New shop dialog"
              @escape-key="closeDialog"
            >
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
            <q-dialog
              v-model="removeShopDialog"
              aria-label="Remove shop dialog"
              @escape-key="closeDialog"
            >
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
            <q-select
              v-model="tmpShop.name"
              dense
              style="min-width: 120px; max-width: 120px"
              class="tw:my-auto tw:mr-2"
              outlined
              :options="shops"
              label="Shops"
              @update:model-value="changeActiveShop(tmpShop.name)"
            />
          </div>
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
