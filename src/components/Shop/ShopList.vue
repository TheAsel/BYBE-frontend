<script setup lang="ts">
import { ref, watch } from 'vue';
import { biPlus, biDash, biTrash, biPlusLg } from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { itemsStore, settingsStore } from 'stores/store';
import { useRouter } from 'vue-router';
import { shop_list } from 'src/types/shop';
import { min_item } from 'src/types/item';
import { requestItemId } from 'src/utils/shop-api-calls';
import { debounce, isNull } from 'lodash-es';
import { useQuasar } from 'quasar';
import {
  mdiSword,
  mdiShield,
  mdiFoodDrumstick,
  mdiRing,
  mdiTshirtCrew
} from '@quasar/extras/mdi-v7';

const $q = useQuasar();

const router = useRouter();

const settings = settingsStore();
const shop = itemsStore();

const newShopDialog = ref(false);
const shopNameInput = ref();
const newShopName = ref('');

const removeShopDialog = ref(false);

const tmpShop = ref<shop_list>(shop.getActiveShop);
const shops = ref<string[]>(shop.getShops.map((shop) => shop.name));

const lastItem = ref<number>();

tmpShop.value = {
  name: shop.getActiveShop.name,
  items: shop.getActiveShop.items
};

// save on shop list change
watch(shop, () => {
  tmpShop.value = {
    name: shop.getActiveShop.name,
    items: shop.getActiveShop.items
  };
  saveChanges();
});

const closeDialog = () => {
  newShopDialog.value = false;
  removeShopDialog.value = false;
  newShopName.value = '';
};

const addShop = () => {
  shopNameInput.value.validate();
  if (!shopNameInput.value.hasError) {
    shop.addShop(newShopName.value);
    shops.value = shop.getShops.map((shop) => shop.name);
    tmpShop.value = {
      name: shop.getActiveShop.name,
      items: [...shop.getActiveShop.items]
    };
    saveChanges();
    newShopName.value = '';
    newShopDialog.value = false;
  }
};

const removeShop = () => {
  shop.removeShop();
  shops.value = shop.getShops.map((shop) => shop.name);
  tmpShop.value = {
    name: shop.getActiveShop.name,
    items: [...shop.getActiveShop.items]
  };
  saveChanges();
  removeShopDialog.value = false;
};

const changeActiveShop = (selected: string) => {
  shop.changeActiveShop(shop.getShopIndex(selected));
  tmpShop.value = {
    name: shop.getActiveShop.name,
    items: [...shop.getActiveShop.items]
  };
};

const saveChanges = () => {
  shop.updateShop(tmpShop.value.name, tmpShop.value.items);
  localStorage.setItem('shops', JSON.stringify(shop.getShops));
};

