<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import type { creature } from 'src/types/creature';
import { requestCreatureId } from 'src/utils/api-calls';
import _, { isNull } from 'lodash';

const title = ref('Creature Sheet - BYBE');

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
      title.value = creatureData?.core_data.essential.name + ' - BYBE';
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

const addPlus = (value: number | undefined) => {
  if (value != undefined && value > 0) {
    return '+' + value;
  } else {
    return value;
  }
};

const perceptionString = () => {
  const perception = creatureData?.extra_data?.perception;
  const senses = creatureData?.extra_data?.senses;
  let finalString = '';
  if (perception != undefined) {
    finalString += addPlus(perception) + '; ';
  }
  if (senses != undefined && senses.length > 0) {
    senses.forEach((sense) => {
      return creatureData?.extra_data?.actions.forEach((action) => {
        if (action.slug === sense) {
          finalString += action.name.toLowerCase() + ', ';
        }
      });
    });
    if (creatureData?.extra_data?.perception_detail) {
      finalString += creatureData?.extra_data?.perception_detail;
    } else {
      finalString = finalString.substring(0, finalString.length - 2);
    }
  }
  return finalString;
};

const languageString = () => {
  const languages = creatureData?.extra_data?.languages;
  let finalString = '';
  if (languages != undefined && languages.length > 0) {
    languages.forEach((language) => {
      finalString += _.upperFirst(language) + ', ';
    });
  }
  finalString = finalString.substring(0, finalString.length - 2);
  finalString += '; ';
  if (creatureData?.extra_data?.language_detail) {
    finalString += creatureData?.extra_data?.language_detail;
  } else {
    finalString = finalString.substring(0, finalString.length - 2);
  }
  return finalString;
};

