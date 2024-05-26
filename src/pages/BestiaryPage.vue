<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { matPriorityHigh, matArrowDropDown } from '@quasar/extras/material-icons';
import type { creature } from 'src/types/creature';
import { requestCreatureId } from 'src/utils/api-calls';
import _, { isNull } from 'lodash';
import { variants } from 'src/types/filters';

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
const queryVariant: string = String(route.query.variant).toLowerCase();
const creatureVariant = ref<variants>('Base');

let creatureData: creature | undefined;
try {
  if (creatureId !== undefined && !isNaN(creatureId)) {
    switch (queryVariant) {
      case 'weak':
        creatureVariant.value = 'Weak';
        creatureData = await requestCreatureId(creatureId, 'Weak');
        break;
      case 'elite':
        creatureVariant.value = 'Elite';
        creatureData = await requestCreatureId(creatureId, 'Elite');
        break;
      default:
        creatureVariant.value = 'Base';
        creatureData = await requestCreatureId(creatureId, 'Base');
        break;
    }
    if (isNull(creatureData) || creatureData === undefined) {
      console.error('Missing creature ID');
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'Missing creature ID',
        icon: matPriorityHigh
      });
      router.push({ name: 'encounter' });
    } else if (creatureVariant.value === 'Base') {
      title.value = creatureData?.core_data.essential.name + ' - BYBE';
    } else {
      title.value =
        creatureVariant.value + ' ' + creatureData?.core_data.essential.name + ' - BYBE';
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

const changeVariant = (variant: variants) => {
  if (creatureVariant.value === 'Base') {
    const routeData = router.resolve({
      name: 'bestiary',
      query: { id: creatureId }
    });
    window.open(routeData.href, '_self');
  } else {
    const routeData = router.resolve({
      name: 'bestiary',
      query: { id: creatureId, variant: variant.toLowerCase() }
    });
    window.open(routeData.href, '_self');
  }
};

const addPlus = (value: number | undefined) => {
  if (value != undefined && value > 0) {
    return '+' + value;
  } else {
    return value;
  }
};

const variantStyle = (value: number | undefined) => {
  if (value && creatureVariant.value != 'Base') {
    let valueStr = value.toString();
    valueStr = '<span class="tw-text-red-600"><b>' + value + '</b></span>';
    return valueStr;
  }
  return value;
};

const cleanDescription = (description: string) => {
  let finalString = '';
  const cleanRegex = /<\/?(?:p)?(?:li)?(?:ul)?>|<hr\ ?\/>|@Localize\[.+\]/g;
  const compendiumRegex =
    /@UUID\[Compendium\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s'()+]*)\](?:{([\w\s'+]*)})?/g;
  const effectRegex =
    /@UUID\[Compendium\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s]*)\.([\w\-\s]*): ([\w\s\-'()]*)\](?:{([\w\s']*)})?/g;
  const damageRegex =
    /@Damage\[\(?([\d]*d?[\d]*\+?[\d]*)\)?\[([\w]*),?([\w]*)\](?:,?\(?(?:([\d]*d[\d]*\+?[\d]*)?\)?\[([\w]*)\])?[\w\-:|]?)+\](?:{([\w\s\-+,]*)})?/g;
  const templateRegex =
    /@Template\[type:([\w]*)\|distance:([\d]*)\|?(?:traits:([\w\-,]*))?\](?:{([\w\s\-]*)})?/g;
  const checkRegex =
    /@Check\[type:([\w]*)(?:[\w\s\-|]*dc:([\w\s,:+@.()]*))?(?:[\w\s\-,:|()]*basic:([\w]*))?[\w\s\-,:|()]*\](?:{([\w\s'+()]*)})?/g;
  const rollRegex =
    /\[\[\/b?r \(?{?([\d*]*[\d]*d?[\d\s\-+]*[\d]*),?[\d]*}?\)?[\w\s]*\[?#?[\w\s,]*\]\]\]?(?:{([\w\s\-+;]*)})?/g;

  finalString = description.replace(cleanRegex, '');
  finalString = finalString.replace(effectRegex, '');

  const compendium = finalString.matchAll(compendiumRegex);
  for (let i of compendium) {
    if (i) {
      if (i[5]) {
        finalString = finalString.replace(i[0], i[5].toLowerCase());
      } else {
        finalString = finalString.replace(i[0], i[4].toLowerCase());
      }
    }
  }

  const damage = finalString.matchAll(damageRegex);
  for (let i of damage) {
    if (i) {
      if (i[6]) {
        finalString = finalString.replace(i[0], i[6]);
      } else if (i[4]) {
        finalString = finalString.replace(i[0], i[1] + ' ' + i[2] + ' plus ' + i[4] + ' ' + i[5]);
      } else if (i[3]) {
        finalString = finalString.replace(i[0], i[1] + ' ' + i[2] + ' ' + i[3]);
      } else {
        finalString = finalString.replace(i[0], i[1] + ' ' + i[2]);
      }
    }
  }

  const template = finalString.matchAll(templateRegex);
  for (let i of template) {
    if (i) {
      finalString = finalString.replace(i[0], i[2] + '-foot ' + i[1]);
    }
  }

  const save = finalString.matchAll(checkRegex);
  for (let i of save) {
    if (i) {
      if (i[2] && Number(i[2])) {
        if (i[3] === 'true') {
          if (i[4]) {
            finalString = finalString.replace(
              i[0],
              'DC ' + i[2] + ' basic ' + _.upperFirst(i[1]) + ' ' + i[4]
            );
          } else {
            finalString = finalString.replace(i[0], 'DC ' + i[2] + ' basic ' + _.upperFirst(i[1]));
          }
        } else if (i[4]) {
          finalString = finalString.replace(
            i[0],
            'DC ' + i[2] + ' ' + _.upperFirst(i[1]) + ' ' + i[4]
          );
        } else {
          finalString = finalString.replace(i[0], 'DC ' + i[2] + ' ' + _.upperFirst(i[1]));
        }
      } else if (i[4]) {
        finalString = finalString.replace(i[0], _.upperFirst(i[1]) + ' ' + i[4]);
      } else {
        finalString = finalString.replace(i[0], _.upperFirst(i[1]));
      }
    }
  }

  const roll = finalString.matchAll(rollRegex);
  for (let i of roll) {
    if (i) {
      if (i[2]) {
        finalString = finalString.replace(i[0], i[2]);
      } else {
        finalString = finalString.replace(i[0], i[1]);
      }
    }
  }

  return finalString;
};

const nameString = computed(() => {
  let finalString = '';
  if (creatureVariant.value === 'Weak') {
    finalString += 'weak ';
  } else if (creatureVariant.value === 'Elite') {
    finalString += 'elite ';
  }
  finalString += creatureData?.core_data.essential.name;
  return finalString.toUpperCase();
});

const perceptionString = computed(() => {
  const perception = creatureData?.extra_data?.perception;
  const senses = creatureData?.extra_data?.senses;
  const spells = creatureData?.spell_caster_data?.spells;
  let finalString = '';
  if (perception != undefined) {
    finalString += finalString += '<strong>Perception&nbsp;</strong>' + addPlus(perception) + '; ';
  }
  if (senses != undefined && senses.length > 0) {
    senses.forEach((sense) => {
      creatureData?.extra_data?.actions.forEach((action) => {
        if (action.slug === sense) {
          finalString += action.name.toLowerCase() + ', ';
        }
      });
    });
    if (spells != undefined && spells.length > 0) {
      spells.forEach((spell) => {
        if (spell.name === 'True Seeing (Constant)') {
          finalString += 'true seeing' + ', ';
        }
      });
    }
    if (creatureData?.extra_data?.perception_detail) {
      finalString += creatureData?.extra_data?.perception_detail;
    } else {
      finalString = finalString.substring(0, finalString.length - 2);
    }
  }
  return finalString;
});

const languageString = computed(() => {
  const languages = creatureData?.extra_data?.languages;
  let finalString = '';
  if (languages != undefined && languages.length > 0) {
    finalString += '<strong>Languages&nbsp;</strong>';
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
});

const skillString = computed(() => {
  const skills = creatureData?.extra_data?.skills;
  let finalString = '';
  if (skills != undefined && skills.length > 0) {
    finalString += '<strong>Skills&nbsp;</strong>';
    skills.forEach((skill) => {
      finalString += skill.name + ' ' + addPlus(skill.modifier) + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
});

const weaponString = computed(() => {
  const weapons = creatureData?.combat_data?.weapons;
  let finalString = '';
  if (weapons != undefined && weapons.length > 0) {
    finalString += '<strong>Items&nbsp;</strong>';
    weapons.forEach((weapon) => {
      // TODO: wait for DB fix
      if (weapon.wp_type != 'melee' && weapon.wp_type != 'ranged') {
        finalString += weapon.name.toLowerCase() + ', ';
      }
    });
  }
  if (finalString === '<strong>Items&nbsp;</strong>') {
    return '';
  } else {
    return finalString.substring(0, finalString.length - 2);
  }
});

const defenceString = computed(() => {
  const actions = creatureData?.extra_data?.actions;
  let finalString = '';
  if (creatureData?.combat_data?.ac) {
    finalString += '<strong>AC&nbsp;</strong>' + creatureData?.combat_data?.ac + ';&nbsp;';
  }
  if (creatureData?.combat_data?.saving_throws.fortitude) {
    finalString +=
      '<strong>Fort&nbsp;</strong>' +
      addPlus(creatureData?.combat_data?.saving_throws.fortitude) +
      ';&nbsp;';
  }
  if (creatureData?.combat_data?.saving_throws.reflex) {
    finalString +=
      '<strong>Ref&nbsp;</strong>' +
      addPlus(creatureData?.combat_data?.saving_throws.reflex) +
      ';&nbsp;';
  }
  if (creatureData?.combat_data?.saving_throws.will) {
    finalString +=
      '<strong>Will&nbsp;</strong>' + addPlus(creatureData?.combat_data?.saving_throws.will);
  }
  if (actions != undefined && actions.length > 0) {
    finalString += '; ';
    actions.forEach((action) => {
      if (action.action_type === 'passive' && action.category === 'defensive') {
        finalString += action.name.toLowerCase() + ', ';
      }
    });
    finalString = finalString.substring(0, finalString.length - 2);
  }
  return finalString;
});

const immunityString = () => {
  const immunities = creatureData?.combat_data?.immunities;
  let finalString = '';
  if (immunities != undefined && immunities.length > 0) {
    immunities.forEach((immunity) => {
      finalString += immunity.toLowerCase() + ', ';
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

const healthString = computed(() => {
  const hp = creatureData?.core_data.essential.hp;
  const hpDetail = creatureData?.extra_data?.hp_detail;
  let finalString = '';
  if (hp != undefined) {
    finalString += '<strong>HP&nbsp;</strong>' + variantStyle(creatureData?.core_data.essential.hp);
    if (hpDetail) {
      finalString += ', ' + hpDetail;
    }
  }
  if (
    creatureData?.combat_data?.immunities != undefined &&
    creatureData?.combat_data?.immunities.length > 0
  ) {
    finalString += ';&nbsp;<strong>Immunities</strong>&nbsp;' + immunityString();
  }
  if (
    creatureData?.combat_data?.resistances != undefined &&
    Object.keys(creatureData?.combat_data?.resistances).length > 0
  ) {
    finalString += ';&nbsp;<strong>Resistances</strong>&nbsp;' + resistanceString();
  }
  if (
    creatureData?.combat_data?.weaknesses != undefined &&
    Object.keys(creatureData?.combat_data?.weaknesses).length > 0
  ) {
    finalString += ';&nbsp;<strong>Weaknesess</strong>&nbsp;' + weaknessString();
  }
  return finalString;
});

const speedString = computed(() => {
  const speeds = creatureData?.extra_data?.speeds;
  const speedKeys = Object.keys(speeds!);
  let finalString = '';
  if (speedKeys.length > 0) {
    for (const speed of speedKeys) {
      if (`${speed}` === 'Base') {
        if (`${creatureData?.extra_data?.speeds[speed]}` != '0') {
          finalString += `${creatureData?.extra_data?.speeds[speed]}` + ' feet, ';
        }
      } else {
        finalString += `${speed}` + ' ' + `${creatureData?.extra_data?.speeds[speed]}` + ' feet, ';
      }
    }
  }
  return finalString.substring(0, finalString.length - 2);
});

const spellString = computed(() => {
  const spells = creatureData?.spell_caster_data?.spells;
  let finalString = '';
  const spellLevels: boolean[] = new Array(10).fill(false);
  finalString +=
    '<strong>' +
    creatureData?.spell_caster_data?.spell_caster_entry.spell_casting_name +
    '</strong>&nbsp;DC ' +
    creatureData?.spell_caster_data?.spell_caster_entry.spell_casting_dc_mod +
    ', attack ' +
    addPlus(creatureData?.spell_caster_data?.spell_caster_entry.spell_casting_atk_mod) +
    '; ';
  if (spells != undefined && spells.length > 0) {
    spells.forEach((spell) => {
      switch (spell.level) {
        case 10:
          if (!spellLevels[10]) {
            spellLevels[10] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += '; <strong>10th</strong>&nbsp;';
          }
          break;
        case 9:
          if (!spellLevels[9]) {
            spellLevels[9] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>9th</strong>&nbsp;';
          }
          break;
        case 8:
          if (!spellLevels[8]) {
            spellLevels[8] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>8th</strong>&nbsp;';
          }
          break;
        case 7:
          if (!spellLevels[7]) {
            spellLevels[7] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>7th</strong>&nbsp;';
          }
          break;
        case 6:
          if (!spellLevels[6]) {
            spellLevels[6] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>6th</strong>&nbsp;';
          }
          break;
        case 5:
          if (!spellLevels[5]) {
            spellLevels[5] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>5th</strong>&nbsp;';
          }
          break;
        case 4:
          if (!spellLevels[4]) {
            spellLevels[4] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>4th</strong>&nbsp;';
          }
          break;
        case 3:
          if (!spellLevels[3]) {
            spellLevels[3] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>3rd</strong>&nbsp;';
          }
          break;
        case 2:
          if (!spellLevels[2]) {
            spellLevels[2] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>2nd</strong>&nbsp;';
          }
          break;
        case 1:
          if (!spellLevels[1]) {
            spellLevels[1] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>1st</strong>&nbsp;';
          }
          break;
        default:
          break;
      }
      finalString += spell.name.toLowerCase() + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
});
</script>

<template>
  <div class="creature-sheet">
    <q-card
      flat
      class="tw-items-center tw-text-justify tw-max-w-[55rem] tw-mx-auto tw-mt-4 tw-p-4 tw-rounded-xl tw-border tw-bg-white tw-border-gray-200 dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <q-scroll-area style="height: calc(100vh - 155px)">
        <div class="q-gutter-y-xs">
          <div class="tw-flex tw-font-bold tw-text-lg tw-text-gray-800 dark:tw-text-white">
            <a
              v-if="creatureData?.core_data.derived.archive_link"
              class="tw-my-auto"
              :href="
                creatureData.core_data.derived.archive_link +
                '&Weak=' +
                (creatureVariant === 'Weak') +
                '&Elite=' +
                (creatureVariant === 'Elite')
              "
              target="_blank"
              rel="noopener"
            >
              <span
                class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
                >{{ nameString }}</span
              >
            </a>
            <span v-else class="tw-my-auto">{{ nameString }}</span>
            <q-space />
            <q-select
              class="tw-mx-4 tw-my-auto tw-text-lg tw-font-bold"
              v-model="creatureVariant"
              :options="Object.freeze(['Weak', 'Base', 'Elite'])"
              :dropdown-icon="matArrowDropDown"
              borderless
              dense
              options-dense
              @update:model-value="changeVariant(creatureVariant)"
            />
            <div class="tw-my-auto">
              {{ creatureData?.core_data.essential.cr_type.toUpperCase() }}
              {{ creatureData?.core_data.essential.level }}
            </div>
          </div>
          <q-separator style="height: 2px" />
          <div class="tw-flex tw-flex-wrap tw-font-bold tw-text-xs tw-text-white">
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
            <div
              v-if="creatureData?.core_data.essential.alignment != 'No Alignment'"
              class="tw-bg-[#4287f5] tw-border-2 tw-border-[#d8c483] tw-my-1 tw-p-1"
            >
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
          <div
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            v-if="creatureData?.core_data.essential.source"
          >
            <strong>Source </strong>
            <a
              :href="
                'https://paizo.com/search?q=' +
                encodeURIComponent(creatureData?.core_data.essential.source) +
                '&what=products&includeUnrated=true&includeUnavailable=true'
              "
              target="_blank"
              rel="noopener"
            >
              <i class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400">
                {{ creatureData?.core_data.essential.source }}
              </i>
            </a>
          </div>
          <div
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            v-html="perceptionString"
          ></div>
          <div
            v-if="
              creatureData?.extra_data?.languages != undefined &&
              creatureData?.extra_data?.languages.length > 0
            "
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            v-html="languageString"
          ></div>
          <div
            v-if="
              creatureData?.extra_data?.skills != undefined &&
              creatureData?.extra_data?.skills.length > 0
            "
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            v-html="skillString"
          ></div>
          <div class="tw-text-sm tw-text-gray-800 dark:tw-text-white">
            <strong>Str</strong>
            {{ addPlus(creatureData?.extra_data?.ability_scores.strength) }},
            <strong>Dex</strong>
            {{ addPlus(creatureData?.extra_data?.ability_scores.dexterity) }},
            <strong>Con</strong>
            {{ addPlus(creatureData?.extra_data?.ability_scores.constitution) }},
            <strong>Int</strong>
            {{ addPlus(creatureData?.extra_data?.ability_scores.intelligence) }},
            <strong>Wis</strong>
            {{ addPlus(creatureData?.extra_data?.ability_scores.wisdom) }},
            <strong>Cha</strong>
            {{ addPlus(creatureData?.extra_data?.ability_scores.charisma) }}
          </div>
          <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
            <div
              v-if="item.category === 'interaction' && item.slug === null"
              class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            >
              <strong>{{ item.name }}</strong>
              <span
                v-if="item.action_type === 'reaction'"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                5
              </span>
              <span v-html="' ' + cleanDescription(item.description)"></span>
            </div>
          </div>
          <div
            v-if="
              creatureData?.combat_data?.weapons != undefined &&
              creatureData?.combat_data?.weapons.length > 0
            "
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            v-html="weaponString"
          ></div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <div class="tw-text-sm tw-text-gray-800 dark:tw-text-white" v-html="defenceString"></div>
          <div class="tw-text-sm tw-text-gray-800 dark:tw-text-white" v-html="healthString"></div>
          <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
            <div
              v-if="
                item.slug != 'regeneration' &&
                item.slug != 'fast-healing' &&
                item.slug != 'negative-healing' &&
                item.description != '' &&
                item.category === 'defensive'
              "
              class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            >
              <strong>{{ item.name }}</strong>
              <span
                v-if="item.action_type === 'reaction'"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                5
              </span>
              <span v-html="' ' + cleanDescription(item.description)"></span>
            </div>
          </div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <div
            v-if="
              creatureData?.extra_data?.speeds != undefined &&
              Object.keys(creatureData?.extra_data?.speeds).length > 0
            "
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            <strong>Speed</strong>
            {{ speedString }}
          </div>

          <div
            v-for="item in creatureData?.combat_data?.weapons"
            :key="item.name"
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
          >
            <strong v-if="item.wp_type === 'melee'">Melee </strong>
            <strong v-if="item.wp_type === 'ranged'">Ranged </strong>
            <span style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large">1 </span>
            <i>{{ item.name.toLowerCase() }} </i>
            {{ addPlus(item.to_hit_bonus) }}, <strong>Damage</strong> {{ item.n_of_dices
            }}{{ item.die_size }}+{{ item.bonus_dmg }}
            {{ item.dmg_type }}
          </div>
          <div
            v-if="creatureData?.spell_caster_data?.spell_caster_entry.spell_casting_name != null"
            class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            v-html="spellString"
          ></div>
          <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
            <div
              v-if="item.category === 'offensive'"
              class="tw-text-sm tw-text-gray-800 dark:tw-text-white"
            >
              <strong>{{ item.name }}</strong>
              <span
                v-if="item.n_of_actions === 1"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                1
              </span>
              <span
                v-else-if="item.n_of_actions === 2"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                2
              </span>
              <span
                v-else-if="item.n_of_actions === 3"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                3
              </span>
              <span
                v-else-if="item.action_type === 'free'"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                4
              </span>
              <span
                v-else-if="item.action_type === 'reaction'"
                style="font-family: Pathfinder2eActions, sans-serif; font-size: x-large"
              >
                5
              </span>
              <span v-html="' ' + cleanDescription(item.description)"></span>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<style scoped>
.creature-sheet {
  min-height: calc(100vh - 119px) !important;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
