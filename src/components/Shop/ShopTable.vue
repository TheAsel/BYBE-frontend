<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { requestItems, requestSources } from 'src/utils/shop-api-calls';
import type { item, min_item } from 'src/types/item';
import {
  biArrowDownUp,
  biBasketFill,
  biEraser,
  biPlusLg,
  biBoxArrowUpRight,
  biCaretRight,
  biBook,
  biFullscreen,
  biFullscreenExit
} from '@quasar/extras/bootstrap-icons';
import { item_columns, item_filters, rarities } from 'src/types/filters';
import { itemsStore, settingsStore } from 'src/stores/store';
import { useQuasar } from 'quasar';
import { matPriorityHigh, matWarning } from '@quasar/extras/material-icons';
import { debounce } from 'lodash-es';
import { useRouter } from 'vue-router';
import ShopBuilder from 'src/components/Shop/ShopTable/ShopBuilder.vue';
import {
  mdiSword,
  mdiShield,
  mdiFoodDrumstick,
  mdiRing,
  mdiTshirtCrew
} from '@quasar/extras/mdi-v7';
import SkeletonTable from 'src/components/Shop/SkeletonTable.vue';

const $q = useQuasar();
const settings = settingsStore();
const items = itemsStore();

const skeleton = ref(true);

const shopBuilderRef = ref();
const router = useRouter();

const itemTable = ref();
const navigationActive = ref(false);
const selected = ref<item[]>([]);
const keyDown = ref(false);
const rows = ref<item[]>([]);
const loading = ref(false);
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0
});
const sources = ref<string[]>();
const filters = ref<{
  name_filter: string;
  level_filter: { min: number; max: number };
  rarity_filter: rarities[];
  type_filter: string[];
  source_filter: string[];
  sort_by: item_columns;
  order_by: 'ascending' | 'descending';
}>({
  name_filter: '',
  level_filter: { min: 0, max: 25 },
  rarity_filter: [],
  type_filter: [],
  source_filter: [],
  sort_by: 'name',
  order_by: 'ascending'
});
const fullscreen = ref(false);
const tableHeight = ref('height: calc(100vh - 122px)');
const sourcesOptions = ref(['']);

const columns: {
  name: item_columns;
  label: string;
  field: (row: item) => string | number | string[];
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  style?: string;
}[] = [
  {
    name: 'source',
    label: 'Source',
    field: (row) => row.core_item.source,
    required: false,
    align: 'center',
    sortable: true,
    style: 'min-width: 120px; max-width: 120px;'
  },
  {
    name: 'name',
    label: 'Name',
    field: (row) => row.core_item.name,
    required: true,
    align: 'left',
    sortable: true,
    style: 'min-width: 215px;'
  },
  {
    name: 'level',
    label: 'Level',
    field: (row) => row.core_item.level,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  },
  {
    name: 'rarity',
    label: 'Rarity',
    field: (row) => row.core_item.rarity,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 180px;'
  },
  {
    name: 'type',
    label: 'Type',
    field: (row) => row.core_item.item_type,
    required: false,
    align: 'center',
    sortable: true,
    style: 'min-width: 100px; max-width: 180px;'
  },

  {
    name: 'id',
    label: 'Shop',
    field: (row) => row.core_item.id,
    required: true,
    align: 'center',
    sortable: false
  }
];

const fetchFromServer = debounce(async function (startRow: number, rowsPerPage: number) {
  const body: item_filters = {
    min_level_filter: filters.value.level_filter.min,
    max_level_filter: filters.value.level_filter.max,
    pathfinder_version: settings.getPfVersion
  };
  if (filters.value.name_filter != '') {
    body.name_filter = filters.value.name_filter;
  }
  if (filters.value.rarity_filter != undefined && filters.value.rarity_filter.length > 0) {
    body.rarity_filter = filters.value.rarity_filter;
  }
  if (filters.value.type_filter != undefined && filters.value.type_filter.length > 0) {
    body.type_filter = filters.value.type_filter;
  }
  if (filters.value.source_filter != undefined && filters.value.source_filter.length > 0) {
    body.source_filter = filters.value.source_filter;
  }
  try {
    const request = await requestItems(
      startRow,
      rowsPerPage,
      filters.value.sort_by,
      filters.value.order_by,
      body
    );
    if (request) {
      pagination.value.rowsNumber = request.total;
      rows.value = request.results;
      skeleton.value = false;
      loading.value = false;
    } else {
      throw new Error('Error loading items');
    }
  } catch (error) {
    skeleton.value = true;
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error loading the items',
      icon: matPriorityHigh
    });
  }
}, 300);

