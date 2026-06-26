<script setup lang="ts">
import {
  biArrowDownUp,
  biArrowsCollapseVertical,
  biArrowsExpandVertical,
  biBasketFill,
  biBook,
  biBoxArrowUpRight,
  biCaretRight,
  biEraser,
  biFullscreen,
  biFullscreenExit,
  biPlusLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh, matWarning } from "@quasar/extras/material-icons";
import {
  mdiFoodDrumstick,
  mdiRing,
  mdiShield,
  mdiSword,
  mdiTshirtCrew
} from "@quasar/extras/mdi-v7";
import { capitalize, debounce } from "lodash-es";
import { useQuasar } from "quasar";
import { onMounted, onUnmounted, ref, toRaw, watch } from "vue";
import { useRouter } from "vue-router";

import {
  requestFilters,
  requestItemId,
  requestItems,
  requestShopRanges,
  requestTemplates
} from "@/api/shop-api-calls";
import DiceIcon from "@/components/generic/DiceIcon.vue";
import ShopBuilder from "@/components/shop/ShopTable/ShopBuilder.vue";
import { filtersStore } from "@/stores/filters";
import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import { templateStore } from "@/stores/template";
import { getGameAonLink, openSheet } from "@/utils/sheet";

import type { QTableProps } from "quasar";
import type { item_columns, item_filters, rarities } from "@/types/filters";
import type { item, min_item } from "@/types/item";

const props = defineProps({ sheetVisible: Boolean, toggleSheetView: Function }); // oxlint-disable-line max-props

const $q = useQuasar();
const settings_store = settingsStore();
const items_store = itemsStore();
const filters_store = filtersStore();

const shopBuilderRef = ref();
const router = useRouter();

const itemTable = ref();
const navigationActive = ref(false);
const selected = ref<item[]>([]);
const rows = ref<item[]>([]);
const loading = ref(true);
const pagination = ref({
  descending: false,
  page: 1,
  rowsNumber: 0,
  rowsPerPage: 100,
  sortBy: "name"
});
const activeFilters = ref<{
  name_filter: string;
  level_filter: { min: number; max: number };
  trait_filter: string[];
  rarity_filter: rarities[];
  type_filter: string[];
  source_filter: string[];
  sort_by: item_columns;
  order_by: "ascending" | "descending";
}>({
  level_filter: {
    max: filters_store.shopRanges.max_level,
    min: filters_store.shopRanges.min_level
  },
  name_filter: "",
  order_by: "ascending",
  rarity_filter: [],
  sort_by: "name",
  source_filter: [],
  trait_filter: [],
  type_filter: []
});
const fullscreen = ref(false);
const tableOpacity = ref("");

const sourceFilter = ref<string[]>(filters_store.itemFilters.sources);
const traitFilter = ref<{ label: string; value: string }[]>(
  filters_store.itemFilters.traits
);

const columns: {
  name: item_columns;
  label: string;
  field: (row: item) => string | number | string[];
  required?: boolean;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  style?: string;
}[] = [
  {
    align: "center",
    field: row => row.core_item.source,
    label: "Source",
    name: "source",
    required: false,
    sortable: true,
    style: "min-width: 120px; max-width: 120px;"
  },
  {
    align: "left",
    field: row => row.core_item.name,
    label: "Name",
    name: "name",
    required: true,
    sortable: true,
    style: "min-width: 215px;"
  },
  {
    align: "left",
    field: row => row.core_item.level,
    label: "Level",
    name: "level",
    required: false,
    sortable: true,
    style: "min-width: 80px;"
  },
  {
    align: "left",
    field: row => row.core_item.traits.map(t => t.name),
    label: "Traits",
    name: "trait",
    required: false,
    sortable: true,
    style: "min-width: 110px; max-width: 180px;"
  },
  {
    align: "left",
    field: row => row.core_item.rarity,
    label: "Rarity",
    name: "rarity",
    required: false,
    sortable: true,
    style: "min-width: 100px; max-width: 180px;"
  },
  {
    align: "center",
    field: row => row.core_item.item_type,
    label: "Type",
    name: "type",
    required: false,
    sortable: true,
    style: "min-width: 100px; max-width: 180px;"
  },
  {
    align: "center",
    field: row => row.core_item.id,
    label: "Cart",
    name: "id",
    required: false,
    sortable: false
  }
];

