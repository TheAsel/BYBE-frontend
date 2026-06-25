<script setup lang="ts">
import { biEraser } from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { debounce } from "lodash-es";
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";

import {
  npcGenerator,
  requestAncestries,
  requestParameters
} from "@/api/npc-api-calls";
import DiceIcon from "@/components/generic/DiceIcon.vue";
import { npcStore } from "@/stores/npc";
import { npcParametersStore } from "@/stores/npc_parameters";
import { settingsStore } from "@/stores/settings";

import type { npc_data } from "@/types/npc";

const $q = useQuasar();

const npc_parameters_store = npcParametersStore();
const npc_store = npcStore();
const settings_store = settingsStore();

const parameters = ref<{
  genders: string[];
  ancestries: string[];
  cultures: string[];
  classes: string[];
  jobs: string[];
  level: { min: number; max: number };
}>({
  ancestries: [],
  classes: [],
  cultures: [],
  genders: [],
  jobs: [],
  level: { max: 25, min: -1 }
});

const nickname = ref<boolean>(false);

const genderFilter = ref<string[]>(npc_parameters_store.npcParameters.genders);
const ancestryFilter = ref<string[]>(
  npc_parameters_store.npcParameters.ancestries
);
const culturesFilter = ref<string[]>(
  npc_parameters_store.npcParameters.cultures
);
const classFilter = ref<string[]>(npc_parameters_store.npcParameters.classes);
const jobFilter = ref<string[]>(npc_parameters_store.npcParameters.jobs);

onMounted(async () => {
  try {
    const [
      gendersRequest,
      ancestriesRequest,
      classesRequest,
      jobsRequest,
      culturesRequest
    ] = await Promise.all([
      requestParameters(settings_store.game, "genders"),
      requestAncestries(settings_store.game),
      requestParameters(settings_store.game, "classes"),
      requestParameters(settings_store.game, "jobs"),
      settings_store.game === "pf"
        ? requestParameters("pf", "cultures")
        : Promise.resolve(null)
    ]);

    if (!gendersRequest) {
      throw new Error("Error fetching genders");
    }
    if (!ancestriesRequest) {
      throw new Error("Error fetching ancestries");
    }
    if (!classesRequest) {
      throw new Error("Error fetching classes");
    }
    if (!jobsRequest) {
      throw new Error("Error fetching jobs");
    }
    if (settings_store.game === "pf" && !culturesRequest) {
      throw new Error("Error fetching cultures");
    }

    npc_parameters_store.updateGenders(gendersRequest);
    genderFilter.value = npc_parameters_store.npcParameters.genders;

    npc_parameters_store.updateValidGenders(ancestriesRequest);
    npc_parameters_store.updateAncestries(
      ancestriesRequest.map(valid_genders => valid_genders.ancestry).toSorted()
    );
    ancestryFilter.value = npc_parameters_store.npcParameters.ancestries;

    npc_parameters_store.updateClasses(classesRequest.toSorted());
    classFilter.value = npc_parameters_store.npcParameters.classes;

    npc_parameters_store.updateJobs(jobsRequest.toSorted());
    jobFilter.value = npc_parameters_store.npcParameters.jobs;

    if (culturesRequest) {
      npc_parameters_store.updateCultures(culturesRequest.toSorted());
      culturesFilter.value = npc_parameters_store.npcParameters.cultures;
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error fetching filters",
      progress: true,
      type: "warning"
    });
  }
});

