<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { biXLg, biQuestionCircle } from '@quasar/extras/bootstrap-icons';
import { partyStore, filtersStore, encounterStore, settingsStore } from 'src/stores/store';
import { encounterGenerator } from 'src/utils/encounter-api-calls';
import type { alignments, sizes, rarities, challenges, roles } from 'src/types/filters';
import type { min_creature } from 'src/types/creature';
import { debounce } from 'lodash-es';
import { adventure_groups } from 'src/types/encounter';

const $q = useQuasar();

const settings = settingsStore();
const party = partyStore();
const filters = filtersStore();
const encounter = encounterStore();

const dialog = ref(false);
const tab = ref('General');

const traits = ref<string[]>();
const traitsOptions = filters.getFilters.traits;
const alignment = ref<alignments[]>();
const size = ref<sizes[]>();
const rarity = ref<rarities[]>();
const family = ref<string[]>();
const familiesOptions = filters.getFilters.families;
const creature_type = ref<string[]>();
const allow_weak_variants = ref<boolean>(true);
const allow_elite_variants = ref<boolean>(true);
const creature_number = ref({ min: 1, max: 20 });
const challenge = ref<challenges>();
const creature_roles = ref<roles[]>();
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
  traits: traits.value,
  alignment: alignment.value,
  size: size.value,
  rarity: rarity.value,
  family: family.value,
  creature_type: creature_type.value,
  allow_weak_variants: allow_weak_variants.value,
  allow_elite_variants: allow_elite_variants.value,
  creatures: creature_number.value,
  challenge: challenge.value,
  creature_roles: creature_roles.value,
  adventure_group_toggle: adventure_group_toggle.value,
  adventure_group: adventure_group.value
});

const restoreSettings = () => {
  dialog.value = true;
  tmpFilters.value.traits = traits.value;
  tmpFilters.value.alignment = alignment.value;
  tmpFilters.value.rarity = rarity.value;
  tmpFilters.value.size = size.value;
  tmpFilters.value.family = family.value;
  tmpFilters.value.creature_type = creature_type.value;
  tmpFilters.value.allow_weak_variants = allow_weak_variants.value;
  tmpFilters.value.allow_elite_variants = allow_elite_variants.value;
  tmpFilters.value.creatures = creature_number.value;
  tmpFilters.value.challenge = challenge.value;
  tmpFilters.value.creature_roles = creature_roles.value;
  tmpFilters.value.adventure_group_toggle = adventure_group_toggle.value;
  tmpFilters.value.adventure_group = adventure_group.value;
};

const generateEncounter = debounce(async function () {
  encounter.setGenerating(true);
  saveChanges();
  const partyLevels = party.getActiveParty.members;
  const is_pwl_on = encounter.getPwl;
  const pf_version = settings.getPfVersion;

  const post: {
    traits: string[] | undefined;
    alignments: alignments[] | undefined;
    sizes: sizes[] | undefined;
    rarities: rarities[] | undefined;
    families: string[] | undefined;
    creature_types: string[] | undefined;
    challenge?: challenges;
    party_levels: number[];
    min_creatures?: number;
    max_creatures?: number;
    allow_weak_variants: boolean;
    allow_elite_variants: boolean;
    creature_roles: roles[] | undefined;
    is_pwl_on: boolean;
    pathfinder_version: string;
    adventure_group?: adventure_groups;
  } = {
    traits: tmpFilters.value.traits,
    alignments: tmpFilters.value.alignment,
    sizes: tmpFilters.value.size,
    rarities: tmpFilters.value.rarity,
    families: tmpFilters.value.family,
    creature_types: tmpFilters.value.creature_type,
    allow_weak_variants: tmpFilters.value.allow_weak_variants,
    allow_elite_variants: tmpFilters.value.allow_elite_variants,
    party_levels: partyLevels,
    creature_roles: creature_roles.value,
    is_pwl_on: is_pwl_on,
    pathfinder_version: pf_version
  };

  if (tmpFilters.value.adventure_group_toggle) {
    post.adventure_group = tmpFilters.value.adventure_group.value;
  } else {
    post.min_creatures = tmpFilters.value.creatures.min;
    post.max_creatures = tmpFilters.value.creatures.max;
    post.challenge = tmpFilters.value.challenge;
  }
  try {
    const randomEncounter = await encounterGenerator(post);
    if (typeof randomEncounter != 'undefined') {
      if (randomEncounter.count > 0 && randomEncounter.results) {
        encounter.clearEncounter();
        for (let i = 0; i < randomEncounter.count; i++) {
          const min_creature: min_creature = {
            id: randomEncounter.results[i].core_data.essential.id,
            archive_link: randomEncounter.results[i].core_data.derived.archive_link,
            name: randomEncounter.results[i].core_data.essential.name,
            level: randomEncounter.results[i].core_data.essential.base_level,
            variant: randomEncounter.results[i].variant_data?.variant
          };
          encounter.addToEncounter(min_creature);
        }
      } else {
        $q.notify({
          progress: true,
          type: 'warning',
          message: 'No encounter could be generated from the current filters',
          icon: matPriorityHigh
        });
      }
    } else {
      throw new Error('Error generating random encounter');
    }
  } catch (error) {
    console.error(error);
  }
  encounter.setGenerating(false);
}, 300);

