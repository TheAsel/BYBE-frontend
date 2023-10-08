<script setup lang="ts">
import { ref, computed } from 'vue';
import PartyBuilder from './PartyBuilder.vue';
import EncounterBuilder from './EncounterBuilder.vue';

const columns: {
  name: string;
  label: string;
  field: string | ((row: number | string) => number | string);
  required?: boolean | undefined;
  align?: 'left' | 'right' | 'center' | undefined;
  sortable?: boolean | undefined;
}[] = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    required: true,
    align: 'left',
    sortable: true
  },
  {
    name: 'level',
    label: 'Level',
    field: 'level',
    required: false,
    align: 'left',
    sortable: true
  },
  {
    name: 'hp',
    label: 'HP',
    field: 'hp',
    required: false,
    align: 'left',
    sortable: true
  },
  {
    name: 'family',
    label: 'Family',
    field: 'family',
    required: false,
    align: 'left',
    sortable: true
  },
  {
    name: 'alignment',
    label: 'Alignment',
    field: 'alignment',
    required: false,
    align: 'left',
    sortable: true
  },
  {
    name: 'size',
    label: 'Size',
    field: 'size',
    required: false,
    align: 'left',
    sortable: true
  },
  {
    name: 'rarity',
    label: 'Rarity',
    field: 'rarity',
    required: false,
    align: 'left',
    sortable: true
  }
];

const rows = [
  {
    id: 138,
    name: 'Ancient Red Dragon',
    level: 19,
    hp: 425,
    family: 'Dragon, Red',
    alignment: 'CE',
    size: 'Huge',
    rarity: 'Uncommon'
  },
  {
    id: 272,
    name: 'Kobold Warrior',
    level: -1,
    hp: 8,
    family: 'Kobold',
    alignment: 'LE',
    size: 'Small',
    rarity: 'Common'
  },
  {
    id: 490,
    name: 'Tarrasque',
    level: 25,
    hp: 540,
    family: 'Spawn of Rovagug',
    alignment: 'CE',
    size: 'Gargantuan',
    rarity: 'Unique'
  }
];

const creatureTable = ref();

const visibleColumns = ref(['level', 'hp', 'family', 'alignment', 'size', 'rarity']);

const filterName = ref('');

const levelRange = ref({ min: -1, max: 25 });

const hpRange = ref({ min: 0, max: 600 });

const families = ['Dragon, Red', 'Kobold', 'Spawn of Rovagug'];
const filterFamily = ref('');

const alignments = ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE', 'Any', 'No Alignment'];
const filterAlignment = ref('');

const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const filterSize = ref('');

const rarities = ['Common', 'Uncommon', 'Rare', 'Unique'];
const filterRarity = ref('');

const combineFilters = computed(() => {
  let filteredItems = rows;
  let filteredNames = filteredItems.filter((out) => {
    if (filterName.value && filterName.value.length) {
      console.log('hei');
      return out.name.toLowerCase().includes(filterName.value.toLowerCase());
    }
    return out;
  });
  let filteredLevel = filteredNames.filter((out) => {
    if (levelRange.value.max < 25 || levelRange.value.min > -1) {
      return out.level <= levelRange.value.max && out.level >= levelRange.value.min;
    }
    return out;
  });
  let filteredHp = filteredLevel.filter((out) => {
    if (hpRange.value.max < 600 || hpRange.value.min > 0) {
      return out.hp <= hpRange.value.max && out.hp >= hpRange.value.min;
    }
    return out;
  });
  let filteredFamily = filteredHp.filter((out) => {
    if (filterFamily.value && filterFamily.value.length) {
      return out.family.includes(filterFamily.value);
    }
    return out;
  });
  let filteredAlignment = filteredFamily.filter((out) => {
    if (filterAlignment.value && filterAlignment.value.length) {
      return out.alignment.includes(filterAlignment.value);
    }
    return out;
  });
  let filteredSize = filteredAlignment.filter((out) => {
    if (filterSize.value && filterSize.value.length) {
      return out.size.includes(filterSize.value);
    }
    return out;
  });
  let filteredRarity = filteredSize.filter((out) => {
    if (filterRarity.value && filterRarity.value.length) {
      return out.rarity.includes(filterRarity.value);
    }
    return out;
  });
  return filteredRarity;
});

const resetFilters = () => {
  filterName.value = '';
  levelRange.value.min = -1;
  levelRange.value.max = 25;
  hpRange.value.min = 0;
  hpRange.value.max = 600;
  filterFamily.value = '';
  filterAlignment.value = '';
  filterSize.value = '';
  filterRarity.value = '';
};

const sort = (col: string) => {
  creatureTable.value.sort(col);
};

