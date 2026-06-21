<script setup lang="ts">
import { biBoxArrowUpRight, biXLg } from "@quasar/extras/bootstrap-icons";
import { upperFirst } from "lodash-es";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import TraitsList from "@/components/generic/TraitsList.vue";
import { encounterStore } from "@/stores/encounter";
import { settingsStore } from "@/stores/settings";
import {
  addPlus,
  cleanDescription,
  getGameFont,
  getGameFontSize,
  openSheet,
  pfActionSymbol
} from "@/utils/sheet";

import type { creature } from "@/types/creature";
import type { variants } from "@/types/filters";

const route = useRoute();
const router = useRouter();
const encounter_store = encounterStore();
const settings_store = settingsStore();

const changeVariant = (variant: variants) => {
  if (encounter_store.selectedCreature?.variant_data?.variant === "Base") {
    const routeData = router.resolve({
      name: "bestiary",
      query: {
        game: settings_store.game,
        id: encounter_store.selectedCreature?.core_data.essential.id
      }
    });
    globalThis.open(routeData.href, "_self");
  } else {
    const routeData = router.resolve({
      name: "bestiary",
      query: {
        game: settings_store.game,
        id: encounter_store.selectedCreature?.core_data.essential.id,
        variant: variant.toLowerCase()
      }
    });
    globalThis.open(routeData.href, "_self");
  }
};

const variantStyle = (value: string | number | undefined) => {
  if (
    value &&
    encounter_store.selectedCreature?.variant_data?.variant !== "Base"
  ) {
    const valueStr = `<span class="tw:text-red-600"><b>${value.toString()}</b></span>`;
    return valueStr;
  }
  return value;
};

const perceptionString = computed(() => {
  const perception = encounter_store.selectedCreature?.extra_data?.perception;
  const senses = encounter_store.selectedCreature?.extra_data?.senses;
  const spells =
    encounter_store.selectedCreature?.spellcaster_data?.spellcaster_entries
      .flatMap(entry => Object.values(entry.spells))
      .flatMap(spell => spell.name);
  let finalString = "";
  if (perception !== undefined) {
    finalString += `<strong>Perception&nbsp;</strong>${variantStyle(
      addPlus(perception)
    )}; `;
  }
  if (senses !== undefined && senses.length > 0) {
    for (const sense of senses) {
      let found = false;
      for (const action of encounter_store.selectedCreature?.extra_data
        ?.actions ?? []) {
        if (action.core_action.slug === sense.name) {
          finalString += `${action.core_action.name.toLowerCase()}, `;
          found = true;
        }
      }
      if (!found) {
        finalString += sense.name;
        if (sense.acuity) {
          finalString += ` (${sense.acuity})`;
        }
        if (sense.range?.value) {
          finalString += ` ${sense.range.value} feet`;
        }
        finalString += ", ";
      }
    }
    if (
      spells !== undefined &&
      spells.length > 0 &&
      senses.every(sense => sense.name !== "truesight")
    ) {
      for (const spell of spells) {
        if (spell === "True Seeing (Constant)") {
          finalString += "truesight, ";
        }
      }
    }
    if (!encounter_store.selectedCreature?.extra_data?.has_vision) {
      finalString += "no vision, ";
    }
    if (encounter_store.selectedCreature?.extra_data?.perception_detail) {
      finalString +=
        encounter_store.selectedCreature?.extra_data?.perception_detail;
    } else {
      finalString = finalString.substring(0, finalString.length - 2);
    }
  } else if (encounter_store.selectedCreature?.extra_data?.perception_detail) {
    finalString +=
      encounter_store.selectedCreature?.extra_data?.perception_detail;
  }
  return finalString;
});

const languageString = computed(() => {
  const languages = encounter_store.selectedCreature?.extra_data?.languages;
  languages?.sort();
  let finalString = "";
  if (languages !== undefined && languages.length > 0) {
    finalString += "<strong>Languages&nbsp;</strong>";
    for (const language of languages) {
      finalString += `${upperFirst(language)}, `;
    }
  }
  finalString = finalString.substring(0, finalString.length - 2);
  finalString += "; ";
  if (encounter_store.selectedCreature?.extra_data?.language_detail) {
    finalString +=
      encounter_store.selectedCreature?.extra_data?.language_detail;
  } else {
    finalString = finalString.substring(0, finalString.length - 2);
  }
  return finalString;
});

const skillString = computed(() => {
  const skills = encounter_store.selectedCreature?.extra_data?.skills;
  let finalString = "";
  if (skills !== undefined && skills.length > 0) {
    finalString += "<strong>Skills&nbsp;</strong>";
    for (const skill of skills) {
      finalString += `${upperFirst(skill.name)} ${variantStyle(
        addPlus(skill.modifier)
      )}, `;
    }
  }
  return finalString.substring(0, finalString.length - 2);
});

