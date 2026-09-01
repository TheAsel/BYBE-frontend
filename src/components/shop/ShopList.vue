<script setup lang="ts">
import {
  biDash,
  biInputCursorText,
  biPlus,
  biPlusLg,
  biShare,
  biTrash,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import {
  mdiAmmunition,
  mdiBagPersonal,
  mdiFoodDrumstick,
  mdiRing,
  mdiShield,
  mdiSword,
  mdiTreasureChest,
  mdiTshirtCrew
} from "@quasar/extras/mdi-v7";
import { debounce } from "lodash-es";
import { copyToClipboard, QInput, useQuasar } from "quasar";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  decodeShopLink,
  generateShopLink,
  requestItemId
} from "@/api/shop-api-calls";
import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import { getGameAonLink, openSheet } from "@/utils/sheet";

import type { games } from "@/types/filters";
import type { min_item } from "@/types/item";
import type { shareable_shop, shop_list } from "@/types/shop";

const isApp = import.meta.env.IS_APP;

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const settings_store = settingsStore();
const items_store = itemsStore();

const importShopDialog = ref(false);
const importNameInput = ref<InstanceType<typeof QInput> | null>(null);
const importShopName = ref("");
const importShopData = ref<shareable_shop>();

const shareDialog = ref(false);
const shareUrl = ref("");
const isGenerating = ref(false);

const newShopDialog = ref(false);
const shopNameInput = ref<InstanceType<typeof QInput> | null>(null);
const newShopName = ref("");

const renameShopDialog = ref(false);
const shopRenameInput = ref<InstanceType<typeof QInput> | null>(null);
const newShopRename = ref("");

const removeShopDialog = ref(false);

const tmpShop = ref<shop_list>(items_store.shops[items_store.activeShop]!);
const shops = ref<string[]>(items_store.shops.map(shop => shop.name));

tmpShop.value = {
  items: items_store.shops[items_store.activeShop]!.items,
  name: items_store.shops[items_store.activeShop]!.name
};

// Read the "share" query and decode it
const encodedData = ref(route.query.share ?? "");

const decodeData = async (): Promise<void> => {
  if (encodedData.value !== "") {
    isGenerating.value = true;
    importShopDialog.value = true;
    try {
      const decodedData = await decodeShopLink(String(encodedData.value));
      if (!decodedData) {
        importShopDialog.value = false;
        throw new TypeError("Error importing shop");
      }
      importShopData.value = decodedData;
      importShopName.value = decodedData.shop_name;
    } catch (error) {
      importShopDialog.value = false;
      console.error(error);
      $q.notify({
        icon: matPriorityHigh,
        message: "Error importing shop",
        progress: true,
        type: "warning"
      });
    }
    isGenerating.value = false;
  }
};
await decodeData();

const closeDialog = (): void => {
  importShopDialog.value = false;
  shareDialog.value = false;
  newShopDialog.value = false;
  renameShopDialog.value = false;
  removeShopDialog.value = false;
  importShopName.value = "";
  newShopName.value = "";
  newShopRename.value = "";
};

const saveChanges = (): void => {
  items_store.updateShop(tmpShop.value.name, tmpShop.value.items);
  localStorage.setItem("shops", JSON.stringify(items_store.shops));
};

// Clean and check the link for manual app import
const sharedLink = ref("");
const cleanLink = async (): Promise<void> => {
  try {
    const parsedUrl = new URL(sharedLink.value);
    const path = parsedUrl.pathname;
    if (path !== route.path) {
      closeDialog();
      $q.notify({
        icon: matPriorityHigh,
        message: "Invalid page for this link",
        progress: true,
        type: "warning"
      });
      throw new Error("Invalid page for this link");
    }
    const share = parsedUrl.searchParams.get("share");
    if (share === null || share === "") {
      closeDialog();
      $q.notify({
        icon: matPriorityHigh,
        message: "Missing share hash",
        progress: true,
        type: "warning"
      });
      throw new TypeError("Missing share code");
    }
    encodedData.value = share;
    closeDialog();
    await decodeData();
  } catch (error) {
    console.error(error);
  }
};

