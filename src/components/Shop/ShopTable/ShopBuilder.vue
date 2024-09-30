<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { mdiCloseCircle } from '@quasar/extras/mdi-v7';
import {
  biXLg,
  biQuestionCircle,
  biTrash,
  biPlusLg,
  biCopy,
  biPencilSquare,
  biCheck,
  biX
} from '@quasar/extras/bootstrap-icons';
import { filtersStore, itemsStore, settingsStore, templateStore } from 'src/stores/store';
import { shopGenerator } from 'src/utils/shop-api-calls';
import { capitalize, cloneDeep, debounce } from 'lodash-es';
import { min_item } from 'src/types/item';
import { template } from 'src/types/template';

const $q = useQuasar();

const settings = settingsStore();
const filters = filtersStore();
const shop = itemsStore();
const templatesStore = templateStore();

const dialog = ref(false);
const tab = ref('General');

const selectedTraits = ref<{ label: string; value: string; state: boolean | null }[]>([]);
const traitsOptions = ref<{ label: string; value: string; state: boolean | null }[]>(
  filters.getItemFilters.traits.map((trait) => ({
    label: trait.label,
    value: trait.value,
    state: null
  }))
);

const sourceFilter = filters.getItemFilters.sources;
const traitFilter = traitsOptions.value;

const newTemplateDialog = ref(false);
const newNameInput = ref();
const duplicateTemplateDialog = ref(false);
const duplicateNameInput = ref();
const editTemplateDialog = ref(false);
const editNameInput = ref();

const newTemplate = ref<template>({
  default: false,
  name: '',
  description: '',
  source_filter: [],
  trait_blacklist_filter: [],
  trait_whitelist_filter: [],
  rarity_filter: [],
  type_filter: [],
  armor_percentage: 0,
  equipment_percentage: 0,
  shield_percentage: 0,
  weapon_percentage: 0
});
const removeTemplateDialog = ref(false);

const fixedConsumableDice = ref(false);
const fixedEquipmentDice = ref(false);

const armorOn = ref(true);
const equipmentOn = ref(true);
const shieldOn = ref(true);
const weaponOn = ref(true);

const diceSelect = [
  {
    label: 'D4',
    value: 4,
    icon: 'img:/dice/d4.png'
  },
  {
    label: 'D6',
    value: 6,
    icon: 'img:/dice/d6.png'
  },
  {
    label: 'D8',
    value: 8,
    icon: 'img:/dice/d8.png'
  },
  {
    label: 'D10',
    value: 10,
    icon: 'img:/dice/d10.png'
  },
  {
    label: 'D12',
    value: 12,
    icon: 'img:/dice/d12.png'
  },
  {
    label: 'D20',
    value: 20,
    icon: 'img:/dice/d20.png'
  }
];

const template_list = ref<string[]>(templatesStore.getTemplates.map((template) => template.name));

const consumable_dices = ref({ dice_size: { label: 'D4', value: 4 }, n_of_dices: 3 });
const equippable_dices = ref({ dice_size: { label: 'D4', value: 4 }, n_of_dices: 3 });
const levels = ref({ min: 0, max: 25 });

const tmpFilters = ref({
  consumable_dices: consumable_dices.value,
  equippable_dices: equippable_dices.value,
  levels: levels.value,
  shop_template: cloneDeep(templatesStore.getActiveTemplate)
});

const restoreSettings = () => {
  dialog.value = true;
  tmpFilters.value.consumable_dices = {
    dice_size: {
      label: consumable_dices.value.dice_size.label,
      value: consumable_dices.value.dice_size.value
    },
    n_of_dices: consumable_dices.value.n_of_dices
  };
  tmpFilters.value.equippable_dices = {
    dice_size: {
      label: equippable_dices.value.dice_size.label,
      value: equippable_dices.value.dice_size.value
    },
    n_of_dices: equippable_dices.value.n_of_dices
  };
  tmpFilters.value.levels = levels.value;
  tmpFilters.value.shop_template = cloneDeep(templatesStore.getActiveTemplate);
};

