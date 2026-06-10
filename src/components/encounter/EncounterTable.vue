<script setup lang="ts">
import {
  biArrowDownUp,
  biArrowsCollapseVertical,
  biArrowsExpandVertical,
  biBook,
  biBoxArrowUpRight,
  biCaretRight,
  biEraser,
  biFullscreen,
  biFullscreenExit
} from '@quasar/extras/bootstrap-icons';
import {
  fasCrosshairs,
  fasGraduationCap,
  fasHandFist,
  fasHatWizard,
  fasMeteor,
  fasUserNinja,
  fasUserShield
} from '@quasar/extras/fontawesome-v7';
import { matPriorityHigh, matWarning } from '@quasar/extras/material-icons';
import { mdiBowArrow, mdiMagicStaff, mdiSword } from '@quasar/extras/mdi-v7';
import { capitalize, debounce } from 'lodash-es';
import { useQuasar } from 'quasar';
import { onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  requestCreatureRanges,
  requestCreatures,
  requestFilters,
  requestHazardFilters,
  requestHazardRanges,
  requestHazards
} from 'src/api/encounter-api-calls';
import EncounterBuilder from 'src/components/encounter/EncounterTable/EncounterBuilder.vue';
import PartyBuilder from 'src/components/encounter/EncounterTable/PartyBuilder.vue';
import { encounterStore } from 'src/stores/encounter';
import { filtersStore } from 'src/stores/filters';
import { settingsStore } from 'src/stores/settings';

import type { QTableProps } from 'quasar';
import type { creature } from 'src/types/creature';
import type { min_creature_hazard } from 'src/types/encounter';
import type {
  alignments,
  complexities,
  creature_columns,
  creature_filters,
  creature_type,
  hazard_columns,
  hazard_filters,
  rarities,
  roles,
  sizes
} from 'src/types/filters';
import type { hazard } from 'src/types/hazard';

const props = defineProps({ toggleSheetView: Function, sheetVisible: Boolean });

const $q = useQuasar();
const settings = settingsStore();
const filters = filtersStore();
const encounter = encounterStore();

const encounterBuilderRef = ref();
const router = useRouter();

const currentAon = ref(settings.game === 'sf' ? 'aonsrd' : 'aonprd');

const hazardToggle = ref<'creatures' | 'hazards'>('creatures');
encounter.removeSelectedHazard();

const encounterTable = ref();
const navigationActive = ref(false);
const selected = ref<creature[] | hazard[]>([]);
const creatureRows = ref<creature[]>([]);
const hazardRows = ref<hazard[]>([]);
const loading = ref(true);
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 100,
  rowsNumber: 0
});

const creatureFilters = ref<{
  name_filter: string;
  level_filter: { min: number; max: number };
  hp_filter: { min: number; max: number };
  trait_filter: string[];
  alignment_filter: alignments[];
  size_filter: sizes[];
  rarity_filter: rarities[];
  family_filter: string[];
  type_filter: creature_type[];
  attack_data_filter: {
    melee: boolean | null;
    ranged: boolean | null;
    spellcaster: boolean | null;
  };
  role_filter: roles[];
  source_filter: string[];
  sort_by: creature_columns;
  order_by: 'ascending' | 'descending';
}>({
  name_filter: '',
  level_filter: {
    min: filters.creatureRanges.min_level,
    max: filters.creatureRanges.max_level
  },
  hp_filter: { min: filters.creatureRanges.min_hp, max: filters.creatureRanges.max_hp },
  trait_filter: [],
  alignment_filter: [],
  size_filter: [],
  rarity_filter: [],
  family_filter: [],
  type_filter: [],
  attack_data_filter: {
    melee: null,
    ranged: null,
    spellcaster: null
  },
  role_filter: [],
  source_filter: [],
  sort_by: 'name',
  order_by: 'ascending'
});

watch(
  () => filters.creatureRanges,
  (ranges) => {
    creatureFilters.value.level_filter = {
      min: ranges.min_level,
      max: ranges.max_level
    };
    creatureFilters.value.hp_filter = {
      min: ranges.min_hp,
      max: ranges.max_hp
    };
  }
);

const hazardFilters = ref<{
  name_filter: string;
  level_filter: { min: number; max: number };
  hp_filter: { min: number; max: number };
  trait_filter: string[];
  complexity_filter: complexities | null;
  size_filter: sizes[];
  rarity_filter: rarities[];
  stealth_filter: { min: number; max: number };
  ac_filter: { min: number; max: number };
  fortitude_filter: { min: number; max: number };
  reflex_filter: { min: number; max: number };
  will_filter: { min: number; max: number };
  hardness_filter: { min: number; max: number };
  source_filter: string[];
  sort_by: hazard_columns;
  order_by: 'ascending' | 'descending';
}>({
  name_filter: '',
  level_filter: {
    min: filters.hazardRanges.min_level,
    max: filters.hazardRanges.max_level
  },
  hp_filter: { min: filters.hazardRanges.min_hp, max: filters.hazardRanges.max_hp },
  trait_filter: [],
  complexity_filter: null,
  size_filter: [],
  rarity_filter: [],
  stealth_filter: {
    min: filters.hazardRanges.min_stealth,
    max: filters.hazardRanges.max_stealth
  },
  ac_filter: { min: filters.hazardRanges.min_ac, max: filters.hazardRanges.max_ac },
  fortitude_filter: {
    min: filters.hazardRanges.min_fortitude,
    max: filters.hazardRanges.max_fortitude
  },
  reflex_filter: {
    min: filters.hazardRanges.min_reflex,
    max: filters.hazardRanges.max_reflex
  },
  will_filter: { min: filters.hazardRanges.min_will, max: filters.hazardRanges.max_will },
  hardness_filter: {
    min: filters.hazardRanges.min_hardness,
    max: filters.hazardRanges.max_hardness
  },
  source_filter: [],
  sort_by: 'name',
  order_by: 'ascending'
});

watch(
  () => filters.hazardRanges,
  (ranges) => {
    hazardFilters.value.level_filter = {
      min: ranges.min_level,
      max: ranges.max_level
    };
    hazardFilters.value.hp_filter = {
      min: ranges.min_hp,
      max: ranges.max_hp
    };
    hazardFilters.value.stealth_filter = {
      min: ranges.min_stealth,
      max: ranges.max_stealth
    };
    hazardFilters.value.ac_filter = {
      min: ranges.min_ac,
      max: ranges.max_ac
    };
    hazardFilters.value.fortitude_filter = {
      min: ranges.min_fortitude,
      max: ranges.max_fortitude
    };
    hazardFilters.value.reflex_filter = {
      min: ranges.min_reflex,
      max: ranges.max_reflex
    };
    hazardFilters.value.will_filter = {
      min: ranges.min_will,
      max: ranges.max_will
    };
    hazardFilters.value.hardness_filter = {
      min: ranges.min_hardness,
      max: ranges.max_hardness
    };
  }
);

const fullscreen = ref(false);
const tableOpacity = ref('');

const sourceCreatureFilter = ref<string[]>(filters.creatureFilters.sources);
const traitCreatureFilter = ref<string[]>(filters.creatureFilters.traits);
const familyCreatureFilter = ref<string[]>(filters.creatureFilters.families);
const sourceHazardFilter = ref<string[]>(filters.hazardFilters.sources);
const traitHazardFilter = ref<string[]>(filters.hazardFilters.traits);