// Clean the url from queries
await router.replace({
  path: route.path,
  query: { game: settings_store.game }
});

// Open the share dialog and generate the shareable link
const openShare = async (): Promise<void> => {
  isGenerating.value = true;
  shareDialog.value = true;
  const shopList = items_store.shops[items_store.activeShop]!.items;
  const body: shareable_shop = {
    items_data: [],
    shop_name: items_store.shops[items_store.activeShop]?.name
      ? items_store.shops[items_store.activeShop]!.name
      : "Default"
  };

  for (const item of shopList) {
    if (item.game !== "pf" && item.game !== "sf") {
      shareDialog.value = false;
      $q.notify({
        icon: matPriorityHigh,
        message: "This legacy list cannot be shared",
        progress: true,
        type: "warning"
      });
      return;
    }

    const tmp_qty: number = item.quantity ? item.quantity : 1;
    const tmp_game: games = item.game;

    body.items_data.push({
      game: tmp_game,
      id: item.id,
      qty: tmp_qty
    });
  }

  try {
    const shareableLink = await generateShopLink(body);
    if (typeof shareableLink === "string") {
      shareUrl.value = `https://bybe.app/shop?game=${
        settings_store.game
      }&share=${shareableLink}`;
    } else {
      shareDialog.value = false;
      $q.notify({
        icon: matPriorityHigh,
        message: "Error generating shared link",
        progress: true,
        type: "warning"
      });
    }
  } catch (error) {
    shareDialog.value = false;
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error generating shared link",
      progress: true,
      type: "warning"
    });
  }
  isGenerating.value = false;
};

const importShop = async (): Promise<void> => {
  importNameInput.value?.validate();
  if (!importNameInput.value?.hasError) {
    const tmp_items: min_item[] = [];

    const results = await Promise.all(
      (importShopData.value?.items_data ?? []).map(
        async (
          item
        ): Promise<{ success: true; item: min_item } | { success: false }> => {
          try {
            const fetchedItemData = await requestItemId(item.game, item.id);
            if (!fetchedItemData) {
              console.error("Missing item ID");
              return { success: false };
            }
            return {
              item: {
                archive_link: `https://2e.${getGameAonLink(
                  item.game
                )}.com/search?type=eqs&q=type%3A(item) ${encodeURIComponent(
                  fetchedItemData.core_item.name
                )}`,
                game: item.game,
                id: item.id,
                level: fetchedItemData.core_item.level,
                name: fetchedItemData.core_item.name,
                price: fetchedItemData.core_item.price,
                quantity: item.qty,
                type: fetchedItemData.core_item.item_type
              },
              success: true
            };
          } catch (error) {
            console.error(error);
            return { success: false };
          }
        }
      )
    );

    if (results.some(i => !i.success)) {
      $q.notify({
        icon: matPriorityHigh,
        message: "Some items could not be loaded",
        progress: true,
        type: "warning"
      });
    }

    tmp_items.push(
      ...results
        .filter((i): i is Extract<typeof i, { success: true }> => i.success)
        .map(c => c.item)
    );

    items_store.addShop(importShopName.value);
    shops.value = items_store.shops.map(shop => shop.name);
    items_store.updateShop(importShopName.value, tmp_items);
    tmpShop.value = {
      items: [...items_store.shops[items_store.activeShop]!.items],
      name: items_store.shops[items_store.activeShop]!.name
    };
    saveChanges();
    importShopName.value = "";
    importShopDialog.value = false;
  }
};

const addShop = (): void => {
  shopNameInput.value?.validate();
  if (!shopNameInput.value?.hasError) {
    items_store.addShop(newShopName.value);
    shops.value = items_store.shops.map(shop => shop.name);
    tmpShop.value = {
      items: [...items_store.shops[items_store.activeShop]!.items],
      name: items_store.shops[items_store.activeShop]!.name
    };
    saveChanges();
    newShopName.value = "";
    newShopDialog.value = false;
  }
};

