<script setup lang="ts">
import { ref } from 'vue';
import { requestItems } from 'src/utils/shop-api-calls';
import type { item, min_item } from 'src/types/item';
import {
  biArrowDownUp,
  biBasketFill,
  biEraser,
  biPlusLg,
  biBoxArrowUpRight
} from '@quasar/extras/bootstrap-icons';
import { item_filters } from 'src/types/filters';
import { itemsStore, settingsStore } from 'src/stores/store';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash';
import { useRouter } from 'vue-router';
import ShopBuilder from 'src/components/Shop/ShopTable/ShopBuilder.vue';
import { fasDrumstickBite, fasRing } from '@quasar/extras/fontawesome-v6';
import SkeletonTable from 'src/components/Shop/SkeletonTable.vue';

const $q = useQuasar();
const settings = settingsStore();
const items = itemsStore();

const skeleton = ref(true);

const shopBuilderRef = ref();
const router = useRouter();

const itemTable = ref();
const rows = ref<item[]>([]);
const loading = ref(false);
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0
});

const filters = ref<item_filters>({
  name: '',
  level: { min: 0, max: 25 },
  type: null,
  sort_by: 'name',
  order_by: 'ascending'
});

const columns: {
  name: 'name' | 'id' | 'level' | 'type';
  label: string;
  field: (row: item) => string | number | string[];
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  style?: string;
}[] = [
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
    required: true,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  },
  {
    name: 'type',
    label: 'Type',
    field: (row) => row.core_item.item_type,
    required: true,
    align: 'center',
    sortable: true,
    style: 'min-width: 100px; max-width: 140px;'
  },
  {
    name: 'id',
    label: '',
    field: (row) => row.core_item.id,
    required: true,
    align: 'center',
    sortable: false
  }
];

const fetchFromServer = debounce(async function (startRow: number, rowsPerPage: number) {
  try {
    const request = await requestItems(startRow, rowsPerPage, filters.value, settings.getPfVersion);
    if (request) {
      pagination.value.rowsNumber = request.total;
      rows.value = request.results;
      skeleton.value = false;
    } else {
      throw new Error('Error loading items');
    }
  } catch (error) {
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

  // calculate starting row of data
  const startRow = (page - 1) * rowsPerPage;

  // don't forget to update local pagination object
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  // fetch data from "server"
  await fetchFromServer(startRow, pagination.value.rowsPerPage);

  // ...and turn of loading indicator
  loading.value = false;
}

const resetFilters = () => {
  filters.value = {
    name: '',
    level: { min: 0, max: 25 },
    type: null,
    sort_by: 'name',
    order_by: 'ascending'
  };
};

const sort = (col: 'name' | 'id' | 'level' | 'type') => {
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

const openItemSheet = (id: number) => {
  const routeData = router.resolve({ name: 'item', query: { id: id } });
  window.open(routeData.href, '_blank');
};

const addItem = debounce(function (item: item) {
  const min_item: min_item = {
    id: item.core_item.id,
    archive_link: '', // TODO: item.core_item.archive_link,
    name: item.core_item.name,
    level: item.core_item.level,
    type: item.core_item.item_type,
    price: item.core_item.price
  };
  items.addToShop(min_item);
}, 50);

await fetchFromServer(0, 100);
</script>

<template>
  <SkeletonTable v-if="skeleton" />
  <div v-else class="tw-w-full q-pa-md md:tw-w-[40%] only-screen">
    <q-table
      ref="itemTable"
      class="sticky-header-table tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: calc(100vh - 135px)"
      flat
      bordered
      :rows="rows"
      :columns="columns"
      virtual-scroll
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filters"
      rows-per-page-label="Items per page:"
      :rows-per-page-options="[50, 100, 0]"
      no-data-label="No item matches the current filters"
      @request="onRequest"
      @row-click="(_, row) => items.setSelectedItem(row)"
      id="v-step-0"
      table-header-class="v-step-3"
    >
      <template v-slot:top>
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
                push
                dense
                class="tw-p-2"
                size="md"
                aria-label="Random shop"
                @click="shopBuilderRef.generateShop()"
                id="v-step-2"
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
              rounded
              dense
              class="tw-p-2"
              :icon="biEraser"
              size="md"
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
          </div>
        </div>
      </template>
      <template v-slot:header-cell-name>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-input
                dense
                outlined
                v-model="filters.name"
                :label="columns[0].label"
                :style="columns[0].style"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                :icon="biArrowDownUp"
                aria-label="Sort name column"
                @click="sort(columns[0].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-level>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columns[1].label"
                :style="columns[1].style"
                stack-label
              >
                <template v-slot:control>
                  {{ filters.level.min }} to {{ filters.level.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw-pt-8 tw-px-1">
                      <q-range
                        v-model="filters.level"
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
                rounded
                dense
                size="xs"
                class="tw-p-2"
                :icon="biArrowDownUp"
                aria-label="Sort level column"
                @click="sort(columns[1].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-type>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                options-dense
                v-model="filters.type"
                :options="Object.freeze(['Consumable', 'Equipment'])"
                :label="columns[2].label"
                :style="columns[2].style"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                :icon="biArrowDownUp"
                aria-label="Sort types column"
                @click="sort(columns[2].name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-id>
        <q-th>
          <q-icon :name="biBasketFill" class="tw-mr-1" size="sm"></q-icon>
        </q-th>
      </template>
      <template v-slot:body-cell-name="name">
        <q-td :props="name">
          <q-btn
            round
            unelevated
            :icon="biBoxArrowUpRight"
            size="sm"
            class="tw-mr-1"
            @click="openItemSheet(name.row.core_item.id)"
            target="_blank"
            aria-label="Open item sheet"
          >
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Open item sheet
            </q-tooltip>
          </q-btn>
          <a
            v-if="name.row.core_item.archive_link"
            :href="name.row.core_item.archive_link"
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
        </q-td>
      </template>
      <template v-slot:body-cell-type="type">
        <q-td :props="type">
          <q-icon
            v-if="type.row.core_item.item_type === 'Consumable'"
            :name="fasDrumstickBite"
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
            :name="fasRing"
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
        </q-td>
      </template>
      <template v-slot:body-cell-id="id">
        <q-td :props="id">
          <q-btn
            round
            unelevated
            :icon="biPlusLg"
            size="sm"
            class="tw-mr-1"
            @click="addItem(id.row)"
            target="_blank"
            aria-label="Open creature sheet"
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

.q-table--dark tr:nth-child(even) {
  background-color: #374151 !important;
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