// ---- Creature columns declaration
const columnCreatures: {
  name: creature_columns;
  label: string;
  field: (row: creature) => string | number | string[] | boolean[];
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  style?: string;
}[] = [
  {
    name: 'source',
    label: 'Source',
    field: (row) => row.core_data.essential.source,
    required: false,
    align: 'center',
    sortable: true,
    style: 'min-width: 120px; max-width: 120px;'
  },
  {
    name: 'name',
    label: 'Name',
    field: (row) => row.core_data.essential.name,
    required: true,
    align: 'left',
    sortable: true,
    style: 'min-width: 225px;'
  },
  {
    name: 'level',
    label: 'Level',
    field: (row) => row.core_data.essential.base_level,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  },
  {
    name: 'hp',
    label: 'HP',
    field: (row) => row.core_data.essential.hp,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'trait',
    label: 'Traits',
    field: (row) => row.core_data.traits,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 110px; max-width: 180px;'
  },
  {
    name: 'alignment',
    label: 'Alignment',
    field: (row) => row.core_data.essential.alignment,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 135px; max-width: 180px;'
  },
  {
    name: 'size',
    label: 'Size',
    field: (row) => row.core_data.essential.size,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 180px;'
  },
  {
    name: 'rarity',
    label: 'Rarity',
    field: (row) => row.core_data.essential.rarity,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 180px;'
  },
  {
    name: 'family',
    label: 'Family',
    field: (row) => row.core_data.essential.family,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 125px; max-width: 180px;'
  },
  {
    name: 'type',
    label: 'Type',
    field: (row) => row.core_data.essential.cr_type,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px'
  },
  {
    name: 'attack',
    label: 'Attacks',
    field: (row) => [
      row.core_data.derived.attack_data.melee,
      row.core_data.derived.attack_data.ranged,
      row.core_data.derived.attack_data.spellcaster
    ],
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  },
  {
    name: 'role',
    label: 'Roles',
    field: (row) => row.core_data.derived.creature_role!,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 200px;'
  }
];

// ---- Hazard columns declaration
const columnHazards: {
  name: hazard_columns;
  label: string;
  field: (row: hazard) => string | number | string[] | boolean[] | null;
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  style?: string;
}[] = [
  {
    name: 'source',
    label: 'Source',
    field: (row) => row.core_hazard.essential.source,
    required: false,
    align: 'center',
    sortable: true,
    style: 'min-width: 120px; max-width: 120px;'
  },
  {
    name: 'name',
    label: 'Name',
    field: (row) => row.core_hazard.essential.name,
    required: true,
    align: 'left',
    sortable: true,
    style: 'min-width: 225px;'
  },
  {
    name: 'level',
    label: 'Level',
    field: (row) => row.core_hazard.essential.level,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 80px;'
  },
  {
    name: 'hp',
    label: 'HP',
    field: (row) => row.core_hazard.essential.hp,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'trait',
    label: 'Traits',
    field: (row) => row.core_hazard.traits,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 110px; max-width: 180px;'
  },
  {
    name: 'complexity',
    label: 'Complexity',
    field: (row) => row.core_hazard.essential.complexity,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 135px; max-width: 180px;'
  },
  {
    name: 'size',
    label: 'Size',
    field: (row) => row.core_hazard.essential.size,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 180px;'
  },
  {
    name: 'rarity',
    label: 'Rarity',
    field: (row) => row.core_hazard.essential.rarity,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px; max-width: 180px;'
  },
  {
    name: 'stealth',
    label: 'Stealth',
    field: (row) => row.core_hazard.essential.stealth,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'ac',
    label: 'AC',
    field: (row) => row.core_hazard.essential.ac,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'fortitude',
    label: 'Fortitude',
    field: (row) => row.core_hazard.essential.fortitude,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'reflex',
    label: 'Reflex',
    field: (row) => row.core_hazard.essential.reflex,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'will',
    label: 'Will',
    field: (row) => row.core_hazard.essential.will,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  },
  {
    name: 'hardness',
    label: 'Hardness',
    field: (row) => row.core_hazard.essential.hardness,
    required: false,
    align: 'left',
    sortable: true,
    style: 'min-width: 100px;'
  }
];

// Waits for the table pagination to load
let resolveWhenLoaded: (() => void) | null = null;
const waitForPageLoad = () =>
  new Promise<void>((resolve) => {
    resolveWhenLoaded = resolve;
  });