// Waits for the table pagination to load
let resolveWhenLoaded: (() => void) | null = null;
const waitForPageLoad = (): Promise<void> =>
  new Promise<void>(resolve => {
    resolveWhenLoaded = resolve;
  });

const fetchFromServer = debounce(
  async (startRow: number, rowsPerPage: number) => {
    const body: item_filters = {
      game_system_version: settings_store.game_version,
      max_level_filter: activeFilters.value.level_filter.max,
      min_level_filter: activeFilters.value.level_filter.min
    };
    if (activeFilters.value.name_filter !== "") {
      body.name_filter = activeFilters.value.name_filter;
    }
    if (
      activeFilters.value.trait_filter !== null &&
      activeFilters.value.trait_filter.length > 0
    ) {
      body.trait_whitelist_filter = activeFilters.value.trait_filter;
    }
    if (
      activeFilters.value.rarity_filter !== null &&
      activeFilters.value.rarity_filter.length > 0
    ) {
      body.rarity_filter = activeFilters.value.rarity_filter;
    }
    if (
      activeFilters.value.type_filter !== null &&
      activeFilters.value.type_filter.length > 0
    ) {
      body.type_filter = activeFilters.value.type_filter;
    }
    if (
      activeFilters.value.source_filter !== null &&
      activeFilters.value.source_filter.length > 0
    ) {
      body.source_filter = activeFilters.value.source_filter;
    }
    try {
      const request = await requestItems(
        settings_store.game,
        startRow,
        rowsPerPage,
        activeFilters.value.sort_by,
        activeFilters.value.order_by,
        body
      );
      if (request) {
        pagination.value.rowsNumber = request.total;
        rows.value = request.results;
        loading.value = false;
        resolveWhenLoaded?.();
        resolveWhenLoaded = null;
      } else {
        throw new Error("Error loading items");
      }
    } catch (error) {
      console.error(error);
      $q.notify({
        icon: matPriorityHigh,
        message: "Error loading the items",
        progress: true,
        type: "warning"
      });
    }
  },
  300
);

async function onRequest(
  table_props: Parameters<NonNullable<QTableProps["onRequest"]>>[0]
): Promise<void> {
  const { page, rowsPerPage } = table_props.pagination;

  loading.value = true;

  const startRow = (page - 1) * rowsPerPage;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  await fetchFromServer(startRow, pagination.value.rowsPerPage);
}

const resetFilters = (): void => {
  activeFilters.value = {
    level_filter: {
      max: filters_store.shopRanges.max_level,
      min: filters_store.shopRanges.min_level
    },
    name_filter: "",
    order_by: "ascending",
    rarity_filter: [],
    sort_by: "name",
    source_filter: [],
    trait_filter: [],
    type_filter: []
  };
};

const visibleColumns = ref(["name", "level", "type", "rarity"]);

const sort = (col: item_columns): void => {
  if (activeFilters.value.sort_by === col) {
    if (activeFilters.value.order_by === "ascending") {
      activeFilters.value.order_by = "descending";
    } else {
      activeFilters.value.order_by = "ascending";
    }
  } else {
    activeFilters.value.order_by = "ascending";
    activeFilters.value.sort_by = col;
  }
};

const addItem = debounce((item: item) => {
  const aon_link = `https://2e.${getGameAonLink(
    settings_store.game
  )}.com/search?q=${encodeURIComponent(item.core_item.name)}&type=eqs`;
  const min_item: min_item = {
    archive_link: aon_link,
    game: item.game,
    id: item.core_item.id,
    level: item.core_item.level,
    name: item.core_item.name,
    price: item.core_item.price,
    quantity: item.core_item.quantity,
    type: item.core_item.item_type
  };
  items_store.addToShop(min_item);
}, 50);