const showItem = debounce(async function (item: min_item) {
  if (lastItem.value != item.id) {
    lastItem.value = item.id;
    try {
      const itemData = await requestItemId(item.id);
      if (isNull(itemData) || itemData === undefined) {
        console.error('Missing item ID');
        $q.notify({
          progress: true,
          type: 'warning',
          message: 'Missing item ID',
          icon: matPriorityHigh
        });
        router.push({ name: 'shop' });
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
  <div class="q-pa-md tw-w-full md:tw-w-[27%] only-screen">
    <q-layout
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 122px)"
      class="tw-opacity-85 dark:tw-opacity-90 tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
      id="v-step-4"
    >
      <q-header
        bordered
        class="tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800 dark:!tw-border-gray-700"
      >
        <div class="tw-flex tw-flex-wrap tw-mx-4 tw-my-0.5">
          <div class="tw-flex tw-flex-shrink">
            <span class="text-h6 tw-my-auto font-bold tw-text-gray-800 dark:tw-text-gray-200">
              Shop
            </span>
          </div>
          <q-space />
          <div class="tw-flex tw-py-1">
            <q-btn
              class="tw-my-auto tw-ml-2"
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
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                    dense
                    v-model="newShopName"
                    autofocus
                    @keyup.enter="addShop"
                    :rules="[
                      (val) => !!val || 'Field is required',
                      (val) => !shops.find((name) => name === val) || 'This shop already exists'
                    ]"
                    :no-error-icon="true"
                  />
                </q-card-section>

                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    @click="closeDialog"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                  />
                  <q-btn
                    flat
                    label="Add shop"
                    @click="addShop"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Add shop"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-btn
              class="tw-my-auto tw-mx-2 tw-p-2"
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
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                    @click="closeDialog"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                  />
                  <q-btn
                    flat
                    label="Remove"
                    @click="removeShop"
                    class="tw-text-red-600 dark:tw-text-red-400"
                    aria-label="Remove shop"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-select
              dense
              style="min-width: 120px; max-width: 120px"
              class="tw-my-auto tw-mr-2"
              outlined
              v-model="tmpShop.name"
              :options="shops"
              label="Shops"
              @update:model-value="changeActiveShop(tmpShop.name)"
            />
          </div>
          <q-btn flat dense @click="shop.clearShop" aria-label="Clear shop">CLEAR</q-btn>
        </div>
      </q-header>

      <q-page-container v-if="shop.getGenerating == false">
        <div v-for="(item, index) in shop.getActiveShop.items" :key="index">
          <div class="tw-flex">
            <div class="tw-flex-none tw-w-12 tw-my-auto tw-mx-1">
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
            <div class="tw-flex tw-flex-row tw-flex-grow cursor-pointer" @click="showItem(item)">
              <div class="tw-flex-grow tw-my-auto tw-mx-1" style="min-width: 100px">
                <q-chip
                  v-if="item.type === 'Armor'"
                  text-color="white"
                  :clickable="false"
                  :ripple="false"
                  class="tw-p-1 tw-invisible"
                  aria-label="Armor item type"
                >
                  <q-avatar class="tw-visible" :icon="mdiTshirtCrew" color="blue">
                    <q-tooltip
                      class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                  class="tw-p-1 tw-invisible"
                  aria-label="Consumable item type"
                >
                  <q-avatar class="tw-visible" :icon="mdiFoodDrumstick" color="orange">
                    <q-tooltip
                      class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                  class="tw-p-1 tw-invisible"
                  aria-label="Equipment item type"
                >
                  <q-avatar class="tw-visible" :icon="mdiRing" color="green">
                    <q-tooltip
                      class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                  class="tw-p-1 tw-invisible"
                  aria-label="Shield item type"
                >
                  <q-avatar class="tw-visible" :icon="mdiShield" color="purple">
                    <q-tooltip
                      class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                  class="tw-p-1 tw-invisible"
                  aria-label="Weapon item type"
                >
                  <q-avatar class="tw-visible" :icon="mdiSword" color="red">
                    <q-tooltip
                      class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Weapon
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <span class="tw-align-middle">
                  {{ item.quantity }}
                  <a
                    v-if="item.archive_link && settings.getAonLinks"
                    :href="item.archive_link"
                    target="_blank"
                    rel="noopener"
                  >
                    <span
                      class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
                      >{{ item.name }}</span
                    >
                  </a>
                  <span v-else>{{ item.name }}</span>
                  — Lv. {{ item.level }}
                </span>
              </div>
              <div class="tw-flex-shrink tw-text-nowrap tw-my-auto tw-mx-1">
                {{ shop.getFormattedPrice(item.price * item.quantity!) }}
              </div>
            </div>
            <div class="tw-flex-none tw-my-auto tw-ml-1 tw-mr-3">
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
          <q-separator class="tw-bg-gray-200 dark:tw-bg-gray-700" />
        </div>
      </q-page-container>
      <q-page-container v-else class="tw-flex" style="height: 78vh">
        <div class="tw-m-auto">
          <q-spinner-gears class="tw-mx-auto tw-text-black dark:tw-text-white" size="5em" />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800 dark:!tw-border-gray-700"
      >
        <div class="tw-flex tw-mx-4">
          <div class="text-subtitle1 font-bold tw-whitespace-nowrap tw-py-2.5 tw-pr-4">
            Total cost: {{ shop.getFormattedPrice(shop.getTotalCost) }}
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