const skillString = () => {
  const skills = creatureData?.extra_data?.skills;
  let finalString = '';
  if (skills != undefined && skills.length > 0) {
    skills.forEach((skill) => {
      finalString += skill.name + ' ' + addPlus(skill.modifier) + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
};

const weaponString = () => {
  const weapons = creatureData?.combat_data?.weapons;
  let finalString = '';
  if (weapons != undefined && weapons.length > 0) {
    weapons.forEach((weapon) => {
      finalString += weapon.name.toLowerCase() + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
};

const defenceString = () => {
  const actions = creatureData?.extra_data?.actions;
  let finalString = '';
  if (actions != undefined && actions.length > 0) {
    finalString += '(';
    actions.forEach((action) => {
      if (action.action_type === 'passive' && action.category === 'defensive') {
        finalString += action.name.toLowerCase() + ', ';
      }
    });
    finalString = finalString.substring(0, finalString.length - 2);
    if (finalString != '') {
      finalString += ')';
    }
  }
  return finalString;
};

const immunityString = () => {
  const immunities = creatureData?.combat_data?.immunities;
  let finalString = '';
  if (immunities != undefined && immunities.length > 0) {
    immunities.forEach((immunnity) => {
      finalString += immunnity.toLowerCase() + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
};

const resistanceString = () => {
  const resistances = creatureData?.combat_data?.resistances;
  const resistKeys = Object.keys(resistances!);
  let finalString = '';

  if (resistKeys.length > 0) {
    for (const resistance of resistKeys) {
      finalString +=
        `${resistance}` + ' ' + `${creatureData?.combat_data?.resistances[resistance]}` + ', ';
    }
  }
  return finalString.substring(0, finalString.length - 2);
};

const weaknessString = () => {
  const weaknesses = creatureData?.combat_data?.weaknesses;
  const weakKeys = Object.keys(weaknesses!);
  let finalString = '';
  if (weakKeys.length > 0) {
    for (const weakness of weakKeys) {
      finalString +=
        `${weakness}` + ' ' + `${creatureData?.combat_data?.weaknesses[weakness]}` + ', ';
    }
  }
  return finalString.substring(0, finalString.length - 2);
};

const speedString = () => {
  const speeds = creatureData?.extra_data?.speeds;
  const speedKeys = Object.keys(speeds!);
  let finalString = '';
  if (speedKeys.length > 0) {
    for (const speed of speedKeys) {
      if (`${speed}` === 'Base') {
        finalString += `${creatureData?.extra_data?.speeds[speed]}` + ' feet, ';
      } else {
        finalString += `${speed}` + ' ' + `${creatureData?.extra_data?.speeds[speed]}` + ' feet, ';
      }
    }
  }
  return finalString.substring(0, finalString.length - 2);
};
</script>

<template>
  <q-page class="tw-items-center tw-max-w-[50rem] tw-m-auto tw-p-2">
    <q-scroll-area style="height: calc(100vh - 123px); width: auto">
      <div class="q-gutter-y-xs">
        <div
          class="tw-flex tw-flex-row tw-font-bold tw-text-lg tw-text-gray-800 dark:tw-text-white"
        >
          <div class="tw-flex-none tw-mr-2">
            {{ creatureData?.core_data.essential.name.toUpperCase() }}
          </div>
          <div class="tw-flex-grow"></div>
          <div class="tw-flex-none">
            {{ creatureData?.core_data.essential.cr_type.toUpperCase() }}
            {{ creatureData?.core_data.essential.level }}
          </div>
        </div>
        <q-separator class="tw-flex" style="height: 2px" />
        <div class="tw-flex tw-flex-rows tw-flex-wrap tw-font-bold tw-text-xs tw-text-white">
          <div v-if="creatureData?.core_data.essential.rarity === 'Common'"></div>
          <div
            v-else-if="creatureData?.core_data.essential.rarity === 'Uncommon'"
            class="tw-bg-[#c45500] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
          >
            {{ creatureData?.core_data.essential.rarity.toUpperCase() }}
          </div>
          <div
            v-else-if="creatureData?.core_data.essential.rarity === 'Rare'"
            class="tw-bg-[#0c1466] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
          >
            {{ creatureData?.core_data.essential.rarity.toUpperCase() }}
          </div>
          <div
            v-else-if="creatureData?.core_data.essential.rarity === 'Unique'"
            class="tw-bg-[#800080] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
          >
            {{ creatureData?.core_data.essential.rarity.toUpperCase() }}
          </div>
          <div class="tw-bg-[#4287f5] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
            {{ creatureData?.core_data.essential.alignment.toUpperCase() }}
          </div>
          <div class="tw-bg-[#478c42] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1">
            {{ creatureData?.core_data.essential.size.toUpperCase() }}
          </div>
          <div
            v-for="item in creatureData?.core_data.traits"
            :key="item"
            class="tw-bg-[#522e2c] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
          >
            {{ item.toUpperCase() }}
          </div>
        </div>
        <div class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white">
          <b>Source</b> &nbsp;
          <i class="tw-text-[#60a5fa]"> {{ creatureData?.core_data.essential.source }} </i>
        </div>
        <div class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white">
          <b>Perception</b> &nbsp;
          <div>
            {{ perceptionString() }}
          </div>
        </div>
        <div
          v-if="
            creatureData?.extra_data?.languages != undefined &&
            creatureData?.extra_data?.languages.length > 0
          "
          class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white"
        >
          <b>Languages</b> &nbsp;
          <div>
            {{ languageString() }}
          </div>
        </div>
        <div
          v-if="
            creatureData?.extra_data?.skills != undefined &&
            creatureData?.extra_data?.skills.length > 0
          "
          class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white"
        >
          <b>Skills</b>&nbsp;
          <div>
            {{ skillString() }}
          </div>
        </div>
        <div class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white">
          <b>Str</b> &nbsp;
          <div>{{ addPlus(creatureData?.extra_data?.ability_scores.strength) }},&nbsp;</div>
          <b>Dex</b> &nbsp;
          <div>{{ addPlus(creatureData?.extra_data?.ability_scores.dexterity) }},&nbsp;</div>
          <b>Con</b> &nbsp;
          <div>{{ addPlus(creatureData?.extra_data?.ability_scores.constitution) }},&nbsp;</div>
          <b>Int</b> &nbsp;
          <div>{{ addPlus(creatureData?.extra_data?.ability_scores.intelligence) }},&nbsp;</div>
          <b>Wis</b> &nbsp;
          <div>{{ addPlus(creatureData?.extra_data?.ability_scores.wisdom) }},&nbsp;</div>
          <b>Cha</b> &nbsp;
          <div>{{ addPlus(creatureData?.extra_data?.ability_scores.charisma) }}</div>
        </div>
        <div
          v-if="
            creatureData?.combat_data?.weapons != undefined &&
            creatureData?.combat_data?.weapons.length > 0
          "
          class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white"
        >
          <b>Items</b> &nbsp;
          <div>
            {{ weaponString() }}
          </div>
        </div>
        <q-separator class="tw-flex tw-my-2" style="height: 2px" />
        <div class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white">
          <b>AC</b>&nbsp;
          <div>{{ creatureData?.combat_data?.ac }};&nbsp;</div>
          <b>Fort</b> &nbsp;
          <div>{{ addPlus(creatureData?.combat_data?.saving_throws.fortitude) }},&nbsp;</div>
          <b>Ref</b> &nbsp;
          <div>{{ addPlus(creatureData?.combat_data?.saving_throws.reflex) }},&nbsp;</div>
          <b>Will</b> &nbsp;
          <div>{{ addPlus(creatureData?.combat_data?.saving_throws.will) }}&nbsp;</div>
          <div>{{ defenceString() }}</div>
        </div>
        <!-- TODO: fix text wrapping -->
        <div
          class="tw-flex tw-flex-row tw-text-wrap tw-text-sm tw-text-gray-800 dark:tw-text-white"
        >
          <b>HP</b> &nbsp;
          <div>{{ creatureData?.core_data.essential.hp }}</div>
          <div
            v-if="
              creatureData?.combat_data?.immunities != undefined &&
              creatureData?.combat_data?.immunities.length > 0
            "
            class="tw-flex-none tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            ;&nbsp;<b>Immunities</b>
            {{ immunityString() }}
          </div>
          <div
            v-if="
              creatureData?.combat_data?.resistances != undefined &&
              Object.keys(creatureData?.combat_data?.resistances).length > 0
            "
            class="tw-flex-none tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            ;&nbsp;<b>Resistances</b>
            {{ resistanceString() }}
          </div>
          <div
            v-if="
              creatureData?.combat_data?.weaknesses != undefined &&
              Object.keys(creatureData?.combat_data?.weaknesses).length > 0
            "
            class="tw-flex-none tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            ;&nbsp;<b>Weaknesess</b>
            {{ weaknessString() }}
          </div>
        </div>
        <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
          <div
            v-if="item.description != '' && item.category === 'defensive'"
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            <b>{{ item.name }}</b>
            <span
              v-if="item.action_type === 'reaction'"
              style="font-family: Pathfinder2eActions; font-size: x-large"
            >
              5
            </span>
            {{ item.description }}
          </div>
        </div>
        <q-separator class="tw-flex tw-my-2" style="height: 2px" />
        <div
          v-if="
            creatureData?.extra_data?.speeds != undefined &&
            Object.keys(creatureData?.extra_data?.speeds).length > 0
          "
          class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white"
        >
          <b>Speed</b> &nbsp;
          <div>
            {{ speedString() }}
          </div>
        </div>

        <div
          v-for="item in creatureData?.combat_data?.weapons"
          :key="item.name"
          class="tw-flex tw-flex-row tw-text-sm tw-text-gray-800 dark:tw-text-white"
        >
          <b v-if="item.wp_type === 'melee'">Melee</b>
          <b v-if="item.wp_type === 'ranged'">Ranged</b>
          &nbsp;
          <div style="font-family: Pathfinder2eActions; font-size: x-large">1</div>
          &nbsp; <i>{{ item.name.toLowerCase() }}&nbsp; </i> {{ addPlus(item.to_hit_bonus) }},&nbsp;
          <b>Damage&nbsp;</b> {{ item.n_of_dices }}{{ item.die_size }}+{{ item.bonus_dmg }}
          {{ item.dmg_type }}
        </div>
        <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
          <div
            v-if="item.category === 'offensive'"
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            <b>{{ item.name }}</b>
            <span
              v-if="item.n_of_actions === 1"
              style="font-family: Pathfinder2eActions; font-size: x-large"
            >
              1
            </span>
            <span
              v-else-if="item.n_of_actions === 2"
              style="font-family: Pathfinder2eActions; font-size: x-large"
            >
              2
            </span>
            <span
              v-else-if="item.n_of_actions === 3"
              style="font-family: Pathfinder2eActions; font-size: x-large"
            >
              3
            </span>
            {{ item.description }}
          </div>
        </div>
        <!-- TODO: add spellcasting -->
      </div>
    </q-scroll-area>
  </q-page>
</template>