const showItem = debounce(async (item: item) => {
  try {
    const itemData = await requestItemId(item.game, item.core_item.id);
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
}, 50);

const activateNavigation = (): void => {
  navigationActive.value = true;
};

const deactivateNavigation = (): void => {
  navigationActive.value = false;
};

// Checks if typing to prevent stealing shortcuts
function isTextInput(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(
    el?.closest('input, textarea, [contenteditable="true"], .q-editor')
  );
}

// Table shortcuts
async function onTableKey(evt: KeyboardEvent): Promise<void> {
  if (isTextInput(evt.target)) {
    return;
  }

  if (
    navigationActive.value !== true ||
    ![
      "Enter",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowUp",
      "ArrowRight",
      "ArrowDown"
    ].includes(evt.key) ||
    itemTable.value === null ||
    loading.value === true
  ) {
    return;
  }

  evt.preventDefault();

  const { computedRowsNumber, computedRows } = itemTable.value;

  if (computedRows.length === 0) {
    return;
  }

  const currentIndex =
    selected.value.length > 0
      ? computedRows.indexOf(toRaw(selected.value[0]))
      : -1;
  const currentPage = pagination.value.page;
  const rowsPerPage =
    pagination.value.rowsPerPage === 0
      ? computedRowsNumber
      : pagination.value.rowsPerPage;
  const lastIndex = computedRows.length - 1;
  const lastPage = Math.ceil(computedRowsNumber / rowsPerPage);

  let index = currentIndex;

  switch (evt.key) {
    case "Enter": {
      addItem(items_store.selectedItem!);
      break;
    }
    case "PageUp": {
      index = 0;
      selected.value = [computedRows[index]];
      showItem(selected.value[0]!);
      itemTable.value.scrollTo(index);
      break;
    }
    case "PageDown": {
      index = rowsPerPage - 1;
      selected.value = [computedRows[Math.min(index, computedRows.length - 1)]];
      showItem(selected.value[0]!);
      itemTable.value.scrollTo(index);
      break;
    }
    case "Home": {
      index = 0;
      const promise = waitForPageLoad();
      itemTable.value.firstPage();
      await promise;

      selected.value = [computedRows[index]];
      showItem(selected.value[0]!);
      itemTable.value.scrollTo(index);
      break;
    }
    case "End": {
      index = rowsPerPage - 1;
      const promise = waitForPageLoad();
      itemTable.value.lastPage();
      await promise;

      selected.value = [computedRows[Math.min(index, computedRows.length - 1)]];
      showItem(selected.value[0]!);
      itemTable.value.scrollTo(index - 1);
      break;
    }
    case "ArrowLeft": {
      const page = currentPage <= 1 ? lastPage : currentPage - 1;
      index = 0;
      const promise = waitForPageLoad();
      if (page === lastPage) {
        itemTable.value.lastPage();
      } else {
        itemTable.value.prevPage();
      }
      await promise;

      selected.value = [computedRows[index]];
      showItem(selected.value[0]!);
      itemTable.value.scrollTo(index);
      break;
    }
    case "ArrowUp": {
      if (currentIndex > 0) {
        index = currentIndex - 1;
        selected.value = [computedRows[index]];
        showItem(selected.value[0]!);
      }
      itemTable.value.scrollTo(index - 1);
      break;
    }
    case "ArrowRight": {
      const page = currentPage >= lastPage ? 1 : currentPage + 1;
      index = 0;
      const promise = waitForPageLoad();
      if (page === 1) {
        itemTable.value.firstPage();
      } else {
        itemTable.value.nextPage();
      }
      await promise;

      selected.value = [computedRows[index]];
      showItem(selected.value[0]!);
      itemTable.value.scrollTo(index);
      break;
    }
    case "ArrowDown": {
      if (currentIndex < lastIndex) {
        index = currentIndex + 1;
        selected.value = [computedRows[index]];
        showItem(selected.value[0]!);
      }
      itemTable.value.scrollTo(index);
      break;
    }
    default:
      break;
  }
}

// Global shortcuts
function onGlobalKey(evt: KeyboardEvent): void {
  if (isTextInput(evt.target)) {
    return;
  }
  if (evt.key.toLowerCase() === "b" && (evt.ctrlKey || evt.metaKey)) {
    evt.preventDefault();
    props.toggleSheetView!();
  }
}

onMounted(() => {
  globalThis.addEventListener("keydown", onGlobalKey);
});

onUnmounted(() => {
  globalThis.removeEventListener("keydown", onGlobalKey);
});

const toggleFullscreen = (): void => {
  fullscreen.value = !fullscreen.value;
  if (fullscreen.value) {
    tableOpacity.value = "opacity: 1";
  } else {
    tableOpacity.value = "";
  }
};

const filterSourcesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.itemFilters.sources = sourceFilter.value.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterTraitsFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.itemFilters.traits = traitFilter.value.filter(v =>
      v.label.toLowerCase().includes(filter)
    );
  });
};