const saveChanges = () => {
  traits.value = tmpFilters.value.traits;
  alignment.value = tmpFilters.value.alignment;
  rarity.value = tmpFilters.value.rarity;
  size.value = tmpFilters.value.size;
  family.value = tmpFilters.value.family;
  creature_type.value = tmpFilters.value.creature_type;
  allow_weak_variants.value = tmpFilters.value.allow_weak_variants;
  allow_elite_variants.value = tmpFilters.value.allow_elite_variants;
  creature_number.value = tmpFilters.value.creatures;
  challenge.value = tmpFilters.value.challenge;
  creature_roles.value = tmpFilters.value.creature_roles;
  adventure_group_toggle.value = tmpFilters.value.adventure_group_toggle;
  adventure_group.value = tmpFilters.value.adventure_group;
};

const filterTraitsFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getFilters.traits = traitsOptions.filter((v) => v.toLowerCase().indexOf(filter) > -1);
  });
};

const filterFamiliesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getFilters.families = familiesOptions.filter(
      (v) => v.toLowerCase().indexOf(filter) > -1
    );
  });
};

defineExpose({ generateEncounter });
</script>

<template>
  <q-btn push label="Generator Settings" @click="restoreSettings" id="v-step-2" />
  <q-dialog v-model="dialog" aria-label="Generator Settings">
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-h6 tw-mr-4">Generator Settings</div>
        <q-space />
        <q-btn
          :icon="biXLg"
          size="md"
          padding="sm"
          flat
          round
          dense
          v-close-popup
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
        <q-tab name="Advanced" label="Advanced" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="General">
          <q-card-section style="max-height: 46rem">
            <div class="tw-space-y-3">
              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.traits"
                :options="Object.freeze(filters.getFilters.traits)"
                @filter="filterTraitsFn"
                use-input
                input-debounce="0"
                label="Traits"
                style="max-width: 270px"
              />

              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.size"
                :options="Object.freeze(filters.getFilters.sizes)"
                label="Size"
                style="max-width: 270px"
              />

              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.rarity"
                :options="Object.freeze(filters.getFilters.rarities)"
                label="Rarity"
                style="max-width: 270px"
              />

              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.family"
                :options="Object.freeze(filters.getFilters.families)"
                @filter="filterFamiliesFn"
                use-input
                input-debounce="0"
                label="Family"
                style="max-width: 270px"
              />

              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.creature_type"
                :options="Object.freeze(filters.getFilters.creature_types)"
                label="Creature Type"
                style="max-width: 270px"
              />
              <q-separator />
              <q-toggle
                v-model="tmpFilters.adventure_group_toggle"
                label="Use Adventure Groups"
                class="tw-mr-2"
                aria-label="Toggle Adventure Groups"
              >
              </q-toggle>
              <q-btn
                flat
                round
                size="sm"
                :icon="biQuestionCircle"
                href="https://2e.aonprd.com/Rules.aspx?ID=2717"
                target="_blank"
                rel="noopener"
                aria-label="Link to explanation for adventure groups"
              >
                <q-tooltip
                  class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                  anchor="top middle"
                  self="bottom middle"
                >
                  <strong>Adventure Groups</strong> <br />
                  Click to learn more
                </q-tooltip>
              </q-btn>
              <span v-if="tmpFilters.adventure_group_toggle">
                <q-select
                  dense
                  outlined
                  options-dense
                  v-model="tmpFilters.adventure_group"
                  :options="Object.freeze(adventureGroupSelect)"
                  label="Adventure Group"
                  class="tw-pt-1 tw-pb-6"
                />
                <p
                  v-if="tmpFilters.adventure_group.value === 'BossAndLackeys'"
                  class="text-center text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Boss and Lackeys (120 XP)</strong>
                  <br />
                  One creature of party level +2,<br />four creatures of party level -4
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'BossAndLieutenant'"
                  class="text-center text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Boss and Lieutenant (120 XP)</strong>
                  <br />
                  One creature of party level +2,<br />one creature of party level
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'EliteEnemies'"
                  class="tw-mb-[21px] text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Elite Enemies (120 XP)</strong>
                  <br />
                  Three creatures of party level
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'LieutenantAndLackeys'"
                  class="text-center text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Lieutenant and Lackeys (80 XP)</strong>
                  <br />
                  One creature of party level,<br />four creatures of party level -4
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'MatedPair'"
                  class="tw-mb-[21px] text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Mated Pair (80 XP)</strong>
                  <br />
                  Two creatures of party level
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'Troop'"
                  class="text-center text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Troop (80 XP)</strong>
                  <br />
                  One creature of party level,<br />two creatures of party level -2
                </p>
                <p
                  v-if="tmpFilters.adventure_group.value === 'MookSquad'"
                  class="tw-mb-[21px] text-center tw-bg-gray-200 tw-text-black dark:tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                >
                  <strong>Mook Squad (60 XP)</strong>
                  <br />
                  Six creatures of party level -4
                </p>
              </span>
              <span v-else>
                <div class="tw-pb-7">
                  <q-badge outline class="tw-text-sm"> Number of creatures: </q-badge>

                  <q-range
                    v-model="tmpFilters.creatures"
                    label-always
                    :min="1"
                    :max="20"
                    markers
                    :left-label-value="'Min: ' + tmpFilters.creatures.min"
                    :right-label-value="'Max: ' + tmpFilters.creatures.max"
                    style="max-width: 270px"
                    class="tw-px-3 tw-pt-1"
                    aria-label="Creature numbers"
                    role="menuitem"
                    switch-label-side
                  />
                </div>

                <q-select
                  dense
                  outlined
                  clearable
                  options-dense
                  v-model="tmpFilters.challenge"
                  :options="
                    Object.freeze(['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme', 'Impossible'])
                  "
                  label="Challenge"
                />
              </span>
            </div>
          </q-card-section>
        </q-tab-panel>
        <q-tab-panel name="Advanced">
          <q-card-section class="tw-flex" style="max-height: 46rem">
            <div class="tw-space-y-3">
              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.alignment"
                :options="Object.freeze(filters.getFilters.alignments)"
                label="Alignment"
                style="max-width: 270px"
              />

              <q-select
                multiple
                dense
                outlined
                clearable
                options-dense
                v-model="tmpFilters.creature_roles"
                :options="Object.freeze(filters.getFilters.creature_roles)"
                label="Roles"
                style="max-width: 270px"
              />

              <div class="q-gutter-sm tw-pb-[239px]">
                <q-checkbox
                  v-model="tmpFilters.allow_weak_variants"
                  label="Allow Weak?"
                  class="tw-mx-1"
                />
                <q-checkbox
                  v-model="tmpFilters.allow_elite_variants"
                  label="Allow Elite?"
                  class="tw-mx-1"
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
            flat
            label="Save changes"
            type="button"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            v-close-popup
            @click="saveChanges"
          />
          <q-separator vertical />
          <q-btn
            flat
            label="Generate Encounter"
            type="button"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            v-close-popup
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
