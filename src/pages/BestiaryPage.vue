<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import type { creature } from 'src/types/creature';
import { requestCreatureId } from 'src/utils/api-calls';
import { isNull } from 'lodash';

const title = ref('Creature Sheet - BYBE')

useHead({
  title: title,
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
    } else {
      title.value = creatureData!.core_data.essential.name + ' - BYBE'
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

const addPlus = (value: number) => {
  if (value > 0) {
    return '+' + value
  } else {
    return value
  }
}

const perceptionString = () => {
  const perception = creatureData!.extra_data!.perception
  const senses = creatureData!.extra_data!.senses
  var finalString = addPlus(perception)
  if (senses.length > 0) {
    finalString = finalString + '; '
    senses.forEach((sense) => {
      return creatureData!.extra_data!.actions.forEach((action) => {
        if (action.slug === sense) {
          finalString = finalString + action.name.toLowerCase() + ', '
        }
      })
    })
    if (creatureData!.extra_data!.perception_detail) {
      finalString = finalString + creatureData!.extra_data!.perception_detail
    } else {
      finalString = finalString.substring(0, finalString.length - 2);
    }
  }
  return finalString
}

</script>

<template>
  <q-page class="tw-px-96 tw-py-4 items-center justify-evenly">
    <div class="tw-flex tw-flex-row tw-font-bold tw-text-lg tw-text-gray-800 dark:tw-text-white">
      <div class="tw-flex-none">
        {{ creatureData!.core_data.essential.name.toUpperCase() }}
      </div>
      <div class="tw-flex-grow" />
      <div class="tw-flex-none">
        {{ creatureData!.core_data.essential.cr_type.toUpperCase() }}
        {{ creatureData!.core_data.essential.level }}
      </div>
    </div>
    <q-separator style="height: 2px;" />
    <div class="tw-flex tw-flex-rows tw-font-bold tw-text-xs tw-text-white">
      <div v-if="creatureData!.core_data.essential.rarity === 'Common'" />
      <div v-else-if="creatureData!.core_data.essential.rarity === 'Uncommon'"
        class="tw-bg-[#c45500] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
        {{ creatureData!.core_data.essential.rarity.toUpperCase() }}
      </div>
      <div v-else-if="creatureData!.core_data.essential.rarity === 'Rare'"
        class="tw-bg-[#0c1466] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
        {{ creatureData!.core_data.essential.rarity.toUpperCase() }}
      </div>
      <div v-else-if="creatureData!.core_data.essential.rarity === 'Unique'"
        class="tw-bg-[#800080] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
        {{ creatureData!.core_data.essential.rarity.toUpperCase() }}
      </div>
      <div class="tw-bg-[#4287f5] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
        {{ creatureData!.core_data.essential.alignment.toUpperCase() }}
      </div>
      <div class="tw-bg-[#478c42] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
        {{ creatureData!.core_data.essential.size.toUpperCase() }}
      </div>
      <div v-for="item in creatureData!.core_data.traits" :key="item"
        class="tw-bg-[#522e2c] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
        {{ item.toUpperCase() }}
      </div>
    </div>
    <div class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white">
      <b>Source</b> &nbsp; <i class="tw-text-[#60a5fa]"> {{ creatureData!.core_data.essential.source }} </i>
    </div>
    <div class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white">
      <b>Perception</b> &nbsp;
      <div>
        {{ perceptionString() }}
      </div>
    </div>
  </q-page>
</template>