const renameShop = (): void => {
  shopRenameInput.value?.validate();
  if (!shopRenameInput.value?.hasError) {
    items_store.shops[items_store.activeShop]!.name = newShopRename.value;
    shops.value = items_store.shops.map(shop => shop.name);
    tmpShop.value = {
      items: [...items_store.shops[items_store.activeShop]!.items],
      name: items_store.shops[items_store.activeShop]!.name
    };
    saveChanges();
    newShopRename.value = "";
    renameShopDialog.value = false;
  }
};

const removeShop = (): void => {
  items_store.removeShop();
  shops.value = items_store.shops.map(shop => shop.name);
  tmpShop.value = {
    items: [...items_store.shops[items_store.activeShop]!.items],
    name: items_store.shops[items_store.activeShop]!.name
  };
  saveChanges();
  removeShopDialog.value = false;
};

const changeActiveShop = (selected: string): void => {
  items_store.changeActiveShop(items_store.getShopIndex(selected));
  tmpShop.value = {
    items: [...items_store.shops[items_store.activeShop]!.items],
    name: items_store.shops[items_store.activeShop]!.name
  };
};

const showItem = debounce(async (item: min_item) => {
  try {
    const itemData = await requestItemId(item.game, item.id);
    if (itemData === null) {
      console.error("Missing item ID");
      $q.notify({
        icon: matPriorityHigh,
        message: "Missing item ID",
        progress: true,
        type: "warning"
      });
    } else {
      items_store.setSelectedItem(itemData);
    }
  } catch (error) {
    console.error(error);
  }
}, 300);

// Save on shop list change
watch(items_store, () => {
  tmpShop.value = {
    items: items_store.shops[items_store.activeShop]!.items,
    name: items_store.shops[items_store.activeShop]!.name
  };
  saveChanges();
});
</script>