const addCreature = (row: Array<string | number>) => {
  console.log(row);
};
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-3/4">
    <q-table
      ref="creatureTable"
      class="sticky-header-table tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-slate-900 dark:tw-border-gray-700"
      style="height: 80vh"
      flat
      bordered
      title="Creatures"
      :rows="combineFilters"
      :columns="columns"
      row-key="name"
      :pagination="{ rowsPerPage: 0 }"
      :rows-per-page-options="[0]"
      :visible-columns="visibleColumns"
      virtual-scroll
      dense
      no-data-label="No creature matches the current filters"
      @row-click="(_, row) => addCreature(row)"
    >
      <template v-slot:top>
        <q-item-label class="text-h6 font-bold tw-text-gray-800 dark:tw-text-gray-200"
          >Creatures</q-item-label
        >
        <q-space />
        <PartyBuilder />
        <q-separator vertical inset class="tw-mx-4" />
        <EncounterBuilder />
        <q-space />
        <q-btn
          flat
          rounded
          dense
          class="tw-mx-2 tw-p-2"
          icon="bi-eraser"
          size="md"
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

        <q-select
          v-model="visibleColumns"
          multiple
          outlined
          dense
          options-dense
          display-value="Show\Hide columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          style="min-width: 150px"
        />
      </template>
      <template v-slot:body-cell-name="name">
        <q-td :props="name">
          <a :href="'https://2e.aonprd.com/Monsters.aspx?ID=' + name.row.id" target="_blank">
            <span
              class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-500"
              >{{ name.value }}</span
            >
          </a>
        </q-td>
      </template>
      <template v-slot:header-cell-name>
        <q-th>
          <div
            style="min-width: 245px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-input dense outlined v-model="filterName" label="Name" />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                icon="bi-arrow-down-up"
                @click="sort('name')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-level>
        <q-th>
          <div
            style="min-width: 110px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                label="Level"
                style="min-width: 80px; width: auto"
                stack-label
              >
                <template v-slot:control> {{ levelRange.min }} to {{ levelRange.max }} </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw-pt-8 tw-px-1">
                      <q-range
                        v-model="levelRange"
                        label-always
                        :min="-1"
                        :max="25"
                        style="min-width: 200px"
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
                icon="bi-arrow-down-up"
                @click="sort('level')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-hp>
        <q-th>
          <div
            style="min-width: 130px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-field dense outlined label="HP" style="min-width: 100px" stack-label>
                <template v-slot:control> {{ hpRange.min }} to {{ hpRange.max }} </template>
                <q-popup-proxy>
                  <q-banner rounded style="min-width: 300px">
                    <div class="tw-pt-8 tw-px-1">
                      <q-range
                        v-model="hpRange"
                        label-always
                        :min="0"
                        :max="600"
                        style="min-width: 200px"
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
                icon="bi-arrow-down-up"
                @click="sort('hp')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-family>
        <q-th>
          <div
            style="min-width: 190px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                options-dense
                v-model="filterFamily"
                :options="families"
                label="Family"
                style="min-width: 160px"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                icon="bi-arrow-down-up"
                @click="sort('family')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-alignment>
        <q-th>
          <div
            style="min-width: 170px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                options-dense
                v-model="filterAlignment"
                :options="alignments"
                label="Alignments"
                style="min-width: 140px"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                icon="bi-arrow-down-up"
                @click="sort('alignment')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-size>
        <q-th>
          <div
            style="min-width: 150px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                options-dense
                v-model="filterSize"
                :options="sizes"
                label="Size"
                style="min-width: 120px"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                icon="bi-arrow-down-up"
                @click="sort('size')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-rarity>
        <q-th>
          <div style="min-width: 165px" class="row no-wrap items-center">
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                options-dense
                v-model="filterRarity"
                :options="rarities"
                label="Rarity"
                style="min-width: 135px"
              />
            </div>
            <div class="col-shrink tw-mx-2">
              <q-btn
                flat
                rounded
                dense
                size="xs"
                class="tw-p-2"
                icon="bi-arrow-down-up"
                @click="sort('rarity')"
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
  height: 310px;

  td {
    border-bottom: none;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
    border-left: none;
    border-right: none;
    border-width: 1px;
    border-color: #e5e7eb;
  }

  tr:nth-child(even) {
    background-color: #f3f4f6 !important;
  }

  thead tr:first-child th {
    top: 0;
  }

  &.q-table--loading thead tr:last-child th {
    top: 48px;
  }

  tbody {
    scroll-margin-top: 48px;
  }
}

.q-table--dark .q-table__top {
  background-color: #1f2937;
}

.q-table--dark .q-table__middle {
  background-color: #1f2937;
}

.q-table--dark .q-table__bottom {
  background-color: #1f2937;
}

.q-table--dark thead tr th {
  background-color: #1f2937;
  border-width: 1px;
  border-color: #374151;
}

.q-table--dark tr:nth-child(even) {
  background-color: #374151 !important;
}

.q-table--dark td {
  border-bottom: none;
}
</style>