const itemString = computed(() => {
  const weapons = encounter_store.selectedCreature?.combat_data?.weapons;
  const items = encounter_store.selectedCreature?.extra_data?.items;
  const armors = encounter_store.selectedCreature?.combat_data?.armors;
  let finalString = "";
  finalString += "<strong>Items&nbsp;</strong>";
  const droppedItems: string[] = [];
  if (weapons !== undefined && weapons.length > 0) {
    for (const weapon of weapons) {
      if (weapon.weapon_data && weapon.weapon_data.weapon_type === "Generic") {
        let weaponString = "";
        if (
          weapon.weapon_data.n_of_potency_runes > 0 ||
          weapon.weapon_data.n_of_striking_runes > 0 ||
          weapon.weapon_data.property_runes.length > 0
        ) {
          if (weapon.weapon_data.n_of_potency_runes > 0) {
            weaponString += `${addPlus(weapon.weapon_data.n_of_potency_runes)} `;
          }
          switch (weapon.weapon_data.n_of_striking_runes) {
            case 1: {
              weaponString += "striking ";
              break;
            }
            case 2: {
              weaponString += "greater striking ";
              break;
            }
            case 3: {
              weaponString += "major striking ";
              break;
            }
            default: {
              break;
            }
          }
          if (weapon.weapon_data.property_runes.length > 0) {
            for (const rune of weapon.weapon_data.property_runes) {
              weaponString += `${rune} `;
            }
          }
          if (weapon.item_core.material_type) {
            weaponString += `${weapon.item_core.material_type} `;
          }
          weaponString += weapon.item_core.name.toLowerCase();
        } else if (weapon.item_core.quantity === 1) {
          weaponString += weapon.item_core.name.toLowerCase();
        } else if (weapon.item_core.quantity > 1) {
          weaponString += `${
            weapon.item_core.quantity
          } ${weapon.item_core.name.toLowerCase()}`;
        }
        if (weaponString !== "") {
          droppedItems.push(weaponString);
        }
      }
    }
  }
  if (items !== undefined && items.length > 0) {
    for (const item of items) {
      if (item.item_type === "Consumable" || item.item_type === "Equipment") {
        let tmpString = "";
        if (item.quantity === 1) {
          tmpString += item.name.toLowerCase();
        } else if (item.quantity > 1) {
          tmpString += `${item.quantity} ${item.name.toLowerCase()}`;
        }
        if (tmpString !== "") {
          droppedItems.push(tmpString);
        }
      }
    }
  }
  if (armors !== undefined && armors.length > 0) {
    for (const armor of armors) {
      let armorString = "";
      if (armor.armor_data) {
        if (
          armor.armor_data.n_of_potency_runes > 0 ||
          armor.armor_data.n_of_resilient_runes > 0 ||
          armor.armor_data.property_runes.length > 0
        ) {
          if (armor.armor_data.n_of_potency_runes > 0) {
            armorString += `${addPlus(armor.armor_data.n_of_potency_runes)} `;
          }
          switch (armor.armor_data.n_of_resilient_runes) {
            case 1: {
              armorString += "resilient ";
              break;
            }
            case 2: {
              armorString += "greater resilient ";
              break;
            }
            case 3: {
              armorString += "major resilient ";
              break;
            }
            default: {
              break;
            }
          }
          if (armor.armor_data.property_runes.length > 0) {
            for (const rune of armor.armor_data.property_runes) {
              armorString += `${rune} `;
            }
          }
          if (armor.item_core.material_type) {
            armorString += `${armor.item_core.material_type} `;
          }
        }
      }
      armorString += armor.item_core.name.toLowerCase();

      if (armorString !== "") {
        droppedItems.push(armorString);
      }
    }
  }
  for (const dropped of droppedItems) {
    finalString += `${dropped}, `;
  }
  if (droppedItems.length === 0) {
    return "";
  } else {
    return finalString.substring(0, finalString.length - 2);
  }
});