const generateShop = debounce(async function () {
  shop.setGenerating(true);
  saveChanges();
  const pf_version = settings.getPfVersion;

  const post = {
    consumable_dices: [
      {
        dice_size: tmpFilters.value.consumable_dices.dice_size.value,
        n_of_dices: tmpFilters.value.consumable_dices.n_of_dices
      }
    ],
    equippable_dices: [
      {
        dice_size: tmpFilters.value.equippable_dices.dice_size.value,
        n_of_dices: tmpFilters.value.equippable_dices.n_of_dices
      }
    ],
    min_level: tmpFilters.value.levels.min,
    max_level: tmpFilters.value.levels.max,
    pathfinder_version: pf_version
  };
  if (fixedConsumableDice.value) {
    post.consumable_dices = [
      {
        dice_size: 1,
        n_of_dices: tmpFilters.value.consumable_dices.n_of_dices
      }
    ];
  }
  if (fixedEquipmentDice.value) {
    post.equippable_dices = [
      {
        dice_size: 1,
        n_of_dices: tmpFilters.value.equippable_dices.n_of_dices
      }
    ];
  }
  if (tmpFilters.value.shop_template.default) {
    post['shop_template'] = tmpFilters.value.shop_template.name;
  } else {
    post['source_filter'] = tmpFilters.value.shop_template.source_filter;
    post['trait_blacklist_filter'] = tmpFilters.value.shop_template.trait_blacklist_filter;
    post['trait_whitelist_filter'] = tmpFilters.value.shop_template.trait_whitelist_filter;
    post['rarity_filter'] = tmpFilters.value.shop_template.rarity_filter;
    post['type_filter'] = tmpFilters.value.shop_template.type_filter;
    if (tmpFilters.value.shop_template.armor_percentage! > 0) {
      post['armor_percentage'] = tmpFilters.value.shop_template.armor_percentage;
    }
    if (tmpFilters.value.shop_template.equipment_percentage! > 0) {
      post['equipment_percentage'] = tmpFilters.value.shop_template.equipment_percentage;
    }
    if (tmpFilters.value.shop_template.shield_percentage! > 0) {
      post['shield_percentage'] = tmpFilters.value.shop_template.shield_percentage;
    }
    if (tmpFilters.value.shop_template.weapon_percentage! > 0) {
      post['weapon_percentage'] = tmpFilters.value.shop_template.weapon_percentage;
    }
  }
  try {
    const randomShop = await shopGenerator(post);
    if (typeof randomShop != 'undefined') {
      if (randomShop.count > 0 && randomShop.results) {
        shop.clearShop();
        for (let i = 0; i < randomShop.count; i++) {
          const min_item: min_item = {
            id: randomShop.results[i].core_item.id,
            archive_link:
              'https://2e.aonprd.com/Search.aspx?q=' +
              encodeURIComponent(randomShop.results[i].core_item.name), // TODO: randomShop.results[i].core_item.archive_link,
            name: randomShop.results[i].core_item.name,
            level: randomShop.results[i].core_item.level,
            type: randomShop.results[i].core_item.item_type,
            price: randomShop.results[i].core_item.price,
            quantity: randomShop.results[i].core_item.quantity
          };
          shop.addToShop(min_item);
        }
      } else {
        $q.notify({
          progress: true,
          type: 'warning',
          message: 'No shop could be generated from the current filters',
          icon: matPriorityHigh
        });
      }
    } else {
      throw new Error('Error generating random shop');
    }
  } catch (error) {
    console.error(error);
  }
  shop.setGenerating(false);
}, 300);

const validateNumber = (consumables: boolean) => {
  if (consumables) {
    const value = tmpFilters.value.consumable_dices.n_of_dices;
    if (value < 0) {
      tmpFilters.value.consumable_dices.n_of_dices = 0;
    }
    if (value > 20) {
      tmpFilters.value.consumable_dices.n_of_dices = 20;
    }
    tmpFilters.value.consumable_dices.n_of_dices = Math.round(
      tmpFilters.value.consumable_dices.n_of_dices
    );
  } else {
    const value = tmpFilters.value.equippable_dices.n_of_dices;
    if (value < 0) {
      tmpFilters.value.equippable_dices.n_of_dices = 0;
    }
    if (value > 20) {
      tmpFilters.value.equippable_dices.n_of_dices = 20;
    }
    tmpFilters.value.equippable_dices.n_of_dices = Math.round(
      tmpFilters.value.equippable_dices.n_of_dices
    );
  }
};

