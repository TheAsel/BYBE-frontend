<script setup lang="ts">
import { biEraser } from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash-es';
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';

import { npcParametersStore, npcStore } from '../../../stores/store';
import { npcGenerator, requestAncestries, requestParameters } from '../../../utils/npc-api-calls';

const $q = useQuasar();

const npcParameters = npcParametersStore();
const npcs = npcStore();

const parameters = ref<{
  genders: string[];
  ancestries: string[];
  cultures: string[];
  classes: string[];
  jobs: string[];
  level: { min: number; max: number };
}>({
  genders: [],
  ancestries: [],
  cultures: [],
  classes: [],
  jobs: [],
  level: { min: -1, max: 25 }
});

const nickname = ref<boolean>(false);

const genderFilter = ref<string[]>(npcParameters.getNpcParameters.genders);
const ancestryFilter = ref<string[]>(npcParameters.getNpcParameters.ancestries);
const culturesFilter = ref<string[]>(npcParameters.getNpcParameters.cultures);
const classFilter = ref<string[]>(npcParameters.getNpcParameters.classes);
const jobFilter = ref<string[]>(npcParameters.getNpcParameters.jobs);

onMounted(async () => {
  try {
    const gendersRequest = await requestParameters('pf', 'genders');
    if (gendersRequest) {
      npcParameters.updateGenders(gendersRequest);
      genderFilter.value = npcParameters.getNpcParameters.genders;
    } else {
      throw new Error('Error fetching genders');
    }
    const ancestriesRequest = await requestAncestries('pf');
    if (ancestriesRequest) {
      npcParameters.updateValidGenders(ancestriesRequest);
      npcParameters.updateAncestries(
        ancestriesRequest.map((valid_genders) => valid_genders.ancestry).sort()
      );
      ancestryFilter.value = npcParameters.getNpcParameters.ancestries;
    } else {
      throw new Error('Error fetching ancestries');
    }
    const culturesRequest = await requestParameters('pf', 'cultures');
    if (culturesRequest) {
      npcParameters.updateCultures(culturesRequest.sort());
      culturesFilter.value = npcParameters.getNpcParameters.cultures;
    } else {
      throw new Error('Error fetching cultures');
    }
    const classesRequest = await requestParameters('pf', 'classes');
    if (classesRequest) {
      npcParameters.updateClasses(classesRequest.sort());
      classFilter.value = npcParameters.getNpcParameters.classes;
    } else {
      throw new Error('Error fetching classes');
    }
    const jobsRequest = await requestParameters('pf', 'jobs');
    if (jobsRequest) {
      npcParameters.updateJobs(jobsRequest.sort());
      jobFilter.value = npcParameters.getNpcParameters.jobs;
    } else {
      throw new Error('Error fetching jobs');
    }
  } catch (error) {
    console.error(error);
  }
});

const generateNpc = debounce(async function () {
  npcs.setGenerating(true);

  const post: {
    gender_filter?: string[] | undefined;
    name_origin_filter?: {
      FromAncestry?: string[];
      FromCulture?: string[];
    };
    class_filter?: string[] | undefined;
    job_filter?: string[] | undefined;
    level_filter?: {
      min_level: number | undefined;
      max_level: number | undefined;
    };
    generate_nickname: boolean;
  } = {
    generate_nickname: nickname.value
  };

  if (parameters.value.genders && parameters.value.genders.length > 0) {
    const tmpGenders = parameters.value.genders.map((_gender) => {
      return _gender.replaceAll(' ', '');
    });
    post.gender_filter = tmpGenders;
  }

  if (
    !npcs.getActiveNpc!.culture &&
    parameters.value.ancestries &&
    parameters.value.ancestries.length > 0
  ) {
    const tmpAncestries = parameters.value.ancestries.map((_ancestry) => {
      return _ancestry.replaceAll(' ', '');
    });
    post.name_origin_filter = { FromAncestry: tmpAncestries };
  } else if (!npcs.getActiveNpc!.culture) {
    post.name_origin_filter = { FromAncestry: [] };
  }

  if (
    npcs.getActiveNpc!.culture &&
    parameters.value.cultures &&
    parameters.value.cultures.length > 0
  ) {
    const tmpCultures = parameters.value.cultures.map((_culture) => {
      return _culture.replaceAll(' ', '');
    });
    post.name_origin_filter = { FromCulture: tmpCultures };
  } else if (npcs.getActiveNpc!.culture) {
    post.name_origin_filter = { FromCulture: [] };
  }

  if (parameters.value.classes && parameters.value.classes.length > 0) {
    const tmpClasses = parameters.value.classes.map((_class) => {
      return _class.replaceAll(' ', '');
    });
    post.class_filter = tmpClasses;
  }

  if (parameters.value.jobs && parameters.value.jobs.length > 0) {
    const tmpJobs = parameters.value.jobs.map((_job) => {
      return _job.replaceAll(' ', '');
    });
    post.job_filter = tmpJobs;
  }

  post.level_filter = {
    min_level: parameters.value.level.min,
    max_level: parameters.value.level.max
  };

  try {
    const randomNpc = await npcGenerator('pf', post);
    if (randomNpc === undefined) {
      throw new TypeError('Error generating random npc');
    }
    if (!npcs.getLocks.name) {
      npcs.getActiveNpc!.npc.name = randomNpc.name;
    }
    if (!npcs.getLocks.nickname) {
      npcs.getActiveNpc!.npc.nickname = randomNpc.nickname;
    }
    // regex: adds spaces between words
    if (!npcs.getLocks.gender) {
      randomNpc.gender = randomNpc.gender!.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
      npcs.getActiveNpc!.npc.gender = randomNpc.gender;
    }
    if (!npcs.getLocks.ancestry) {
      randomNpc.ancestry = randomNpc.ancestry!.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
      npcs.getActiveNpc!.npc.ancestry = randomNpc.ancestry;
    }
    if (!npcs.getLocks.culture) {
      randomNpc.culture = randomNpc.culture!.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
      npcs.getActiveNpc!.npc.culture = randomNpc.culture;
    }
    if (!npcs.getLocks.class) {
      randomNpc.class = randomNpc.class!.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
      npcs.getActiveNpc!.npc.class = randomNpc.class;
    }
    if (!npcs.getLocks.job) {
      randomNpc.job = randomNpc.job!.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
      npcs.getActiveNpc!.npc.job = randomNpc.job;
    }
    if (!npcs.getLocks.level) {
      npcs.getActiveNpc!.npc.level = randomNpc.level;
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error generating random npc',
      icon: matPriorityHigh
    });
  }

  npcs.setGenerating(false);
}, 300);

