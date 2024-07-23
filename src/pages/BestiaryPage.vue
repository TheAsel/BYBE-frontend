<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { matPriorityHigh, matPrint } from '@quasar/extras/material-icons';
import type { creature } from 'src/types/creature';
import { requestCreatureId } from 'src/utils/encounter-api-calls';
import { variants } from 'src/types/filters';
import { isNull, upperFirst } from 'lodash-es';
import { encounterStore } from 'src/stores/store';

const title = ref('Creature Sheet - BYBE');
const encounters = encounterStore();

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
        creatureData = await requestCreatureId(creatureId, 'Weak', encounters.getPwl);
        break;
      case 'elite':
        creatureVariant.value = 'Elite';
        creatureData = await requestCreatureId(creatureId, 'Elite', encounters.getPwl);
        break;
      default:
        creatureVariant.value = 'Base';
        creatureData = await requestCreatureId(creatureId, 'Base', encounters.getPwl);
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
    if (creatureData?.combat_data?.weapons) {
      creatureData?.combat_data?.weapons.sort((a, b) => {
        if (
          a.weapon_data?.damage_data[0].dice?.dice_size &&
          b.weapon_data?.damage_data[0].dice?.dice_size
        ) {
          return (
            b.weapon_data.damage_data[0].dice?.dice_size -
            a.weapon_data.damage_data[0].dice?.dice_size
          );
        } else {
          return 0;
        }
      });
      creatureData?.combat_data?.weapons.sort((a, b) => {
        if (a.weapon_data?.to_hit_bonus && b.weapon_data?.to_hit_bonus) {
          return b.weapon_data.to_hit_bonus - a.weapon_data.to_hit_bonus;
        } else {
          return 0;
        }
      });
      creatureData?.combat_data?.weapons.sort((a, b) => {
        if (a.weapon_data?.weapon_type && b.weapon_data?.weapon_type) {
          return a.weapon_data.weapon_type.localeCompare(b.weapon_data.weapon_type);
        } else {
          return 0;
        }
      });
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

const variantStyle = (value: string | number | undefined) => {
  if (value && creatureVariant.value != 'Base') {
    let valueStr = '<span class="tw-text-red-600"><b>' + value.toString() + '</b></span>';
    return valueStr;
  }
  return value;
};

const pfActionSymbol = (num: number | null, action: string) => {
  if (num === 1 || num === 2 || num === 3) {
    return num;
  }
  if (action === 'free') {
    return 4;
  }
  if (action === 'reaction') {
    return 5;
  }
};

const cleanDescription = (description: string) => {
  const cleanRegex = /<\/?(?:p)?(?:li)?(?:ul)?>|<hr ?\/>|@Localize\[.+\]/g;

  return description.replace(cleanRegex, '');
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
    finalString += finalString +=
      '<strong>Perception&nbsp;</strong>' + variantStyle(addPlus(perception)) + '; ';
  }
  if (senses != undefined && senses.length > 0) {
    senses.forEach((sense) => {
      let found = false;
      creatureData?.extra_data?.actions.forEach((action) => {
        if (action.slug === sense) {
          finalString += action.name.toLowerCase() + ', ';
          found = true;
        }
      });
      if (!found) {
        finalString += sense + ', ';
      }
    });
    if (spells != undefined && spells.length > 0 && !senses.includes('truesight')) {
      spells.forEach((spell) => {
        if (spell.name === 'True Seeing (Constant)') {
          finalString += 'truesight' + ', ';
        }
      });
    }
    if (creatureData?.extra_data?.perception_detail) {
      finalString += creatureData?.extra_data?.perception_detail;
    } else {
      finalString = finalString.substring(0, finalString.length - 2);
    }
  } else if (creatureData?.extra_data?.perception_detail) {
    finalString += creatureData?.extra_data?.perception_detail;
  }
  return finalString;
});

