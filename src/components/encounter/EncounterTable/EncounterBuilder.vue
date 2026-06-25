<script setup lang="ts">
import { biQuestionCircle, biXLg } from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { debounce } from "lodash-es";
import { useQuasar } from "quasar";
import { ref, watch } from "vue";

import { encounterGenerator } from "@/api/encounter-api-calls";
import { encounterStore } from "@/stores/encounter";
import { filtersStore } from "@/stores/filters";
import { partyStore } from "@/stores/party";
import { settingsStore } from "@/stores/settings";
import { getGameAonLink } from "@/utils/sheet";

import type {
  adventure_groups,
  encounter_data,
  min_creature_hazard
} from "@/types/encounter";
import type {
  alignments,
  challenges,
  complexities,
  rarities,
  roles,
  sizes
} from "@/types/filters";

const $q = useQuasar();

const settings_store = settingsStore();
const party_store = partyStore();
const filters_store = filtersStore();
const encounter_store = encounterStore();

const dialog = ref(false);
const tab = ref("General");

const currentRules = ref(
  settings_store.game === "sf"
    ? "https://2e.aonsrd.com/rules/791-encounter-design"
    : "https://2e.aonprd.com/rules?id=2717"
);

const creatureHazardRatio = ref<number>(100);

const creatureTraits = ref<string[]>();
const creatureTraitsOptions = ref<string[]>(
  filters_store.creatureFilters.traits
);
const alignment = ref<alignments[]>();
const creatureSize = ref<sizes[]>();
const creatureRarity = ref<rarities[]>();
const family = ref<string[]>();
const familiesOptions = filters_store.creatureFilters.families;
const creature_type = ref<string[]>();
const creature_roles = ref<roles[]>();
const creatureSources = ref<string[]>();
const creatureSourcesOptions = ref<string[]>(
  filters_store.creatureFilters.sources
);
const allow_weak_variants = ref<boolean>(true);
const allow_elite_variants = ref<boolean>(true);
const creature_number = ref({ max: 20, min: 1 });

const hazardTraits = ref<string[]>();
const hazardTraitsOptions = ref<string[]>(filters_store.hazardFilters.traits);
const complexity = ref<complexities[]>();
const hazardSize = ref<sizes[]>();
const hazardRarity = ref<rarities[]>();
const hazardSources = ref<string[]>();
const hazardSourcesOptions = ref<string[]>(filters_store.hazardFilters.sources);
const hazardStealth = ref({
  max: filters_store.hazardRanges.max_stealth,
  min: filters_store.hazardRanges.min_stealth
});
const hazard_number = ref({ max: 20, min: 1 });

const challenge = ref<challenges>();
const adventure_group_toggle = ref(false);
const adventure_group = ref<{ label: string; value: adventure_groups }>({
  label: "Boss and Lackeys",
  value: "BossAndLackeys"
});

const adventureGroupSelect = [
  {
    label: "Boss and Lackeys",
    value: "BossAndLackeys"
  },
  {
    label: "Boss and Lieutenant",
    value: "BossAndLieutenant"
  },
  {
    label: "Elite Enemies",
    value: "EliteEnemies"
  },
  {
    label: "Lieutenant and Lackeys",
    value: "LieutenantAndLackeys"
  },
  {
    label: "Mated Pair",
    value: "MatedPair"
  },
  {
    label: "Troop",
    value: "Troop"
  },
  {
    label: "Mook Squad",
    value: "MookSquad"
  }
];

const tmpFilters = ref({
  adventure_group: adventure_group.value,
  adventure_group_toggle: adventure_group_toggle.value,
  challenge: challenge.value,
  creature_hazard_ratio: creatureHazardRatio.value,
  creatures: {
    alignment: alignment.value,
    allow_elite_variants: allow_elite_variants.value,
    allow_weak_variants: allow_weak_variants.value,
    creature_roles: creature_roles.value,
    creature_type: creature_type.value,
    family: family.value,
    number: creature_number.value,
    rarity: creatureRarity.value,
    size: creatureSize.value,
    sources: creatureSources.value,
    traits: creatureTraits.value
  },
  hazards: {
    complexity: complexity.value,
    number: hazard_number.value,
    rarity: hazardRarity.value,
    size: hazardSize.value,
    sources: hazardSources.value,
    stealth: hazardStealth.value,
    traits: hazardTraits.value
  }
});