const defenceString = computed(() => {
  const actions = encounter_store.selectedCreature?.extra_data?.actions;
  let finalString = "";
  if (encounter_store.selectedCreature?.combat_data?.ac) {
    finalString += `<strong>AC&nbsp;</strong>${variantStyle(
      encounter_store.selectedCreature?.combat_data?.ac
    )}`;
    if (encounter_store.selectedCreature?.extra_data?.ac_detail) {
      finalString += ` ${encounter_store.selectedCreature?.extra_data?.ac_detail}`;
    }
    finalString += ";&nbsp;";
  }
  if (encounter_store.selectedCreature?.combat_data?.saving_throws.fortitude) {
    finalString += `<strong>Fort&nbsp;</strong>${variantStyle(
      addPlus(
        encounter_store.selectedCreature?.combat_data?.saving_throws.fortitude
      )
    )};&nbsp;`;
  }
  if (encounter_store.selectedCreature?.combat_data?.saving_throws.reflex) {
    finalString += `<strong>Ref&nbsp;</strong>${variantStyle(
      addPlus(
        encounter_store.selectedCreature?.combat_data?.saving_throws.reflex
      )
    )};&nbsp;`;
  }
  if (encounter_store.selectedCreature?.combat_data?.saving_throws.will) {
    finalString += `<strong>Will&nbsp;</strong>${variantStyle(
      addPlus(encounter_store.selectedCreature?.combat_data?.saving_throws.will)
    )}`;
  }
  if (actions !== undefined && actions.length > 0) {
    finalString += "; ";
    for (const action of actions) {
      if (
        action.core_action.action_type === "passive" &&
        action.core_action.category === "defensive" &&
        action.core_action.description === ""
      ) {
        finalString += `${action.core_action.name.toLowerCase()}, `;
      }
    }
    finalString = finalString.substring(0, finalString.length - 2);
  }
  return finalString;
});

const immunityString = () => {
  const immunities = encounter_store.selectedCreature?.combat_data?.immunities;
  immunities?.sort();
  let finalString = "";
  if (immunities !== undefined && immunities.length > 0) {
    for (const immunity of immunities) {
      finalString += `${immunity.toLowerCase().replaceAll("-", " ")}, `;
    }
  }
  return finalString.substring(0, finalString.length - 2);
};

const resistanceString = () => {
  const resistances =
    encounter_store.selectedCreature?.combat_data?.resistances;
  resistances?.sort();
  let finalString = "";

  if (resistances !== undefined && resistances.length > 0) {
    for (const resistance of resistances) {
      finalString +=
        `${resistance.core.name.replaceAll("-", " ")}` +
        " " +
        `${resistance.core.value}` +
        ", ";

      if (
        (resistance.exception_vs !== undefined &&
          resistance.exception_vs.length > 0) ||
        (resistance.double_vs !== undefined && resistance.double_vs.length > 0)
      ) {
        if (
          resistance.exception_vs !== undefined &&
          resistance.exception_vs.length > 0
        ) {
          finalString = finalString.substring(0, finalString.length - 2);
          finalString += " (except ";
          for (const exception of resistance.exception_vs) {
            finalString += `${exception.replaceAll("-", " ")}, `;
          }
          finalString += "";
          finalString = finalString.substring(0, finalString.length - 2);
        }

        if (
          resistance.double_vs !== undefined &&
          resistance.double_vs.length > 0
        ) {
          if (
            resistance.exception_vs !== undefined &&
            resistance.exception_vs.length > 0
          ) {
            finalString += ";";
          }
          finalString += " double resistance against ";
          for (const double of resistance.double_vs) {
            finalString += `${double.replaceAll("-", " ")}, `;
          }
          finalString += "";
          finalString = finalString.substring(0, finalString.length - 2);
        }

        finalString += ")  ";
      }
    }
  }
  return finalString.substring(0, finalString.length - 2);
};

const weaknessString = () => {
  const weaknesses = encounter_store.selectedCreature?.combat_data?.weaknesses;
  const weakKeys = Object.keys(weaknesses!);
  weakKeys.sort();
  let finalString = "";
  if (weakKeys.length > 0) {
    for (const weakness of weakKeys) {
      finalString +=
        `${weakness.replaceAll("-", " ")}` +
        " " +
        `${encounter_store.selectedCreature?.combat_data?.weaknesses[weakness]}` +
        ", ";
    }
  }
  return finalString.substring(0, finalString.length - 2);
};

const healthString = computed(() => {
  const hp = encounter_store.selectedCreature?.core_data.essential.hp;
  const hpDetail = encounter_store.selectedCreature?.extra_data?.hp_detail;
  let finalString = "";
  if (hp !== undefined) {
    finalString += `<strong>HP&nbsp;</strong>${variantStyle(
      encounter_store.selectedCreature?.core_data.essential.hp
    )}`;
    if (hpDetail) {
      finalString += `, ${hpDetail}`;
    }
  }
  if (
    encounter_store.selectedCreature?.combat_data?.immunities !== undefined &&
    encounter_store.selectedCreature?.combat_data?.immunities.length > 0
  ) {
    finalString += `;<br><strong>Immunities</strong>&nbsp;${immunityString()}`;
  }
  if (
    encounter_store.selectedCreature?.combat_data?.resistances !== undefined &&
    Object.keys(encounter_store.selectedCreature?.combat_data?.resistances)
      .length > 0
  ) {
    finalString += `;<br><strong>Resistances</strong>&nbsp;${resistanceString()}`;
  }
  if (
    encounter_store.selectedCreature?.combat_data?.weaknesses !== undefined &&
    Object.keys(encounter_store.selectedCreature?.combat_data?.weaknesses)
      .length > 0
  ) {
    finalString += `;<br><strong>Weaknesess</strong>&nbsp;${weaknessString()};`;
  }
  return finalString;
});