const languageString = computed(() => {
  const languages = creatureData?.extra_data?.languages;
  let finalString = '';
  if (languages != undefined && languages.length > 0) {
    finalString += '<strong>Languages&nbsp;</strong>';
    languages.forEach((language) => {
      finalString += upperFirst(language) + ', ';
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
      finalString += skill.name + ' ' + variantStyle(addPlus(skill.modifier)) + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
});

const itemString = computed(() => {
  const weapons = creatureData?.combat_data?.weapons;
  const items = creatureData?.extra_data?.items;
  const armors = creatureData?.combat_data?.armors;
  let finalString = '';
  finalString += '<strong>Items&nbsp;</strong>';
  if (weapons != undefined && weapons.length > 0) {
    weapons.forEach((weapon) => {
      if (weapon.weapon_data) {
        if (
          weapon.weapon_data.n_of_potency_runes > 0 ||
          weapon.weapon_data.n_of_striking_runes > 0 ||
          weapon.weapon_data.property_runes.length > 0
        ) {
          if (weapon.weapon_data.n_of_potency_runes > 0) {
            finalString += addPlus(weapon.weapon_data.n_of_potency_runes) + ' ';
          }
          switch (weapon.weapon_data.n_of_striking_runes) {
            case 1:
              finalString += 'striking ';
              break;
            case 2:
              finalString += 'greater striking ';
              break;
            case 3:
              finalString += 'major striking ';
              break;
            default:
              break;
          }
          if (weapon.weapon_data.property_runes.length > 0) {
            weapon.weapon_data.property_runes.forEach((rune) => {
              finalString += rune + ' ';
            });
          }
          if (weapon.item_core.material_type) {
            finalString += weapon.item_core.material_type + ' ';
          }
          finalString += weapon.item_core.name.toLowerCase() + ', ';
        }
        if (weapon.item_core.quantity > 1) {
          finalString +=
            weapon.item_core.quantity + ' ' + weapon.item_core.name.toLowerCase() + ', ';
        }
      }
    });
  }
  if (items != undefined && items.length > 0) {
    items.forEach((item) => {
      if (item.item_type === 'Consumable' || item.item_type === 'Equipment') {
        if (item.quantity > 1) {
          finalString += item.quantity + ' ';
        }
        finalString += item.name.toLowerCase() + ', ';
      }
    });
  }
  if (armors != undefined && armors.length > 0) {
    armors.forEach((armor) => {
      if (armor.armor_data)
        if (
          armor.armor_data.n_of_potency_runes > 0 ||
          armor.armor_data.n_of_resilient_runes > 0 ||
          armor.armor_data.property_runes.length > 0
        ) {
          if (armor.armor_data.n_of_potency_runes > 0) {
            finalString += addPlus(armor.armor_data.n_of_potency_runes) + ' ';
          }
          switch (armor.armor_data.n_of_resilient_runes) {
            case 1:
              finalString += 'resilient ';
              break;
            case 2:
              finalString += 'greater resilient ';
              break;
            case 3:
              finalString += 'major resilient ';
              break;
            default:
              break;
          }
          if (armor.armor_data.property_runes.length > 0) {
            armor.armor_data.property_runes.forEach((rune) => {
              finalString += rune + ' ';
            });
          }
          if (armor.item_core.material_type) {
            finalString += armor.item_core.material_type + ' ';
          }
        }
      finalString += armor.item_core.name.toLowerCase() + ', ';
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
    finalString +=
      '<strong>AC&nbsp;</strong>' + variantStyle(creatureData?.combat_data?.ac) + ';&nbsp;';
  }
  if (creatureData?.combat_data?.saving_throws.fortitude) {
    finalString +=
      '<strong>Fort&nbsp;</strong>' +
      variantStyle(addPlus(creatureData?.combat_data?.saving_throws.fortitude)) +
      ';&nbsp;';
  }
  if (creatureData?.combat_data?.saving_throws.reflex) {
    finalString +=
      '<strong>Ref&nbsp;</strong>' +
      variantStyle(addPlus(creatureData?.combat_data?.saving_throws.reflex)) +
      ';&nbsp;';
  }
  if (creatureData?.combat_data?.saving_throws.will) {
    finalString +=
      '<strong>Will&nbsp;</strong>' +
      variantStyle(addPlus(creatureData?.combat_data?.saving_throws.will));
  }
  if (actions != undefined && actions.length > 0) {
    finalString += '; ';
    actions.forEach((action) => {
      if (
        action.action_type === 'passive' &&
        action.category === 'defensive' &&
        action.description === ''
      ) {
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
        case 8:
        case 7:
        case 6:
        case 5:
        case 4:
          if (!spellLevels[spell.level]) {
            spellLevels[spell.level] = true;
            finalString = finalString.substring(0, finalString.length - 2);
            finalString += ';&nbsp;<strong>' + spell.level + 'th</strong>&nbsp;';
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

const printPage = () => {
  window.print();
};
</script>

<template>
  <div class="creature-sheet q-pa-md tw-w-full md:tw-w-[57rem] tw-mx-auto">
    <div
      class="tw-items-center tw-text-left tw-max-w-[55rem] tw-rounded-xl tw-border tw-bg-white tw-border-gray-200 dark:tw-bg-gray-800 dark:tw-border-gray-700 hide-print"
    >
      <q-scroll-area style="height: calc(100vh - 135px)">
        <div class="q-gutter-y-xs tw-p-4 show-print">
          <div
            class="tw-flex tw-font-bold tw-text-2xl tw-text-gray-800 dark:tw-text-white"
            style="font-family: 'Good Pro Condensed', sans-serif"
          >
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
              <h1
                class="tw-leading-8 tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
              >
                {{ nameString }}
              </h1>
            </a>
            <h1 v-else class="tw-leading-8 tw-my-auto">{{ nameString }}</h1>
            <q-space />
            <q-select
              class="tw-mx-4 tw-my-auto tw-text-2xl only-screen"
              v-model="creatureVariant"
              :options="Object.freeze(['Weak', 'Base', 'Elite'])"
              borderless
              dense
              options-dense
              @update:model-value="changeVariant(creatureVariant)"
            />
            <div class="tw-my-auto">
              {{ creatureData?.core_data.essential.cr_type.toUpperCase() }}
              <span :class="{ 'tw-text-red-600': creatureVariant != 'Base' }">{{
                creatureData?.variant_data?.level
              }}</span>
            </div>
          </div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw-flex tw-flex-wrap tw-font-bold tw-text-sm tw-text-white">
            <div
              v-if="creatureData?.core_data.essential.rarity === 'Uncommon'"
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
          <div class="tw-indent-[-0.5rem] tw-pl-2 q-gutter-y-xs">
            <div
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
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
                <i
                  class="tw-text-blue-600 tw-decoration-2 hover:tw-underline dark:tw-text-blue-400"
                >
                  {{ creatureData?.core_data.essential.source }}
                </i>
              </a>
            </div>
            <div
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="perceptionString"
            ></div>
            <div
              v-if="
                creatureData?.extra_data?.languages != undefined &&
                creatureData?.extra_data?.languages.length > 0
              "
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="languageString"
            ></div>
            <div
              v-if="
                creatureData?.extra_data?.skills != undefined &&
                creatureData?.extra_data?.skills.length > 0
              "
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="skillString"
            ></div>
            <div class="tw-text-base tw-text-gray-800 dark:tw-text-white">
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
                class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              >
                <strong>{{ item.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw-text-2xl"
                  >{{ pfActionSymbol(item.n_of_actions, item.action_type) }}
                </span>
                <span v-html="' ' + cleanDescription(item.description)"></span>
              </div>
            </div>
            <div
              v-if="
                creatureData?.combat_data?.weapons != undefined &&
                creatureData?.combat_data?.weapons.length > 0
              "
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="itemString"
            ></div>
          </div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw-indent-[-0.5rem] tw-pl-2 q-gutter-y-xs">
            <div
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="defenceString"
            ></div>
            <div
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="healthString"
            ></div>
            <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
              <div
                v-if="
                  item.slug != 'regeneration' &&
                  item.slug != 'fast-healing' &&
                  item.slug != 'negative-healing' &&
                  item.description != '' &&
                  item.category === 'defensive'
                "
                class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              >
                <strong>{{ item.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw-text-2xl"
                  >{{ pfActionSymbol(item.n_of_actions, item.action_type) }}
                </span>
                <span v-html="' ' + cleanDescription(item.description)"></span>
              </div>
            </div>
          </div>
          <q-separator class="tw-my-2" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw-indent-[-0.5rem] tw-pl-2 q-gutter-y-xs">
            <div
              v-if="
                creatureData?.extra_data?.speeds != undefined &&
                Object.keys(creatureData?.extra_data?.speeds).length > 0
              "
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
            >
              <strong>Speed</strong>
              {{ speedString }}
            </div>

            <div
              v-for="item in creatureData?.combat_data?.weapons"
              :key="item.item_core.name"
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
            >
              <span v-if="item.weapon_data?.weapon_type != 'Generic'">
                <strong v-if="item.weapon_data?.weapon_type === 'Melee'">Melee </strong>
                <strong v-if="item.weapon_data?.weapon_type === 'Ranged'">Ranged </strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw-text-2xl"
                  >1</span
                >
                <i>{{ ' ' + item.item_core.name.toLowerCase() + ' ' }} </i>
                <span :class="{ 'tw-text-red-600 tw-font-bold': creatureVariant != 'Base' }"
                  >{{ addPlus(item.weapon_data?.to_hit_bonus!) }}
                  <span v-if="item.item_core.traits.includes('agile')"
                    >[{{ addPlus(item.weapon_data?.to_hit_bonus! - 4) }}/{{
                      addPlus(item.weapon_data?.to_hit_bonus! - 8)
                    }}]
                  </span>
                  <span v-else
                    >[{{ addPlus(item.weapon_data?.to_hit_bonus! - 5) }}/{{
                      addPlus(item.weapon_data?.to_hit_bonus! - 10)
                    }}]
                  </span> </span
                >({{ item.item_core.traits.join(', ').replaceAll('-', ' ') }}),
                <strong>Damage </strong>
                <span v-for="(weapon, index) in item.weapon_data?.damage_data" :key="index">
                  <span v-if="weapon.dice">
                    {{ weapon.dice.n_of_dices }}d{{ weapon.dice.dice_size
                    }}<span
                      v-if="weapon.bonus_dmg != 0"
                      :class="{ 'tw-text-red-600 tw-font-bold': creatureVariant != 'Base' }"
                      >{{ addPlus(weapon.bonus_dmg) }}</span
                    >
                    {{ weapon.dmg_type }}
                    <span
                      v-if="
                        item.weapon_data!.damage_data.length > 1 &&
                        index != item.weapon_data!.damage_data.length - 1
                      "
                    >
                      plus
                    </span>
                  </span>
                </span>
              </span>
            </div>
            <div
              v-if="creatureData?.spell_caster_data?.spell_caster_entry.spell_casting_name != null"
              class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              v-html="spellString"
            ></div>
            <div v-for="item in creatureData?.extra_data?.actions" :key="item.name">
              <div
                v-if="item.category === 'offensive'"
                class="tw-text-base tw-text-gray-800 dark:tw-text-white"
              >
                <strong>{{ item.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw-text-2xl"
                  >{{ pfActionSymbol(item.n_of_actions, item.action_type) }}
                </span>
                <span v-html="' ' + cleanDescription(item.description)"></span>
              </div>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw-z-10 only-screen tw-opacity-85"
  >
    <q-btn
      fab
      :icon="matPrint"
      color="primary"
      @click="printPage"
      aria-label="Print creature sheet"
    />
  </q-page-sticky>
</template>

<style scoped>
.creature-sheet {
  min-height: calc(100vh - 103px) !important;
  font-family: 'Good Pro', sans-serif;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
