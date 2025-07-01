<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { npcParametersStore, npcStore } from '../../stores/store';
import { debounce } from 'lodash-es';
import { requestParameters, npcGenerator, requestAncestries } from 'src/utils/npc-api-calls';
import { biEraser } from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';

const $q = useQuasar();

const npcParameters = npcParametersStore();
const npcs = npcStore();

const parameters = ref<{
  genders: string[];
  ancestries: string[];
  classes: string[];
  jobs: string[];
}>({
  genders: [],
  ancestries: [],
  classes: [],
  jobs: []
});

const nickname = ref<boolean>(false);

const genderFilter = ref<string[]>(npcParameters.getNpcParameters.genders);
const ancestryFilter = ref<string[]>(npcParameters.getNpcParameters.ancestries);
const classFilter = ref<string[]>(npcParameters.getNpcParameters.classes);
const jobFilter = ref<string[]>(npcParameters.getNpcParameters.jobs);

onMounted(async () => {
  try {
    const gendersRequest = await requestParameters('genders');
    if (gendersRequest) {
      npcParameters.updateGenders(gendersRequest);
      genderFilter.value = npcParameters.getNpcParameters.genders;
    } else {
      throw new Error('Error fetching genders');
    }
    const ancestriesRequest = await requestAncestries();
    if (ancestriesRequest) {
      npcParameters.updateValidGenders(ancestriesRequest);
      npcParameters.updateAncestries(
        ancestriesRequest.map((valid_genders) => valid_genders.ancestry)
      );
      ancestryFilter.value = npcParameters.getNpcParameters.ancestries;
    } else {
      throw new Error('Error fetching ancestries');
    }
    const classesRequest = await requestParameters('classes');
    if (classesRequest) {
      npcParameters.updateClasses(classesRequest);
      classFilter.value = npcParameters.getNpcParameters.classes;
    } else {
      throw new Error('Error fetching classes');
    }
    const jobsRequest = await requestParameters('jobs');
    if (jobsRequest) {
      npcParameters.updateJobs(jobsRequest);
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
    ancestry_filter?: string[] | undefined;
    class_filter?: string[] | undefined;
    job_filter?: string[] | undefined;
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

  if (parameters.value.ancestries && parameters.value.ancestries.length > 0) {
    const tmpAncestries = parameters.value.ancestries.map((_ancestry) => {
      return _ancestry.replaceAll(' ', '');
    });
    post.ancestry_filter = tmpAncestries;
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

  try {
    const randomNpc = await npcGenerator(post);
    if (typeof randomNpc != 'undefined') {
      npcs.clearNpc();
      randomNpc.gender = randomNpc.gender!.replace(/([a-z])([A-Z])/g, '$1 $2');
      randomNpc.ancestry = randomNpc.ancestry!.replace(/([a-z])([A-Z])/g, '$1 $2');
      randomNpc.class = randomNpc.class!.replace(/([a-z])([A-Z])/g, '$1 $2');
      randomNpc.job = randomNpc.job!.replace(/([a-z])([A-Z])/g, '$1 $2');
      npcs.getActiveNpc!.npc = randomNpc;
    } else {
      throw new Error('Error generating random npc');
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
  parameters.value.classes = [];
  parameters.value.jobs = [];
  nickname.value = false;
};

const filterGendersFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.genders = genderFilter.value.filter(
      (v) => v.toLowerCase().indexOf(filter) > -1
    );
  });
};

const filterAncestriesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.ancestries = ancestryFilter.value.filter(
      (v) => v.toLowerCase().indexOf(filter) > -1
    );
  });
};

const filterClassesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.classes = classFilter.value.filter(
      (v) => v.toLowerCase().indexOf(filter) > -1
    );
  });
};

const filterJobsFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    npcParameters.getNpcParameters.jobs = jobFilter.value.filter(
      (v) => v.toLowerCase().indexOf(filter) > -1
    );
  });
};
</script>

<template>
  <div class="q-pa-md tw-w-full md:tw-w-[33%]">
    <q-layout
      id="v-step-0"
      view="lHh lpr lFf"
      container
      style="height: calc(100vh - 122px)"
      class="tw-opacity-85 dark:tw-opacity-90 tw-overflow-auto tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-bg-white dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <q-header
        bordered
        class="tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800 dark:!tw-border-gray-700"
      >
        <div class="tw-flex tw-flex-wrap tw-mx-4 tw-my-0.5">
          <div class="tw-flex tw-flex-shrink">
            <span class="text-h6 tw-my-auto font-bold tw-text-gray-800 dark:tw-text-gray-200">
              NPC Generator
            </span>
          </div>
          <q-space />
          <div class="tw-flex tw-py-1">
            <q-btn
              flat
              round
              dense
              class="tw-mx-2"
              :icon="biEraser"
              size="md"
              padding="sm"
              aria-label="Clear filters"
              @click="resetParameters"
            >
              <q-tooltip
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
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
        <div class="tw-w-64 tw-mx-auto tw-mt-4 tw-space-y-3">
          <q-select
            label="Genders"
            v-model="parameters.genders"
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
          <q-select
            label="Ancestries"
            v-model="parameters.ancestries"
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
          <q-checkbox v-model="nickname" label="Nickname" />
        </div>
      </q-page-container>
      <q-page-container
        bordered
        class="tw-text-gray-800 dark:tw-text-gray-200 tw-bg-white dark:tw-bg-gray-800 dark:!tw-border-gray-700"
      >
        <div class="tw-flex tw-mx-4">
          <div class="text-subtitle1 font-bold tw-whitespace-nowrap tw-mx-auto tw-py-2.5 tw-pr-4">
            <q-btn
              id="v-step-1"
              unelevated
              v-close-popup
              label="GENERATE NPC"
              type="submit"
              class="tw-text-blue-600 dark:tw-text-blue-400"
              @click="generateNpc"
            />
          </div>
        </div>
      </q-page-container>
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