const resetTemplateDialog = () => {
  newTemplate.value = {
    default: false,
    name: '',
    description: '',
    source_filter: [],
    trait_blacklist_filter: [],
    trait_whitelist_filter: [],
    rarity_filter: [],
    type_filter: [],
    armor_percentage: 0,
    equipment_percentage: 0,
    shield_percentage: 0,
    weapon_percentage: 0
  };
  selectedTraits.value.forEach((trait) => (trait.state = null));
  selectedTraits.value = [];
  armorOn.value = true;
  equipmentOn.value = true;
  shieldOn.value = true;
  weaponOn.value = true;
  tab.value = 'General';
};

const addTemplate = () => {
  try {
    newNameInput.value.validate();
    if (!newNameInput.value.hasError) {
      selectedTraits.value.forEach((trait) => {
        switch (trait.state) {
          case true:
            newTemplate.value.trait_whitelist_filter?.push(trait.value);
            break;
          case false:
            newTemplate.value.trait_blacklist_filter?.push(trait.value);
            break;
          default:
            break;
        }
      });
      if (armorOn.value) {
        newTemplate.value.type_filter?.push('Armor');
      }
      if (equipmentOn.value) {
        newTemplate.value.type_filter?.push('Equipment');
      }
      if (shieldOn.value) {
        newTemplate.value.type_filter?.push('Shield');
      }
      if (weaponOn.value) {
        newTemplate.value.type_filter?.push('Weapon');
      }
      templatesStore.addTemplate(newTemplate.value);
      template_list.value = templatesStore.getTemplates.map((template) => template.name);
      tmpFilters.value.shop_template = cloneDeep(templatesStore.getActiveTemplate);
      saveChanges();
      newTemplateDialog.value = false;
      resetTemplateDialog();
    } else {
      tab.value = 'General';
      nextTick(() => {
        newNameInput.value.validate();
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const duplicateTemplate = () => {
  try {
    duplicateNameInput.value.validate();
    if (!duplicateNameInput.value.hasError) {
      const newName = newTemplate.value.name;
      newTemplate.value = cloneDeep(templatesStore.getActiveTemplate);
      newTemplate.value.name = newName;
      newTemplate.value.default = false;
      templatesStore.addTemplate(newTemplate.value);
      template_list.value = templatesStore.getTemplates.map((template) => template.name);
      tmpFilters.value.shop_template = cloneDeep(templatesStore.getActiveTemplate);
      saveChanges();
      duplicateTemplateDialog.value = false;
      resetTemplateDialog();
    }
  } catch (error) {
    console.error(error);
  }
};

const openEditDialog = () => {
  newTemplate.value = cloneDeep(templatesStore.getActiveTemplate);
  armorOn.value = newTemplate.value.type_filter!.includes('Armor');
  equipmentOn.value = newTemplate.value.type_filter!.includes('Equipment');
  shieldOn.value = newTemplate.value.type_filter!.includes('Shield');
  weaponOn.value = newTemplate.value.type_filter!.includes('Weapon');
  selectedTraits.value = [];
  newTemplate.value.trait_blacklist_filter?.forEach((trait) => {
    selectedTraits.value.push({
      label: trait
        .split('-')
        .map((str) => capitalize(str))
        .join(' ')
        .replace('Additive', 'Additive '),
      value: trait,
      state: false
    });
  });
  newTemplate.value.trait_whitelist_filter?.forEach((trait) => {
    selectedTraits.value.push({
      label: trait
        .split('-')
        .map((str) => capitalize(str))
        .join(' ')
        .replace('Additive', 'Additive '),
      value: trait,
      state: true
    });
  });
  editTemplateDialog.value = true;
};

const editTemplate = () => {
  try {
    editNameInput.value.validate();
    if (!editNameInput.value.hasError) {
      const newWhitelist: string[] = [];
      const newBlacklist: string[] = [];
      selectedTraits.value.forEach((trait) => {
        switch (trait.state) {
          case true:
            newWhitelist.push(trait.value);
            break;
          case false:
            newBlacklist.push(trait.value);
            break;
          default:
            break;
        }
      });
      newTemplate.value.trait_whitelist_filter = newWhitelist;
      newTemplate.value.trait_blacklist_filter = newBlacklist;
      const newTypes: string[] = [];
      if (armorOn.value) {
        newTypes.push('Armor');
      }
      if (equipmentOn.value) {
        newTypes.push('Equipment');
      }
      if (shieldOn.value) {
        newTypes.push('Shield');
      }
      if (weaponOn.value) {
        newTypes.push('Weapon');
      }
      newTemplate.value.type_filter = newTypes;
      templatesStore.updateTemplate(templatesStore.getActiveTemplate.name, newTemplate.value);
      template_list.value = templatesStore.getTemplates.map((template) => template.name);
      tmpFilters.value.shop_template = cloneDeep(templatesStore.getActiveTemplate);
      saveChanges();
      editTemplateDialog.value = false;
      resetTemplateDialog();
    } else {
      tab.value = 'General';
      nextTick(() => {
        editNameInput.value.validate();
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const removeTemplate = () => {
  templatesStore.removeTemplate();
  template_list.value = templatesStore.getTemplates.map((template) => template.name);
  tmpFilters.value.shop_template = cloneDeep(templatesStore.getActiveTemplate);
  saveChanges();
  removeTemplateDialog.value = false;
  resetTemplateDialog();
};

const changeActiveTemplate = (selected: string) => {
  templatesStore.changeActiveTemplate(templatesStore.getTemplateIndex(selected));
  tmpFilters.value.shop_template = cloneDeep(templatesStore.getActiveTemplate);
};

const saveChanges = () => {
  consumable_dices.value = tmpFilters.value.consumable_dices;
  equippable_dices.value = tmpFilters.value.equippable_dices;
  levels.value = tmpFilters.value.levels;
  templatesStore.changeActiveTemplate(
    templatesStore.getTemplateIndex(tmpFilters.value.shop_template.name)
  );
  const customTemplates = templatesStore.getTemplates.filter(
    (template) => template.default === false
  );
  localStorage.setItem('templates', JSON.stringify(customTemplates));
};

const toggleTraits = (opt) => {
  const index = selectedTraits.value.findIndex((trait) => trait.label === opt.label);
  if (index !== -1) {
    if (opt.state === null) {
      selectedTraits.value.splice(index, 1);
    } else {
      selectedTraits.value[index].state = opt.state;
    }
  } else {
    selectedTraits.value.push(opt);
  }
};

const filterSourcesFn = (val, update) => {
  update(() => {
    const filter = val.toLowerCase();
    filters.getItemFilters.sources = sourceFilter.filter(
      (v) => v.toLowerCase().indexOf(filter) > -1
    );
  });
};

const filterTraitsFn = (val, update) => {
  const filter = val.toLowerCase();
  const filtered = traitFilter.filter((v) => v.label.toLowerCase().indexOf(filter) > -1);
  update(() => {
    traitsOptions.value = filtered;
  });
};

defineExpose({ generateShop });
</script>

<template>
  <q-btn id="v-step-1" push label="Generator Settings" @click="restoreSettings" />
  <q-dialog v-model="dialog" aria-label="Generator Settings">
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-h6 tw-mr-4">Generator Settings</div>
        <q-space />
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
      <q-card-section style="max-height: 46rem">
        <div class="tw-space-y-3">
          <div>
            <q-badge outline class="tw-text-sm"> Equippable items: </q-badge>
            <q-toggle
              v-model="fixedEquipmentDice"
              label="Fixed number?"
              dense
              size="xs"
              class="!tw-my-auto tw-pb-1 tw-ml-8 tw-text-xs"
            />
          </div>
          <div class="tw-flex tw-flex-row tw-justify-center">
            <q-input
              v-model.number="tmpFilters.equippable_dices.n_of_dices"
              dense
              outlined
              class="tw-w-32 tw-pr-2"
              type="number"
              label="Number"
              @update:model-value="validateNumber(false)"
            />
            <q-select
              v-if="!fixedEquipmentDice"
              v-model="tmpFilters.equippable_dices.dice_size"
              label="Size"
              class="tw-w-32 tw-pl-2"
              dense
              outlined
              :options="Object.freeze(diceSelect)"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div>
            <q-badge outline class="tw-text-sm"> Consumable items: </q-badge>
            <q-toggle
              v-model="fixedConsumableDice"
              label="Fixed number?"
              dense
              size="xs"
              class="!tw-my-auto tw-pb-1 tw-ml-[22px] tw-text-xs"
            />
          </div>
          <div class="tw-flex tw-flex-row tw-justify-center">
            <q-input
              v-model.number="tmpFilters.consumable_dices.n_of_dices"
              dense
              outlined
              class="tw-w-32 tw-pr-2"
              type="number"
              label="Number"
              @update:model-value="validateNumber(true)"
            />
            <q-select
              v-if="!fixedConsumableDice"
              v-model="tmpFilters.consumable_dices.dice_size"
              dense
              outlined
              :options="Object.freeze(diceSelect)"
              label="Size"
              class="tw-w-32 tw-pl-2"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="tw-pb-4">
            <q-badge outline class="tw-text-sm"> Level of items: </q-badge>
            <q-range
              v-model="tmpFilters.levels"
              label-always
              :min="0"
              :max="25"
              markers
              :left-label-value="'Min: ' + tmpFilters.levels.min"
              :right-label-value="'Max: ' + tmpFilters.levels.max"
              style="max-width: 270px"
              class="tw-px-3 tw-pt-1"
              aria-label="Items level range"
              role="menuitem"
              switch-label-side
            />
          </div>
          <q-separator class="!tw-mt-4" />
          <div class="tw-flex tw-flex-row tw-mx-3">
            <q-select
              v-model="tmpFilters.shop_template.name"
              dense
              outlined
              options-dense
              :options="template_list"
              label="Shop template"
              class="tw-w-52"
              @update:model-value="changeActiveTemplate(tmpFilters.shop_template.name)"
            >
              <q-tooltip
                class="text-caption text-center tw-max-w-72 tw-text-wrap tw-text-ellipsis tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>{{ tmpFilters.shop_template.name }}</strong>
                <br />
                {{ tmpFilters.shop_template.description }}
              </q-tooltip>
            </q-select>
            <q-icon flat round size="xs" :name="biQuestionCircle" class="tw-m-auto tw-mr-2">
              <q-tooltip
                class="text-caption text-left tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>Default shop templates</strong>
                <hr />
                <b>• Alchemist: </b> Only equipments and consumables
                <br />
                <b>• Blacksmith: </b> Weapons, armors and shields
                <br />
                <b>• General: </b> All kinds of items
              </q-tooltip>
            </q-icon>
          </div>
          <div class="tw-flex tw-flex-row tw-justify-center">
            <q-btn
              class="tw-m-auto"
              :icon="biPlusLg"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Add new template"
              @click="
                resetTemplateDialog();
                newTemplateDialog = true;
              "
            >
              <q-tooltip
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Add new template
              </q-tooltip>
            </q-btn>
            <q-dialog
              v-model="newTemplateDialog"
              aria-label="New template dialog"
              @escape-key="
                resetTemplateDialog();
                newTemplateDialog = false;
              "
            >
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Template Creator</div>
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
                  <q-tab-panel name="General" class="tw-px-3">
                    <q-card-section class="tw-space-y-3" style="max-height: 46rem">
                      <q-input
                        ref="newNameInput"
                        v-model="newTemplate.name"
                        outlined
                        dense
                        autofocus
                        label="Name"
                        counter
                        :maxlength="50"
                        :no-error-icon="true"
                        :rules="[
                          (val) => !!val || 'Field is required',
                          (val) =>
                            !template_list.find(
                              (name) => name.toLowerCase() === val.toLowerCase()
                            ) || 'This template already exists'
                        ]"
                      />
                      <q-input
                        v-model="newTemplate.description"
                        outlined
                        dense
                        autogrow
                        counter
                        :maxlength="100"
                        label="Description"
                        type="textarea"
                      />
                      <q-separator class="!tw-my-4" />
                      <q-select
                        v-model="newTemplate.source_filter"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="Object.freeze(filters.getItemFilters.sources)"
                        use-input
                        input-debounce="0"
                        label="Source"
                        style="max-width: 235px"
                        @filter="filterSourcesFn"
                      />
                      <q-select
                        v-model="selectedTraits"
                        multiple
                        dense
                        outlined
                        options-dense
                        :options="traitsOptions"
                        map-options
                        emit-value
                        use-input
                        input-debounce="0"
                        label="Traits"
                        style="max-width: 235px"
                        @filter="filterTraitsFn"
                      >
                        <template #selected-item="scope">
                          <q-chip
                            removable
                            dense
                            class="tw-text-white"
                            :color="scope.opt.state === true ? 'green' : 'red'"
                            :tabindex="scope.tabindex"
                            @remove="
                              selectedTraits[scope.index].state = null;
                              scope.removeAtIndex(scope.index);
                            "
                          >
                            {{ scope.opt.label }}
                          </q-chip>
                        </template>
                        <template #option="scope">
                          <q-item>
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-toggle
                                v-model="scope.opt.state"
                                toggle-indeterminate
                                :checked-icon="biCheck"
                                :unchecked-icon="biX"
                                @update:model-value="toggleTraits(scope.opt)"
                              />
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-if="selectedTraits.length > 0" #append>
                          <q-icon
                            :name="mdiCloseCircle"
                            class="tw-text-[#7d838b] hover:tw-text-[#bcbfc3] cursor-pointer"
                            @click.stop.prevent="
                              selectedTraits.forEach((trait) => (trait.state = null));
                              selectedTraits = [];
                            "
                          />
                        </template>
                      </q-select>
                      <q-select
                        v-model="newTemplate.rarity_filter"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="Object.freeze(['Common', 'Uncommon', 'Rare', 'Unique'])"
                        use-input
                        input-debounce="0"
                        label="Rarity"
                        class="tw-mb-2 tw-pb-0.5"
                        style="max-width: 235px"
                      />
                    </q-card-section>
                  </q-tab-panel>
                  <q-tab-panel name="Advanced" class="tw-px-3">
                    <q-card-section class="tw-flex" style="max-height: 46rem">
                      <q-input
                        ref="newNameInput"
                        v-model="newTemplate.name"
                        outlined
                        dense
                        autofocus
                        label="Name"
                        counter
                        class="tw-hidden"
                        :maxlength="50"
                        :no-error-icon="true"
                        :rules="[
                          (val) => !!val || 'Field is required',
                          (val) =>
                            !template_list.find(
                              (name) => name.toLowerCase() === val.toLowerCase()
                            ) || 'This template already exists'
                        ]"
                      />
                      <div class="tw-space-y-3">
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="armorOn"
                              label="Enable Armors?"
                              @click="
                                if (!armorOn) {
                                  newTemplate.armor_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.armor_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.equipment_percentage! -
                              newTemplate.shield_percentage! -
                              newTemplate.weapon_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.armor_percentage + '%'"
                            :disable="!armorOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Armor percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="equipmentOn"
                              label="Enable Equipments?"
                              @click="
                                if (!equipmentOn) {
                                  newTemplate.equipment_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.equipment_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.armor_percentage! -
                              newTemplate.shield_percentage! -
                              newTemplate.weapon_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.equipment_percentage + '%'"
                            :disable="!equipmentOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Equipment percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="shieldOn"
                              label="Enable Shields?"
                              @click="
                                if (!shieldOn) {
                                  newTemplate.shield_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.shield_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.armor_percentage! -
                              newTemplate.equipment_percentage! -
                              newTemplate.weapon_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.shield_percentage + '%'"
                            :disable="!shieldOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Shield percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="weaponOn"
                              label="Enable Weapons?"
                              @click="
                                if (!weaponOn) {
                                  newTemplate.weapon_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.weapon_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.armor_percentage! -
                              newTemplate.equipment_percentage! -
                              newTemplate.shield_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.weapon_percentage + '%'"
                            :disable="!weaponOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Weapon percentage"
                            role="menuitem"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-tab-panel>
                </q-tab-panels>
                <q-separator />

                <q-card-actions align="center" class="text-primary">
                  <q-btn-group flat class="tw-px-1.5">
                    <q-btn
                      v-close-popup
                      flat
                      label="Cancel"
                      type="button"
                      class="full-width !tw-px-6 tw-text-blue-600 dark:tw-text-blue-400"
                      @click="
                        resetTemplateDialog();
                        newTemplateDialog = false;
                      "
                    />
                    <q-separator vertical />
                    <q-btn
                      flat
                      label="Add template"
                      type="button"
                      class="full-width !tw-px-6 tw-text-blue-600 dark:tw-text-blue-400"
                      @click="addTemplate()"
                    />
                  </q-btn-group>
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-btn
              class="tw-m-auto"
              :icon="biCopy"
              size="sm"
              padding="sm"
              flat
              round
              dense
              aria-label="Duplicate current template"
              @click="
                duplicateTemplateDialog = true;
                newTemplate.name = '';
              "
            >
              <q-tooltip
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Duplicate template
              </q-tooltip>
            </q-btn>
            <q-dialog
              v-model="duplicateTemplateDialog"
              aria-label="Duplicate template dialog"
              @escape-key="duplicateTemplateDialog = false"
            >
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Duplicate template</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <q-input
                    ref="duplicateNameInput"
                    v-model="newTemplate.name"
                    dense
                    autofocus
                    counter
                    label="New template name"
                    :maxlength="50"
                    :no-error-icon="true"
                    :rules="[
                      (val) => !!val || 'Field is required',
                      (val) =>
                        !template_list.find((name) => name.toLowerCase() === val.toLowerCase()) ||
                        'This template already exists'
                    ]"
                    @keyup.enter="duplicateTemplate"
                  />
                </q-card-section>

                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Close dialog"
                    @click="duplicateTemplateDialog = false"
                  />
                  <q-btn
                    flat
                    label="Duplicate"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    aria-label="Duplicate template"
                    @click="duplicateTemplate"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-btn
              class="tw-m-auto"
              :icon="biPencilSquare"
              size="sm"
              padding="sm"
              flat
              round
              dense
              :disable="tmpFilters.shop_template.default"
              aria-label="Edit current template"
              @click="openEditDialog()"
            >
              <q-tooltip
                v-if="tmpFilters.shop_template.default"
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Can't edit default template
              </q-tooltip>
              <q-tooltip
                v-else
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Edit template
              </q-tooltip>
            </q-btn>
            <q-dialog
              v-model="editTemplateDialog"
              aria-label="Edit template dialog"
              @escape-key="
                resetTemplateDialog();
                editTemplateDialog = false;
              "
            >
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Template Editor</div>
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
                  <q-tab-panel name="General" class="tw-px-3">
                    <q-card-section class="tw-space-y-3" style="max-height: 46rem">
                      <q-input
                        ref="editNameInput"
                        v-model="newTemplate.name"
                        outlined
                        dense
                        autofocus
                        label="Name"
                        counter
                        :maxlength="50"
                        :no-error-icon="true"
                        :rules="[
                          (val) => !!val || 'Field is required',
                          (val) =>
                            !template_list.find(
                              (name) =>
                                name.toLowerCase() === val.toLowerCase() &&
                                newTemplate.name !== templatesStore.getActiveTemplate.name
                            ) || 'This template already exists'
                        ]"
                      />
                      <q-input
                        v-model="newTemplate.description"
                        outlined
                        dense
                        autogrow
                        counter
                        :maxlength="100"
                        label="Description"
                        type="textarea"
                      />
                      <q-separator class="!tw-my-4" />
                      <q-select
                        v-model="newTemplate.source_filter"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="Object.freeze(filters.getItemFilters.sources)"
                        use-input
                        input-debounce="0"
                        label="Source"
                        style="max-width: 235px"
                        @filter="filterSourcesFn"
                      />
                      <q-select
                        v-model="selectedTraits"
                        multiple
                        dense
                        outlined
                        options-dense
                        :options="traitsOptions"
                        map-options
                        emit-value
                        use-input
                        input-debounce="0"
                        label="Traits"
                        style="max-width: 235px"
                        @filter="filterTraitsFn"
                      >
                        <template #selected-item="scope">
                          <q-chip
                            removable
                            dense
                            class="tw-text-white"
                            :color="scope.opt.state === true ? 'green' : 'red'"
                            :tabindex="scope.tabindex"
                            @remove="
                              selectedTraits[scope.index].state = null;
                              scope.removeAtIndex(scope.index);
                            "
                          >
                            {{ scope.opt.label }}
                          </q-chip>
                        </template>
                        <template #option="scope">
                          <q-item>
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-toggle
                                v-model="scope.opt.state"
                                toggle-indeterminate
                                :checked-icon="biCheck"
                                :unchecked-icon="biX"
                                @update:model-value="toggleTraits(scope.opt)"
                              />
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-if="selectedTraits.length > 0" #append>
                          <q-icon
                            :name="mdiCloseCircle"
                            class="tw-text-[#7d838b] hover:tw-text-[#bcbfc3] cursor-pointer"
                            @click.stop.prevent="
                              selectedTraits.forEach((trait) => (trait.state = null));
                              selectedTraits = [];
                            "
                          />
                        </template>
                      </q-select>
                      <q-select
                        v-model="newTemplate.rarity_filter"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="Object.freeze(['Common', 'Uncommon', 'Rare', 'Unique'])"
                        use-input
                        input-debounce="0"
                        label="Rarity"
                        class="tw-mb-2 tw-pb-0.5"
                        style="max-width: 235px"
                      />
                    </q-card-section>
                  </q-tab-panel>
                  <q-tab-panel name="Advanced" class="tw-px-3">
                    <q-card-section class="tw-flex" style="max-height: 46rem">
                      <q-input
                        ref="editNameInput"
                        v-model="newTemplate.name"
                        outlined
                        dense
                        autofocus
                        label="Name"
                        counter
                        class="tw-hidden"
                        :maxlength="50"
                        :no-error-icon="true"
                        :rules="[
                          (val) => !!val || 'Field is required',
                          (val) =>
                            !template_list.find(
                              (name) =>
                                name.toLowerCase() === val.toLowerCase() &&
                                newTemplate.name !== templatesStore.getActiveTemplate.name
                            ) || 'This template already exists'
                        ]"
                      />
                      <div class="tw-space-y-3">
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="armorOn"
                              label="Enable Armors?"
                              @click="
                                if (!armorOn) {
                                  newTemplate.armor_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.armor_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.equipment_percentage! -
                              newTemplate.shield_percentage! -
                              newTemplate.weapon_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.armor_percentage + '%'"
                            :disable="!armorOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Armor percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="equipmentOn"
                              label="Enable Equipments?"
                              @click="
                                if (!equipmentOn) {
                                  newTemplate.equipment_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.equipment_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.armor_percentage! -
                              newTemplate.shield_percentage! -
                              newTemplate.weapon_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.equipment_percentage + '%'"
                            :disable="!equipmentOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Equipment percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="shieldOn"
                              label="Enable Shields?"
                              @click="
                                if (!shieldOn) {
                                  newTemplate.shield_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.shield_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.armor_percentage! -
                              newTemplate.equipment_percentage! -
                              newTemplate.weapon_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.shield_percentage + '%'"
                            :disable="!shieldOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Shield percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw-flex tw-flex-col">
                          <div class="tw-flex tw-flex-row">
                            <q-checkbox
                              v-model="weaponOn"
                              label="Enable Weapons?"
                              @click="
                                if (!weaponOn) {
                                  newTemplate.weapon_percentage = 0;
                                }
                              "
                            />
                          </div>
                          <q-slider
                            v-model="newTemplate.weapon_percentage"
                            label
                            :min="0"
                            :max="100"
                            :inner-max="
                              100 -
                              newTemplate.armor_percentage! -
                              newTemplate.equipment_percentage! -
                              newTemplate.shield_percentage!
                            "
                            :step="5"
                            :label-value="'Min: ' + newTemplate.weapon_percentage + '%'"
                            :disable="!weaponOn"
                            class="tw-px-3"
                            style="min-width: 234px"
                            aria-label="Weapon percentage"
                            role="menuitem"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-tab-panel>
                </q-tab-panels>
                <q-separator />

                <q-card-actions align="center" class="text-primary">
                  <q-btn-group flat class="tw-px-1.5">
                    <q-btn
                      v-close-popup
                      flat
                      label="Cancel"
                      type="button"
                      class="full-width !tw-px-6 tw-text-blue-600 dark:tw-text-blue-400"
                      @click="
                        resetTemplateDialog();
                        editTemplateDialog = false;
                      "
                    />
                    <q-separator vertical />
                    <q-btn
                      flat
                      label="Edit template"
                      type="button"
                      class="full-width !tw-px-6 tw-text-blue-600 dark:tw-text-blue-400"
                      @click="editTemplate()"
                    />
                  </q-btn-group>
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-btn
              class="tw-m-auto"
              :icon="biTrash"
              size="sm"
              padding="sm"
              flat
              round
              dense
              :disable="tmpFilters.shop_template.default"
              aria-label="Remove current template"
              @click="removeTemplateDialog = true"
            >
              <q-tooltip
                v-if="tmpFilters.shop_template.default"
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Can't delete default template
              </q-tooltip>
              <q-tooltip
                v-else
                class="text-caption tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                Delete template
              </q-tooltip>
            </q-btn>
            <q-dialog
              v-model="removeTemplateDialog"
              aria-label="Remove template dialog"
              @escape-key="removeTemplateDialog = false"
            >
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6">Remove this template?</div>
                </q-card-section>
                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    class="tw-text-blue-600 dark:tw-text-blue-400"
                    @click="removeTemplateDialog = false"
                  />
                  <q-btn
                    flat
                    label="Remove"
                    class="tw-text-red-600 dark:tw-text-red-400"
                    @click="removeTemplate"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn-group flat class="tw-px-1.5">
          <q-btn
            v-close-popup
            flat
            label="Save changes"
            type="button"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            @click="saveChanges"
          />
          <q-separator vertical />
          <q-btn
            v-close-popup
            flat
            label="Generate new Shop"
            type="button"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            @click="generateShop"
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

.q-select:deep(.q-field__native) > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield;
}
</style>
