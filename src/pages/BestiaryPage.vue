<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import type { creature } from 'src/types/creature';
import { requestCreatureId } from 'src/utils/api-calls';
import { isNull } from 'lodash';

useHead({
  title: 'Creature Sheet - BYBE',
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/bestiary'
    }
  ]
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const creatureId = Number(route.query.id);
let creatureData: creature | undefined;
try {
  if (creatureId !== undefined && !isNaN(creatureId)) {
    creatureData = await requestCreatureId(creatureId);
    if (isNull(creatureData) || creatureData === undefined) {
      console.error('Missing creature ID');
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing creature ID',
        icon: matPriorityHigh
      });
      router.push({ name: 'encounter' });
    }
  } else {
    console.error('Invalid creature ID');
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Invalid creature ID',
      icon: matPriorityHigh
    });
    router.push({ name: 'encounter' });
  }
} catch (error) {
  console.error(error);
}
</script>

<template>
  <q-page class="tw-flex row items-center justify-evenly">
    <div class="tw-text-center tw-py-10 tw-px-4 sm:tw-px-6 lg:tw-px-8">
      <h1
        class="tw-block tw-text-base tw-font-bold tw-text-gray-800 dark:tw-text-white sm:tw-text-lg"
      >
        {{ creatureData?.core_data.essential.name.toUpperCase() }}
        {{ creatureData?.core_data.essential.cr_type.toUpperCase() }}
        {{ creatureData?.core_data.essential.level }}
      </h1>
    </div>
  </q-page>
</template>