onMounted(async () => {
  try {
    const [sourcesRequest, traitsRequest, templatesRequest, shopRangesRequest] =
      await Promise.all([
        requestFilters(settings_store.game, "sources"),
        requestFilters(settings_store.game, "traits"),
        requestTemplates(settings_store.game),
        requestShopRanges(settings_store.game),
        fetchFromServer(0, 100)
      ]);

    if (!sourcesRequest) {
      throw new Error("Error fetching sources");
    }
    if (!traitsRequest) {
      throw new Error("Error fetching traits");
    }
    if (!templatesRequest) {
      throw new Error("Error fetching templates");
    }
    if (!shopRangesRequest) {
      throw new Error("Error fetching shop ranges");
    }

    filters_store.updateItemSources(sourcesRequest);
    sourceFilter.value = filters_store.itemFilters.sources;

    filters_store.updateItemTraits(traitsRequest);
    traitFilter.value = filters_store.itemFilters.traits;

    templateStore().addDefaultTemplates(templatesRequest);

    filters_store.shopRanges = shopRangesRequest;
  } catch (error) {
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error fetching activeFilters",
      progress: true,
      type: "warning"
    });
  }
});

watch(
  () => filters_store.shopRanges,
  ranges => {
    activeFilters.value.level_filter = {
      max: ranges.max_level,
      min: ranges.min_level
    };
  }
);
</script>

