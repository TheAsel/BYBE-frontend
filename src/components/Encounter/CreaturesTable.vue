<script setup lang="ts">
import { ref, computed } from 'vue';
import { matArrowDropDown, matCancel, matWarning } from '@quasar/extras/material-icons';
import { biEraser, biArrowDownUp, biBook } from '@quasar/extras/bootstrap-icons';
import { mdiSword, mdiBowArrow, mdiMagicStaff } from '@quasar/extras/mdi-v7';
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
  field: (row: creature) => string | number | string[] | boolean[];
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  style?: string;
}[] = [
  {
    name: 'name',
    label: 'Name',
    field: (row) => row.name,
    required: true,
    align: 'left',
    sortable: true,
    style: 'min-width: 225px;'
  },
  {
    name: 'level',
    label: 'Level',
    field: (row) => row.level,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  },
  {
    name: 'hp',
    label: 'HP',
    field: (row) => row.hp,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'traits',
    label: 'Traits',
    field: (row) => row.traits,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 110px; max-width: 300px;'
  },
  {
    name: 'alignment',
    label: 'Alignment',
    field: (row) => row.alignment,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 135px; max-width: 300px;'
  },
  {
    name: 'size',
    label: 'Size',
    field: (row) => row.size,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 300px;'
  },
  {
    name: 'rarity',
    label: 'Rarity',
    field: (row) => row.rarity,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'family',
    label: 'Family',
    field: (row) => row.family,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 125px; max-width: 300px;'
  },
  {
    name: 'creature_type',
    label: 'Creature Type',
    field: (row) => row.creature_type,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 155px; max-width: 300px;'
  },
  {
    name: 'attacks',
    label: 'Attacks',
    field: (row) => [row.is_melee, row.is_ranged, row.is_spell_caster],
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  }
];

// ---- Filters
const filterName = ref<string>();
const levelRange = ref({ min: -1, max: 25 });
const hpRange = ref({ min: 0, max: 600 });
const filterTraits = ref<string[]>();
const filterAlignment = ref<string[]>();
const filterSize = ref<string[]>();
const filterRarity = ref<string[]>();
const filterFamily = ref<string[]>();
const filterType = ref<string[]>();
const filterAttacks = ref([false, false, false]);

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
  let filteredTraits = filteredHp.filter((out) => {
    if (filterTraits.value && filterTraits.value.length) {
      return filterTraits.value.some((v) => out.traits.includes(v));
    }
    return out;
  });
  let filteredAlignment = filteredTraits.filter((out) => {
    if (filterAlignment.value && filterAlignment.value.length) {
      return filterAlignment.value.includes(out.alignment);
    }
    return out;
  });
  let filteredSize = filteredAlignment.filter((out) => {
    if (filterSize.value && filterSize.value.length) {
      return filterSize.value.includes(out.size);
    }
    return out;
  });
  let filteredRarity = filteredSize.filter((out) => {
    if (filterRarity.value && filterRarity.value.length) {
      return filterRarity.value.includes(out.rarity);
    }
    return out;
  });
  let filteredFamily = filteredRarity.filter((out) => {
    if (filterFamily.value && filterFamily.value.length) {
      return filterFamily.value.includes(out.family);
    }
    return out;
  });
  let filteredType = filteredFamily.filter((out) => {
    if (filterType.value && filterType.value.length) {
      return filterType.value.includes(out.creature_type);
    }
    return out;
  });
  let filteredAttacks = filteredType.filter((out) => {
    if (filterAttacks.value[0] || filterAttacks.value[1] || filterAttacks.value[2]) {
      return (
        out.is_melee === filterAttacks.value[0] &&
        out.is_ranged === filterAttacks.value[1] &&
        out.is_spell_caster === filterAttacks.value[2]
      );
    }
    return out;
  });
  return filteredAttacks;
});

// ---- Reset filters function
const resetFilters = () => {
  filterName.value = '';
  levelRange.value.min = -1;
  levelRange.value.max = 25;
  hpRange.value.min = 0;
  hpRange.value.max = 600;
  filterTraits.value = [];
  filterAlignment.value = [];
  filterSize.value = [];
  filterRarity.value = [];
  filterFamily.value = [];
  filterType.value = [];
  filterAttacks.value = [false, false, false];
};

