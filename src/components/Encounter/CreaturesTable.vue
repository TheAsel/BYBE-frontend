<script setup lang="ts">
import { ref, computed } from 'vue';
import { requestCreatures, requestFilters } from '../../utils/api-calls';
import { creature } from '../../types/creature';
import { filtersStore, creaturesStore, encounterStore } from 'stores/store';
import PartyBuilder from './CreaturesTable/PartyBuilder.vue';
import EncounterBuilder from './CreaturesTable/EncounterBuilder.vue';

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

// ---- API requests
if (creatures.getCreatures.length === 0) {
  creatures.updateCreatures(await requestCreatures(0, -1));
}

if (filters.getFilters.family.length === 0) {
  filters.updateFamilies(await requestFilters('families'));
}

if (filters.getFilters.alignment.length === 0) {
  filters.updateAlignments(await requestFilters('alignments'));
}

if (filters.getFilters.size.length === 0) {
  filters.updateSizes(await requestFilters('sizes'));
}

if (filters.getFilters.rarity.length === 0) {
  filters.updateRarities(await requestFilters('rarities'));
}

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
const addCreature = (creature: creature) => {
  const selectedCreature = creatures.getCreatureId(creature.id);
  if (selectedCreature) {
    encounter.addToEncounter(selectedCreature);
  }
};
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-3/4">
    <q-table
      ref="creatureTable"
      class="sticky-header-table tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: 85vh"
      flat
      bordered
      title="Creatures"
      :rows="combineFilters"
      :columns="columns"
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
          style="min-width: 150px"
        />
      </template>
      <template v-slot:body-cell-name="name">
        <q-td :props="name">
          <a :href="'https://2e.aonprd.com/Monsters.aspx?ID=' + name.row.id" target="_blank">
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
                icon="bi-arrow-down-up"
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
                icon="bi-arrow-down-up"
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
                options-dense
                v-model="filterFamily"
                :options="Object.freeze(filters.getFilters.family)"
                label="Family"
                style="min-width: 180px"
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
                options-dense
                v-model="filterAlignment"
                :options="Object.freeze(filters.getFilters.alignment)"
                label="Alignment"
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
                icon="bi-arrow-down-up"
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
                options-dense
                v-model="filterSize"
                :options="Object.freeze(filters.getFilters.size)"
                label="Size"
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
                icon="bi-arrow-down-up"
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
                options-dense
                v-model="filterRarity"
                :options="Object.freeze(filters.getFilters.rarity)"
                label="Rarity"
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
                icon="bi-arrow-down-up"
                aria-label="Sort rarity column"
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
  thead tr th {
    position: sticky;
    z-index: 1;
    background-color: #ffffff;
    border-left: none;
    border-right: none;
    border-width: 1px;
  }

  thead tr:first-child th {
    top: 0;
  }
}

.q-table--dark thead tr th {
  background-color: #1f2937;
}

tr:nth-child(even) {
  background-color: #f3f4f6 !important;
}

.q-table--dark tr:nth-child(even) {
  background-color: #374151 !important;
}

.sticky-header-table {
  td {
    border-bottom: none;
  }
}

.q-table--dark td {
  border-bottom: none;
}
</style>