async function onRequest(props) {
  const { page, rowsPerPage } = props.pagination;

  loading.value = true;

  const startRow = (page - 1) * rowsPerPage;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  await fetchFromServer(startRow, pagination.value.rowsPerPage);
}

const resetFilters = () => {
  filters.value = {
    name_filter: '',
    level_filter: { min: 0, max: 25 },
    rarity_filter: [],
    type_filter: [],
    source_filter: [],
    sort_by: 'name',
    order_by: 'ascending'
  };
};

const visibleColumns = ref(['name', 'level', 'type', 'id']);

const sort = (col: item_columns) => {
  if (filters.value.sort_by === col) {
    if (filters.value.order_by === 'ascending') {
      filters.value.order_by = 'descending';
    } else {
      filters.value.order_by = 'ascending';
    }
  } else {
    filters.value.order_by = 'ascending';
    filters.value.sort_by = col;
  }
};

const openShopSheet = (id: number) => {
  const routeData = router.resolve({ name: 'item', query: { id: id } });
  window.open(routeData.href, '_blank');
};

const addItem = debounce(function (item: item) {
  const min_item: min_item = {
    id: item.core_item.id,
    archive_link: 'https://2e.aonprd.com/Search.aspx?q=' + encodeURIComponent(item.core_item.name), // TODO: item.core_item.archive_link,
    name: item.core_item.name,
    level: item.core_item.level,
    type: item.core_item.item_type,
    price: item.core_item.price,
    quantity: item.core_item.quantity
  };
  items.addToShop(min_item);
}, 50);

const activateNavigation = () => {
  navigationActive.value = true;
};

const deactivateNavigation = () => {
  navigationActive.value = false;
};