const fetchFromServer = debounce(async function (startRow: number, rowsPerPage: number) {
  if (hazardToggle.value === 'creatures') {
    const body: creature_filters = {
      min_level_filter: creatureFilters.value.level_filter.min,
      max_level_filter: creatureFilters.value.level_filter.max,
      min_hp_filter: creatureFilters.value.hp_filter.min,
      max_hp_filter: creatureFilters.value.hp_filter.max,
      attack_data_filter: creatureFilters.value.attack_data_filter,
      role_threshold: 50,
      game_system_version: settings.game_version
    };
    if (creatureFilters.value.name_filter !== '') {
      body.name_filter = creatureFilters.value.name_filter;
    }
    if (
      creatureFilters.value.trait_filter !== undefined &&
      creatureFilters.value.trait_filter !== null &&
      creatureFilters.value.trait_filter.length > 0
    ) {
      body.trait_whitelist_filter = creatureFilters.value.trait_filter;
    }
    if (
      creatureFilters.value.alignment_filter !== undefined &&
      creatureFilters.value.alignment_filter !== null &&
      creatureFilters.value.alignment_filter.length > 0
    ) {
      body.alignment_filter = creatureFilters.value.alignment_filter;
    }
    if (
      creatureFilters.value.size_filter !== undefined &&
      creatureFilters.value.size_filter !== null &&
      creatureFilters.value.size_filter.length > 0
    ) {
      body.size_filter = creatureFilters.value.size_filter;
    }
    if (
      creatureFilters.value.rarity_filter !== undefined &&
      creatureFilters.value.rarity_filter !== null &&
      creatureFilters.value.rarity_filter.length > 0
    ) {
      body.rarity_filter = creatureFilters.value.rarity_filter;
    }
    if (
      creatureFilters.value.family_filter !== undefined &&
      creatureFilters.value.family_filter !== null &&
      creatureFilters.value.family_filter.length > 0
    ) {
      body.family_filter = creatureFilters.value.family_filter;
    }
    if (
      creatureFilters.value.type_filter !== undefined &&
      creatureFilters.value.type_filter !== null &&
      creatureFilters.value.type_filter.length > 0
    ) {
      body.type_filter = creatureFilters.value.type_filter;
    }
    if (
      creatureFilters.value.role_filter !== undefined &&
      creatureFilters.value.role_filter !== null &&
      creatureFilters.value.role_filter.length > 0
    ) {
      body.role_filter = creatureFilters.value.role_filter;
    }
    if (
      creatureFilters.value.source_filter !== undefined &&
      creatureFilters.value.source_filter !== null &&
      creatureFilters.value.source_filter.length > 0
    ) {
      body.source_filter = creatureFilters.value.source_filter;
    }
    try {
      const request = await requestCreatures(
        settings.game,
        startRow,
        rowsPerPage,
        creatureFilters.value.sort_by,
        creatureFilters.value.order_by,
        body
      );
      if (request) {
        pagination.value.rowsNumber = request.total;
        for (const creature of request.results) {
          // calculate the roles of the creature, by picking the percentages that are at least over 50%
          const rolePercentages: { role: roles; percentage: number }[] = [
            { role: 'Brute', percentage: creature.core_data.derived.role_data.brute },
            {
              role: 'Magical Striker',
              percentage: creature.core_data.derived.role_data.magical_striker
            },
            {
              role: 'Skill Paragon',
              percentage: creature.core_data.derived.role_data.skill_paragon
            },
            { role: 'Skirmisher', percentage: creature.core_data.derived.role_data.skirmisher },
            { role: 'Sniper', percentage: creature.core_data.derived.role_data.sniper },
            { role: 'Soldier', percentage: creature.core_data.derived.role_data.soldier },
            { role: 'Spellcaster', percentage: creature.core_data.derived.role_data.spellcaster }
          ];
          const rolesList: roles[] = [];
          for (const role of rolePercentages) {
            if (role.percentage >= 50) {
              rolesList.push(role.role);
            }
          }
          if (rolePercentages.length > 0) {
            creature.core_data.derived.creature_role = rolesList;
          } else {
            creature.core_data.derived.creature_role = ['None'];
          }
        }
        creatureRows.value = request.results;
        loading.value = false;
        resolveWhenLoaded?.();
        resolveWhenLoaded = null;
      } else {
        throw new Error('Error loading creatures');
      }
    } catch (error) {
      console.error(error);
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error loading the creatures',
        icon: matPriorityHigh
      });
    }
  } else {
    const body: hazard_filters = {
      min_level_filter: hazardFilters.value.level_filter.min,
      max_level_filter: hazardFilters.value.level_filter.max,
      min_hp_filter: hazardFilters.value.hp_filter.min,
      max_hp_filter: hazardFilters.value.hp_filter.max,
      min_stealth_filter: hazardFilters.value.stealth_filter.min,
      max_stealth_filter: hazardFilters.value.stealth_filter.max,
      min_ac_filter: hazardFilters.value.ac_filter.min,
      max_ac_filter: hazardFilters.value.ac_filter.max,
      min_fortitude_filter: hazardFilters.value.fortitude_filter.min,
      max_fortitude_filter: hazardFilters.value.fortitude_filter.max,
      min_reflex_filter: hazardFilters.value.reflex_filter.min,
      max_reflex_filter: hazardFilters.value.reflex_filter.max,
      min_will_filter: hazardFilters.value.will_filter.min,
      max_will_filter: hazardFilters.value.will_filter.max,
      min_hardness_filter: hazardFilters.value.hardness_filter.min,
      max_hardness_filter: hazardFilters.value.hardness_filter.max,
      game_system_version: settings.game_version
    };
    if (hazardFilters.value.name_filter !== '') {
      body.name_filter = hazardFilters.value.name_filter;
    }
    if (
      hazardFilters.value.trait_filter !== undefined &&
      hazardFilters.value.trait_filter !== null &&
      hazardFilters.value.trait_filter.length > 0
    ) {
      body.trait_whitelist_filter = hazardFilters.value.trait_filter;
    }
    if (
      hazardFilters.value.complexity_filter !== undefined &&
      hazardFilters.value.complexity_filter !== null &&
      hazardFilters.value.complexity_filter.length > 0
    ) {
      body.complexity_filter = hazardFilters.value.complexity_filter;
    }
    if (
      hazardFilters.value.size_filter !== undefined &&
      hazardFilters.value.size_filter !== null &&
      hazardFilters.value.size_filter.length > 0
    ) {
      body.size_filter = hazardFilters.value.size_filter;
    }
    if (
      hazardFilters.value.rarity_filter !== undefined &&
      hazardFilters.value.rarity_filter !== null &&
      hazardFilters.value.rarity_filter.length > 0
    ) {
      body.rarity_filter = hazardFilters.value.rarity_filter;
    }
    if (
      hazardFilters.value.source_filter !== undefined &&
      hazardFilters.value.source_filter !== null &&
      hazardFilters.value.source_filter.length > 0
    ) {
      body.source_filter = hazardFilters.value.source_filter;
    }
    try {
      const request = await requestHazards(
        settings.game,
        startRow,
        rowsPerPage,
        hazardFilters.value.sort_by,
        hazardFilters.value.order_by,
        body
      );
      if (request) {
        pagination.value.rowsNumber = request.total;
        hazardRows.value = request.results;
        loading.value = false;
        resolveWhenLoaded?.();
        resolveWhenLoaded = null;
      } else {
        throw new Error('Error loading hazards');
      }
    } catch (error) {
      console.error(error);
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Error loading the hazards',
        icon: matPriorityHigh
      });
    }
  }
}, 300);

async function onRequest(props: Parameters<NonNullable<QTableProps['onRequest']>>[0]) {
  const { page, rowsPerPage } = props.pagination;

  loading.value = true;

  const startRow = (page - 1) * rowsPerPage;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  await fetchFromServer(startRow, pagination.value.rowsPerPage);
}

// ---- Reset filters functions
const resetCreatureFilters = () => {
  creatureFilters.value = {
    source_filter: [],
    name_filter: '',
    level_filter: {
      min: filters.creatureRanges.min_level,
      max: filters.creatureRanges.max_level
    },
    hp_filter: { min: filters.creatureRanges.min_hp, max: filters.creatureRanges.max_hp },
    trait_filter: [],
    alignment_filter: [],
    size_filter: [],
    rarity_filter: [],
    family_filter: [],
    type_filter: [],
    attack_data_filter: {
      melee: null,
      ranged: null,
      spellcaster: null
    },
    role_filter: [],
    sort_by: 'name',
    order_by: 'ascending'
  };
};

const resetHazardFilters = () => {
  hazardFilters.value = {
    source_filter: [],
    name_filter: '',
    level_filter: {
      min: filters.hazardRanges.min_level,
      max: filters.hazardRanges.max_level
    },
    hp_filter: { min: filters.hazardRanges.min_hp, max: filters.hazardRanges.max_hp },
    trait_filter: [],
    complexity_filter: null,
    size_filter: [],
    rarity_filter: [],
    stealth_filter: {
      min: filters.hazardRanges.min_stealth,
      max: filters.hazardRanges.max_stealth
    },
    ac_filter: { min: filters.hazardRanges.min_ac, max: filters.hazardRanges.max_ac },
    fortitude_filter: {
      min: filters.hazardRanges.min_fortitude,
      max: filters.hazardRanges.max_fortitude
    },
    reflex_filter: {
      min: filters.hazardRanges.min_reflex,
      max: filters.hazardRanges.max_reflex
    },
    will_filter: {
      min: filters.hazardRanges.min_will,
      max: filters.hazardRanges.max_will
    },
    hardness_filter: {
      min: filters.hazardRanges.min_hardness,
      max: filters.hazardRanges.max_hardness
    },
    sort_by: 'name',
    order_by: 'ascending'
  };
};

// ---- Table and visible columns
const visibleCreatureColumns = ref(['name', 'level', 'trait', 'type', 'attack', 'role']);
const visibleHazardColumns = ref(['name', 'level', 'trait', 'complexity', 'rarity', 'stealth']);

// ---- Creatures column sort function
const sortCreatures = (col: creature_columns) => {
  if (creatureFilters.value.sort_by === col) {
    if (creatureFilters.value.order_by === 'ascending') {
      creatureFilters.value.order_by = 'descending';
    } else {
      creatureFilters.value.order_by = 'ascending';
    }
  } else {
    creatureFilters.value.order_by = 'ascending';
    creatureFilters.value.sort_by = col;
  }
};

// ---- Hazards column sort function
const sortHazards = (col: hazard_columns) => {
  if (hazardFilters.value.sort_by === col) {
    if (hazardFilters.value.order_by === 'ascending') {
      hazardFilters.value.order_by = 'descending';
    } else {
      hazardFilters.value.order_by = 'ascending';
    }
  } else {
    hazardFilters.value.order_by = 'ascending';
    hazardFilters.value.sort_by = col;
  }
};

