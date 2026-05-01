<script setup lang="ts">
import { biQuestionCircle, biXLg } from '@quasar/extras/bootstrap-icons';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { debounce } from 'lodash-es';
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';

import { encounterStore, filtersStore, partyStore, settingsStore } from '../../../../stores/store';
import { encounterGenerator } from '../../../../utils/encounter-api-calls';

import type {
  adventure_groups,
  encounter_data,
  min_creature_hazard
} from '../../../../types/encounter';
import type {
  alignments,
  challenges,
  complexities,
  rarities,
  roles,
  sizes
} from '../../../../types/filters';

const $q = useQuasar();

const settings = settingsStore();
const party = partyStore();
const filters = filtersStore();
const encounter = encounterStore();

const dialog = ref(false);
const tab = ref('General');

watch(
  () => filters.hazardRanges,
  (ranges) => {
    hazardStealth.value = {
      min: ranges.min_stealth,
      max: ranges.max_stealth
    };
  }
);

const creatureHazardRatio = ref<number>(100);

const creatureTraits = ref<string[]>();
const creatureTraitsOptions = ref<string[]>(filters.getCreatureFilters.traits);
const alignment = ref<alignments[]>();
const creatureSize = ref<sizes[]>();
const creatureRarity = ref<rarities[]>();
const family = ref<string[]>();
const familiesOptions = filters.getCreatureFilters.families;
const creature_type = ref<string[]>();
const creature_roles = ref<roles[]>();
const creatureSources = ref<string[]>();
const creatureSourcesOptions = ref<string[]>(filters.getCreatureFilters.sources);
const allow_weak_variants = ref<boolean>(true);
const allow_elite_variants = ref<boolean>(true);
const creature_number = ref({ min: 1, max: 20 });

const hazardTraits = ref<string[]>();
const hazardTraitsOptions = ref<string[]>(filters.getHazardFilters.traits);
const complexity = ref<complexities[]>();
const hazardSize = ref<sizes[]>();
const hazardRarity = ref<rarities[]>();
const hazardSources = ref<string[]>();
const hazardSourcesOptions = ref<string[]>(filters.getHazardFilters.sources);
const hazardStealth = ref({
  min: filters.hazardRanges.min_stealth,
  max: filters.hazardRanges.max_stealth
});
const hazard_number = ref({ min: 1, max: 20 });

const challenge = ref<challenges>();
const adventure_group_toggle = ref(false);
const adventure_group = ref<{ label: string; value: adventure_groups }>({
  label: 'Boss and Lackeys',
  value: 'BossAndLackeys'
});

const adventureGroupSelect = [
  {
    label: 'Boss and Lackeys',
    value: 'BossAndLackeys'
  },
  {
    label: 'Boss and Lieutenant',
    value: 'BossAndLieutenant'
  },
  {
    label: 'Elite Enemies',
    value: 'EliteEnemies'
  },
  {
    label: 'Lieutenant and Lackeys',
    value: 'LieutenantAndLackeys'
  },
  {
    label: 'Mated Pair',
    value: 'MatedPair'
  },
  {
    label: 'Troop',
    value: 'Troop'
  },
  {
    label: 'Mook Squad',
    value: 'MookSquad'
  }
];

const tmpFilters = ref({
  creature_hazard_ratio: creatureHazardRatio.value,
  adventure_group_toggle: adventure_group_toggle.value,
  adventure_group: adventure_group.value,
  challenge: challenge.value,
  creatures: {
    number: creature_number.value,
    traits: creatureTraits.value,
    alignment: alignment.value,
    size: creatureSize.value,
    rarity: creatureRarity.value,
    family: family.value,
    creature_type: creature_type.value,
    sources: creatureSources.value,
    allow_weak_variants: allow_weak_variants.value,
    allow_elite_variants: allow_elite_variants.value,
    creature_roles: creature_roles.value
  },
  hazards: {
    number: hazard_number.value,
    traits: hazardTraits.value,
    complexity: complexity.value,
    size: hazardSize.value,
    rarity: hazardRarity.value,
    sources: hazardSources.value,
    stealth: hazardStealth.value
  }
});