const restoreSettings = (): void => {
  dialog.value = true;

  tmpFilters.value.creature_hazard_ratio = creatureHazardRatio.value;
  tmpFilters.value.adventure_group_toggle = adventure_group_toggle.value;
  tmpFilters.value.challenge = challenge.value;
  tmpFilters.value.adventure_group = adventure_group.value;

  tmpFilters.value.creatures.number = creature_number.value;
  tmpFilters.value.creatures.traits = creatureTraits.value;
  tmpFilters.value.creatures.alignment = alignment.value;
  tmpFilters.value.creatures.rarity = creatureRarity.value;
  tmpFilters.value.creatures.size = creatureSize.value;
  tmpFilters.value.creatures.family = family.value;
  tmpFilters.value.creatures.creature_type = creature_type.value;
  tmpFilters.value.creatures.creature_roles = creature_roles.value;
  tmpFilters.value.creatures.sources = creatureSources.value;
  tmpFilters.value.creatures.allow_weak_variants = allow_weak_variants.value;
  tmpFilters.value.creatures.allow_elite_variants = allow_elite_variants.value;

  tmpFilters.value.hazards.number = hazard_number.value;
  tmpFilters.value.hazards.traits = hazardTraits.value;
  tmpFilters.value.hazards.complexity = complexity.value;
  tmpFilters.value.hazards.rarity = hazardRarity.value;
  tmpFilters.value.hazards.size = hazardSize.value;
  tmpFilters.value.hazards.sources = hazardSources.value;
  tmpFilters.value.hazards.stealth = hazardStealth.value;
};

const saveChanges = (): void => {
  creatureHazardRatio.value = tmpFilters.value.creature_hazard_ratio;
  challenge.value = tmpFilters.value.challenge;
  adventure_group_toggle.value = tmpFilters.value.adventure_group_toggle;
  adventure_group.value = tmpFilters.value.adventure_group;

  creature_number.value = tmpFilters.value.creatures.number;
  creatureTraits.value = tmpFilters.value.creatures.traits;
  alignment.value = tmpFilters.value.creatures.alignment;
  creatureRarity.value = tmpFilters.value.creatures.rarity;
  creatureSize.value = tmpFilters.value.creatures.size;
  family.value = tmpFilters.value.creatures.family;
  creature_type.value = tmpFilters.value.creatures.creature_type;
  creature_roles.value = tmpFilters.value.creatures.creature_roles;
  creatureSources.value = tmpFilters.value.creatures.sources;
  allow_weak_variants.value = tmpFilters.value.creatures.allow_weak_variants;
  allow_elite_variants.value = tmpFilters.value.creatures.allow_elite_variants;

  hazard_number.value = tmpFilters.value.hazards.number;
  hazardTraits.value = tmpFilters.value.hazards.traits;
  complexity.value = tmpFilters.value.hazards.complexity;
  hazardRarity.value = tmpFilters.value.hazards.rarity;
  hazardSize.value = tmpFilters.value.hazards.size;
  hazardSources.value = tmpFilters.value.hazards.sources;
  hazardStealth.value = tmpFilters.value.hazards.stealth;
};