const speedString = computed(() => {
  const speeds = encounter_store.selectedCreature?.extra_data?.speeds;
  const speedKeys = Object.keys(speeds!);
  let finalString = "";
  if (speedKeys.length > 0) {
    for (const speed of speedKeys) {
      if (`${speed}` === "Base") {
        if (
          `${encounter_store.selectedCreature?.extra_data?.speeds[speed]}` !==
          "0"
        ) {
          finalString +=
            `${encounter_store.selectedCreature?.extra_data?.speeds[speed]}` +
            " feet, ";
        }
      } else {
        finalString +=
          `${speed}` +
          " " +
          `${encounter_store.selectedCreature?.extra_data?.speeds[speed]}` +
          " feet, ";
      }
    }
  }
  return finalString.substring(0, finalString.length - 2);
});

const ordinalSuffix = (n: number) => {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) {
    return `${n}st`;
  }
  if (j === 2 && k !== 12) {
    return `${n}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${n}rd`;
  }
  return `${n}th`;
};

const spellString = computed(() => {
  const finalStrings: string[] = [];
  for (const entry of encounter_store.selectedCreature?.spellcaster_data
    ?.spellcaster_entries ?? []) {
    let finalString = "";
    const spellLevels: boolean[] = Array.from<boolean>({ length: 11 }).fill(
      false
    );
    finalString += `<strong>${entry.spellcaster_data.spellcasting_name}</strong>`;
    if (entry.spellcaster_data.spellcasting_dc_mod !== 0) {
      finalString += `&nbsp;DC ${variantStyle(entry.spellcaster_data.spellcasting_dc_mod)}`;
    }
    if (encounter_store.selectedCreature?.variant_data?.variant === "Elite") {
      finalString += ` (${variantStyle("+4 dmg")})`;
    }
    if (encounter_store.selectedCreature?.variant_data?.variant === "Weak") {
      finalString += ` (${variantStyle("-4 dmg")})`;
    }
    if (entry.spellcaster_data.spellcasting_atk_mod !== 0) {
      finalString += `, attack ${variantStyle(
        addPlus(entry.spellcaster_data.spellcasting_atk_mod)
      )}`;
    }
    if (
      (encounter_store.selectedCreature?.core_data.essential.focus_points ??
        0) > 0 &&
      entry.spellcaster_data.type_of_spellcaster === "focus"
    ) {
      finalString += `,&nbsp;${
        encounter_store.selectedCreature?.core_data.essential.focus_points
      }`;

      if (
        (encounter_store.selectedCreature?.core_data.essential.focus_points ??
          0) > 1
      ) {
        finalString += " Focus Points";
      } else {
        finalString += " Focus Point";
      }
    }
    finalString += "; ";
    entry.spells.sort((a, b) => b.slot - a.slot);
    if (entry.spellcaster_data.type_of_spellcaster === "focus") {
      finalString = finalString.substring(0, finalString.length - 2);
      finalString += `;&nbsp;<strong>${ordinalSuffix(
        entry.spellcaster_data.heighten_level
      )}</strong>&nbsp;`;
      for (const spell of entry.spells) {
        finalString += `${spell.name.toLowerCase()}, `;
      }
    } else {
      for (const spell of entry.spells) {
        if (spell.slot === 0 && !spellLevels[0]) {
          spellLevels[0] = true;
          finalString = finalString.substring(0, finalString.length - 2);
          finalString += `;&nbsp;<strong>Cantrips (${ordinalSuffix(
            entry.spellcaster_data.heighten_level
          )})</strong>&nbsp;`;
        } else if (!spellLevels[spell.slot]) {
          spellLevels[spell.slot] = true;
          finalString = finalString.substring(0, finalString.length - 2);
          finalString += `;&nbsp;<strong>${ordinalSuffix(spell.slot)}</strong>&nbsp;`;
        }
        finalString += `${spell.name.toLowerCase()}, `;
      }
    }

    finalStrings.push(
      `${finalString.substring(0, finalString.length - 2)}<br>`
    );
  }
  return finalStrings;
});

