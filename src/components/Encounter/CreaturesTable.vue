<script setup lang="ts">
import { ref, computed } from 'vue';
import { matArrowDropDown, matCancel, matWarning } from '@quasar/extras/material-icons';
import { biEraser, biArrowDownUp } from '@quasar/extras/bootstrap-icons';
import debounce from 'lodash/debounce';
import { creature } from 'src/types/creature';
import { filtersStore, creaturesStore, encounterStore } from 'stores/store';
import PartyBuilder from 'src/components/Encounter/CreaturesTable/PartyBuilder.vue';
import EncounterBuilder from 'src/components/Encounter/CreaturesTable/EncounterBuilder.vue';

const encounterBuilderRef = ref();

// ---- Stores declaration
const filters = filtersStore();
const creatures = creaturesStore();
const encounter = encounterStore();

// ---- Columns declaration
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

// ---- Filters
const filterName = ref('');
const levelRange = ref({ min: -1, max: 25 });
const hpRange = ref({ min: 0, max: 600 });
const filterFamily = ref('');
const filterAlignment = ref('');
const filterSize = ref('');
const filterRarity = ref('');

// ---- Filter function
// combines all filters
const combineFilters = computed(() => {
  let filteredItems = creatures.getCreatures;
  let filteredNames = filteredItems.filter((out) => {
    if (filterName.value && filterName.value.length) {
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

// ---- Reset filters function
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

// ---- Table and visible columns
const creatureTable = ref();
const visibleColumns = ref(['level', 'hp', 'family', 'alignment', 'size', 'rarity']);

// ---- Column sort function
const sort = (col: string) => {
  creatureTable.value.sort(col);
};

// ---- Add creature to encounter function
const addCreature = debounce(function (creature: creature) {
  const selectedCreature = creatures.getCreatureId(creature.id);
  if (selectedCreature) {
    encounter.addToEncounter(selectedCreature);
  }
}, 50);
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-[70%]">
    <q-table
      ref="creatureTable"
      class="sticky-header-table tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: calc(100vh - 135px)"
      flat
      bordered
      title="Creatures"
      :rows="combineFilters"
      :columns="columns"
      :pagination="{ rowsPerPage: 0 }"
      :rows-per-page-options="[0]"
      :visible-columns="visibleColumns"
      virtual-scroll
      no-data-label="No creature matches the current filters"
      @row-dblclick="(_, row) => addCreature(row)"
    >
      <template v-slot:top>
        <div class="tw-flex tw-flex-grow tw-flex-wrap tw-gap-2 tw-justify-center">
          <div class="tw-flex tw-flex-shrink">
            <q-item-label
              class="text-h6 tw-my-auto font-bold tw-text-gray-800 dark:tw-text-gray-200"
            >
              Creatures
            </q-item-label>
          </div>
          <div class="tw-flex tw-flex-grow tw-justify-center">
            <q-btn-group push>
              <PartyBuilder />
              <q-separator vertical />
              <EncounterBuilder ref="encounterBuilderRef" />
              <q-separator vertical />
              <q-btn
                push
                dense
                class="tw-p-2"
                size="md"
                aria-label="Random encounter"
                @click="encounterBuilderRef.generateEncounter()"
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
                  Generate random encounter
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
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

            <q-select
              v-model="visibleColumns"
              multiple
              outlined
              dense
              options-dense
              display-value="Show\Hide columns"
              emit-value
              map-options
              :options="Object.freeze(columns)"
              option-value="name"
              :dropdown-icon="matArrowDropDown"
              style="min-width: 150px"
            />
          </div>
        </div>
      </template>
      <template v-slot:body-cell-name="name">
        <q-td :props="name">
          <a
            :href="'https://2e.aonprd.com/Monsters.aspx?ID=' + name.row.id"
            target="_blank"
            rel="noopener"
          >
            <span
              class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
              >{{ name.value }}</span
            >
          </a>
        </q-td>
      </template>
      <template v-slot:header-cell-name>
        <q-th>
          <div
            style="min-width: 225px"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col">
              <q-input dense outlined v-model="filterName" label="Name" />
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
                @click="sort('name')"
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
              <q-field dense outlined label="Level" style="min-width: 80px" stack-label>
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
                        aria-label="Filter level"
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
                @click="sort('level')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-hp>
        <q-th>
          <div
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
                        aria-label="Filter HP"
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
                aria-label="Sort hp column"
                @click="sort('hp')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-family>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterFamily"
                :options="Object.freeze(filters.getFilters.family)"
                label="Family"
                :dropdown-icon="matArrowDropDown"
                style="min-width: 125px"
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
                aria-label="Sort family column"
                @click="sort('family')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-alignment>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterAlignment"
                :options="Object.freeze(filters.getFilters.alignment)"
                label="Alignment"
                :dropdown-icon="matArrowDropDown"
                style="min-width: 130px"
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
                aria-label="Sort alignment column"
                @click="sort('alignment')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-size>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterSize"
                :options="Object.freeze(filters.getFilters.size)"
                label="Size"
                :dropdown-icon="matArrowDropDown"
                style="min-width: 100px"
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
                aria-label="Sort size column"
                @click="sort('size')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-rarity>
        <q-th>
          <div class="row no-wrap items-center">
            <div class="col-grow">
              <q-select
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterRarity"
                :options="Object.freeze(filters.getFilters.rarity)"
                label="Rarity"
                :dropdown-icon="matArrowDropDown"
                style="min-width: 100px"
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
                aria-label="Sort rarity column"
                @click="sort('rarity')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:no-data="{ message }">
        <div class="full-width row">
          <span class="tw-py-2">
            <q-icon size="sm" :name="matWarning" />
            {{ message }}
          </span>
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
