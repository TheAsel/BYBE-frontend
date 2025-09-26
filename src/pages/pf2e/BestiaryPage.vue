<script setup lang="ts">
import { matPrint, matPriorityHigh } from '@quasar/extras/material-icons';
import { useHead } from '@unhead/vue';
import { isNull, upperFirst } from 'lodash-es';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { encounterStore } from '../../stores/store';
import { requestCreatureId } from '../../utils/encounter-api-calls';

import type { creature } from '../../types/creature';
import type { variants } from '../../types/filters';

const title = ref('Creature Sheet - BYBE');
const encounters = encounterStore();

useHead({
  title: title,
  link: [
    {
      rel: 'canonical',
      href: 'https://bybe.fly.dev/pf2e/bestiary'
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
        creatureData = await requestCreatureId('pf2e', creatureId, 'Weak', encounters.getPwl);
        break;
      case 'elite':
        creatureVariant.value = 'Elite';
        creatureData = await requestCreatureId('pf2e', creatureId, 'Elite', encounters.getPwl);
        break;
      default:
        creatureVariant.value = 'Base';
        creatureData = await requestCreatureId('pf2e', creatureId, 'Base', encounters.getPwl);
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
      await router.push({ name: 'pf2e/encounter' });
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
    await router.push({ name: 'pf2e/encounter' });
  }
} catch (error) {
  console.error(error);
}

const changeVariant = (variant: variants) => {
  if (creatureVariant.value === 'Base') {
    const routeData = router.resolve({
      name: 'pf2e_bestiary',
      query: { id: creatureId }
    });
    window.open(routeData.href, '_self');
  } else {
    const routeData = router.resolve({
      name: 'pf2e_bestiary',
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
    const valueStr = '<span class="tw:text-red-600"><b>' + value.toString() + '</b></span>';
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
    finalString += 'Weak ';
  } else if (creatureVariant.value === 'Elite') {
    finalString += 'Elite ';
  }
  finalString += creatureData?.core_data.essential.name;
  return finalString;
});

const perceptionString = computed(() => {
  const perception = creatureData?.extra_data?.perception;
  const senses = creatureData?.extra_data?.senses;
  const spells = creatureData?.spellcaster_data?.spellcaster_entries
    .flatMap((entry) => Object.values(entry.spells))
    .flatMap((spell) => spell.name);
  let finalString = '';
  if (perception != undefined) {
    finalString += finalString +=
      '<strong>Perception&nbsp;</strong>' + variantStyle(addPlus(perception)) + '; ';
  }
  if (senses != undefined && senses.length > 0) {
    senses.forEach((sense) => {
      let found = false;
      creatureData?.extra_data?.actions.forEach((action) => {
        if (action.slug === sense.name) {
          finalString += action.name.toLowerCase() + ', ';
          found = true;
        }
      });
      if (!found) {
        finalString += sense.name;
        if (sense.acuity) {
          finalString += ' ' + '(' + sense.acuity + ')';
        }
        if (sense.range) {
          finalString += ' ' + sense.range + ' feet';
        }
        finalString += ', ';
      }
    });
    if (
      spells != undefined &&
      spells.length > 0 &&
      senses.every((sense) => {
        return sense.name !== 'truesight';
      })
    ) {
      spells.forEach((spell) => {
        if (spell === 'True Seeing (Constant)') {
          finalString += 'truesight' + ', ';
        }
      });
    }
    if (!creatureData!.extra_data!.has_vision) {
      finalString += 'no vision' + ', ';
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
      finalString += immunity.toLowerCase().replaceAll('-', ' ') + ', ';
    });
  }
  return finalString.substring(0, finalString.length - 2);
};

const resistanceString = () => {
  const resistances = creatureData?.combat_data?.resistances;
  let finalString = '';

  if (resistances != undefined && resistances.length > 0) {
    resistances.forEach((resistance) => {
      finalString +=
        `${resistance.core.name.replaceAll('-', ' ')}` + ' ' + `${resistance.core.value}` + ', ';

      if (
        (resistance.exception_vs != undefined && resistance.exception_vs.length > 0) ||
        (resistance.double_vs != undefined && resistance.double_vs.length > 0)
      ) {
        if (resistance.exception_vs != undefined && resistance.exception_vs.length > 0) {
          finalString = finalString.substring(0, finalString.length - 2);
          finalString += ' (except ';
          resistance.exception_vs.forEach((exception) => {
            finalString += exception.replaceAll('-', ' ') + ', ';
          });
          finalString += '';
          finalString = finalString.substring(0, finalString.length - 2);
        }

        if (resistance.double_vs != undefined && resistance.double_vs.length > 0) {
          if (resistance.exception_vs != undefined && resistance.exception_vs.length > 0) {
            finalString += ';';
          }
          finalString += ' double resistance against ';
          resistance.double_vs.forEach((double) => {
            finalString += double.replaceAll('-', ' ') + ', ';
          });
          finalString += '';
          finalString = finalString.substring(0, finalString.length - 2);
        }

        finalString += ')  ';
      }
    });
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
        `${weakness.replaceAll('-', ' ')}` +
        ' ' +
        `${creatureData?.combat_data?.weaknesses[weakness]}` +
        ', ';
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
    finalString += ';<br><strong>Immunities</strong>&nbsp;' + immunityString();
  }
  if (
    creatureData?.combat_data?.resistances != undefined &&
    Object.keys(creatureData?.combat_data?.resistances).length > 0
  ) {
    finalString += ';<br><strong>Resistances</strong>&nbsp;' + resistanceString();
  }
  if (
    creatureData?.combat_data?.weaknesses != undefined &&
    Object.keys(creatureData?.combat_data?.weaknesses).length > 0
  ) {
    finalString += ';<br><strong>Weaknesess</strong>&nbsp;' + weaknessString() + ';';
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

const ordinalSuffix = (n: number) => {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) {
    return n + 'st';
  }
  if (j === 2 && k !== 12) {
    return n + 'nd';
  }
  if (j === 3 && k !== 13) {
    return n + 'rd';
  }
  return n + 'th';
};

const spellString = computed(() => {
  const finalStrings: string[] = [];
  creatureData?.spellcaster_data?.spellcaster_entries.forEach((entry) => {
    let finalString = '';
    const spellLevels: boolean[] = new Array(11).fill(false);
    finalString += '<strong>' + entry.spellcaster_data.spellcasting_name + '</strong>';
    if (entry.spellcaster_data.spellcasting_dc_mod != 0) {
      finalString += '&nbsp;DC ' + variantStyle(entry.spellcaster_data.spellcasting_dc_mod);
    }
    if (creatureVariant.value === 'Elite') {
      finalString += ' (' + variantStyle('+4 dmg') + ')';
    }
    if (creatureVariant.value === 'Weak') {
      finalString += ' (' + variantStyle('-4 dmg') + ')';
    }
    if (entry.spellcaster_data.spellcasting_atk_mod != 0) {
      finalString +=
        ', attack ' + variantStyle(addPlus(entry.spellcaster_data.spellcasting_atk_mod));
    }
    if (
      creatureData.core_data.essential.focus_points > 0 &&
      entry.spellcaster_data.type_of_spellcaster === 'focus'
    ) {
      finalString += ',&nbsp;' + creatureData.core_data.essential.focus_points;

      if (creatureData.core_data.essential.focus_points > 1) {
        finalString += ' Focus Points';
      } else {
        finalString += ' Focus Point';
      }
    }
    finalString += '; ';
    entry.spells.sort((a, b) => b.slot - a.slot);
    if (entry.spellcaster_data.type_of_spellcaster === 'focus') {
      finalString = finalString.substring(0, finalString.length - 2);
      finalString +=
        ';&nbsp;<strong>' +
        ordinalSuffix(entry.spellcaster_data.heighten_level) +
        '</strong>&nbsp;';
      entry.spells.forEach((spell) => {
        finalString += spell.name.toLowerCase() + ', ';
      });
    } else {
      entry.spells.forEach((spell) => {
        if (spell.slot === 0 && !spellLevels[0]) {
          spellLevels[0] = true;
          finalString = finalString.substring(0, finalString.length - 2);
          finalString +=
            ';&nbsp;<strong>Cantrips (' +
            ordinalSuffix(entry.spellcaster_data.heighten_level) +
            ')</strong>&nbsp;';
        } else if (!spellLevels[spell.slot]) {
          spellLevels[spell.slot] = true;
          finalString = finalString.substring(0, finalString.length - 2);
          finalString += ';&nbsp;<strong>' + ordinalSuffix(spell.slot) + '</strong>&nbsp;';
        }
        finalString += spell.name.toLowerCase() + ', ';
      });
    }

    finalStrings.push(finalString.substring(0, finalString.length - 2) + '<br>');
  });
  return finalStrings;
});

const printPage = () => {
  window.print();
};
</script>

<template>
  <div
    class="creature-sheet tw:opacity-85 tw:dark:opacity-90 q-pa-md tw:w-full tw:md:w-228! tw:mx-auto"
  >
    <div
      class="tw:items-center tw:text-left tw:max-w-220 tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700 hide-print"
    >
      <q-scroll-area style="height: calc(100vh - 128px)">
        <div class="q-gutter-y-xs tw:p-4 show-print">
          <div
            class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
            style="font-family: 'Good Pro Condensed', sans-serif; font-variant-caps: small-caps"
          >
            <a
              v-if="creatureData?.core_data.derived.archive_link"
              class="tw:my-auto"
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
                class="tw:text-3xl! tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
              >
                {{ nameString }}
              </h1>
            </a>
            <h1 v-else class="tw:text-3xl! tw:leading-8 tw:my-auto">{{ nameString }}</h1>
            <q-space />
            <q-select
              v-model="creatureVariant"
              class="tw:mx-4 tw:my-auto tw:text-2xl! only-screen"
              :options="Object.freeze(['Weak', 'Base', 'Elite'])"
              borderless
              dense
              options-dense
              @update:model-value="changeVariant(creatureVariant)"
            />
            <div class="tw:my-auto">
              {{ creatureData?.core_data.essential.cr_type }}
              <span :class="{ 'tw:text-red-600': creatureVariant != 'Base' }">{{
                creatureData?.variant_data?.level
              }}</span>
            </div>
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
            <div
              v-if="creatureData?.core_data.essential.rarity === 'Uncommon'"
              class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ creatureData?.core_data.essential.rarity.toUpperCase() }}
            </div>
            <div
              v-else-if="creatureData?.core_data.essential.rarity === 'Rare'"
              class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ creatureData?.core_data.essential.rarity.toUpperCase() }}
            </div>
            <div
              v-else-if="creatureData?.core_data.essential.rarity === 'Unique'"
              class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ creatureData?.core_data.essential.rarity.toUpperCase() }}
            </div>
            <div
              v-if="creatureData?.core_data.essential.alignment != 'No Alignment'"
              class="tw:bg-[#4287f5] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ creatureData?.core_data.essential.alignment.toUpperCase() }}
            </div>
            <div class="tw:bg-[#478c42] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1">
              {{ creatureData?.core_data.essential.size.toUpperCase() }}
            </div>
            <div
              v-for="item in creatureData?.core_data.traits"
              :key="item"
              class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
            >
              {{ item.toUpperCase() }}
            </div>
          </div>
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div
              v-if="creatureData?.core_data.essential.source"
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
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
                  class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
                >
                  {{ creatureData?.core_data.essential.source }}
                </i>
              </a>
            </div>
            <div
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="perceptionString"
            ></div>
            <div
              v-if="
                creatureData?.extra_data?.languages != undefined &&
                creatureData?.extra_data?.languages.length > 0
              "
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="languageString"
            ></div>
            <div
              v-if="
                creatureData?.extra_data?.skills != undefined &&
                creatureData?.extra_data?.skills.length > 0
              "
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="skillString"
            ></div>
            <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
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
            <template v-for="item in creatureData?.extra_data?.actions" :key="item.name">
              <div
                v-if="item.category === 'interaction' && item.slug === null"
                class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              >
                <strong>{{ item.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl"
                  >{{ pfActionSymbol(item.n_of_actions, item.action_type) }}
                </span>
                <span v-html="' ' + cleanDescription(item.description)"></span>
              </div>
            </template>
            <div
              v-if="
                creatureData?.combat_data?.weapons != undefined &&
                creatureData?.combat_data?.weapons.length > 0 &&
                itemString != ''
              "
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="itemString"
            ></div>
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="defenceString"
            ></div>
            <div
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              v-html="healthString"
            ></div>
            <template v-for="item in creatureData?.extra_data?.actions" :key="item.name">
              <div
                v-if="
                  item.slug != 'regeneration' &&
                  item.slug != 'fast-healing' &&
                  item.slug != 'negative-healing' &&
                  item.description != '' &&
                  item.category === 'defensive'
                "
                class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              >
                <strong>{{ item.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl"
                  >{{ pfActionSymbol(item.n_of_actions, item.action_type) }}
                </span>
                <span v-html="' ' + cleanDescription(item.description)"></span>
              </div>
            </template>
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <hr
            class="only-print"
            style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
          />
          <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
            <div
              v-if="
                creatureData?.extra_data?.speeds != undefined &&
                Object.keys(creatureData?.extra_data?.speeds).length > 0
              "
              class="tw:text-base tw:text-gray-800 tw:dark:text-white"
            >
              <strong>Speed</strong>
              {{ speedString }}
            </div>

            <template v-for="item in creatureData?.combat_data?.weapons" :key="item.item_core.id">
              <div
                v-if="item.weapon_data?.weapon_type != 'Generic'"
                class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              >
                <strong v-if="item.weapon_data?.weapon_type === 'Melee'">Melee </strong>
                <strong v-if="item.weapon_data?.weapon_type === 'Ranged'">Ranged </strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl"
                  >1</span
                >
                <i>{{ ' ' + item.item_core.name.toLowerCase() + ' ' }} </i>
                <span :class="{ 'tw:text-red-600 tw:font-bold': creatureVariant != 'Base' }"
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
                      :class="{ 'tw:text-red-600 tw:font-bold': creatureVariant != 'Base' }"
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
              </div>
            </template>
            <template v-for="entity in spellString" :key="entity">
              <div v-html="entity" class="tw:text-base tw:text-gray-800 tw:dark:text-white" />
            </template>
            <template v-for="item in creatureData?.extra_data?.actions" :key="item.name">
              <div
                v-if="item.category === 'offensive'"
                class="tw:text-base tw:text-gray-800 tw:dark:text-white"
              >
                <strong>{{ item.name + ' ' }}</strong>
                <span style="font-family: Pathfinder2eActions, sans-serif" class="tw:text-2xl"
                  >{{ pfActionSymbol(item.n_of_actions, item.action_type) }}
                </span>
                <span v-html="' ' + cleanDescription(item.description)"></span>
              </div>
            </template>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw:z-10 only-screen tw:opacity-85"
  >
    <q-btn
      fab
      :icon="matPrint"
      color="primary"
      aria-label="Print creature sheet"
      @click="printPage"
    />
  </q-page-sticky>
</template>

<style scoped>
.creature-sheet {
  min-height: calc(100vh - 94px) !important;
  font-family: 'Good Pro', sans-serif;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