const resetParameters = () => {
  parameters.value.genders = [];
  parameters.value.ancestries = [];
  parameters.value.cultures = [];
  parameters.value.classes = [];
  parameters.value.jobs = [];
  parameters.value.level = { min: -1, max: 25 };
  nickname.value = false;
};

const filterGendersFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.genders = genderFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterAncestriesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.ancestries = ancestryFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterCulturesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.cultures = culturesFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterClassesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.classes = classFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterJobsFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.jobs = jobFilter.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};
</script>

<template>
  <div class="q-pa-md tw:w-full tw:md:w-[33%]">
    <q-layout
      id="v-step-0"
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 126px)"
      class="tw:opacity-85 tw:dark:opacity-90 tw:overflow-auto tw:border tw:border-gray-200 tw:rounded-xl tw:shadow-sm tw:bg-white tw:dark:bg-gray-800 tw:dark:border-gray-700"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:flex-wrap tw:mx-4 tw:my-0.5">
          <div class="tw:flex tw:shrink">
            <span class="text-h6 tw:my-auto font-bold tw:text-gray-800 tw:dark:text-gray-200">
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
              :options="Object.freeze(npcParameters.getNpcParameters.genders)"
              @filter="filterGendersFn"
            />

            <div class="tw:flex tw:flex-wrap tw:justify-center tw:gap-2">
              <q-select
                v-if="!npcs.getActiveNpc!.culture"
                label="Ancestries"
                v-model="parameters.ancestries"
                class="tw:grow"
                multiple
                dense
                outlined
                clearable
                options-dense
                use-input
                input-debounce="0"
                :options="Object.freeze(npcParameters.getNpcParameters.ancestries)"
                @filter="filterAncestriesFn"
              />
              <q-select
                v-else
                label="Cultures"
                v-model="parameters.cultures"
                class="tw:grow"
                multiple
                dense
                outlined
                clearable
                options-dense
                use-input
                input-debounce="0"
                :options="Object.freeze(npcParameters.getNpcParameters.cultures)"
                @filter="filterCulturesFn"
              />
              <q-toggle
                v-model="npcs.getActiveNpc!.culture"
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
              :options="Object.freeze(npcParameters.getNpcParameters.classes)"
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
              :options="Object.freeze(npcParameters.getNpcParameters.jobs)"
              @filter="filterJobsFn"
            />
            <div class="tw:flex tw:flex-col">
              <span class="tw:text-gray-800 tw:dark:text-gray-200"> Level range: </span>
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
            <q-checkbox class="tw:mx-auto" v-model="nickname" label="Nickname" />
          </div>
        </div>
      </q-page-container>

      <q-footer
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
        <div class="tw:flex tw:grow tw:justify-center tw:my-2 tw:mx-8">
          <q-btn
            id="v-step-1"
            color="primary"
            push
            label="Generate NPC"
            @click="generateNpc"
            class="tw:basis-xs"
          >
            <q-icon right class="tw:py-2">
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