const rangeTraits = (
  weapon: NonNullable<creature["combat_data"]>["weapons"][number]
) => {
  if (weapon.weapon_data?.range?.value) {
    return weapon.item_core.traits.concat({
      description:
        "These attacks will either list a finite range or a range increment, which follows the normal rules for range increments.",
      display_name: `range ${weapon.weapon_data?.range?.value} feet`,
      name: `range ${weapon.weapon_data?.range?.value} feet`
    });
  } else if (weapon.weapon_data?.range?.increment) {
    return weapon.item_core.traits.concat({
      description:
        "These attacks will either list a finite range or a range increment, which follows the normal rules for range increments.",
      display_name: `range increment ${weapon.weapon_data?.range?.increment} feet`,
      name: `range increment ${weapon.weapon_data?.range?.increment} feet`
    });
  } else if (weapon.weapon_data?.range?.max) {
    return weapon.item_core.traits.concat({
      description:
        "These attacks will either list a finite range or a range increment, which follows the normal rules for range increments.",
      display_name: `range ${weapon.weapon_data?.range?.max} feet`,
      name: `range ${weapon.weapon_data?.range?.max} feet`
    });
  } else {
    return weapon.item_core.traits;
  }
};
</script>

<template>
  <div
    class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
    :style="
      'font-family: ' +
      getGameFont(
        encounter_store.selectedCreature?.game ?? settings_store.game
      ) +
      ', sans-serif; font-variant-caps: small-caps'
    "
  >
    <div class="tw:my-auto!">
      <q-btn
        :icon="biBoxArrowUpRight"
        flat
        round
        dense
        size="sm"
        padding="sm"
        class="tw:mr-1 tw:my-auto only-screen encounter-page-element"
        aria-label="Open creature sheet"
        @click="
          openSheet(
            router,
            'bestiary',
            encounter_store.selectedCreature?.game ?? settings_store.game,
            encounter_store.selectedCreature?.core_data.essential.id ?? 0,
            encounter_store.selectedCreature?.variant_data?.variant
          )
        "
      >
        <q-tooltip
          class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
          anchor="top middle"
          self="bottom middle"
        >
          Open creature sheet
        </q-tooltip>
      </q-btn>
    </div>
    <a
      v-if="
        encounter_store.selectedCreature &&
        encounter_store.selectedCreature?.core_data.derived.archive_link
      "
      class="tw:my-auto"
      :href="
        encounter_store.selectedCreature.core_data.derived.archive_link +
        '&Weak=' +
        (encounter_store.selectedCreature?.variant_data?.variant === 'Weak') +
        '&Elite=' +
        (encounter_store.selectedCreature?.variant_data?.variant === 'Elite')
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        :class="
          getGameFontSize(
            encounter_store.selectedCreature?.game ?? settings_store.game
          ) +
          ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
        "
      >
        <span
          v-if="
            encounter_store.selectedCreature?.variant_data?.variant === 'Weak'
          "
          >Weak
        </span>
        <span
          v-else-if="
            encounter_store.selectedCreature?.variant_data?.variant === 'Elite'
          "
          >Elite
        </span>
        {{ encounter_store.selectedCreature?.core_data.essential.name }}
      </h1>
    </a>
    <a
      v-else-if="
        encounter_store.selectedCreature &&
        encounter_store.selectedCreature.game === 'sf'
      "
      class="tw:my-auto"
      :href="
        'https://2e.aonsrd.com/search?q=' +
        encodeURIComponent(
          encounter_store.selectedCreature?.core_data.essential.name
        ) +
        ' type%3A(creature)&type=eqs'
      "
      target="_blank"
      rel="noopener"
    >
      <h1
        :class="
          getGameFontSize(
            encounter_store.selectedCreature?.game ?? settings_store.game
          ) +
          ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
        "
      >
        <span
          v-if="
            encounter_store.selectedCreature?.variant_data?.variant === 'Weak'
          "
          >Weak
        </span>
        <span
          v-else-if="
            encounter_store.selectedCreature?.variant_data?.variant === 'Elite'
          "
          >Elite
        </span>
        {{ encounter_store.selectedCreature?.core_data.essential.name }}
      </h1>
    </a>
    <h1
      v-else
      :class="
        getGameFontSize(
          encounter_store.selectedCreature?.game ?? settings_store.game
        ) + ' tw:mr-4 tw:leading-8 tw:my-auto'
      "
    >
      <span
        v-if="
          encounter_store.selectedCreature?.variant_data?.variant === 'Weak'
        "
        >Weak
      </span>
      <span
        v-else-if="
          encounter_store.selectedCreature?.variant_data?.variant === 'Elite'
        "
        >Elite
      </span>
      {{ encounter_store.selectedCreature?.core_data.essential.name }}
    </h1>
    <q-space />
    <q-select
      v-if="route.path === '/bestiary'"
      v-model="encounter_store.selectedCreature!.variant_data!.variant"
      class="tw:mx-4 tw:my-auto tw:text-2xl! only-screen"
      :options="Object.freeze(['Weak', 'Base', 'Elite'])"
      borderless
      dense
      options-dense
      @update:model-value="
        changeVariant(encounter_store.selectedCreature?.variant_data?.variant!)
      "
    />
    <div class="tw:my-1 tw:text-2xl!">
      {{ encounter_store.selectedCreature?.core_data.essential.cr_type }}
      <span
        :class="{
          'tw:text-red-600':
            encounter_store.selectedCreature?.variant_data?.variant !== 'Base'
        }"
        >{{ encounter_store.selectedCreature?.variant_data?.level }}</span
      >
    </div>
    <div class="tw:my-auto!">
      <q-btn
        class="tw:ml-2! only-screen encounter-page-element"
        :icon="biXLg"
        size="sm"
        padding="sm"
        flat
        round
        dense
        aria-label="Remove selected creature"
        @click="encounter_store.removeSelectedCreature()"
      />
    </div>
  </div>
  <q-separator class="tw:my-2!" style="height: 2px" />
  <hr
    class="only-print"
    style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
  />
  <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm">
    <div
      v-if="
        encounter_store.selectedCreature?.core_data.essential.rarity ===
        'Uncommon'
      "
      class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
        >{{
          encounter_store.selectedCreature?.core_data.essential.rarity.toUpperCase()
        }}<q-tooltip
          style="
            font-family:
              Good Pro,
              sans-serif;
          "
          class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
        >
          <strong>{{
            encounter_store.selectedCreature?.core_data.essential.rarity.toUpperCase()
          }}</strong>
          <q-separator class="tw:my-1!" style="height: 2px" />
          <span>{{
            "Something of uncommon rarity requires special training or comes from a particular culture or part of the world. Some character choices give access to uncommon options, and the GM can choose to allow access for anyone. Less is known about uncommon creatures than common creatures. They typically can't be summoned. The DC of Recall Knowledge checks related to these creature is increased by 2."
          }}</span>
        </q-tooltip>
      </span>
    </div>
    <div
      v-else-if="
        encounter_store.selectedCreature?.core_data.essential.rarity === 'Rare'
      "
      class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
        >{{
          encounter_store.selectedCreature?.core_data.essential.rarity.toUpperCase()
        }}<q-tooltip
          style="
            font-family:
              Good Pro,
              sans-serif;
          "
          class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
        >
          <strong>{{
            encounter_store.selectedCreature?.core_data.essential.rarity.toUpperCase()
          }}</strong>
          <q-separator class="tw:my-1!" style="height: 2px" />
          <span>{{
            "This rarity indicates that a rules element is very difficult to find in the game world. A rare feat, spell, item or the like is available to players only if the GM decides to include it in the game, typically through discovery during play. Creatures with this trait are rare. They typically can't be summoned. The DC of Recall Knowledge checks related to these creatures is increased by 5."
          }}</span>
        </q-tooltip>
      </span>
    </div>
    <div
      v-else-if="
        encounter_store.selectedCreature?.core_data.essential.rarity ===
        'Unique'
      "
      class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
        >{{
          encounter_store.selectedCreature?.core_data.essential.rarity.toUpperCase()
        }}<q-tooltip
          style="
            font-family:
              Good Pro,
              sans-serif;
          "
          class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
        >
          <strong>{{
            encounter_store.selectedCreature?.core_data.essential.rarity.toUpperCase()
          }}</strong>
          <q-separator class="tw:my-1!" style="height: 2px" />
          <span>{{
            "A rules element with this trait is one-of-a-kind. The DC of Recall Knowledge checks related to creatures with this trait is increased by 10."
          }}</span>
        </q-tooltip>
      </span>
    </div>
    <div
      v-if="
        encounter_store.selectedCreature?.core_data.essential.alignment !==
        'No Alignment'
      "
      class="tw:bg-[#4287f5] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      <a
        class="tw:text-white! tw:decoration-2 tw:hover:underline"
        href="https://2e.aonprd.com/rules?id=95&NoRedirect=1"
        target="_blank"
        rel="noopener"
      >
        {{
          encounter_store.selectedCreature?.core_data.essential.alignment.toUpperCase()
        }}
      </a>
    </div>
    <div class="tw:bg-[#478c42] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1">
      <a
        class="tw:text-white! tw:decoration-2 tw:hover:underline"
        :href="
          settings_store.game === 'sf'
            ? 'https://2e.aonsrd.com/rules/407-size-space-and-reach'
            : 'https://2e.aonprd.com/rules?id=2359'
        "
        target="_blank"
        rel="noopener"
      >
        {{
          encounter_store.selectedCreature?.core_data.essential.size.toUpperCase()
        }}
      </a>
    </div>
    <div
      v-for="item in encounter_store.selectedCreature?.core_data.traits.sort()"
      :key="item.name"
      class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
    >
      <span
        v-if="item.description !== null"
        class="tw:text-white! tw:decoration-2 tw:hover:underline"
        >{{ item.display_name?.toUpperCase().replaceAll("-", " ")
        }}<q-tooltip
          style="
            font-family:
              Good Pro,
              sans-serif;
          "
          class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
        >
          <strong>{{ item.name.toUpperCase().replaceAll("-", " ") }}</strong>
          <q-separator class="tw:my-1!" style="height: 2px" />
          <span v-html="cleanDescription(item.description)" /> </q-tooltip
      ></span>
      <span v-else>{{ item.name.toUpperCase().replaceAll("-", " ") }}</span>
    </div>
  </div>
  <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
    <div
      v-if="encounter_store.selectedCreature?.core_data.essential.source"
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Source </strong>
      <a
        :href="
          'https://store.paizo.com/search.php?search_query=' +
          encodeURIComponent(
            encounter_store.selectedCreature?.core_data.essential.source
          ) +
          '&section=product'
        "
        target="_blank"
        rel="noopener"
      >
        <i
          class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
        >
          {{ encounter_store.selectedCreature?.core_data.essential.source }}
        </i>
      </a>
    </div>
    <div
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="perceptionString"
    ></div>
    <div
      v-if="
        encounter_store.selectedCreature?.extra_data?.languages !== undefined &&
        encounter_store.selectedCreature?.extra_data?.languages.length > 0
      "
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="languageString"
    ></div>
    <div
      v-if="
        encounter_store.selectedCreature?.extra_data?.skills !== undefined &&
        encounter_store.selectedCreature?.extra_data?.skills.length > 0
      "
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      v-html="skillString"
    ></div>
    <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
      <strong>Str</strong>
      {{
        addPlus(
          encounter_store.selectedCreature?.extra_data?.ability_scores.strength
        )
      }},
      <strong>Dex</strong>
      {{
        addPlus(
          encounter_store.selectedCreature?.extra_data?.ability_scores.dexterity
        )
      }},
      <strong>Con</strong>
      {{
        addPlus(
          encounter_store.selectedCreature?.extra_data?.ability_scores
            .constitution
        )
      }},
      <strong>Int</strong>
      {{
        addPlus(
          encounter_store.selectedCreature?.extra_data?.ability_scores
            .intelligence
        )
      }},
      <strong>Wis</strong>
      {{
        addPlus(
          encounter_store.selectedCreature?.extra_data?.ability_scores.wisdom
        )
      }},
      <strong>Cha</strong>
      {{
        addPlus(
          encounter_store.selectedCreature?.extra_data?.ability_scores.charisma
        )
      }}
    </div>
    <template
      v-for="item in encounter_store.selectedCreature?.extra_data?.actions"
      :key="item.core_action.name"
    >
      <div
        v-if="
          item.core_action.category === 'interaction' &&
          item.core_action.slug === null
        "
        class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <strong>{{ item.core_action.name + " " }}</strong>
        <span
          style="font-family: Pathfinder2eActions, sans-serif"
          class="tw:text-2xl"
          >{{
            pfActionSymbol(
              item.core_action.n_of_actions,
              item.core_action.action_type
            )
          }}{{ " " }}
        </span>
        <TraitsList :traits="item.traits" />
        <span v-html="' ' + cleanDescription(item.core_action.description)" />
      </div>
    </template>
    <div
      v-if="
        encounter_store.selectedCreature?.combat_data?.weapons !== undefined &&
        encounter_store.selectedCreature?.combat_data?.weapons.length > 0 &&
        itemString !== ''
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
    <template
      v-for="item in encounter_store.selectedCreature?.extra_data?.actions"
      :key="item.core_action.name"
    >
      <div
        v-if="
          item.core_action.slug !== 'regeneration' &&
          item.core_action.slug !== 'fast-healing' &&
          item.core_action.slug !== 'negative-healing' &&
          item.core_action.description !== '' &&
          item.core_action.category === 'defensive'
        "
        class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <strong>{{ item.core_action.name + " " }}</strong>
        <span
          style="font-family: Pathfinder2eActions, sans-serif"
          class="tw:text-2xl"
          >{{
            pfActionSymbol(
              item.core_action.n_of_actions,
              item.core_action.action_type
            )
          }}{{ " " }}
        </span>

        <TraitsList :traits="item.traits" />
        <span v-html="' ' + cleanDescription(item.core_action.description)" />
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
        encounter_store.selectedCreature?.extra_data?.speeds !== undefined &&
        Object.keys(encounter_store.selectedCreature?.extra_data?.speeds)
          .length > 0
      "
      class="tw:text-base tw:text-gray-800 tw:dark:text-white"
    >
      <strong>Speed</strong>
      {{ speedString }}
    </div>

    <template
      v-for="(item, index) in encounter_store.selectedCreature?.combat_data
        ?.weapons"
      :key="index"
    >
      <div
        v-if="item.weapon_data?.weapon_type !== 'Generic'"
        class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <strong v-if="item.weapon_data?.weapon_type === 'Melee'">Melee </strong>
        <strong v-else-if="item.weapon_data?.weapon_type === 'Ranged'"
          >Ranged
        </strong>
        <span
          style="font-family: Pathfinder2eActions, sans-serif"
          class="tw:text-2xl"
          >1</span
        >
        <i>{{ " " + item.item_core.name.toLowerCase() + " " }} </i>
        <span
          :class="{
            'tw:text-red-600 tw:font-bold':
              encounter_store.selectedCreature?.variant_data?.variant !== 'Base'
          }"
          >{{ addPlus(item.weapon_data?.to_hit_bonus!) }}
          <span v-if="item.item_core.traits.map(t => t.name).includes('agile')"
            >[{{ addPlus(item.weapon_data?.to_hit_bonus! - 4) }}/{{
              addPlus(item.weapon_data?.to_hit_bonus! - 8)
            }}]
          </span>
          <span v-else
            >[{{ addPlus(item.weapon_data?.to_hit_bonus! - 5) }}/{{
              addPlus(item.weapon_data?.to_hit_bonus! - 10)
            }}]
          </span>
        </span>
        <TraitsList :traits="rangeTraits(item)" />
        <strong> Damage </strong>
        <span
          v-for="(weapon, index) in item.weapon_data?.damage_data"
          :key="index"
        >
          <span v-if="weapon.dice">
            {{ weapon.dice.n_of_dices }}d{{ weapon.dice.dice_size
            }}<span
              v-if="weapon.bonus_dmg !== 0"
              :class="{
                'tw:text-red-600 tw:font-bold':
                  encounter_store.selectedCreature?.variant_data?.variant !==
                  'Base'
              }"
              >{{ addPlus(weapon.bonus_dmg) }}</span
            >
            {{ weapon.dmg_type }}
            <span
              v-if="
                item.weapon_data?.damage_data.length &&
                index !== item.weapon_data?.damage_data.length - 1
              "
            >
              plus
            </span>
          </span>
        </span>
        <span v-if="item.weapon_data?.attack_effects?.length">
          <template
            v-for="action in item.weapon_data.attack_effects"
            :key="action.core_action.id"
          >
            plus
            <span
              v-if="action.core_action.description !== null"
              class="tw:decoration-2 tw:underline"
            >
              {{ action.core_action.name }}
              <q-tooltip
                style="
                  font-family:
                    Good Pro,
                    sans-serif;
                "
                class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
              >
                <strong>{{
                  action.core_action.name.toUpperCase() + " "
                }}</strong>
                <span
                  style="font-family: Pathfinder2eActions, sans-serif"
                  class="tw:text-2xl"
                  >{{
                    pfActionSymbol(
                      action.core_action.n_of_actions,
                      action.core_action.action_type
                    )
                  }}</span
                >
                <q-separator class="tw:my-1!" style="height: 2px" />
                <span
                  v-html="cleanDescription(action.core_action.description)"
                />
              </q-tooltip>
            </span>
            <span v-else>{{ action.core_action.name }}</span>
          </template>
        </span>
      </div>
    </template>
    <template v-for="entity in spellString" :key="entity">
      <div
        v-html="entity"
        class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      />
    </template>
    <template
      v-for="item in encounter_store.selectedCreature?.extra_data?.actions"
      :key="item.core_action.name"
    >
      <div
        v-if="
          item.core_action.category === 'offensive' &&
          encounter_store.selectedCreature?.combat_data?.weapons.every(weapon =>
            weapon.weapon_data?.attack_effects?.every(
              action => action.core_action.id !== item.core_action.id
            )
          )
        "
        class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <strong>{{ item.core_action.name + " " }}</strong>
        <span
          style="font-family: Pathfinder2eActions, sans-serif"
          class="tw:text-2xl"
          >{{
            pfActionSymbol(
              item.core_action.n_of_actions,
              item.core_action.action_type
            )
          }}{{ " " }}
        </span>
        <TraitsList :traits="item.traits" />
        <span v-html="' ' + cleanDescription(item.core_action.description)" />
      </div>
    </template>
  </div>
</template>

<style>
.action-glyph {
  font-family: "Pathfinder2eActions", sans-serif;
  font-size: 24px;
  line-height: calc(2 / 1.5);
}
</style>

<style scoped>
.creature-sheet {
  font-family: "Good Pro", sans-serif;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