const openCreatureSheet = (id: number) => {
  const routeData = router.resolve({
    name: 'bestiary',
    query: { game: settings.game, id: id }
  });
  if (process.env.IS_APP === 'true') {
    globalThis.open(routeData.href, '_self');
  } else {
    globalThis.open(routeData.href, '_blank');
  }
};

const openHazardSheet = (id: number) => {
  const routeData = router.resolve({ name: 'hazard', query: { game: settings.game, id: id } });
  if (process.env.IS_APP === 'true') {
    globalThis.open(routeData.href, '_self');
  } else {
    globalThis.open(routeData.href, '_blank');
  }
};

// ---- Add creature to encounter function
const addCreature = debounce(function (creature: creature) {
  const aon_link =
    settings.game === 'sf'
      ? 'https://2e.aonsrd.com/search?q=' +
        encodeURIComponent(creature.core_data.essential.name) +
        ' type%3A(creature)&type=eqs'
      : creature.core_data.derived.archive_link;
  const min_creature: min_creature_hazard = {
    game: creature.game,
    id: creature.core_data.essential.id,
    archive_link: aon_link,
    name: creature.core_data.essential.name,
    level: creature.core_data.essential.base_level,
    variant: 'Base',
    is_hazard: false
  };
  encounter.addToEncounter(min_creature);
}, 50);

// ---- Add hazard to encounter function
const addHazard = debounce(function (hazard: hazard) {
  const min_hazard: min_creature_hazard = {
    game: hazard.game,
    id: hazard.core_hazard.essential.id,
    archive_link:
      'https://2e.' +
      currentAon.value +
      '.com/search?q=' +
      encodeURIComponent(hazard.core_hazard.essential.name) +
      ' type%3A(hazard)&type=eqs',
    name: hazard.core_hazard.essential.name,
    level: hazard.core_hazard.essential.level,
    is_hazard: true,
    complexity: hazard.core_hazard.essential.complexity
  };
  encounter.addToEncounter(min_hazard);
}, 50);

const activateNavigation = () => {
  navigationActive.value = true;
};

const deactivateNavigation = () => {
  navigationActive.value = false;
};

// Checks if typing to prevent stealing shortcuts
function isTextInput(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el?.closest('input, textarea, [contenteditable="true"], .q-editor');
}

// Table sortcuts
async function onTableKey(evt: KeyboardEvent) {
  if (isTextInput(evt.target)) {
    return;
  }

  if (
    navigationActive.value !== true ||
    ![
      'Enter',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'ArrowLeft',
      'ArrowUp',
      'ArrowRight',
      'ArrowDown'
    ].includes(evt.key) ||
    encounterTable.value === null ||
    loading.value === true
  ) {
    return;
  }

  evt.preventDefault();

  const { computedRowsNumber, computedRows } = encounterTable.value;

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

  switch (evt.key) {
    case 'Enter': {
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        addHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        addCreature(tmp_creature);
      }
      break;
    }
    case 'PageUp': {
      index = 0;
      const { computedRows } = encounterTable.value;
      selected.value = [computedRows[index]];
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        encounter.setSelectedHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        encounter.setSelectedCreature(tmp_creature);
      }
      encounterTable.value.scrollTo(index);
      break;
    }
    case 'PageDown': {
      index = rowsPerPage - 1;
      const { computedRows } = encounterTable.value;
      selected.value = [computedRows[Math.min(index, computedRows.length - 1)]];
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        encounter.setSelectedHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        encounter.setSelectedCreature(tmp_creature);
      }
      encounterTable.value.scrollTo(index);
      break;
    }
    case 'Home': {
      index = 0;
      const promise = waitForPageLoad();
      encounterTable.value.firstPage();
      await promise;

      const { computedRows } = encounterTable.value;
      selected.value = [computedRows[index]];
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        encounter.setSelectedHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        encounter.setSelectedCreature(tmp_creature);
      }
      encounterTable.value.scrollTo(index);
      break;
    }
    case 'End': {
      index = rowsPerPage - 1;
      const promise = waitForPageLoad();
      encounterTable.value.lastPage();
      await promise;

      const { computedRows } = encounterTable.value;
      selected.value = [computedRows[Math.min(index, computedRows.length - 1)]];
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        encounter.setSelectedHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        encounter.setSelectedCreature(tmp_creature);
      }
      encounterTable.value.scrollTo(index - 1);
      break;
    }
    case 'ArrowLeft': {
      const page = currentPage <= 1 ? lastPage : currentPage - 1;
      index = 0;
      const promise = waitForPageLoad();
      if (page === lastPage) {
        encounterTable.value.lastPage();
      } else {
        encounterTable.value.prevPage();
      }
      await promise;

      const { computedRows } = encounterTable.value;
      selected.value = [computedRows[index]];
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        encounter.setSelectedHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        encounter.setSelectedCreature(tmp_creature);
      }
      encounterTable.value.scrollTo(index);
      break;
    }
    case 'ArrowUp': {
      if (currentIndex > 0) {
        index = currentIndex - 1;
        const { computedRows } = encounterTable.value;
        selected.value = [computedRows[index]];
        if (hazardToggle.value === 'hazards') {
          const tmp_hazard = selected.value[0]! as hazard;
          encounter.setSelectedHazard(tmp_hazard);
        } else {
          const tmp_creature = selected.value[0]! as creature;
          encounter.setSelectedCreature(tmp_creature);
        }
      }
      encounterTable.value.scrollTo(index - 1);
      break;
    }
    case 'ArrowRight': {
      const page = currentPage >= lastPage ? 1 : currentPage + 1;
      index = 0;
      const promise = waitForPageLoad();
      if (page === 1) {
        encounterTable.value.firstPage();
      } else {
        encounterTable.value.nextPage();
      }
      await promise;

      const { computedRows } = encounterTable.value;
      selected.value = [computedRows[index]];
      if (hazardToggle.value === 'hazards') {
        const tmp_hazard = selected.value[0]! as hazard;
        encounter.setSelectedHazard(tmp_hazard);
      } else {
        const tmp_creature = selected.value[0]! as creature;
        encounter.setSelectedCreature(tmp_creature);
      }
      encounterTable.value.scrollTo(index);
      break;
    }
    case 'ArrowDown': {
      if (currentIndex < lastIndex) {
        index = currentIndex + 1;
        const { computedRows } = encounterTable.value;
        selected.value = [computedRows[index]];
        if (hazardToggle.value === 'hazards') {
          const tmp_hazard = selected.value[0]! as hazard;
          encounter.setSelectedHazard(tmp_hazard);
        } else {
          const tmp_creature = selected.value[0]! as creature;
          encounter.setSelectedCreature(tmp_creature);
        }
      }
      encounterTable.value.scrollTo(index);
      break;
    }
  }
}

// Global shortcuts
function onGlobalKey(evt: KeyboardEvent) {
  if (isTextInput(evt.target)) {
    return;
  }
  if (evt.key.toLowerCase() === 'b') {
    if (evt.ctrlKey || evt.metaKey) {
      evt.preventDefault();
      props.toggleSheetView!();
    }
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', onGlobalKey);
});

onUnmounted(() => {
  globalThis.removeEventListener('keydown', onGlobalKey);
});

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value;
  if (fullscreen.value) {
    tableOpacity.value = 'opacity: 1';
  } else {
    tableOpacity.value = '';
  }
};

const filterCreatureSourcesFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.creatureFilters.sources = sourceCreatureFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterCreatureTraitsFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.creatureFilters.traits = traitCreatureFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterCreatureFamiliesFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.creatureFilters.families = familyCreatureFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterHazardSourcesFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.hazardFilters.sources = sourceHazardFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterHazardTraitsFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.hazardFilters.traits = traitHazardFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

onMounted(async () => {
  try {
    const [
      traitsRequest,
      alignmentsRequest,
      sizesRequest,
      raritiesRequest,
      familiesRequest,
      typesRequest,
      sourcesRequest,
      rolesRequest,
      creatureRangesRequest,
      hazardTraitsRequest,
      hazardSizesRequest,
      hazardRaritiesRequest,
      hazardSourcesRequest,
      hazardRangesRequest
    ] = await Promise.all([
      requestFilters(settings.game, 'traits'),
      requestFilters(settings.game, 'alignments'),
      requestFilters(settings.game, 'sizes'),
      requestFilters(settings.game, 'rarities'),
      requestFilters(settings.game, 'families'),
      requestFilters(settings.game, 'creature_types'),
      requestFilters(settings.game, 'sources'),
      requestFilters(settings.game, 'creature_roles'),
      requestCreatureRanges(settings.game),
      requestHazardFilters(settings.game, 'traits'),
      requestHazardFilters(settings.game, 'sizes'),
      requestHazardFilters(settings.game, 'rarities'),
      requestHazardFilters(settings.game, 'sources'),
      requestHazardRanges(settings.game),
      fetchFromServer(0, 100)
    ]);

    if (!traitsRequest) throw new Error('Error fetching creature traits');
    if (!alignmentsRequest) throw new Error('Error fetching creature alignments');
    if (!sizesRequest) throw new Error('Error fetching creature sizes');
    if (!raritiesRequest) throw new Error('Error fetching creature rarities');
    if (!familiesRequest) throw new Error('Error fetching creature families');
    if (!typesRequest) throw new Error('Error fetching creature creature_types');
    if (!sourcesRequest) throw new Error('Error fetching creature sources');
    if (!rolesRequest) throw new Error('Error fetching creature creature_roles');
    if (!creatureRangesRequest) throw new Error('Error fetching creature ranges');
    if (!hazardTraitsRequest) throw new Error('Error fetching hazard traits');
    if (!hazardSizesRequest) throw new Error('Error fetching hazard sizes');
    if (!hazardRaritiesRequest) throw new Error('Error fetching hazard rarities');
    if (!hazardSourcesRequest) throw new Error('Error fetching hazard sources');
    if (!hazardRangesRequest) throw new Error('Error fetching hazard ranges');

    filters.updateTraits(traitsRequest);
    traitCreatureFilter.value = filters.creatureFilters.traits;

    filters.updateAlignments(alignmentsRequest);
    filters.updateSizes(sizesRequest);
    filters.updateRarities(raritiesRequest);

    filters.updateFamilies(familiesRequest);
    familyCreatureFilter.value = filters.creatureFilters.families;

    filters.updateCreatureType(typesRequest);

    filters.updateSources(sourcesRequest);
    sourceCreatureFilter.value = filters.creatureFilters.sources;

    filters.updateRoles(rolesRequest);
    filters.creatureRanges = creatureRangesRequest;

    filters.updateHazardTraits(hazardTraitsRequest);
    traitHazardFilter.value = filters.hazardFilters.traits;

    filters.updateHazardSizes(hazardSizesRequest);
    filters.updateHazardRarities(hazardRaritiesRequest);

    filters.updateHazardSources(hazardSourcesRequest);
    sourceHazardFilter.value = filters.hazardFilters.sources;

    filters.hazardRanges = hazardRangesRequest;
  } catch (error) {
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error fetching filters',
      icon: matPriorityHigh
    });
  }
});
</script>