async function onKey(evt) {
  if (
    navigationActive.value !== true ||
    [13, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(evt.keyCode) === -1 ||
    itemTable.value === null ||
    loading.value === true ||
    keyDown.value === true
  ) {
    return;
  }

  evt.preventDefault();

  const { computedRowsNumber, computedRows } = itemTable.value;

  if (computedRows.length === 0) {
    return;
  }

  const currentIndex =
    selected.value.length > 0 ? computedRows.indexOf(toRaw(selected.value[0])) : -1;
  const currentPage = pagination.value.page;
  const rowsPerPage =
    pagination.value.rowsPerPage === 0 ? computedRowsNumber : pagination.value.rowsPerPage;
  const lastIndex = computedRows.length - 1;
  const lastPage = Math.ceil(computedRowsNumber / rowsPerPage);

  let index = currentIndex;
  let page = currentPage;

  switch (evt.keyCode) {
    case 13: // Enter
      addItem(selected.value[0]);
      break;
    case 33: // PageUp
      index = 0;
      selected.value = [computedRows[index]];
      items.setSelectedItem(selected.value[0]);
      itemTable.value.scrollTo(index);
      break;
    case 34: // PageDown
      index = rowsPerPage - 1;
      selected.value = [computedRows[Math.min(index, computedRows.length - 1)]];
      items.setSelectedItem(selected.value[0]);
      itemTable.value.scrollTo(index);
      break;
    case 36: // Home
      index = 0;
      await itemTable.value.firstPage();
      keyDown.value = true;
      setTimeout(() => {
        const { computedRows } = itemTable.value;
        selected.value = [computedRows[index]];
        items.setSelectedItem(selected.value[0]);
        keyDown.value = false;
        itemTable.value.scrollTo(index);
      }, 1000);
      break;
    case 35: // End
      index = rowsPerPage - 1;
      await itemTable.value.lastPage();
      keyDown.value = true;
      setTimeout(() => {
        const { computedRows } = itemTable.value;
        selected.value = [computedRows[Math.min(index, computedRows.length - 1)]];
        items.setSelectedItem(selected.value[0]);
        keyDown.value = false;
        itemTable.value.scrollTo(index - 1);
      }, 1000);
      break;
    case 37: // ArrowLeft
      page = currentPage <= 1 ? lastPage : currentPage - 1;
      index = 0;
      if (page === lastPage) {
        itemTable.value.lastPage();
      } else {
        itemTable.value.prevPage();
      }
      keyDown.value = true;
      setTimeout(() => {
        const { computedRows } = itemTable.value;
        selected.value = [computedRows[index]];
        items.setSelectedItem(selected.value[0]);
        keyDown.value = false;
        itemTable.value.scrollTo(index);
      }, 1000);
      break;
    case 38: // ArrowUp
      if (currentIndex > 0) {
        index = currentIndex - 1;
        selected.value = [computedRows[index]];
        items.setSelectedItem(selected.value[0]);
      }
      itemTable.value.scrollTo(index - 1);
      break;
    case 39: // ArrowRight
      page = currentPage >= lastPage ? 1 : currentPage + 1;
      index = 0;
      if (page === 1) {
        itemTable.value.firstPage();
      } else {
        itemTable.value.nextPage();
      }
      keyDown.value = true;
      setTimeout(() => {
        const { computedRows } = itemTable.value;
        selected.value = [computedRows[index]];
        items.setSelectedItem(selected.value[0]);
        keyDown.value = false;
        itemTable.value.scrollTo(index);
      }, 1000);
      break;
    case 40: // ArrowDown
      if (currentIndex < lastIndex) {
        index = currentIndex + 1;
        selected.value = [computedRows[index]];
        items.setSelectedItem(selected.value[0]);
      }
      itemTable.value.scrollTo(index);
      break;
  }
}

await fetchFromServer(0, 100);

try {
  const request = await requestSources();
  if (request) {
    sources.value = request.sort();
    sourcesOptions.value = sources.value;
  } else {
    throw new Error('Error fetching sources');
  }
} catch (error) {
  console.error(error);
}

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value;
  if (fullscreen.value) {
    tableHeight.value = 'height: 100%; opacity: 1';
  } else {
    tableHeight.value = 'height: calc(100vh - 122px)';
  }
};

const filterSourcesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    sources.value = sourcesOptions.value.filter((v) => v.toLowerCase().indexOf(filter) > -1);
  });
};
</script>

