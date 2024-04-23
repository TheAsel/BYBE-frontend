<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { matPriorityHigh, matArrowDropDown, matCancel } from '@quasar/extras/material-icons';
import { biXLg } from '@quasar/extras/bootstrap-icons';
import { partyStore, filtersStore, encounterStore } from 'src/stores/store';
import { encounterGenerator } from 'src/utils/api-calls';
import type { alignments, sizes, rarities, challenges } from 'src/types/filters';
import { creature_encounter } from 'src/types/creature';

const $q = useQuasar();

const party = partyStore();
const filters = filtersStore();
const encounter = encounterStore();

const dialog = ref(false);

const traits = ref<string[]>();
const alignment = ref<alignments[]>();
const size = ref<sizes[]>();
const rarity = ref<rarities[]>();
const family = ref<string[]>();
const creature_type = ref<string[]>();
const allow_weak_variants = ref<boolean>(true);
const allow_elite_variants = ref<boolean>(true);
const creatureNumber = ref({ min: 1, max: 20 });
const challenge = ref<challenges>();
const creatures_roles = ref<string[]>();

const tmpFilters = ref({
  traits: traits.value,
  alignment: alignment.value,
  size: size.value,
  rarity: rarity.value,
  family: family.value,
  creature_type: creature_type.value,
  allow_weak_variants: allow_weak_variants.value,
  allow_elite_variants: allow_elite_variants.value,
  creatures: creatureNumber.value,
  challenge: challenge.value,
  creatures_roles: creatures_roles.value
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
  tmpFilters.value.creatures = creatureNumber.value;
  tmpFilters.value.challenge = challenge.value;
  tmpFilters.value.creatures_roles = creatures_roles.value;
};

const generateEncounter = async () => {
  saveChanges();
  const partyLevels = party.getActiveParty.members;
  const is_pwl_on = ref(false);
  const localPwl = ref(localStorage.getItem('is_pwl_on'));
  switch (localPwl.value) {
    case 'true':
      is_pwl_on.value = true;
      break;
    case 'false':
      is_pwl_on.value = false;
      break;
    default:
      is_pwl_on.value = false;
      localStorage.setItem('is_pwl_on', 'false');
      break;
  }
  const post = {
    traits: tmpFilters.value.traits,
    alignments: tmpFilters.value.alignment,
    sizes: tmpFilters.value.size,
    rarities: tmpFilters.value.rarity,
    families: tmpFilters.value.family,
    creature_types: tmpFilters.value.creature_type,
    allow_weak_variants: tmpFilters.value.allow_weak_variants,
    allow_elite_variants: tmpFilters.value.allow_elite_variants,
    min_creatures: tmpFilters.value.creatures.min,
    max_creatures: tmpFilters.value.creatures.max,
    challenge: tmpFilters.value.challenge,
    party_levels: partyLevels,
    is_pwl_on: is_pwl_on.value,
    creatures_roles: creatures_roles.value
  };
  try {
    const randomEncounter = await encounterGenerator(post);
    if (typeof randomEncounter != 'undefined') {
      if (randomEncounter.count > 0 && randomEncounter.results) {
        encounter.clearEncounter();
        for (var i = 0; i < randomEncounter.count; i++) {
          const min_creature: creature_encounter = {
            archive_link: randomEncounter.results[i].core_data.archive_link,
            name: randomEncounter.results[i].core_data.name,
            level: randomEncounter.results[i].core_data.base_level,
            variant: randomEncounter.results[i].core_data.variant
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
      throw 'Error generating random encounter';
    }
  } catch (error) {
    console.error(error);
  }
};

const saveChanges = () => {
  traits.value = tmpFilters.value.traits;
  alignment.value = tmpFilters.value.alignment;
  rarity.value = tmpFilters.value.rarity;
  size.value = tmpFilters.value.size;
  family.value = tmpFilters.value.family;
  creature_type.value = tmpFilters.value.creature_type;
  allow_weak_variants.value = tmpFilters.value.allow_weak_variants;
  allow_elite_variants.value = tmpFilters.value.allow_elite_variants;
  creatureNumber.value = tmpFilters.value.creatures;
  challenge.value = tmpFilters.value.challenge;
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

      <q-card-section style="max-height: 62vh" class="scroll">
        <div class="tw-space-y-3">
          <q-select
            multiple
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.traits"
            :options="Object.freeze(filters.getFilters.traits)"
            label="Traits"
            :dropdown-icon="matArrowDropDown"
            style="max-width: 270px"
          />

          <q-select
            multiple
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.alignment"
            :options="Object.freeze(filters.getFilters.alignments)"
            label="Alignment"
            :dropdown-icon="matArrowDropDown"
            style="max-width: 270px"
          />

          <q-select
            multiple
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.size"
            :options="Object.freeze(filters.getFilters.sizes)"
            label="Size"
            :dropdown-icon="matArrowDropDown"
            style="max-width: 270px"
          />

          <q-select
            multiple
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.rarity"
            :options="Object.freeze(filters.getFilters.rarities)"
            label="Rarity"
            :dropdown-icon="matArrowDropDown"
            style="max-width: 270px"
          />

          <q-select
            multiple
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.family"
            :options="Object.freeze(filters.getFilters.families)"
            label="Family"
            :dropdown-icon="matArrowDropDown"
            style="max-width: 270px"
          />

          <q-select
            multiple
            dense
            outlined
            clearable
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.creature_type"
            :options="Object.freeze(filters.getFilters.creature_types)"
            label="Creature Type"
            :dropdown-icon="matArrowDropDown"
            style="max-width: 270px"
          />

          <div class="q-gutter-sm tw-mx-auto">
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

          <div class="tw-pb-4">
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
            :clear-icon="matCancel"
            options-dense
            v-model="tmpFilters.challenge"
            :options="
              Object.freeze(['Trivial', 'Low', 'Moderate', 'Severe', 'Extreme', 'Impossible'])
            "
            label="Challenge"
            :dropdown-icon="matArrowDropDown"
          />
        </div>
      </q-card-section>
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