// ---- Table and visible columns
const creatureTable = ref();
const visibleColumns = ref([
  'name',
  'level',
  'traits',
  'alignment',
  'size',
  'creature_type',
  'attacks'
]);

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
  <div class="q-pa-md tw-w-full md:tw-w-[73%]">
    <q-table
      ref="creatureTable"
      class="sticky-header-table tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
      style="height: calc(100vh - 135px)"
      flat
      bordered
      title="Creatures"
      :rows="combineFilters"
      :columns="columns"
      selection="single"
      :pagination="{ rowsPerPage: 0 }"
      :rows-per-page-options="[0]"
      :visible-columns="visibleColumns"
      virtual-scroll
      no-data-label="No creature matches the current filters"
      @row-dblclick="(_, row) => addCreature(row)"
      id="v-step-0"
      table-header-class="v-step-5"
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
                id="v-step-3"
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
            <div id="v-step-4">
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
        </div>
      </template>
      <template v-slot:header-cell-name>
        <q-th>
          <div
            :style="columns[0].style"
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col">
              <q-input dense outlined v-model="filterName" :label="columns[0].label" />
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
              <q-field
                dense
                outlined
                :label="columns[1].label"
                :style="columns[1].style"
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
              <q-field
                dense
                outlined
                :label="columns[2].label"
                :style="columns[2].style"
                stack-label
              >
                <template v-slot:control> {{ hpRange.min }} to {{ hpRange.max }} </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw-pt-8 tw-px-1">
                      <q-range
                        v-model="hpRange"
                        label-always
                        :min="0"
                        :max="600"
                        style="min-width: 200px"
                        aria-label="Filter HP"
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
                aria-label="Sort hp column"
                @click="sort('hp')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-traits>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                multiple
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterTraits"
                :options="Object.freeze(filters.getFilters.traits)"
                :label="columns[3].label"
                :dropdown-icon="matArrowDropDown"
                :style="columns[3].style"
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
                aria-label="Sort traits column"
                @click="sort('traits')"
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
                multiple
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterAlignment"
                :options="Object.freeze(filters.getFilters.alignment)"
                :label="columns[4].label"
                :dropdown-icon="matArrowDropDown"
                :style="columns[4].style"
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
                multiple
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterSize"
                :options="Object.freeze(filters.getFilters.size)"
                :label="columns[5].label"
                :dropdown-icon="matArrowDropDown"
                :style="columns[5].style"
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
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                multiple
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterRarity"
                :options="Object.freeze(filters.getFilters.rarity)"
                :label="columns[6].label"
                :dropdown-icon="matArrowDropDown"
                :style="columns[6].style"
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
      <template v-slot:header-cell-family>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                multiple
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterFamily"
                :options="Object.freeze(filters.getFilters.family)"
                :label="columns[7].label"
                :dropdown-icon="matArrowDropDown"
                :style="columns[7].style"
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
      <template v-slot:header-cell-creature_type>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-select
                multiple
                dense
                outlined
                clearable
                :clear-icon="matCancel"
                options-dense
                v-model="filterType"
                :options="Object.freeze(filters.getFilters.creature_type)"
                :label="columns[8].label"
                :dropdown-icon="matArrowDropDown"
                :style="columns[8].style"
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
                aria-label="Sort creature type column"
                @click="sort('creature_type')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:header-cell-attacks>
        <q-th>
          <div
            class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columns[9].label"
                :style="columns[9].style"
                :stack-label="filterAttacks[0] || filterAttacks[1] || filterAttacks[2]"
              >
                <template v-slot:control>
                  <q-icon v-if="filterAttacks[0]" :name="mdiSword" size="xs" />
                  <q-icon v-if="filterAttacks[1]" :name="mdiBowArrow" size="xs" />
                  <q-icon v-if="filterAttacks[2]" :name="mdiMagicStaff" size="xs" />
                </template>
                <q-popup-proxy>
                  <q-banner rounded style="min-width: 100px">
                    <div class="column">
                      <q-toggle
                        :icon="mdiSword"
                        v-model="filterAttacks[0]"
                        size="xl"
                        role="menuitemcheckbox"
                      >
                        <q-tooltip
                          class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[4, 4]"
                        >
                          Melee
                        </q-tooltip>
                      </q-toggle>

                      <q-toggle
                        :icon="mdiBowArrow"
                        v-model="filterAttacks[1]"
                        size="xl"
                        role="menuitemcheckbox"
                      >
                        <q-tooltip
                          class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[4, 4]"
                        >
                          Ranged
                        </q-tooltip>
                      </q-toggle>

                      <q-toggle
                        :icon="mdiMagicStaff"
                        v-model="filterAttacks[2]"
                        size="xl"
                        role="menuitemcheckbox"
                      >
                        <q-tooltip
                          class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[4, 4]"
                        >
                          Spells
                        </q-tooltip>
                      </q-toggle>
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
                aria-label="Sort attacks column"
                @click="sort('attacks')"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template v-slot:body-selection="source">
        <q-icon round unelevated v-if="source.row.sources.length > 0" :name="biBook" size="xs">
          <q-tooltip
            class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
            anchor="top middle"
            self="bottom middle"
          >
            <i class="tw-whitespace-nowrap" v-for="item in source.row.sources" :key="item">
              {{ item }}
            </i>
          </q-tooltip>
        </q-icon>
      </template>
      <template v-slot:body-cell-name="name">
        <q-td :props="name">
          <a :href="name.row.archive_link" target="_blank" rel="noopener" class="tw-inline">
            <span
              class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400 tw-max-w-[250px] tw-whitespace-normal"
              >{{ name.value }}</span
            >
          </a>
        </q-td>
      </template>
      <template v-slot:body-cell-traits="traits">
        <q-td :props="traits">
          <span v-if="traits.row.traits" class="tw-block tw-max-w-[250px] tw-whitespace-normal">
            {{ traits.row.traits.join(', ') }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-attacks="attacks">
        <q-td :props="attacks">
          <q-icon v-if="attacks.row.is_melee" :name="mdiSword" size="sm" left>
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Melee
            </q-tooltip>
          </q-icon>
          <q-icon v-if="attacks.row.is_ranged" :name="mdiBowArrow" size="sm" left>
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Ranged
            </q-tooltip>
          </q-icon>
          <q-icon v-if="attacks.row.is_spell_caster" :name="mdiMagicStaff" size="sm" left>
            <q-tooltip
              class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
              anchor="top middle"
              self="bottom middle"
            >
              Spells
            </q-tooltip>
          </q-icon>
        </q-td>
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

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