const restoreSettings = () => {
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

const generateEncounter = debounce(async function () {
  encounter.setGenerating(true);
  saveChanges();
  const partyLevels = party.getActiveParty!.members;
  const is_pwl_on = encounter.getPwl;
  const game_version = settings.getGameVersion;

  const body: encounter_data = {
    creature_data: {
      trait_whitelist_filter: tmpFilters.value.creatures.traits,
      alignment_filter: tmpFilters.value.creatures.alignment,
      size_filter: tmpFilters.value.creatures.size,
      rarity_filter: tmpFilters.value.creatures.rarity,
      family_filter: tmpFilters.value.creatures.family,
      type_filter: tmpFilters.value.creatures.creature_type,
      source_filter: tmpFilters.value.creatures.sources,
      allow_weak_variants: tmpFilters.value.creatures.allow_weak_variants,
      allow_elite_variants: tmpFilters.value.creatures.allow_elite_variants,
      party_levels: partyLevels,
      role_filter: creature_roles.value,
      is_pwl_on: is_pwl_on,
      game_system_version: game_version
    },
    hazard_data: {
      trait_whitelist_filter: tmpFilters.value.hazards.traits,
      complexity_filter: tmpFilters.value.hazards.complexity,
      rarity_filter: tmpFilters.value.hazards.rarity,
      size_filter: tmpFilters.value.hazards.size,
      source_filter: tmpFilters.value.hazards.sources,
      min_stealth: tmpFilters.value.hazards.stealth.min,
      max_stealth: tmpFilters.value.hazards.stealth.max,
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
    const randomEncounter = await encounterGenerator('pf', body);
    if (randomEncounter === undefined) {
      throw new TypeError('Error generating random encounter');
    }
    if (randomEncounter.count > 0 && randomEncounter.results) {
      encounter.clearEncounter();
      if (randomEncounter.results.creatures && randomEncounter.results.creatures.length > 0) {
        for (const creature of randomEncounter.results.creatures) {
          const min_creature: min_creature_hazard = {
            game: creature.game,
            id: creature.core_data.essential.id,
            archive_link: creature.core_data.derived.archive_link,
            name: creature.core_data.essential.name,
            level: creature.core_data.essential.base_level,
            variant: creature.variant_data?.variant,
            is_hazard: false
          };
          encounter.addToEncounter(min_creature);
        }
      }
      if (randomEncounter.results.hazards && randomEncounter.results.hazards.length > 0) {
        for (const hazard of randomEncounter.results.hazards) {
          const min_hazard: min_creature_hazard = {
            game: hazard.game,
            id: hazard.core_hazard.essential.id,
            archive_link:
              'https://2e.aonprd.com/search?q=' +
              encodeURIComponent(hazard.core_hazard.essential.name) +
              ' type%3A(hazard)&type=eqs',
            name: hazard.core_hazard.essential.name,
            level: hazard.core_hazard.essential.level,
            is_hazard: true,
            complexity: hazard.core_hazard.essential.complexity
          };
          encounter.addToEncounter(min_hazard);
        }
      }
    } else {
      $q.notify({
        progress: true,
        type: 'warning',
        message: 'No encounter could be generated from the current filters',
        icon: matPriorityHigh
      });
    }
  } catch (error) {
    console.error(error);
    $q.notify({
      progress: true,
      type: 'warning',
      message: 'Error generating the encounter',
      icon: matPriorityHigh
    });
  }
  encounter.setGenerating(false);
}, 300);

const saveChanges = () => {
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

const filterCreatureTraitsFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getCreatureFilters.traits = creatureTraitsOptions.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterFamiliesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getCreatureFilters.families = familiesOptions.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterCreatureSourcesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getCreatureFilters.sources = creatureSourcesOptions.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterHazardTraitsFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getHazardFilters.traits = hazardTraitsOptions.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterHazardSourcesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getHazardFilters.sources = hazardSourcesOptions.value.filter((v) =>
      v.toLowerCase().includes(filter)
    );
  });
};

defineExpose({ generateEncounter });
</script>

<template>
  <q-btn id="v-step-2" push label="Generator Settings" @click="restoreSettings" />
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
                href="https://2e.aonprd.com/Rules.aspx?ID=2717"
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
                  One creature of party level +2,<br />four creatures of party level -4
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'BossAndLieutenant'"
                  class="tw:mb-0! text-center text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Boss and Lieutenant (120 XP)</strong>
                  <br />
                  One creature of party level +2,<br />one creature of party level
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
                  v-if="tmpFilters.adventure_group.value === 'LieutenantAndLackeys'"
                  class="tw:mb-0! text-center text-center tw:bg-gray-200! tw:text-black! tw:dark:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                >
                  <strong>Lieutenant and Lackeys (80 XP)</strong>
                  <br />
                  One creature of party level,<br />four creatures of party level -4
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
                  One creature of party level,<br />two creatures of party level -2
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
                  <q-badge outline class="tw:text-sm!"> Number of creatures: </q-badge>

                  <q-range
                    v-model="tmpFilters.creatures.number"
                    label-always
                    :min="1"
                    :max="20"
                    markers
                    :left-label-value="'Min: ' + tmpFilters.creatures.number.min"
                    :right-label-value="'Max: ' + tmpFilters.creatures.number.max"
                    class="tw:px-3 tw:pt-1"
                    aria-label="Creature numbers"
                    role="menuitem"
                    switch-label-side
                  />
                </div>

                <div class="tw:pb-7">
                  <q-badge outline class="tw:text-sm!"> Number of hazards: </q-badge>

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
                :options="Object.freeze(filters.getCreatureFilters.traits)"
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
                :options="Object.freeze(filters.getCreatureFilters.sizes)"
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
                :options="Object.freeze(filters.getCreatureFilters.rarities)"
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
                :options="Object.freeze(filters.getCreatureFilters.families)"
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
                :options="Object.freeze(filters.getCreatureFilters.creature_types)"
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
                :options="Object.freeze(filters.getCreatureFilters.sources)"
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
                :options="Object.freeze(filters.getCreatureFilters.alignments)"
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
                :options="Object.freeze(filters.getCreatureFilters.creature_roles)"
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
                :options="Object.freeze(filters.getHazardFilters.traits)"
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
                :options="Object.freeze(filters.getHazardFilters.sizes)"
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
                :options="Object.freeze(filters.getHazardFilters.rarities)"
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
                :options="Object.freeze(filters.getHazardFilters.sources)"
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
                  :min="filters.hazardRanges.min_stealth"
                  :max="filters.hazardRanges.max_stealth"
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