const generateNpc = debounce(async () => {
  npc_store.setGenerating(true);

  const body: npc_data = {
    generate_nickname: nickname.value
  };

  if (parameters.value.genders && parameters.value.genders.length > 0) {
    const tmpGenders = parameters.value.genders.map(_gender =>
      _gender.replaceAll(" ", "")
    );
    body.gender_filter = tmpGenders;
  }

  if (settings_store.game === "sf") {
    if (parameters.value.ancestries && parameters.value.ancestries.length > 0) {
      const tmpAncestries = parameters.value.ancestries.map(_ancestry =>
        _ancestry.replaceAll(" ", "")
      );
      body.name_origin_filter = { FromAncestry: tmpAncestries };
    } else {
      body.name_origin_filter = { FromAncestry: [] };
    }
  } else {
    if (
      !npc_store.npcs[npc_store.activeNpc]!.has_culture &&
      parameters.value.ancestries &&
      parameters.value.ancestries.length > 0
    ) {
      const tmpAncestries = parameters.value.ancestries.map(_ancestry =>
        _ancestry.replaceAll(" ", "")
      );
      body.name_origin_filter = { FromAncestry: tmpAncestries };
    } else if (!npc_store.npcs[npc_store.activeNpc]!.has_culture) {
      body.name_origin_filter = { FromAncestry: [] };
    }

    if (
      npc_store.npcs[npc_store.activeNpc]!.has_culture &&
      parameters.value.cultures &&
      parameters.value.cultures.length > 0
    ) {
      const tmpCultures = parameters.value.cultures.map(_culture =>
        _culture.replaceAll(" ", "")
      );
      body.name_origin_filter = { FromCulture: tmpCultures };
    } else if (npc_store.npcs[npc_store.activeNpc]!.has_culture) {
      body.name_origin_filter = { FromCulture: [] };
    }
  }

  if (parameters.value.classes && parameters.value.classes.length > 0) {
    const tmpClasses = parameters.value.classes.map(_class =>
      _class.replaceAll(" ", "")
    );
    body.class_filter = tmpClasses;
  }

  if (parameters.value.jobs && parameters.value.jobs.length > 0) {
    const tmpJobs = parameters.value.jobs.map(_job => _job.replaceAll(" ", ""));
    body.job_filter = tmpJobs;
  }

  body.level_filter = {
    max_level: parameters.value.level.max,
    min_level: parameters.value.level.min
  };

  try {
    const randomNpc = await npcGenerator(settings_store.game, body);
    if (!randomNpc) {
      throw new TypeError("Error generating random npc");
    }
    if (!npc_store.locks.name) {
      npc_store.npcs[npc_store.activeNpc]!.core_npc.name = randomNpc.name;
    }
    if (!npc_store.locks.nickname) {
      npc_store.npcs[npc_store.activeNpc]!.core_npc.nickname =
        randomNpc.nickname;
    }
    // Regex: adds spaces between words
    if (!npc_store.locks.gender) {
      randomNpc.gender = randomNpc.gender!.replaceAll(
        /([a-z])([A-Z])/gu,
        "$1 $2"
      );
      npc_store.npcs[npc_store.activeNpc]!.core_npc.gender = randomNpc.gender;
    }
    if (!npc_store.locks.ancestry) {
      randomNpc.ancestry = randomNpc.ancestry!.replaceAll(
        /([a-z])([A-Z])/gu,
        "$1 $2"
      );
      npc_store.npcs[npc_store.activeNpc]!.core_npc.ancestry =
        randomNpc.ancestry;
    }
    if (settings_store.game === "pf" && !npc_store.locks.culture) {
      randomNpc.culture = randomNpc.culture!.replaceAll(
        /([a-z])([A-Z])/gu,
        "$1 $2"
      );
      npc_store.npcs[npc_store.activeNpc]!.core_npc.culture = randomNpc.culture;
    }
    if (!npc_store.locks.class) {
      randomNpc.class = randomNpc.class!.replaceAll(
        /([a-z])([A-Z])/gu,
        "$1 $2"
      );
      npc_store.npcs[npc_store.activeNpc]!.core_npc.class = randomNpc.class;
    }
    if (!npc_store.locks.job) {
      randomNpc.job = randomNpc.job!.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
      npc_store.npcs[npc_store.activeNpc]!.core_npc.job = randomNpc.job;
    }
    if (!npc_store.locks.level) {
      npc_store.npcs[npc_store.activeNpc]!.core_npc.level = randomNpc.level;
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error generating random npc",
      progress: true,
      type: "warning"
    });
  }

  npc_store.setGenerating(false);
}, 300);

const resetParameters = (): void => {
  parameters.value.genders = [];
  parameters.value.ancestries = [];
  parameters.value.cultures = [];
  parameters.value.classes = [];
  parameters.value.jobs = [];
  parameters.value.level = { max: 25, min: -1 };
  nickname.value = false;
};

const filterGendersFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    npc_parameters_store.npcParameters.genders = genderFilter.value.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterAncestriesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    npc_parameters_store.npcParameters.ancestries = ancestryFilter.value.filter(
      v => v.toLowerCase().includes(filter)
    );
  });
};

const filterCulturesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    npc_parameters_store.npcParameters.cultures = culturesFilter.value.filter(
      v => v.toLowerCase().includes(filter)
    );
  });
};

const filterClassesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    npc_parameters_store.npcParameters.classes = classFilter.value.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterJobsFn = (val: string, update: (fn: () => void) => void): void => {
  update(() => {
    const filter = val.toLowerCase();
    npc_parameters_store.npcParameters.jobs = jobFilter.value.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};
</script>

<template>
  <div class="tw:h-full">
    <q-layout
      id="shepherd-0"
      view="lHh lpr lFf"
      container
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200 tw:rounded-xl tw:shadow-sm tw:bg-white tw:dark:bg-gray-800 tw:dark:border-gray-700"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:flex-wrap tw:mx-4 tw:my-0.5">
          <div class="tw:flex tw:shrink">
            <span
              class="text-h6 tw:my-auto font-bold tw:text-gray-800 tw:dark:text-gray-200"
            >
              NPC Generator
            </span>
          </div>
          <q-space />
          <div class="tw:flex tw:py-1">
            <q-btn
              flat
              round
              dense
              class="tw:mx-2!"
              :icon="biEraser"
              size="md"
              padding="sm"
              aria-label="Clear filters"
              @click="resetParameters"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Clear Parameters
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-header>
      <q-page-container>
        <div class="tw:justify-center">
          <div class="tw:flex tw:flex-col tw:gap-5 tw:my-4 tw:mx-16">
            <q-select
              label="Genders"
              v-model="parameters.genders"
              class="tw:py-1"
              multiple
              dense
              outlined
              clearable
              options-dense
              use-input
              input-debounce="0"
              :options="
                Object.freeze(npc_parameters_store.npcParameters.genders)
              "
              @filter="filterGendersFn"
            />

            <div class="tw:flex tw:flex-wrap tw:justify-center tw:gap-2">
              <q-select
                v-if="
                  npc_store.npcs[npc_store.activeNpc]!.has_culture &&
                  settings_store.game === 'pf'
                "
                label="Cultures"
                v-model="parameters.cultures"
                class="tw:grow tw:max-w-full"
                multiple
                dense
                outlined
                clearable
                options-dense
                use-input
                input-debounce="0"
                :options="
                  Object.freeze(npc_parameters_store.npcParameters.cultures)
                "
                @filter="filterCulturesFn"
              />
              <q-select
                v-else
                label="Ancestries"
                v-model="parameters.ancestries"
                class="tw:grow tw:max-w-full"
                multiple
                dense
                outlined
                clearable
                options-dense
                use-input
                input-debounce="0"
                :options="
                  Object.freeze(npc_parameters_store.npcParameters.ancestries)
                "
                @filter="filterAncestriesFn"
              />
              <q-toggle
                v-if="settings_store.game === 'pf'"
                v-model="npc_store.npcs[npc_store.activeNpc]!.has_culture"
                label="Use Culture"
                class="tw:shrink"
                aria-label="Toggle Culture"
              >
              </q-toggle>
            </div>

            <q-select
              label="Classes"
              v-model="parameters.classes"
              multiple
              dense
              outlined
              clearable
              options-dense
              use-input
              input-debounce="0"
              :options="
                Object.freeze(npc_parameters_store.npcParameters.classes)
              "
              @filter="filterClassesFn"
            />
            <q-select
              label="Jobs"
              v-model="parameters.jobs"
              multiple
              dense
              outlined
              clearable
              options-dense
              use-input
              input-debounce="0"
              :options="Object.freeze(npc_parameters_store.npcParameters.jobs)"
              @filter="filterJobsFn"
            />
            <div class="tw:flex tw:flex-col">
              <span class="tw:text-gray-800 tw:dark:text-gray-200">
                Level range:
              </span>
              <q-range
                v-model="parameters.level"
                class="tw:mb-2"
                markers
                label-always
                switch-label-side
                role="menuitem"
                :min="-1"
                :max="25"
                :left-label-value="'Min: ' + parameters.level.min"
                :right-label-value="'Max: ' + parameters.level.max"
              />
            </div>
            <q-checkbox
              class="tw:mx-auto"
              v-model="nickname"
              label="Nickname"
            />
          </div>
        </div>
      </q-page-container>

      <q-footer
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
        <div class="tw:flex tw:grow tw:justify-center tw:my-2 tw:mx-8">
          <q-btn
            id="shepherd-1"
            color="primary"
            push
            label="Generate NPC"
            @click="generateNpc"
            class="tw:basis-xs"
          >
            <q-icon right class="tw:py-2">
              <DiceIcon />
            </q-icon>
          </q-btn>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>

<style scoped>
.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