<template>
  <div class="tw:h-full">
    <q-table
      v-if="hazardToggle === 'creatures'"
      id="shepherd-0"
      ref="encounterTable"
      v-model:pagination="pagination"
      class="sticky-header-table tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:bg-white tw:border! tw:border-gray-200! tw:rounded-xl! tw:shadow-sm tw:overflow-hidden tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      :style="tableOpacity"
      color="primary"
      flat
      bordered
      :rows="creatureRows"
      :columns="columnCreatures"
      :visible-columns="visibleCreatureColumns"
      virtual-scroll
      virtual-scroll-slice-size="100"
      virtual-scroll-sticky-size-start="50"
      virtual-scroll-item-size="48"
      :loading="loading"
      :filter="creatureFilters"
      rows-per-page-label="Creatures per page:"
      :rows-per-page-options="[50, 100, 0]"
      table-header-class="shepherd-6"
      row-key="name"
      selection="single"
      :fullscreen="fullscreen"
      @request="onRequest"
      @row-click="
        (_: any, row: creature) => {
          encounter.setSelectedCreature(row);
          selected = [row];
        }
      "
      @row-dblclick="(_: any, row: creature) => addCreature(row)"
      @focusin="activateNavigation"
      @focusout="deactivateNavigation"
      @keydown="onTableKey"
    >
      <template #loading>
        <q-inner-loading showing style="z-index: 2">
          <q-spinner-gears class="tw:mx-auto tw:text-black tw:dark:text-white" size="5em" />
        </q-inner-loading>
      </template>
      <template #top>
        <div class="tw:flex tw:grow tw:flex-wrap tw:gap-2 tw:justify-center">
          <div class="tw:flex tw:shrink tw:justify-center tw:lg:justify-start">
            <span v-if="!fullscreen">
              <q-btn
                v-if="props.sheetVisible"
                id="shepherd-12"
                flat
                round
                dense
                class="tw:mr-4! tw:my-2! tw:md:my-0!"
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
                id="shepherd-12"
                flat
                round
                dense
                class="tw:mr-4! tw:my-2! tw:md:my-0!"
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
              <PartyBuilder />
              <q-separator vertical />
              <q-btn v-if="loading" id="shepherd-2" push label="Generator Settings" />
              <EncounterBuilder v-else ref="encounterBuilderRef" />
              <q-separator vertical />
              <q-btn
                id="shepherd-3"
                push
                dense
                class="tw:p-2!"
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
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Generate random encounter
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
          <div class="tw:flex tw:grow tw:justify-center">
            <q-btn-toggle
              id="shepherd-4"
              :disable="fullscreen"
              v-model="hazardToggle"
              push
              toggle-color="primary"
              :options="[
                { label: 'Creatures', value: 'creatures' },
                { label: 'Hazards', value: 'hazards' }
              ]"
              @update:model-value="
                encounter.removeSelectedCreature();
                encounter.removeSelectedHazard();
                loading = true;
                pagination.page = 0;
                fetchFromServer(0, 100);
              "
            />
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
              aria-label="Clear filters"
              @click="resetCreatureFilters"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Clear Filters
              </q-tooltip>
            </q-btn>
            <div id="shepherd-5">
              <q-select
                v-model="visibleCreatureColumns"
                multiple
                outlined
                dense
                options-dense
                display-value="Columns"
                emit-value
                map-options
                :options="Object.freeze(columnCreatures)"
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
                  v-model="creatureFilters.source_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="Object.freeze(filters.creatureFilters.sources)"
                  use-input
                  input-debounce="0"
                  :label="columnCreatures[0]!.label"
                  :style="columnCreatures[0]!.style"
                  virtual-scroll-item-size="32"
                  @filter="filterCreatureSourcesFn"
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
                v-model="creatureFilters.name_filter"
                dense
                outlined
                :label="columnCreatures[1]!.label"
                :style="columnCreatures[1]!.style"
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
                @click="sortCreatures(columnCreatures[1]!.name)"
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
                :label="columnCreatures[2]!.label"
                :style="columnCreatures[2]!.style"
                stack-label
              >
                <template #control>
                  {{ creatureFilters.level_filter.min }} to {{ creatureFilters.level_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="creatureFilters.level_filter"
                        label-always
                        :min="filters.creatureRanges.min_level"
                        :max="filters.creatureRanges.max_level"
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
                @click="sortCreatures(columnCreatures[2]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-hp>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnCreatures[3]!.label"
                :style="columnCreatures[3]!.style"
                stack-label
              >
                <template #control>
                  {{ creatureFilters.hp_filter.min }} to {{ creatureFilters.hp_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="creatureFilters.hp_filter"
                        label-always
                        :min="filters.creatureRanges.min_hp"
                        :max="filters.creatureRanges.max_hp"
                        style="min-width: 200px"
                        aria-label="Filter HP"
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
                aria-label="Sort hp column"
                @click="sortCreatures(columnCreatures[3]!.name)"
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
                  v-model="creatureFilters.trait_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="Object.freeze(filters.creatureFilters.traits)"
                  use-input
                  input-debounce="0"
                  :label="columnCreatures[4]!.label"
                  :style="columnCreatures[4]!.style"
                  virtual-scroll-item-size="32"
                  @filter="filterCreatureTraitsFn"
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
                @click="sortCreatures(columnCreatures[4]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-alignment>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="creatureFilters.alignment_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.creatureFilters.alignments)"
                :label="columnCreatures[5]!.label"
                :style="columnCreatures[5]!.style"
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
                aria-label="Sort alignment column"
                @click="sortCreatures(columnCreatures[5]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-size>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="creatureFilters.size_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.creatureFilters.sizes)"
                :label="columnCreatures[6]!.label"
                :style="columnCreatures[6]!.style"
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
                aria-label="Sort size column"
                @click="sortCreatures(columnCreatures[6]!.name)"
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
                v-model="creatureFilters.rarity_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.creatureFilters.rarities)"
                :label="columnCreatures[7]!.label"
                :style="columnCreatures[7]!.style"
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
                @click="sortCreatures(columnCreatures[7]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-family>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <KeepAlive>
                <q-select
                  v-model="creatureFilters.family_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="Object.freeze(filters.creatureFilters.families)"
                  use-input
                  input-debounce="0"
                  :label="columnCreatures[8]!.label"
                  :style="columnCreatures[8]!.style"
                  virtual-scroll-item-size="32"
                  @filter="filterCreatureFamiliesFn"
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
                aria-label="Sort family column"
                @click="sortCreatures(columnCreatures[8]!.name)"
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
                v-model="creatureFilters.type_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.creatureFilters.creature_types)"
                :label="columnCreatures[9]!.label"
                :style="columnCreatures[9]!.style"
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
                aria-label="Sort creature type column"
                @click="sortCreatures(columnCreatures[9]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-attack>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnCreatures[10]!.label"
                :style="columnCreatures[10]!.style"
                :stack-label="
                  creatureFilters.attack_data_filter?.melee! ||
                  creatureFilters.attack_data_filter?.ranged! ||
                  creatureFilters.attack_data_filter?.spellcaster!
                "
              >
                <template #control>
                  <q-icon
                    v-if="creatureFilters.attack_data_filter?.melee"
                    :name="mdiSword"
                    size="xs"
                    aria-label="Melee attacks"
                  />
                  <q-icon
                    v-if="creatureFilters.attack_data_filter?.ranged"
                    :name="mdiBowArrow"
                    size="xs"
                    aria-label="Ranged attacks"
                  />
                  <q-icon
                    v-if="creatureFilters.attack_data_filter?.spellcaster"
                    :name="mdiMagicStaff"
                    size="xs"
                    aria-label="Spell attacks"
                  />
                </template>
                <q-popup-proxy>
                  <q-banner rounded style="min-width: 100px">
                    <div class="column">
                      <q-toggle
                        v-model="creatureFilters.attack_data_filter.melee"
                        :icon="mdiSword"
                        :color="
                          creatureFilters.attack_data_filter.melee === true ? 'positive' : 'red'
                        "
                        :keep-color="creatureFilters.attack_data_filter.melee !== null"
                        size="xl"
                        toggle-indeterminate
                        role="menuitemcheckbox"
                        aria-checked="false"
                      >
                        <q-tooltip
                          class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[4, 4]"
                        >
                          Melee
                        </q-tooltip>
                      </q-toggle>

                      <q-toggle
                        v-model="creatureFilters.attack_data_filter.ranged"
                        :icon="mdiBowArrow"
                        :color="
                          creatureFilters.attack_data_filter.ranged === true ? 'positive' : 'red'
                        "
                        :keep-color="creatureFilters.attack_data_filter.ranged !== null"
                        size="xl"
                        toggle-indeterminate
                        role="menuitemcheckbox"
                        aria-checked="false"
                      >
                        <q-tooltip
                          class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[4, 4]"
                        >
                          Ranged
                        </q-tooltip>
                      </q-toggle>

                      <q-toggle
                        v-model="creatureFilters.attack_data_filter.spellcaster"
                        :icon="mdiMagicStaff"
                        :color="
                          creatureFilters.attack_data_filter.spellcaster === true
                            ? 'positive'
                            : 'red'
                        "
                        :keep-color="creatureFilters.attack_data_filter.spellcaster !== null"
                        size="xl"
                        toggle-indeterminate
                        role="menuitemcheckbox"
                        aria-checked="false"
                      >
                        <q-tooltip
                          class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
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
            <div class="col-shrink tw:mx-2">
              <q-btn
                flat
                round
                dense
                size="xs"
                padding="sm"
                :icon="biArrowDownUp"
                aria-label="Sort attacks column"
                @click="sortCreatures(columnCreatures[10]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-role>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="creatureFilters.role_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.creatureFilters.creature_roles)"
                :label="columnCreatures[11]!.label"
                :style="columnCreatures[11]!.style"
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
                aria-label="Sort creature role column"
                @click="sortCreatures(columnCreatures[11]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #body-selection="selectedCreature">
        <q-btn
          :props="selectedCreature"
          round
          unelevated
          :icon="biBoxArrowUpRight"
          size="sm"
          aria-label="Open item sheet"
          target="_blank"
          @click="openCreatureSheet(selectedCreature.row.core_data.essential.id)"
        >
          <q-tooltip
            class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
            anchor="top middle"
            self="bottom middle"
          >
            Open creature sheet
          </q-tooltip>
        </q-btn>
      </template>
      <template #body-cell-source="source">
        <q-td :props="source">
          <q-btn
            v-if="source.row.core_data.essential.source"
            round
            unelevated
            :icon="biBook"
            size="sm"
            padding="sm"
            :href="
              'https://store.paizo.com/search.php?search_query=' +
              encodeURIComponent(source.row.core_data.essential.source) +
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
                {{ source.row.core_data.essential.source }}
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
                encounter.selectedCreature?.core_data &&
                name.row.core_data.essential.id ===
                  encounter.selectedCreature?.core_data.essential.id
              "
              class="tw:mr-1 tw:align-middle"
              size="xs"
              :name="biCaretRight"
            />
            <a
              v-if="name.row.core_data.derived.archive_link"
              :href="name.row.core_data.derived.archive_link"
              target="_blank"
              rel="noopener"
              class="tw:inline tw:align-middle"
            >
              <span
                class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400 tw:max-w-62.5 tw:whitespace-normal"
                >{{ name.value }}</span
              >
            </a>
            <a
              v-else-if="settings.game === 'sf' && settings.is_aon_links_on"
              :href="
                'https://2e.' +
                currentAon +
                '.com/search?q=' +
                encodeURIComponent(name.value) +
                ' type%3A(creature)&type=eqs'
              "
              target="_blank"
              rel="noopener"
              class="tw:inline tw:align-middle"
            >
              <span
                class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400 tw:max-w-62.5 tw:whitespace-normal"
                >{{ name.value }}</span
              >
            </a>
            <span v-else class="tw:align-middle">{{ name.value }}</span>
            <q-chip
              v-if="settings.game === 'pf' && settings.game_version === 'Any'"
              dense
              :color="name.row.core_data.essential.remaster ? 'blue' : 'red-10'"
              text-color="white"
              class="tw:ml-1 tw:text-xs!"
              :label="name.row.core_data.essential.remaster ? 'Remaster' : 'Legacy'"
            />
          </div>
        </q-td>
      </template>
      <template #body-cell-trait="traits">
        <q-td :props="traits">
          <span
            v-if="traits.row.core_data.traits"
            class="tw:block tw:max-w-62.5 tw:whitespace-normal"
          >
            {{
              traits.row.core_data.traits
                .map((trait: string) => {
                  return capitalize(trait);
                })
                .join(', ')
            }}
          </span>
        </q-td>
      </template>
      <template #body-cell-attack="attacks">
        <q-td :props="attacks">
          <q-icon
            v-if="attacks.row.core_data.derived.attack_data.melee"
            :name="mdiSword"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Melee
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="attacks.row.core_data.derived.attack_data.ranged"
            :name="mdiBowArrow"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Ranged
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="attacks.row.core_data.derived.attack_data.spellcaster"
            :name="mdiMagicStaff"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Spells
            </q-tooltip>
          </q-icon>
        </q-td>
      </template>
      <template #body-cell-role="creatureRoles">
        <q-td :props="creatureRoles">
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Brute')"
            :name="fasHandFist"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Brute
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Magical Striker')"
            :name="fasMeteor"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Magical Striker
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Skill Paragon')"
            :name="fasGraduationCap"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Skill Paragon
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Skirmisher')"
            :name="fasUserNinja"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Skirmisher
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Sniper')"
            :name="fasCrosshairs"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Sniper
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Soldier')"
            :name="fasUserShield"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Soldier
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="creatureRoles.row.core_data.derived.creature_role.includes('Spellcaster')"
            :name="fasHatWizard"
            size="sm"
            left
          >
            <q-tooltip
              class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
              anchor="top middle"
              self="bottom middle"
            >
              Spellcaster
            </q-tooltip>
          </q-icon>
        </q-td>
      </template>
      <template #no-data>
        <div class="row flex-center q-gutter-sm">
          <q-icon size="2em" :name="matWarning" />
          <span> No creature matches the current filters </span>
        </div>
      </template>
    </q-table>
    <q-table
      v-else
      id="shepherd-0"
      ref="encounterTable"
      v-model:pagination="pagination"
      class="sticky-header-table tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:bg-white tw:border! tw:border-gray-200! tw:rounded-xl! tw:shadow-sm tw:overflow-hidden tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      :style="tableOpacity"
      color="primary"
      flat
      bordered
      :rows="hazardRows"
      :columns="columnHazards"
      :visible-columns="visibleHazardColumns"
      virtual-scroll
      virtual-scroll-slice-size="100"
      virtual-scroll-sticky-size-start="50"
      virtual-scroll-item-size="48"
      :loading="loading"
      :filter="hazardFilters"
      rows-per-page-label="Hazards per page:"
      :rows-per-page-options="[50, 100, 0]"
      table-header-class="shepherd-6"
      row-key="name"
      selection="single"
      :fullscreen="fullscreen"
      @request="onRequest"
      @row-click="
        (_: any, row: hazard) => {
          encounter.setSelectedHazard(row);
          selected = [row];
        }
      "
      @row-dblclick="(_: any, row: hazard) => addHazard(row)"
      @focusin="activateNavigation"
      @focusout="deactivateNavigation"
      @keydown="onTableKey"
    >
      <template #loading>
        <q-inner-loading showing style="z-index: 2">
          <q-spinner-gears class="tw:mx-auto tw:text-black tw:dark:text-white" size="5em" />
        </q-inner-loading>
      </template>
      <template #top>
        <div class="tw:flex tw:grow tw:flex-wrap tw:gap-2 tw:justify-center">
          <div class="tw:flex tw:shrink tw:justify-center tw:lg:justify-start">
            <span v-if="!fullscreen">
              <q-btn
                v-if="props.sheetVisible"
                id="shepherd-12"
                flat
                round
                dense
                class="tw:mr-4! tw:my-2! tw:md:my-0!"
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
                  Hide sheet
                </q-tooltip>
              </q-btn>
              <q-btn
                v-else
                id="shepherd-12"
                flat
                round
                dense
                class="tw:mr-4! tw:my-2! tw:md:my-0!"
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
                  Show sheet
                </q-tooltip>
              </q-btn>
            </span>
            <q-btn-group push>
              <PartyBuilder />
              <q-separator vertical />
              <q-btn v-if="loading" id="shepherd-2" push label="Generator Settings" />
              <EncounterBuilder v-else ref="encounterBuilderRef" />
              <q-separator vertical />
              <q-btn
                id="shepherd-3"
                push
                dense
                class="tw:p-2!"
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
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Generate random encounter
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
          <div class="tw:flex tw:grow tw:justify-center">
            <q-btn-toggle
              id="shepherd-4"
              :disable="fullscreen"
              v-model="hazardToggle"
              push
              toggle-color="red"
              :options="[
                { label: 'Creatures', value: 'creatures' },
                { label: 'Hazards', value: 'hazards' }
              ]"
              @update:model-value="
                encounter.removeSelectedCreature();
                encounter.removeSelectedHazard();
                loading = true;
                pagination.page = 0;
                fetchFromServer(0, 100);
              "
            />
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
              aria-label="Clear filters"
              @click="resetHazardFilters"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Clear Filters
              </q-tooltip>
            </q-btn>
            <div id="shepherd-5">
              <q-select
                v-model="visibleHazardColumns"
                multiple
                outlined
                dense
                options-dense
                display-value="Columns"
                emit-value
                map-options
                :options="Object.freeze(columnHazards)"
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
                  v-model="hazardFilters.source_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="Object.freeze(filters.hazardFilters.sources)"
                  use-input
                  input-debounce="0"
                  :label="columnHazards[0]!.label"
                  :style="columnHazards[0]!.style"
                  virtual-scroll-item-size="32"
                  @filter="filterHazardSourcesFn"
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
                v-model="hazardFilters.name_filter"
                dense
                outlined
                :label="columnHazards[1]!.label"
                :style="columnHazards[1]!.style"
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
                @click="sortHazards(columnHazards[1]!.name)"
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
                :label="columnHazards[2]!.label"
                :style="columnHazards[2]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.level_filter.min }} to {{ hazardFilters.level_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.level_filter"
                        label-always
                        :min="filters.hazardRanges.min_level"
                        :max="filters.hazardRanges.max_level"
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
                @click="sortHazards(columnHazards[2]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-hp>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[3]!.label"
                :style="columnHazards[3]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.hp_filter.min }} to {{ hazardFilters.hp_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.hp_filter"
                        label-always
                        :min="filters.hazardRanges.min_hp"
                        :max="filters.hazardRanges.max_hp"
                        style="min-width: 200px"
                        aria-label="Filter HP"
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
                aria-label="Sort hp column"
                @click="sortHazards(columnHazards[3]!.name)"
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
                  v-model="hazardFilters.trait_filter"
                  multiple
                  dense
                  outlined
                  clearable
                  options-dense
                  :options="Object.freeze(filters.hazardFilters.traits)"
                  use-input
                  input-debounce="0"
                  :label="columnHazards[4]!.label"
                  :style="columnHazards[4]!.style"
                  virtual-scroll-item-size="32"
                  @filter="filterHazardTraitsFn"
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
                @click="sortHazards(columnHazards[4]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-complexity>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="hazardFilters.complexity_filter"
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(['Simple', 'Complex'])"
                :label="columnHazards[5]!.label"
                :style="columnHazards[5]!.style"
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
                aria-label="Sort complexity column"
                @click="sortHazards(columnHazards[5]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-size>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-select
                v-model="hazardFilters.size_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.hazardFilters.sizes)"
                :label="columnHazards[6]!.label"
                :style="columnHazards[6]!.style"
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
                aria-label="Sort size column"
                @click="sortHazards(columnHazards[6]!.name)"
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
                v-model="hazardFilters.rarity_filter"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters.hazardFilters.rarities)"
                :label="columnHazards[7]!.label"
                :style="columnHazards[7]!.style"
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
                @click="sortHazards(columnHazards[7]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-stealth>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[8]!.label"
                :style="columnHazards[8]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.stealth_filter.min }} to {{ hazardFilters.stealth_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.stealth_filter"
                        label-always
                        :min="filters.hazardRanges.min_stealth"
                        :max="filters.hazardRanges.max_stealth"
                        style="min-width: 200px"
                        aria-label="Filter Stealth"
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
                aria-label="Sort stealth column"
                @click="sortHazards(columnHazards[8]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-ac>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[9]!.label"
                :style="columnHazards[9]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.ac_filter.min }} to {{ hazardFilters.ac_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.ac_filter"
                        label-always
                        :min="filters.hazardRanges.min_ac"
                        :max="filters.hazardRanges.max_ac"
                        style="min-width: 200px"
                        aria-label="Filter AC"
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
                aria-label="Sort ac column"
                @click="sortHazards(columnHazards[9]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-fortitude>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[10]!.label"
                :style="columnHazards[10]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.fortitude_filter.min }} to
                  {{ hazardFilters.fortitude_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.fortitude_filter"
                        label-always
                        :min="filters.hazardRanges.min_fortitude"
                        :max="filters.hazardRanges.max_fortitude"
                        style="min-width: 200px"
                        aria-label="Filter Fortitude"
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
                aria-label="Sort fortitude column"
                @click="sortHazards(columnHazards[10]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-reflex>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[11]!.label"
                :style="columnHazards[11]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.reflex_filter.min }} to {{ hazardFilters.reflex_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.reflex_filter"
                        label-always
                        :min="filters.hazardRanges.min_reflex"
                        :max="filters.hazardRanges.max_reflex"
                        style="min-width: 200px"
                        aria-label="Filter Reflex"
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
                aria-label="Sort reflex column"
                @click="sortHazards(columnHazards[11]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-will>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[12]!.label"
                :style="columnHazards[12]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.will_filter.min }} to {{ hazardFilters.will_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.will_filter"
                        label-always
                        :min="filters.hazardRanges.min_will"
                        :max="filters.hazardRanges.max_will"
                        style="min-width: 200px"
                        aria-label="Filter Will"
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
                aria-label="Sort will column"
                @click="sortHazards(columnHazards[12]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #header-cell-hardness>
        <q-th>
          <div
            class="row no-wrap items-center tw:border-r tw:border-gray-200 tw:dark:border-gray-700"
          >
            <div class="col-grow">
              <q-field
                dense
                outlined
                :label="columnHazards[13]!.label"
                :style="columnHazards[13]!.style"
                stack-label
              >
                <template #control>
                  {{ hazardFilters.hardness_filter.min }} to {{ hazardFilters.hardness_filter.max }}
                </template>
                <q-popup-proxy>
                  <q-banner rounded>
                    <div class="tw:pt-8 tw:px-1">
                      <q-range
                        v-model="hazardFilters.hardness_filter"
                        label-always
                        :min="filters.hazardRanges.min_hardness"
                        :max="filters.hazardRanges.max_hardness"
                        style="min-width: 200px"
                        aria-label="Filter Hardness"
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
                aria-label="Sort hardness column"
                @click="sortHazards(columnHazards[13]!.name)"
              />
            </div>
          </div>
        </q-th>
      </template>
      <template #body-selection="selectedHazard">
        <q-btn
          :props="selectedHazard"
          round
          unelevated
          :icon="biBoxArrowUpRight"
          size="sm"
          aria-label="Open item sheet"
          target="_blank"
          @click="openHazardSheet(selectedHazard.row.core_hazard.essential.id)"
        >
          <q-tooltip
            class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
            anchor="top middle"
            self="bottom middle"
          >
            Open hazard sheet
          </q-tooltip>
        </q-btn>
      </template>
      <template #body-cell-source="source">
        <q-td :props="source">
          <q-btn
            v-if="source.row.core_hazard.essential.source"
            round
            unelevated
            :icon="biBook"
            size="sm"
            padding="sm"
            :href="
              'https://store.paizo.com/search.php?search_query=' +
              encodeURIComponent(source.row.core_hazard.essential.source) +
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
                {{ source.row.core_hazard.essential.source }}
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
                encounter.selectedHazard?.core_hazard &&
                name.row.core_hazard.essential.id ===
                  encounter.selectedHazard?.core_hazard.essential.id
              "
              class="tw:mr-1 tw:align-middle"
              size="xs"
              :name="biCaretRight"
            />
            <a
              v-if="settings.is_aon_links_on"
              :href="
                'https://2e.' +
                currentAon +
                '.com/search?q=' +
                encodeURIComponent(name.value) +
                ' type%3A(hazard)&type=eqs'
              "
              target="_blank"
              rel="noopener"
              class="tw:inline tw:align-middle"
            >
              <span
                class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400 tw:max-w-62.5 tw:whitespace-normal"
                >{{ name.value }}</span
              >
            </a>
            <span v-else class="tw:align-middle">{{ name.value }}</span>
            <q-chip
              v-if="settings.game === 'pf' && settings.game_version === 'Any'"
              dense
              :color="name.row.core_hazard.essential.remaster ? 'blue' : 'red-10'"
              text-color="white"
              class="tw:ml-1 tw:text-xs!"
              :label="name.row.core_hazard.essential.remaster ? 'Remaster' : 'Legacy'"
            />
          </div>
        </q-td>
      </template>
      <template #body-cell-trait="traits">
        <q-td :props="traits">
          <span
            v-if="traits.row.core_hazard.traits"
            class="tw:block tw:max-w-62.5 tw:whitespace-normal"
          >
            {{
              traits.row.core_hazard.traits
                .map((trait: string) => {
                  return capitalize(trait);
                })
                .join(', ')
            }}
          </span>
        </q-td>
      </template>
      <template #no-data>
        <div class="row flex-center q-gutter-sm">
          <q-icon size="2em" :name="matWarning" />
          <span> No hazard matches the current filters </span>
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
