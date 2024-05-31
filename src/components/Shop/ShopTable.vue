<script setup lang="ts">
import { ref } from 'vue';
import { requestItems } from 'src/utils/shop-api-calls';
import type { item } from 'src/types/item';
import { biArrowDownUp, biEraser } from '@quasar/extras/bootstrap-icons';
import { itemFilters } from 'src/types/filters';
import { settingsStore } from 'src/stores/store';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash';

const $q = useQuasar();
const settings = settingsStore();

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

const filters = ref<itemFilters>({
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
    style: 'min-width: 225px;'
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
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 140px;'
  }
];

const fetchFromServer = debounce(async function (startRow: number, rowsPerPage: number) {
  try {
    const items = await requestItems(startRow, rowsPerPage, filters.value, settings.getPfVersion);
    if (items) {
      pagination.value.rowsNumber = items.total;
      rows.value = items.results;
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

await fetchFromServer(0, 100);
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-[35%]">
    <q-table
      ref="itemTable"
      class="sticky-header-table tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: calc(100vh - 135px)"
      flat
      bordered
      title="Items"
      :rows="rows"
      :columns="columns"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filters"
      rows-per-page-label="Items per page:"
      :rows-per-page-options="[50, 100, 0]"
      no-data-label="No item matches the current filters"
      @request="onRequest"
    >
      <template v-slot:top>
        <div class="tw-flex tw-flex-grow tw-flex-wrap tw-gap-2 tw-justify-center">
          <div class="tw-flex tw-flex-shrink">
            <h1 class="text-h6 tw-my-auto font-bold tw-text-gray-800 dark:tw-text-gray-200">
              Items
            </h1>
          </div>
          <q-space />
          <div class="tw-flex tw-flex-shrink">
            <q-btn
              flat
              rounded
              dense
              class="tw-mx-2 tw-p-2"
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