<template>
  <SkeletonTable v-if="skeleton" />
  <div v-else class="tw-w-full q-pa-md md:tw-w-[46%] only-screen">
    <q-table
      id="v-step-0"
      ref="itemTable"
      v-model:pagination="pagination"
      class="sticky-header-table tw-opacity-85 dark:tw-opacity-90 tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
      :style="tableHeight"
      color="primary"
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :visible-columns="visibleColumns"
      virtual-scroll
      virtual-scroll-sticky-size-start="50"
      virtual-scroll-sticky-size-end="50"
      :loading="loading"
      :filter="filters"
      rows-per-page-label="Items per page:"
      :rows-per-page-options="[50, 100, 0]"
      table-header-class="v-step-3"
      row-key="id"
      selection="single"
      :fullscreen="fullscreen"
      @request="onRequest"
      @row-click="
        (_, row: item) => {
          items.setSelectedItem(row);
          selected = [row];
        }
      "
      @focusin="activateNavigation"
      @focusout="deactivateNavigation"
      @keydown="onKey"
    >
      <template #loading>
        <q-inner-loading showing style="z-index: 2">
          <q-spinner-gears class="tw-mx-auto tw-text-black dark:tw-text-white" size="5em" />
        </q-inner-loading>
      </template>
      <template #top>
        <div class="tw-flex tw-flex-grow tw-flex-wrap tw-gap-2 tw-justify-center">
          <div class="tw-flex tw-flex-shrink">
            <h1 class="text-h6 tw-my-auto font-bold tw-text-gray-800 dark:tw-text-gray-200">
              Items
            </h1>
          </div>
          <div class="tw-flex tw-flex-grow tw-justify-center">
            <q-btn-group push>
              <ShopBuilder ref="shopBuilderRef" />
              <q-separator vertical />
              <q-btn
                id="v-step-2"
                push
                dense
                class="tw-p-2"
                size="md"
                aria-label="Random shop"
                @click="shopBuilderRef.generateShop()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 512.021 512.021"
                  fill="currentColor"
                  aria-label="D20 dice"
                >
                  <path
                    d="M490.421,137.707c-0.085-1.003-0.149-2.005-0.555-2.987c-0.107-0.256-0.32-0.427-0.448-0.683
			                 c-0.277-0.533-0.597-0.981-0.96-1.472c-0.725-1.003-1.536-1.835-2.517-2.517c-0.256-0.171-0.363-0.491-0.64-0.64l-224-128
			                 c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-0.256,0.171-0.363,0.469-0.619,0.64c-1.024,0.704-1.899,1.557-2.645,2.624
			                 c-0.299,0.427-0.597,0.811-0.832,1.28c-0.149,0.277-0.384,0.469-0.512,0.768c-0.469,1.173-0.619,2.389-0.661,3.584
			                 c0,0.128-0.107,0.256-0.107,0.384v0.171c0,0.021,0,0.021,0,0.043v234.304c0,0.021,0,0.064,0,0.085v0.064
			                 c0,0.213,0.149,0.405,0.171,0.619c0.085,1.493,0.32,2.987,1.045,4.352c0.043,0.085,0.128,0.107,0.171,0.192
			                 c0.277,0.491,0.768,0.811,1.131,1.259c0.789,0.981,1.557,1.941,2.603,2.603c0.107,0.064,0.149,0.192,0.235,0.235l224,128
			                 c1.664,0.939,3.477,1.408,5.312,1.408s3.648-0.469,5.291-1.408l224-128c0.107-0.064,0.149-0.192,0.256-0.256
			                 c0.981-0.597,1.664-1.493,2.411-2.389c0.427-0.512,1.003-0.896,1.323-1.472c0.043-0.064,0.107-0.107,0.149-0.171
			                 c0.576-1.109,0.683-2.325,0.853-3.52c0.064-0.491,0.384-0.939,0.384-1.451V138.688
			                 C490.677,138.347,490.443,138.048,490.421,137.707z M455.52,136.981l-78.251,31.296L291.211,43.093L455.52,136.981z
			                 M256.011,29.504l97.067,141.184H158.944L256.011,29.504z M220.747,43.115l-86.037,125.163L56.48,136.981L220.747,43.115z
			                 M42.677,154.432l80.768,32.32L42.677,332.16V154.432z M138.635,203.392l98.325,178.773L49.248,364.288L138.635,203.392z
			                 M245.344,482.965l-165.12-94.336l165.12,15.573V482.965z M256.011,372.544l-99.285-180.523h198.571L256.011,372.544z
			                 M266.677,482.965v-78.571l165.035-15.723L266.677,482.965z M274.997,382.357l98.411-178.901l89.365,160.853L274.997,382.357z
			                 M469.344,332.203l-80.811-145.451l80.811-32.32V332.203z"
                  />
                </svg>
                <q-tooltip
                  class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Generate random shop
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
          <div class="tw-flex tw-flex-shrink">
            <q-btn
              flat
              round
              dense
              class="tw-mr-2"
              :icon="biEraser"
              size="md"
              padding="sm"
              aria-label="Clear filters"
              @click="resetFilters"
            >
              <q-tooltip
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
                display-value="Display columns"
                emit-value
                map-options
                :options="Object.freeze(columns)"
                option-value="name"
                style="min-width: 150px"
              />
            </div>
            <q-btn
              flat
              round
              dense
              class="tw-ml-2 !tw-p-3"
              :icon="fullscreen ? biFullscreenExit : biFullscreen"
              size="sm"
              aria-label="Toggle fullscreen"
              @click="toggleFullscreen"
            />
          </div>
        </div>
      </template>
      <template #header-cell-source>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="filters.source_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(sources)"
                :label="columns[0].label"
                :style="columns[0].style"
                use-input
                input-debounce="0"
                @filter="filterSourcesFn"
              />
            </div>
            <div class="col-shrink tw-mx-2"></div>
          </div>
        </q-th>
      </template>
      <template #header-cell-name>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-input
                v-model="filters.name_filter"
                dense
                outlined
                :label="columns[1].label"
                :style="columns[1].style"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort name column"
                @click="sort(columns[1].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-level>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columns[2].label"
                :style="columns[2].style"
                stack-label
              >
                <template #control>
                  {{ filters.level_filter.min }} to {{ filters.level_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw-pt-8 tw-px-1">
                      <q-range
                        v-model="filters.level_filter"
                        label-always
                        :min="0"
                        :max="25"
                        style="min-width: 200px"
                        aria-label="Filter level"
                        role="menuitem"
                      />
                    </div>
                  </q-banner>
                </q-popup-proxy>
              </q-field>
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort level column"
                @click="sort(columns[2].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-rarity>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="filters.rarity_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(['Common', 'Uncommon', 'Rare', 'Unique'])"
                :label="columns[3].label"
                :style="columns[3].style"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort rarity column"
                @click="sort(columns[3].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-type>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="filters.type_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(['Armor', 'Consumable', 'Equipment', 'Shield', 'Weapon'])"
                :label="columns[4].label"
                :style="columns[4].style"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort types column"
                @click="sort(columns[4].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-id>
        <q-th>
          <q-icon :name="biBasketFill" class="tw-mr-1" size="sm"></q-icon>
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
          @click="openShopSheet(selectedItem.row.core_item.id)"
        >
          <q-tooltip
            class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
              'https://paizo.com/search?q=' +
              encodeURIComponent(source.row.core_item.source) +
              '&what=products&includeUnrated=true&includeUnavailable=true'
            "
            target="_blank"
            rel="noopener"
            aria-label="Search source on Paizo store"
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              <i class="tw-whitespace-nowrap">
                {{ source.row.core_item.source }}
              </i>
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #body-cell-name="name">
        <q-td :props="name">
          <q-icon
            v-if="
              items.getSelectedItem?.core_item &&
              name.row.core_item.id === items.getSelectedItem?.core_item.id
            "
            class="tw-mr-1 tw-align-middle"
            size="xs"
            :name="biCaretRight"
          />
          <a
            v-if="settings.getAonLinks"
            :href="
              'https://2e.aonprd.com/Search.aspx?q=' + encodeURIComponent(name.row.core_item.name)
            "
            target="_blank"
            rel="noopener"
            class="tw-inline tw-align-middle"
          >
            <span
              class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400 tw-max-w-[250px] tw-whitespace-normal"
              >{{ name.row.core_item.name }}</span
            >
          </a>
          <span v-else class="tw-align-middle">{{ name.row.core_item.name }}</span>
          <q-chip
            v-if="name.row.core_item.remaster && settings.getPfVersion === 'Any'"
            dense
            color="blue"
            text-color="white"
            class="tw-ml-1 tw-text-xs"
            label="Remaster"
          />
          <q-chip
            v-if="!name.row.core_item.remaster && settings.getPfVersion === 'Any'"
            dense
            color="red-10"
            text-color="white"
            class="tw-ml-1 tw-text-xs"
            label="Legacy"
          />
        </q-td>
      </template>
      <template #body-cell-type="type">
        <q-td :props="type">
          <q-icon
            v-if="type.row.core_item.item_type === 'Armor'"
            :name="mdiTshirtCrew"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Equipment
            </q-tooltip>
          </q-icon>
          <q-icon v-if="type.row.core_item.item_type === 'Shield'" :name="mdiShield" size="sm" left>
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Shield
            </q-tooltip>
          </q-icon>
          <q-icon v-if="type.row.core_item.item_type === 'Weapon'" :name="mdiSword" size="sm" left>
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
            class="tw-mr-1"
            aria-label="Open creature sheet"
            target="_blank"
            @click="addItem(id.row)"
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
          <span> No item matches the current filters </span>
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