<template>
  <div class="tw:h-full only-screen">
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
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !shops.some(name => name.toLowerCase() === val.toLowerCase()) ||
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

    <q-dialog
      v-model="shareDialog"
      aria-label="Share dialog"
      @escape-key="closeDialog"
    >
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
        <div v-if="isApp">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            Paste a shared link here to import it:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-input
                v-model="sharedLink"
                class="tw:w-44 tw:text-gray-800! tw:dark:text-gray-200!"
                outlined
                dense
              />
              <q-btn label="Import" @click="cleanLink" />
            </div>
          </q-card-section>
          <q-separator
            inset
            class="tw:my-2! tw:bg-gray-200! tw:dark:bg-gray-700!"
          />
        </div>
        <div v-if="!isGenerating">
          <q-card-section class="tw:wrap-normal tw:py-1!">
            A copy of your shop can be accessed via the following link:
          </q-card-section>
          <q-card-section>
            <div class="row tw:gap-4">
              <q-field
                class="tw:w-48 tw:text-gray-800! tw:dark:text-gray-200!"
                outlined
                dense
              >
                <template v-slot:control>
                  <div class="tw:text-nowrap tw:overflow-x-scroll tw:py-4!">
                    {{ shareUrl }}
                  </div>
                </template>
              </q-field>
              <q-btn
                label="Copy"
                @click="
                  copyToClipboard(shareUrl);
                  $q.notify({
                    message: 'Link copied to clipboard',
                    progress: true,
                    type: 'positive',
                    timeout: 1000
                  });
                "
              />
            </div>
          </q-card-section>
        </div>
        <q-inner-loading showing v-else style="z-index: 2">
          <q-spinner-gears
            class="tw:mx-auto tw:mt-8! tw:text-gray-800! tw:dark:text-white!"
            size="5em"
          />
        </q-inner-loading>
      </q-card>
    </q-dialog>

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
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !shops.some(name => name.toLowerCase() === val.toLowerCase()) ||
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

    <q-dialog
      v-model="renameShopDialog"
      aria-label="Rename shop dialog"
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
              (val: string) => !!val || 'Field is required',
              (val: string) =>
                !shops.some(name => name.toLowerCase() === val.toLowerCase()) ||
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

    <q-layout
      id="shepherd-4"
      view="lHh lpr lFf"
      container
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200! tw:rounded-xl tw:shadow-sm tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div
          class="tw:flex tw:flex-wrap tw:justify-center! tw:mx-4 tw:my-1.5 tw:gap-2"
        >
          <q-btn
            id="shepherd-5"
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
              @click="
                renameShopDialog = true;
                newShopRename = items_store.shops[items_store.activeShop]!.name;
              "
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
                Remove shop
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
          <q-btn
            flat
            dense
            aria-label="Clear shop"
            @click="items_store.clearShop"
            >CLEAR</q-btn
          >
        </div>
      </q-header>
      <q-page-container v-if="items_store.generating === false">
        <q-page class="tw:min-h-auto!">
          <div
            v-for="(item, index) in items_store.shops[items_store.activeShop]!
              .items"
            :key="index"
          >
            <div class="tw:flex">
              <div class="tw:flex-none tw:w-12 tw:my-auto tw:mx-1">
                <q-btn
                  unelevated
                  :ripple="false"
                  size="sm"
                  class="q-px-md"
                  :icon="biPlus"
                  aria-label="Add item"
                  @click="items_store.addToShop(item, index)"
                />
                <q-btn
                  unelevated
                  :ripple="false"
                  size="sm"
                  class="q-px-md"
                  :icon="biDash"
                  aria-label="Remove item"
                  @click="items_store.removeFromShop(index)"
                />
              </div>
              <div
                class="tw:flex tw:flex-wrap tw:flex-row tw:grow cursor-pointer"
                @click="showItem(item)"
              >
                <div
                  class="tw:grow tw:my-auto tw:mx-1"
                  style="min-width: 100px"
                >
                  <q-chip
                    v-if="item.type === 'Ammunition'"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Ammunition item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="mdiAmmunition"
                      color="black"
                    >
                      <q-tooltip
                        class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Ammunition
                      </q-tooltip>
                    </q-avatar>
                  </q-chip>
                  <q-chip
                    v-if="item.type === 'Armor'"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Armor item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="mdiTshirtCrew"
                      color="blue"
                    >
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
                    v-if="item.type === 'Backpack'"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Backpack item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="mdiBagPersonal"
                      color="brown"
                    >
                      <q-tooltip
                        class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Backpack
                      </q-tooltip>
                    </q-avatar>
                  </q-chip>
                  <q-chip
                    v-if="item.type === 'Consumable'"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Consumable item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="mdiFoodDrumstick"
                      color="orange"
                    >
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
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Equipment item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
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
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Shield item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="mdiShield"
                      color="purple"
                    >
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
                    v-if="item.type === 'Treasure'"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Treasure item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
                  >
                    <q-avatar
                      class="tw:visible"
                      :icon="mdiTreasureChest"
                      color="amber"
                    >
                      <q-tooltip
                        class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        Treasure
                      </q-tooltip>
                    </q-avatar>
                  </q-chip>
                  <q-chip
                    v-if="item.type === 'Weapon'"
                    text-color="white"
                    clickable
                    :ripple="false"
                    class="tw:p-1! tw:invisible"
                    aria-label="Weapon item type"
                    @click="
                      openSheet(
                        router,
                        'item',
                        item.game ?? settings_store.game,
                        item.id
                      )
                    "
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
                      v-if="item.archive_link"
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
                  {{
                    items_store.getFormattedPrice(
                      item.price * item.quantity!,
                      settings_store.game
                    )
                  }}
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
                  @click="items_store.clearItem(item)"
                />
              </div>
            </div>
            <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
          </div>
        </q-page>
      </q-page-container>
      <q-page-container v-else class="tw:flex" style="height: 78vh">
        <div class="tw:m-auto">
          <q-spinner-gears
            class="tw:mx-auto tw:text-gray-800! tw:dark:text-white!"
            size="5em"
          />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:mx-4">
          <div
            class="text-subtitle1 font-bold tw:whitespace-nowrap tw:py-2.5 tw:pr-4"
          >
            Total cost:
            {{
              items_store.getFormattedPrice(
                items_store.getTotalCost,
                settings_store.game
              )
            }}
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