const generateEncounter = debounce(async () => {
  encounter_store.setGenerating(true);
  saveChanges();
  const partyLevels = party_store.parties[party_store.activeParty]!.members.map(
    player => player.level
  );
  const { is_pwl_on } = settings_store;
  const { game_version } = settings_store;

  const body: encounter_data = {
    creature_data: {
      alignment_filter: tmpFilters.value.creatures.alignment ?? null,
      allow_elite_variants:
        tmpFilters.value.creatures.allow_elite_variants ?? null,
      allow_weak_variants:
        tmpFilters.value.creatures.allow_weak_variants ?? null,
      family_filter: tmpFilters.value.creatures.family ?? null,
      rarity_filter: tmpFilters.value.creatures.rarity ?? null,
      role_filter: creature_roles.value ?? null,
      size_filter: tmpFilters.value.creatures.size ?? null,
      source_filter: tmpFilters.value.creatures.sources ?? null,
      trait_whitelist_filter: tmpFilters.value.creatures.traits ?? null,
      type_filter: tmpFilters.value.creatures.creature_type ?? null,
      game_system_version: game_version,
      is_pwl_on
    },
    hazard_data: {
      complexity_filter: tmpFilters.value.hazards.complexity ?? null,
      max_stealth: tmpFilters.value.hazards.stealth.max ?? null,
      min_stealth: tmpFilters.value.hazards.stealth.min ?? null,
      rarity_filter: tmpFilters.value.hazards.rarity ?? null,
      size_filter: tmpFilters.value.hazards.size ?? null,
      source_filter: tmpFilters.value.hazards.sources ?? null,
      trait_whitelist_filter: tmpFilters.value.hazards.traits ?? null,
      game_system_version: game_version
    },
    party_levels: partyLevels
  };

  if (tmpFilters.value.adventure_group_toggle) {
    body.adventure_group = tmpFilters.value.adventure_group.value;
  } else {
    body.creature_percentage = tmpFilters.value.creature_hazard_ratio;
    body.hazard_percentage = 100 - tmpFilters.value.creature_hazard_ratio;
    body.creature_data.min_creatures = tmpFilters.value.creatures.number.min;
    body.creature_data.max_creatures = tmpFilters.value.creatures.number.max;
    body.hazard_data.min_hazards = tmpFilters.value.hazards.number.min;
    body.hazard_data.max_hazards = tmpFilters.value.hazards.number.max;
    body.challenge = tmpFilters.value.challenge!;
  }
  try {
    const randomEncounter = await encounterGenerator(settings_store.game, body);
    if (!randomEncounter) {
      throw new TypeError("Error generating random encounter");
    }
    if (
      randomEncounter &&
      randomEncounter.count > 0 &&
      randomEncounter.results
    ) {
      encounter_store.clearEncounter();
      if (
        randomEncounter.results.creatures &&
        randomEncounter.results.creatures.length > 0
      ) {
        for (const creature of randomEncounter.results.creatures) {
          const min_creature: min_creature_hazard = {
            archive_link: creature.core_data.derived.archive_link,
            game: creature.game,
            id: creature.core_data.essential.id,
            is_hazard: false,
            level: creature.core_data.essential.base_level,
            name: creature.core_data.essential.name,
            variant: creature.variant_data?.variant ?? "Base",
            quantity: 1
          };
          encounter_store.addToEncounter(min_creature);
        }
      }
      if (
        randomEncounter.results.hazards &&
        randomEncounter.results.hazards.length > 0
      ) {
        for (const hazard of randomEncounter.results.hazards) {
          const min_hazard: min_creature_hazard = {
            archive_link: `https://2e.${getGameAonLink(
              hazard.game
            )}.com/search?q=${encodeURIComponent(
              hazard.core_hazard.essential.name
            )} type%3A(hazard)&type=eqs`,
            complexity: hazard.core_hazard.essential.complexity,
            game: hazard.game,
            id: hazard.core_hazard.essential.id,
            is_hazard: true,
            level: hazard.core_hazard.essential.level,
            name: hazard.core_hazard.essential.name,
            quantity: 1
          };
          encounter_store.addToEncounter(min_hazard);
        }
      }
    } else {
      $q.notify({
        icon: matPriorityHigh,
        message: "No encounter could be generated from the current filters",
        progress: true,
        type: "warning"
      });
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error generating the encounter",
      progress: true,
      type: "warning"
    });
  }
  encounter_store.setGenerating(false);
}, 300);

const filterCreatureTraitsFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.creatureFilters.traits = creatureTraitsOptions.value.filter(
      v => v.toLowerCase().includes(filter)
    );
  });
};

const filterFamiliesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.creatureFilters.families = familiesOptions.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterCreatureSourcesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.creatureFilters.sources = creatureSourcesOptions.value.filter(
      v => v.toLowerCase().includes(filter)
    );
  });
};

const filterHazardTraitsFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.hazardFilters.traits = hazardTraitsOptions.value.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterHazardSourcesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.hazardFilters.sources = hazardSourcesOptions.value.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

watch(
  () => filters_store.hazardRanges,
  ranges => {
    hazardStealth.value = {
      max: ranges.max_stealth,
      min: ranges.min_stealth
    };
  }
);

defineExpose({ generateEncounter });
</script>

<template>
  <q-btn
    id="shepherd-2"
    push
    label="Generator Settings"
    @click="restoreSettings"
  />
  <q-dialog v-model="dialog" aria-label="Generator Settings">
    <q-card flat bordered>
      <q-card-section class="row items-center tw:flex">
        <div class="text-h6 tw:grow">Generator Settings</div>
        <q-btn
          v-close-popup
          :icon="biXLg"
          size="md"
          padding="sm"
          flat
          round
          dense
          aria-label="Close dialog"
        />
      </q-card-section>

      <q-separator />
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab name="General" label="General" />
        <q-tab name="Creatures" label="Creatures" />
        <q-tab name="Hazards" label="Hazards" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="General">
          <q-card-section style="max-height: 24rem">
            <div class="tw:space-y-3!">
              <q-toggle
                v-model="tmpFilters.adventure_group_toggle"
                label="Use Adventure Groups"
                class="tw:mr-2! tw:my-auto!"
                aria-label="Toggle Adventure Groups"
              >
              </q-toggle>
              <q-btn
                flat
                round
                size="sm"
                class="tw:my-auto!"
                :icon="biQuestionCircle"
                :href="currentRules"
                target="_blank"
                rel="noopener"
                aria-label="Link to explanation for adventure groups"
              >
                <q-tooltip
                  class="text-caption text-center tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  <strong>Adventure Groups</strong> <br />
                  Click to learn more
                </q-tooltip>
              </q-btn>
              <div v-if="tmpFilters.adventure_group_toggle" class="tw:pb-65.5!">
                <q-select
                  v-model="tmpFilters.adventure_group"
                  dense
                  outlined
                  options-dense
                  :options="Object.freeze(adventureGroupSelect)"
                  label="Adventure Group"
                  class="tw:pt-1! tw:pb-6!"
                />
                <p
                  v-if="tmpFilters.adventure_group.value === 'BossAndLackeys'"
                  class="tw:mb-0! text-center text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Boss and Lackeys (120 XP)</strong>
                  <br />
                  One creature of party level +2,<br />four creatures of party
                  level -4
                </p>
                <p
                  v-if="
                    tmpFilters.adventure_group.value === 'BossAndLieutenant'
                  "
                  class="tw:mb-0! text-center text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Boss and Lieutenant (120 XP)</strong>
                  <br />
                  One creature of party level +2,<br />one creature of party
                  level
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'EliteEnemies'"
                  class="tw:mb-5.25! text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Elite Enemies (120 XP)</strong>
                  <br />
                  Three creatures of party level
                </p>
                <p
                  v-if="
                    tmpFilters.adventure_group.value === 'LieutenantAndLackeys'
                  "
                  class="tw:mb-0! text-center text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Lieutenant and Lackeys (80 XP)</strong>
                  <br />
                  One creature of party level,<br />four creatures of party
                  level -4
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'MatedPair'"
                  class="tw:mb-5.25! text-center tw:bg-gray-200! tw:text-black tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Mated Pair (80 XP)</strong>
                  <br />
                  Two creatures of party level
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'Troop'"
                  class="tw:mb-0! text-center text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Troop (80 XP)</strong>
                  <br />
                  One creature of party level,<br />two creatures of party level
                  -2
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'MookSquad'"
                  class="tw:mb-5.25! text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Mook Squad (60 XP)</strong>
                  <br />
                  Six creatures of party level -4
                </p>
              </div>
              <span v-else>
                <div class="tw:pb-7">
                  <q-badge outline class="tw:text-sm!">
                    Number of creatures:
                  </q-badge>

                  <q-range
                    v-model="tmpFilters.creatures.number"
                    label-always
                    :min="1"
                    :max="20"
                    markers
                    :left-label-value="
                      'Min: ' + tmpFilters.creatures.number.min
                    "
                    :right-label-value="
                      'Max: ' + tmpFilters.creatures.number.max
                    "
                    class="tw:px-3 tw:pt-1"
                    aria-label="Creature numbers"
                    role="menuitem"
                    switch-label-side
                  />
                </div>

                <div class="tw:pb-7">
                  <q-badge outline class="tw:text-sm!">
                    Number of hazards:
                  </q-badge>

                  <q-range
                    v-model="tmpFilters.hazards.number"
                    label-always
                    :min="1"
                    :max="20"
                    markers
                    :left-label-value="'Min: ' + tmpFilters.hazards.number.min"
                    :right-label-value="'Max: ' + tmpFilters.hazards.number.max"
                    class="tw:px-3 tw:pt-1"
                    aria-label="Hazard numbers"
                    role="menuitem"
                    switch-label-side
                  />
                </div>

                <div class="tw:pb-7">
                  <q-badge outline class="tw:text-sm!"> XP ratio: </q-badge>

                  <div class="tw:flex tw:justify-between">
                    <q-badge color="primary"> Creatures </q-badge>

                    <q-badge color="primary"> Hazards </q-badge>
                  </div>
                  <q-slider
                    v-model="tmpFilters.creature_hazard_ratio"
                    label
                    label-always
                    switch-label-side
                    :min="0"
                    :max="100"
                    :step="5"
                    :label-value="
                      tmpFilters.creature_hazard_ratio +
                      ' / ' +
                      (100 - tmpFilters.creature_hazard_ratio)
                    "
                    class="tw:px-3"
                    style="min-width: 236px"
                    aria-label="Creature to hazard percentage"
                    role="menuitem"
                  />
                </div>

                <div class="tw:mb-17">
                  <q-select
                    v-model="tmpFilters.challenge"
                    dense
                    outlined
                    clearable
                    options-dense
                    :options="
                      Object.freeze([
                        'Trivial',
                        'Low',
                        'Moderate',
                        'Severe',
                        'Extreme',
                        'Impossible'
                      ])
                    "
                    label="Challenge"
                  />
                </div>
              </span>
            </div>
          </q-card-section>
        </q-tab-panel>
        <q-tab-panel class="tw:max-w-0" name="Creatures">
          <q-card-section class="tw:flex" style="max-height: 24rem">
            <div class="tw:space-y-3!">
              <q-select
                v-model="tmpFilters.creatures.traits"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.creatureFilters.traits)"
                use-input
                input-debounce="0"
                label="Traits"
                style="max-width: 248px"
                virtual-scroll-item-size="32"
                @filter="filterCreatureTraitsFn"
              />

              <q-select
                v-model="tmpFilters.creatures.size"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.creatureFilters.sizes)"
                label="Size"
                style="max-width: 248px"
              />

              <q-select
                v-model="tmpFilters.creatures.rarity"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.creatureFilters.rarities)"
                label="Rarity"
                style="max-width: 248px"
              />

              <q-select
                v-model="tmpFilters.creatures.family"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.creatureFilters.families)"
                use-input
                input-debounce="0"
                label="Family"
                style="max-width: 248px"
                virtual-scroll-item-size="32"
                @filter="filterFamiliesFn"
              />

              <q-select
                v-model="tmpFilters.creatures.creature_type"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="
                  Object.freeze(filters_store.creatureFilters.creature_types)
                "
                label="Creature Type"
                style="max-width: 248px"
              />

              <q-select
                v-model="tmpFilters.creatures.sources"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.creatureFilters.sources)"
                use-input
                input-debounce="0"
                label="Sources"
                style="max-width: 248px"
                virtual-scroll-item-size="32"
                @filter="filterCreatureSourcesFn"
              />

              <q-separator class="tw:mb-4! tw:mt-4!" />

              <q-select
                v-model="tmpFilters.creatures.alignment"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="
                  Object.freeze(filters_store.creatureFilters.alignments)
                "
                label="Alignment"
                style="width: 248px"
              />

              <q-select
                v-model="tmpFilters.creatures.creature_roles"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="
                  Object.freeze(filters_store.creatureFilters.creature_roles)
                "
                label="Roles"
                style="width: 248px"
              />

              <div class="q-gutter-sm tw:mt-3!">
                <q-checkbox
                  v-model="tmpFilters.creatures.allow_weak_variants"
                  label="Allow Weak?"
                  class="tw:mx-1!"
                />
                <q-checkbox
                  v-model="tmpFilters.creatures.allow_elite_variants"
                  label="Allow Elite?"
                  class="tw:mx-1!"
                />
              </div>
            </div>
          </q-card-section>
        </q-tab-panel>
        <q-tab-panel class="tw:max-w-0" name="Hazards">
          <q-card-section class="tw:flex" style="max-height: 24rem">
            <div class="tw:space-y-3!">
              <q-select
                v-model="tmpFilters.hazards.traits"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.hazardFilters.traits)"
                use-input
                input-debounce="0"
                label="Traits"
                style="width: 248px"
                virtual-scroll-item-size="32"
                @filter="filterHazardTraitsFn"
              />

              <q-select
                v-model="tmpFilters.hazards.complexity"
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(['Simple', 'Complex'])"
                label="Complexity"
                style="max-width: 248px"
              />

              <q-select
                v-model="tmpFilters.hazards.size"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.hazardFilters.sizes)"
                label="Size"
                style="max-width: 248px"
              />

              <q-select
                v-model="tmpFilters.hazards.rarity"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.hazardFilters.rarities)"
                label="Rarity"
                style="max-width: 248px"
              />

              <q-select
                v-model="tmpFilters.hazards.sources"
                multiple
                dense
                outlined
                clearable
                options-dense
                :options="Object.freeze(filters_store.hazardFilters.sources)"
                use-input
                input-debounce="0"
                label="Sources"
                style="width: 248px"
                virtual-scroll-item-size="32"
                @filter="filterHazardSourcesFn"
              />

              <div class="tw:pb-8">
                <q-badge outline class="tw:text-sm!"> Stealth DC: </q-badge>

                <q-range
                  v-model="tmpFilters.hazards.stealth"
                  label-always
                  :min="filters_store.hazardRanges.min_stealth"
                  :max="filters_store.hazardRanges.max_stealth"
                  markers
                  :left-label-value="'Min: ' + tmpFilters.hazards.stealth.min"
                  :right-label-value="'Max: ' + tmpFilters.hazards.stealth.max"
                  class="tw:px-3 tw:pt-1"
                  aria-label="Stealth DC"
                  role="menuitem"
                  switch-label-side
                />
              </div>
            </div>
          </q-card-section>
        </q-tab-panel>
      </q-tab-panels>
      <q-separator />
      <q-card-actions>
        <q-btn-group flat>
          <q-btn
            v-close-popup
            flat
            label="Save changes"
            type="button"
            class="full-width tw:text-blue-600! tw:dark:text-blue-400!"
            @click="saveChanges"
          />
          <q-separator vertical />
          <q-btn
            v-close-popup
            flat
            label="Generate Encounter"
            type="button"
            class="full-width tw:text-blue-600! tw:dark:text-blue-400!"
            @click="generateEncounter"
          />
        </q-btn-group>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-badge {
  border-color: #ffffff;
  color: #666666;
}

.q-dark .q-badge {
  border-color: #1f2937;
  color: #bcbfc3;
}
</style>
