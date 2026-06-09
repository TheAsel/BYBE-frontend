<script setup lang="ts">
import BestiarySheet from 'src/components/encounter/EncounterSheet/BestiarySheet.vue';
import HazardSheet from 'src/components/encounter/EncounterSheet/HazardSheet.vue';
import { encounterStore } from 'src/stores/encounter';

const encounter = encounterStore();
</script>

<template>
  <div class="encounter-sheet tw:h-full">
    <div
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:items-center tw:text-left tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700 hide-print"
    >
      <q-scroll-area class="tw:h-full">
        <div
          v-if="
            (encounter.selectedCreature && encounter.selectedCreature.core_data) ||
            (encounter.selectedHazard && encounter.selectedHazard.core_hazard)
          "
          class="q-gutter-y-xs tw:p-4 show-print"
        >
          <BestiarySheet
            v-if="encounter.selectedCreature && encounter.selectedCreature.core_data"
          />
          <HazardSheet v-if="encounter.selectedHazard && encounter.selectedHazard.core_hazard" />
        </div>
        <div v-else class="tw:text-center tw:text-lg tw:pt-[38vh]">
          Click on an element to display its description
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<style>
.action-glyph {
  font-family: 'Pathfinder2eActions', sans-serif;
  font-size: 24px;
  line-height: calc(2 / 1.5);
}
</style>

<style lang="scss">
.encounter-sheet {
  font-family: 'Good Pro', sans-serif;
}

.encounter-page {
  .encounter-page-element {
    display: none !important;
  }
}

table.pf2e,
table.pf2-table {
  border-collapse: collapse;
  font-size: 13pt;
  margin-top: 10px;
  margin-bottom: 10px;

  thead,
  tbody,
  th,
  td {
    box-sizing: border-box;
  }

  th,
  td {
    border: solid 1px #374151;
    text-align: center;
  }

  th {
    font-weight: bold;
    padding: 0.5rem 0.25rem;
  }

  td {
    padding: 0.25rem;
  }
}

body.body--dark {
  tr:nth-child(even) {
    background-color: #374151 !important;
  }

  td > span,
  th > span {
    color: #fff !important;
  }
}
</style>
