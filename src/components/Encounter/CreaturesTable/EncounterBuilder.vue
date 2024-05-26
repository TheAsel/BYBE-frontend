<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { matPriorityHigh, matArrowDropDown, matCancel } from '@quasar/extras/material-icons';
import { biXLg } from '@quasar/extras/bootstrap-icons';
import { partyStore, filtersStore, encounterStore, settingsStore } from 'src/stores/store';
import { encounterGenerator } from 'src/utils/api-calls';
import type { alignments, sizes, rarities, challenges, roles } from 'src/types/filters';
import type { creature_encounter } from 'src/types/creature';
import { debounce } from 'lodash';

const $q = useQuasar();

const settings = settingsStore();
const party = partyStore();
const filters = filtersStore();
const encounter = encounterStore();

const dialog = ref(false);
const tab = ref('General');

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
const creature_roles = ref<roles[]>();

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
  creature_roles: creature_roles.value
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
  tmpFilters.value.creature_roles = creature_roles.value;
};

const generateEncounter = debounce(async function () {
  encounter.setGenerating(true);
  saveChanges();
  const partyLevels = party.getActiveParty.members;
  const is_pwl_on = encounter.getPwl;
  const pf_version = settings.getPfVersion;

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
    creature_roles: creature_roles.value,
    is_pwl_on: is_pwl_on,
    pathfinder_versions: pf_version
  };
  try {
    const randomEncounter = await encounterGenerator(post);
    if (typeof randomEncounter != 'undefined') {
      if (randomEncounter.count > 0 && randomEncounter.results) {
        encounter.clearEncounter();
        for (let i = 0; i < randomEncounter.count; i++) {
          const min_creature: creature_encounter = {
            archive_link: randomEncounter.results[i].core_data.derived.archive_link,
            name: randomEncounter.results[i].core_data.essential.name,
            level: randomEncounter.results[i].core_data.essential.level,
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
      throw 'Error generating random encounter';
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
  creatureNumber.value = tmpFilters.value.creatures;
  challenge.value = tmpFilters.value.challenge;
  creature_roles.value = tmpFilters.value.creature_roles;
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
        </q-tab-panel>
        <q-tab-panel name="Advanced">
          <q-card-section class="tw-flex" style="max-height: 46rem">
            <div class="tw-space-y-3">
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
                v-model="tmpFilters.creature_roles"
                :options="Object.freeze(filters.getFilters.creature_roles)"
                label="Roles"
                :dropdown-icon="matArrowDropDown"
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