<template>
  <div class="tw:h-full only-screen">
    <q-table
      id="shepherd-0"
      ref="itemTable"
      v-model:pagination="pagination"
      class="sticky-header-table tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:bg-white! tw:border tw:border-gray-200! tw:rounded-xl! tw:shadow-sm tw:overflow-hidden tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      :style="tableOpacity"
      color="primary"
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :visible-columns="visibleColumns"
      virtual-scroll
      virtual-scroll-slice-size="100"
      virtual-scroll-sticky-size-start="50"
      virtual-scroll-item-size="48"
      :loading="loading"
      :filter="activeFilters"
      rows-per-page-label="Items per page:"
      :rows-per-page-options="[50, 100, 0]"
      table-header-class="shepherd-3"
      row-key="name"
      selection="single"
      :fullscreen="fullscreen"
      @request="onRequest"
      @row-click="
        (_: any, row: item) => {
          showItem(row);
          selected = [row];
        }
      "
      @row-dblclick="
        (_: any, row: item) => {
          addItem(row);
        }
      "
      @focusin="activateNavigation"
      @focusout="deactivateNavigation"
      @keydown="onTableKey"
    >
      <template #loading>
        <q-inner-loading showing style="z-index: 2">
          <q-spinner-gears
            class="tw:mx-auto tw:text-gray-800! tw:dark:text-white!"
            size="5em"
          />
        </q-inner-loading>
      </template>
      <template #top>
        <div class="tw:flex tw:grow tw:flex-wrap tw:gap-2 tw:justify-center">
          <div class="tw:flex tw:grow tw:justify-center tw:xl:justify-start">
            <span v-if="!fullscreen">
              <q-btn
                v-if="props.sheetVisible"
                id="shepherd-6"
                flat
                round
                dense
                class="tw:mr-4! tw:my-2! tw:md:my-0! tw:text-gray-800! tw:dark:text-white!"
                :icon="biArrowsCollapseVertical"
                size="md"
                padding="sm"
                aria-label="Hide sheet"
                @click="props.toggleSheetView!()"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Hide sheet (Ctrl + B)
                </q-tooltip>
              </q-btn>
              <q-btn
                v-else
                id="shepherd-6"
                flat
                round
                dense
                class="tw:mr-4! tw:my-2! tw:md:my-0! tw:text-gray-800! tw:dark:text-white!"
                :icon="biArrowsExpandVertical"
                size="md"
                padding="sm"
                aria-label="Show sheet"
                @click="props.toggleSheetView!()"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Show sheet (Ctrl + B)
                </q-tooltip>
              </q-btn>
            </span>
            <q-btn-group push>
              <q-btn
                v-if="loading"
                id="shepherd-1"
                push
                label="Generator Settings"
              />
              <ShopBuilder v-else ref="shopBuilderRef" />
              <q-separator vertical />
              <q-btn
                id="shepherd-2"
                push
                dense
                class="tw:p-2!"
                size="md"
                aria-label="Random shop"
                @click="shopBuilderRef.generateShop()"
              >
                <DiceIcon />
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Generate random shop
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
          <div class="tw:flex tw:shrink">
            <q-btn
              flat
              round
              dense
              class="tw:mr-2!"
              :icon="biEraser"
              size="md"
              padding="sm"
              aria-label="Clear activeFilters"
              @click="resetFilters"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Clear Filters
              </q-tooltip>
            </q-btn>
            <div>
              <q-select
                v-model="visibleColumns"
                multiple
                outlined
                dense
                options-dense
                display-value="Columns"
                emit-value
                map-options
                :options="Object.freeze(columns)"
                option-value="name"
                style="min-width: 100px"
              />
            </div>
            <q-btn
              flat
              round
              dense
              class="tw:ml-2! tw:p-3!"
              :icon="fullscreen ? biFullscreenExit : biFullscreen"
              size="sm"
              aria-label="Toggle fullscreen"
              @click="toggleFullscreen"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Fullscreen
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>
      <template #header-cell-source>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <KeepAlive>
                <q-select
                  v-model="activeFilters.source_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="Object.freeze(filters_store.itemFilters.sources)"
                  :label="columns[0]!.label"
                  :style="columns[0]!.style"
                  use-input
                  input-debounce="0"
                  virtual-scroll-item-size="32"
                  @filter="filterSourcesFn"
                />
              </KeepAlive>
            </div>
            <div class="col-shrink tw:mx-2"></div>
          </div>
        </q-th>
      </template>
      <template #header-cell-name>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-input
                v-model="activeFilters.name_filter"
                dense
                outlined
                :label="columns[1]!.label"
                :style="columns[1]!.style"
              />
            </div>
            <div class="col-shrink tw:mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort name column"
                @click="sort(columns[1]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-level>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columns[2]!.label"
                :style="columns[2]!.style"
                stack-label
              >
                <template #control>
                  {{ activeFilters.level_filter.min }} to
                  {{ activeFilters.level_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="activeFilters.level_filter"
                        label-always
                        :min="filters_store.shopRanges.min_level"
                        :max="filters_store.shopRanges.max_level"
                        style="min-width: 200px"
                        aria-label="Filter level"
                        role="menuitem"
                      />
                    </div>
                  </q-banner>
                </q-popup-proxy>
              </q-field>
            </div>
            <div class="col-shrink tw:mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort level column"
                @click="sort(columns[2]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-trait>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <KeepAlive>
                <q-select
                  v-model="activeFilters.trait_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="filters_store.itemFilters.traits"
                  :label="columns[3]!.label"
                  :style="columns[3]!.style"
                  map-options
                  emit-value
                  use-input
                  input-debounce="0"
                  virtual-scroll-item-size="32"
                  @filter="filterTraitsFn"
                />
              </KeepAlive>
            </div>
            <div class="col-shrink tw:mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort traits column"
                @click="sort(columns[3]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-rarity>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="activeFilters.rarity_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="
                  Object.freeze(['Common', 'Uncommon', 'Rare', 'Unique'])
                "
                :label="columns[4]!.label"
                :style="columns[4]!.style"
              />
            </div>
            <div class="col-shrink tw:mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort rarity column"
                @click="sort(columns[4]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-type>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="activeFilters.type_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="
                  Object.freeze([
                    'Armor',
                    'Consumable',
                    'Equipment',
                    'Shield',
                    'Weapon'
                  ])
                "
                :label="columns[5]!.label"
                :style="columns[5]!.style"
              />
            </div>
            <div class="col-shrink tw:mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort types column"
                @click="sort(columns[5]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-id>
        <q-th>
          <q-icon
            :name="biBasketFill"
            class="tw:mr-1 tw:text-gray-800! tw:dark:text-white!"
            size="sm"
          ></q-icon>
        </q-th>
      </template>
      <template #body-selection="selectedItem">
        <q-btn
          :props="selectedItem"
          round
          unelevated
          :icon="biBoxArrowUpRight"
          size="sm"
          aria-label="Open item sheet"
          target="_blank"
          @click="
            openSheet(
              router,
              'item',
              settings_store.game,
              selectedItem.row.core_item.id
            )
          "
        >
          <q-tooltip
            class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
            anchor="top middle"
            self="bottom middle"
          >
            Open item sheet
          </q-tooltip>
        </q-btn>
      </template>
      <template #body-cell-source="source">
        <q-td :props="source">
          <q-btn
            v-if="source.row.core_item.source"
            round
            unelevated
            :icon="biBook"
            size="sm"
            padding="sm"
            :href="
              'https://store.paizo.com/search.php?search_query=' +
              encodeURIComponent(source.row.core_item.source) +
              '&section=product'
            "
            target="_blank"
            rel="noopener"
            aria-label="Search source on Paizo store"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              <i class="tw:whitespace-nowrap">
                {{ source.row.core_item.source }}
              </i>
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #body-cell-name="name">
        <q-td :props="name">
          <div class="row items-center wrap">
            <q-icon
              v-if="
                items_store.selectedItem?.core_item &&
                name.row.core_item.id === items_store.selectedItem?.core_item.id
              "
              class="tw:mr-1 tw:align-middle"
              size="xs"
              :name="biCaretRight"
            />
            <a
              :href="
                'https://2e.' +
                getGameAonLink(settings_store.game) +
                '.com/search?q=' +
                encodeURIComponent(name.row.core_item.name) +
                '&type=eqs'
              "
              target="_blank"
              rel="noopener"
              class="tw:inline tw:align-middle"
            >
              <span
                class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400 tw:max-w-62.5 tw:whitespace-normal"
                >{{ name.row.core_item.name }}</span
              >
            </a>
            <q-chip
              v-if="
                settings_store.game === 'pf' &&
                settings_store.game_version === 'Any'
              "
              dense
              :color="name.row.core_item.remaster ? 'blue' : 'red-10'"
              text-color="white"
              class="tw:ml-1 tw:text-xs!"
              :label="name.row.core_item.remaster ? 'Remaster' : 'Legacy'"
            />
          </div>
        </q-td>
      </template>
      <template #body-cell-trait="trait">
        <q-td :props="trait">
          <span
            v-if="trait.row.core_item.traits"
            class="tw:block tw:max-w-62.5 tw:whitespace-normal"
          >
            {{
              trait.row.core_item.traits
                .map((t: { name: string; description: string }) => t.name)
                .map((trait: string) => {
                  return trait
                    .split("-")
                    .map(str => capitalize(str))
                    .join(" ");
                })
                .join(", ")
            }}
          </span>
        </q-td>
      </template>
      <template #body-cell-type="type">
        <q-td :props="type">
          <q-icon
            v-if="type.row.core_item.item_type === 'Armor'"
            :name="mdiTshirtCrew"
            size="sm"
            left
            class="tw:text-gray-800! tw:dark:text-white!"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Armor
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="type.row.core_item.item_type === 'Consumable'"
            :name="mdiFoodDrumstick"
            size="sm"
            left
            class="tw:text-gray-800! tw:dark:text-white!"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Consumable
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="type.row.core_item.item_type === 'Equipment'"
            :name="mdiRing"
            size="sm"
            left
            class="tw:text-gray-800! tw:dark:text-white!"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Equipment
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="type.row.core_item.item_type === 'Shield'"
            :name="mdiShield"
            size="sm"
            left
            class="tw:text-gray-800! tw:dark:text-white!"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Shield
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="type.row.core_item.item_type === 'Weapon'"
            :name="mdiSword"
            size="sm"
            left
            class="tw:text-gray-800! tw:dark:text-white!"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Weapon
            </q-tooltip>
          </q-icon>
        </q-td>
      </template>
      <template #body-cell-id="id">
        <q-td :props="id">
          <q-btn
            round
            unelevated
            :icon="biPlusLg"
            size="sm"
            class="tw:mr-1"
            aria-label="Open creature sheet"
            target="_blank"
            @click="addItem(id.row)"
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Add to shop
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #no-data>
        <div class="row flex-center q-gutter-sm">
          <q-icon size="2em" :name="matWarning" />
          <span> No item matches the current activeFilters </span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<style>
.sticky-header-table {
  .q-table__top {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  thead tr th {
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 4px;
    padding-bottom: 4px;
    position: sticky;
    z-index: 1;
    background-color: #ffffff;
    border-left: none;
    border-right: none;
    border-width: 1px;
    border-color: #e5e7eb;
  }

  thead tr:first-child th {
    top: 0;
  }

  td {
    border-bottom: none;
  }

  .q-table__bottom {
    border-color: #e5e7eb;
  }
}

.q-table--dark thead tr th {
  background-color: #1f2937;
  border-color: #374151;
}

tr:nth-child(even) {
  background-color: #f3f4f6 !important;
}

.q-table--dark td {
  border-bottom: none;
  border-color: #374151 !important;
}

.q-table--dark .q-table__bottom {
  border-color: #374151;
}
</style>

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
