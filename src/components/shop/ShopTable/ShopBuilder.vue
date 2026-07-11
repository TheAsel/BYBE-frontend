<script setup lang="ts">
import {
  biCheck,
  biCopy,
  biPencilSquare,
  biPlusLg,
  biQuestionCircle,
  biTrash,
  biX,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { mdiCloseCircle } from "@quasar/extras/mdi-v7";
import { capitalize, cloneDeep, debounce } from "lodash-es";
import { QInput, QSelect, useQuasar } from "quasar";
import { nextTick, ref } from "vue";

import { shopGenerator } from "@/api/shop-api-calls";
import { filtersStore } from "@/stores/filters";
import { itemsStore } from "@/stores/items";
import { settingsStore } from "@/stores/settings";
import { templateStore } from "@/stores/template";
import { getGameAonLink } from "@/utils/sheet";

import type { item_type, min_item } from "@/types/item";
import type { shop_data } from "@/types/shop";
import type { template } from "@/types/template";

const $q = useQuasar();

const settings_store = settingsStore();
const filters_store = filtersStore();
const items_store = itemsStore();
const template_store = templateStore();

const dialog = ref(false);
const tab = ref("General");

const selectedTraits = ref<
  { label: string; value: string; state: boolean | null }[]
>([]);
const traitOptions = ref<
  { label: string; value: string; state: boolean | null }[]
>(
  filters_store.itemFilters.traits.map(trait => ({
    label: trait.label,
    state: null,
    value: trait.value
  }))
);

const sourceFilter = filters_store.itemFilters.sources;
const traitFilter = traitOptions.value;

const newTemplateDialog = ref(false);
const newNameInput = ref<InstanceType<typeof QInput> | null>(null);
const duplicateTemplateDialog = ref(false);
const duplicateNameInput = ref<InstanceType<typeof QInput> | null>(null);
const editTemplateDialog = ref(false);
const editNameInput = ref<InstanceType<typeof QInput> | null>(null);
const editTraitSelect = ref<InstanceType<typeof QSelect> | null>(null);

const newTemplate = ref<template>({
  armor_percentage: 0,
  default: false,
  description: "",
  equipment_percentage: 0,
  name: "",
  item_rarities: [],
  shield_percentage: 0,
  item_sources: [],
  item_traits_blacklist: [],
  item_traits_whitelist: [],
  item_types: [],
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
    icon: "img:/imgs/dices/d4.webp",
    label: "D4",
    value: 4
  },
  {
    icon: "img:/imgs/dices/d6.webp",
    label: "D6",
    value: 6
  },
  {
    icon: "img:/imgs/dices/d8.webp",
    label: "D8",
    value: 8
  },
  {
    icon: "img:/imgs/dices/d10.webp",
    label: "D10",
    value: 10
  },
  {
    icon: "img:/imgs/dices/d12.webp",
    label: "D12",
    value: 12
  },
  {
    icon: "img:/imgs/dices/d20.webp",
    label: "D20",
    value: 20
  }
];

const template_list = ref<string[]>(
  template_store.all_templates.map(template => template.name)
);

const consumable_dices = ref({
  dice_size: { label: "D4", value: 4 },
  n_of_dices: 3
});
const equippable_dices = ref({
  dice_size: { label: "D4", value: 4 },
  n_of_dices: 3
});
const levels = ref({
  max: filters_store.shopRanges.max_level,
  min: filters_store.shopRanges.min_level
});

const tmpFilters = ref({
  consumable_dices: consumable_dices.value,
  equippable_dices: equippable_dices.value,
  levels: levels.value,
  shop_template: cloneDeep(
    template_store.all_templates[template_store.activeTemplate]
  )
});

const restoreSettings = (): void => {
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
  tmpFilters.value.shop_template = cloneDeep(
    template_store.all_templates[template_store.activeTemplate]
  );
};

const saveChanges = (): void => {
  consumable_dices.value = tmpFilters.value.consumable_dices;
  equippable_dices.value = tmpFilters.value.equippable_dices;
  levels.value = tmpFilters.value.levels;
  template_store.changeActiveTemplate(
    template_store.getAllTemplateIndex(tmpFilters.value.shop_template!.name)
  );
  localStorage.setItem(
    "templates",
    JSON.stringify(template_store.custom_templates)
  );
};

const generateShop = debounce(async () => {
  items_store.setGenerating(true);
  saveChanges();
  const { game_version } = settings_store;

  const body: shop_data = {
    armor_percentage: null,
    consumable_dices: [
      {
        dice_size: tmpFilters.value.consumable_dices.dice_size.value,
        n_of_dices: tmpFilters.value.consumable_dices.n_of_dices
      }
    ],
    equipment_percentage: null,
    equippable_dices: [
      {
        dice_size: tmpFilters.value.equippable_dices.dice_size.value,
        n_of_dices: tmpFilters.value.equippable_dices.n_of_dices
      }
    ],
    game_system_version: game_version,
    max_level: tmpFilters.value.levels.max,
    min_level: tmpFilters.value.levels.min,
    rarity_filter: null,
    shield_percentage: null,
    source_filter: null,
    trait_blacklist_filter: null,
    trait_whitelist_filter: null,
    type_filter: null,
    weapon_percentage: null
  };
  if (fixedConsumableDice.value) {
    body.consumable_dices = [
      {
        dice_size: 1,
        n_of_dices: tmpFilters.value.consumable_dices.n_of_dices
      }
    ];
  }
  if (fixedEquipmentDice.value) {
    body.equippable_dices = [
      {
        dice_size: 1,
        n_of_dices: tmpFilters.value.equippable_dices.n_of_dices
      }
    ];
  }
  if (tmpFilters.value.shop_template) {
    if (tmpFilters.value.shop_template.default) {
      body.shop_template = tmpFilters.value.shop_template.name;
    } else {
      body.source_filter = tmpFilters.value.shop_template.item_sources;
      body.trait_blacklist_filter =
        tmpFilters.value.shop_template.item_traits_blacklist;
      body.trait_whitelist_filter =
        tmpFilters.value.shop_template.item_traits_whitelist;
      body.rarity_filter = tmpFilters.value.shop_template.item_rarities;
      body.type_filter = tmpFilters.value.shop_template.item_types;
      if (tmpFilters.value.shop_template.armor_percentage! > 0) {
        body.armor_percentage = tmpFilters.value.shop_template.armor_percentage;
      }
      if (tmpFilters.value.shop_template.equipment_percentage! > 0) {
        body.equipment_percentage =
          tmpFilters.value.shop_template.equipment_percentage;
      }
      if (tmpFilters.value.shop_template.shield_percentage! > 0) {
        body.shield_percentage =
          tmpFilters.value.shop_template.shield_percentage;
      }
      if (tmpFilters.value.shop_template.weapon_percentage! > 0) {
        body.weapon_percentage =
          tmpFilters.value.shop_template.weapon_percentage;
      }
    }
  }
  try {
    const randomShop = await shopGenerator(settings_store.game, body);
    if (!randomShop) {
      throw new TypeError("Error generating random shop");
    }
    if (randomShop.count > 0 && randomShop.results) {
      items_store.clearShop();
      for (let i = 0; i < randomShop.count; i += 1) {
        const min_item: min_item = {
          archive_link: `https://2e.${getGameAonLink(
            settings_store.game
          )}.com/search?q=${encodeURIComponent(
            randomShop.results[i]!.core_item.name
          )}&type=eqs`,
          game: randomShop.results[i]!.game,
          id: randomShop.results[i]!.core_item.id,
          level: randomShop.results[i]!.core_item.level,
          name: randomShop.results[i]!.core_item.name,
          price: randomShop.results[i]!.core_item.price,
          quantity: randomShop.results[i]!.core_item.quantity,
          type: randomShop.results[i]!.core_item.item_type
        };
        items_store.addToShop(min_item);
      }
    } else {
      $q.notify({
        icon: matPriorityHigh,
        message: "No shop could be generated from the current filters",
        progress: true,
        type: "warning"
      });
    }
  } catch (error) {
    console.error(error);
  }
  items_store.setGenerating(false);
}, 300);

const validateNumber = (consumables: boolean): void => {
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

const resetTemplateDialog = (): void => {
  newTemplate.value = {
    armor_percentage: 0,
    default: false,
    description: "",
    equipment_percentage: 0,
    name: "",
    item_rarities: [],
    shield_percentage: 0,
    item_sources: [],
    item_traits_blacklist: [],
    item_traits_whitelist: [],
    item_types: [],
    weapon_percentage: 0
  };
  for (const trait of selectedTraits.value) {
    trait.state = null;
  }
  selectedTraits.value = [];
  armorOn.value = true;
  equipmentOn.value = true;
  shieldOn.value = true;
  weaponOn.value = true;
  tab.value = "General";
};

const addTemplate = async (): Promise<void> => {
  try {
    newNameInput.value?.validate();
    if (newNameInput.value?.hasError) {
      tab.value = "General";
      await nextTick().then(() => {
        newNameInput.value?.validate();
      });
    } else {
      for (const trait of selectedTraits.value) {
        switch (trait.state) {
          case true: {
            newTemplate.value.item_traits_whitelist?.push(trait.value);
            break;
          }
          case false: {
            newTemplate.value.item_traits_blacklist?.push(trait.value);
            break;
          }
          default: {
            break;
          }
        }
      }
      if (armorOn.value) {
        newTemplate.value.item_types?.push("Armor");
      }
      if (equipmentOn.value) {
        newTemplate.value.item_types?.push("Equipment");
      }
      if (shieldOn.value) {
        newTemplate.value.item_types?.push("Shield");
      }
      if (weaponOn.value) {
        newTemplate.value.item_types?.push("Weapon");
      }
      newTemplate.value.item_types?.push("Consumable");
      template_store.addCustomTemplate(newTemplate.value);
      template_list.value = template_store.all_templates.map(
        template => template.name
      );
      tmpFilters.value.shop_template = cloneDeep(
        template_store.all_templates[template_store.activeTemplate]
      );
      saveChanges();
      newTemplateDialog.value = false;
      resetTemplateDialog();
    }
  } catch (error) {
    console.error(error);
  }
};

const duplicateTemplate = (): void => {
  try {
    duplicateNameInput.value?.validate();
    if (!duplicateNameInput.value?.hasError) {
      const newName = newTemplate.value.name;
      newTemplate.value = cloneDeep(
        template_store.all_templates[template_store.activeTemplate]!
      );
      newTemplate.value.name = newName;
      newTemplate.value.default = false;
      template_store.addCustomTemplate(newTemplate.value);
      template_list.value = template_store.all_templates.map(
        template => template.name
      );
      tmpFilters.value.shop_template = cloneDeep(
        template_store.all_templates[template_store.activeTemplate]
      );
      saveChanges();
      duplicateTemplateDialog.value = false;
      resetTemplateDialog();
    }
  } catch (error) {
    console.error(error);
  }
};

const openEditDialog = async (): Promise<void> => {
  newTemplate.value = cloneDeep(
    template_store.all_templates[template_store.activeTemplate]!
  );
  armorOn.value = newTemplate.value.item_types!.includes("Armor");
  equipmentOn.value = newTemplate.value.item_types!.includes("Equipment");
  shieldOn.value = newTemplate.value.item_types!.includes("Shield");
  weaponOn.value = newTemplate.value.item_types!.includes("Weapon");
  for (const trait of selectedTraits.value) {
    trait.state = null;
  }
  selectedTraits.value = [];
  for (const trait of newTemplate.value.item_traits_blacklist ?? []) {
    selectedTraits.value.push({
      label: trait
        .split("-")
        .map(str => capitalize(str))
        .join(" ")
        .replace("Additive", "Additive "),
      state: false,
      value: trait
    });
  }
  for (const trait of newTemplate.value.item_traits_whitelist ?? []) {
    selectedTraits.value.push({
      label: trait
        .split("-")
        .map(str => capitalize(str))
        .join(" ")
        .replace("Additive", "Additive "),
      state: true,
      value: trait
    });
  }
  editTemplateDialog.value = true;
  await nextTick().then(() => {
    if (editTraitSelect.value?.options) {
      for (const trait of selectedTraits.value) {
        for (const opt of editTraitSelect.value.options) {
          if (opt.label === trait.label) {
            opt.state = trait.state;
          }
        }
      }
    }
  });
};

const editTemplate = async (): Promise<void> => {
  try {
    editNameInput.value?.validate();
    if (editNameInput.value?.hasError) {
      tab.value = "General";
      await nextTick().then(() => {
        editNameInput.value?.validate();
      });
    } else {
      const newWhitelist: string[] = [];
      const newBlacklist: string[] = [];
      for (const trait of selectedTraits.value) {
        switch (trait.state) {
          case true: {
            newWhitelist.push(trait.value);
            break;
          }
          case false: {
            newBlacklist.push(trait.value);
            break;
          }
          default: {
            break;
          }
        }
      }
      newTemplate.value.item_traits_whitelist = newWhitelist;
      newTemplate.value.item_traits_blacklist = newBlacklist;
      const newTypes: item_type[] = [];
      if (armorOn.value) {
        newTypes.push("Armor");
      }
      if (equipmentOn.value) {
        newTypes.push("Equipment");
      }
      if (shieldOn.value) {
        newTypes.push("Shield");
      }
      if (weaponOn.value) {
        newTypes.push("Weapon");
      }
      newTypes.push("Consumable");
      newTemplate.value.item_types = newTypes;
      template_store.updateCustomTemplate(
        template_store.all_templates[template_store.activeTemplate]!.name,
        newTemplate.value
      );
      template_list.value = template_store.all_templates.map(
        template => template.name
      );
      tmpFilters.value.shop_template = cloneDeep(
        template_store.all_templates[template_store.activeTemplate]
      );
      saveChanges();
      editTemplateDialog.value = false;
      resetTemplateDialog();
    }
  } catch (error) {
    console.error(error);
  }
};

const removeTemplate = (): void => {
  template_store.removeTemplate();
  template_list.value = template_store.all_templates.map(
    template => template.name
  );
  tmpFilters.value.shop_template = cloneDeep(
    template_store.all_templates[template_store.activeTemplate]
  );
  saveChanges();
  removeTemplateDialog.value = false;
  resetTemplateDialog();
};

const changeActiveTemplate = (selected: string): void => {
  template_store.changeActiveTemplate(
    template_store.getAllTemplateIndex(selected)
  );
  tmpFilters.value.shop_template = cloneDeep(
    template_store.all_templates[template_store.activeTemplate]
  );
};

const toggleTraits = (opt: {
  label: string;
  value: string;
  state: boolean | null;
}): void => {
  const index = selectedTraits.value.findIndex(
    trait => trait.label === opt.label
  );
  if (index === -1) {
    selectedTraits.value.push(opt);
  } else if (opt.state === null) {
    selectedTraits.value.splice(index, 1);
  } else {
    selectedTraits.value[index]!.state = opt.state;
  }
};

const filterSourcesFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    filters_store.itemFilters.sources = sourceFilter.filter(v =>
      v.toLowerCase().includes(filter)
    );
  });
};

const filterTraitsFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  const filter = val.toLowerCase();
  const filtered = traitFilter.filter(v =>
    v.label.toLowerCase().includes(filter)
  );
  update(() => {
    traitOptions.value = filtered;
  });
};

defineExpose({ generateShop });
</script>

<template>
  <q-btn
    id="shepherd-1"
    push
    label="Generator Settings"
    @click="restoreSettings"
  />
  <q-dialog v-model="dialog" aria-label="Generator Settings">
    <q-card flat bordered>
      <q-card-section class="row items-center">
        <div class="text-h6">Generator Settings</div>
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
        <div class="tw:space-y-3">
          <div class="tw:flex">
            <q-badge outline class="tw:grow tw:text-sm!">
              Equippable items:
            </q-badge>
            <q-toggle
              v-model="fixedEquipmentDice"
              label="Fixed number?"
              dense
              size="xs"
              class="tw:my-auto! tw:pb-1 tw:text-xs"
            />
          </div>
          <div class="tw:flex tw:flex-row tw:gap-4 tw:justify-center">
            <q-input
              v-model.number="tmpFilters.equippable_dices.n_of_dices"
              dense
              outlined
              class="tw:basis-1/2 tw:max-w-24"
              type="number"
              label="Number"
              @update:model-value="validateNumber(false)"
            />
            <q-select
              v-if="!fixedEquipmentDice"
              v-model="tmpFilters.equippable_dices.dice_size"
              dense
              outlined
              class="tw:basis-1/2 tw:max-w-24"
              label="Size"
              :options="Object.freeze(diceSelect)"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon
                      :name="scope.opt.icon"
                      class="tw:invert-80 tw:dark:invert-0"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="tw:flex">
            <q-badge outline class="tw:grow tw:text-sm!">
              Consumable items:
            </q-badge>
            <q-toggle
              v-model="fixedConsumableDice"
              label="Fixed number?"
              dense
              size="xs"
              class="tw:my-auto! tw:pb-1 tw:text-xs"
            />
          </div>
          <div class="tw:flex tw:flex-row tw:gap-4 tw:justify-center">
            <q-input
              v-model.number="tmpFilters.consumable_dices.n_of_dices"
              dense
              outlined
              class="tw:basis-1/2 tw:max-w-24"
              type="number"
              label="Number"
              @update:model-value="validateNumber(true)"
            />
            <q-select
              v-if="!fixedConsumableDice"
              v-model="tmpFilters.consumable_dices.dice_size"
              dense
              outlined
              class="tw:basis-1/2 tw:max-w-24"
              label="Size"
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
          <q-badge outline class="tw:mb-1! tw:text-sm!">
            Level of items:
          </q-badge>
          <div class="tw:px-2 tw:pb-4">
            <q-range
              v-model="tmpFilters.levels"
              label-always
              :min="filters_store.shopRanges.min_level"
              :max="filters_store.shopRanges.max_level"
              markers
              :left-label-value="'Min: ' + tmpFilters.levels.min"
              :right-label-value="'Max: ' + tmpFilters.levels.max"
              aria-label="Items level range"
              class="tw:px-2"
              role="menuitem"
              switch-label-side
            />
          </div>
          <q-separator class="tw:mt-4! tw:mb-3!" />
          <div class="tw:flex tw:flex-row tw:px-6">
            <q-select
              v-model="tmpFilters.shop_template!.name"
              dense
              outlined
              options-dense
              :options="template_list"
              label="Shop template"
              class="tw:grow tw:pr-4"
              @update:model-value="
                changeActiveTemplate(tmpFilters.shop_template!.name)
              "
            >
              <q-tooltip
                class="text-caption text-center tw:max-w-72 tw:text-wrap tw:text-ellipsis tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>{{ tmpFilters.shop_template!.name }}</strong>
                <br />
                {{ tmpFilters.shop_template!.description }}
              </q-tooltip>
            </q-select>
            <q-icon
              flat
              round
              size="xs"
              :name="biQuestionCircle"
              class="tw:my-auto"
            >
              <q-tooltip
                class="text-caption text-left tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
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
          <div class="tw:flex tw:flex-row">
            <div class="tw:flex tw:justify-center tw:grow">
              <q-btn
                class="tw:my-auto!"
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
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Add new template
                </q-tooltip>
              </q-btn>
            </div>
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
                  <div class="text-h6 tw:min-w-65!">Template Creator</div>
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
                  <q-tab-panel name="General" class="tw:px-3!">
                    <q-card-section
                      class="tw:space-y-3"
                      style="max-height: 46rem"
                    >
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
                          (val: string) => !!val || 'Field is required',
                          (val: string) =>
                            !template_list.some(
                              name => name.toLowerCase() === val.toLowerCase()
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
                      <q-separator class="tw:my-4!" />
                      <q-select
                        v-model="newTemplate.item_sources"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="
                          Object.freeze(filters_store.itemFilters.sources)
                        "
                        use-input
                        input-debounce="0"
                        label="Source"
                        virtual-scroll-item-size="32"
                        @filter="filterSourcesFn"
                      />
                      <q-select
                        v-model="selectedTraits"
                        multiple
                        dense
                        outlined
                        options-dense
                        :options="traitOptions"
                        map-options
                        emit-value
                        use-input
                        input-debounce="0"
                        label="Traits"
                        :virtual-scroll-slice-size="traitOptions.length"
                        @filter="filterTraitsFn"
                      >
                        <template #selected-item="scope">
                          <q-chip
                            removable
                            dense
                            class="tw:text-white"
                            :color="scope.opt.state === true ? 'green' : 'red'"
                            :tabindex="scope.tabindex"
                            @remove="
                              selectedTraits[scope.index]!.state = null;
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
                                :color="
                                  scope.opt.state === true ? 'positive' : 'red'
                                "
                                :keep-color="scope.opt.state !== null"
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
                            class="tw:text-[#7d838b] tw:hover:text-[#bcbfc3] cursor-pointer"
                            @click.stop.prevent="
                              for (const trait of selectedTraits) {
                                trait.state = null;
                              }
                              selectedTraits = [];
                            "
                          />
                        </template>
                      </q-select>
                      <q-select
                        v-model="newTemplate.item_rarities"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="
                          Object.freeze([
                            'Common',
                            'Uncommon',
                            'Rare',
                            'Unique'
                          ])
                        "
                        input-debounce="0"
                        label="Rarity"
                        class="tw:mb-2 tw:pb-0.5"
                      />
                    </q-card-section>
                  </q-tab-panel>
                  <q-tab-panel name="Advanced" class="tw:px-3! tw:mb-2!">
                    <q-card-section class="tw:flex" style="max-height: 46rem">
                      <q-input
                        ref="newNameInput"
                        v-model="newTemplate.name"
                        outlined
                        dense
                        autofocus
                        label="Name"
                        counter
                        class="tw:hidden!"
                        :maxlength="50"
                        :no-error-icon="true"
                        :rules="[
                          (val: string) => !!val || 'Field is required',
                          (val: string) =>
                            !template_list.some(
                              name => name.toLowerCase() === val.toLowerCase()
                            ) || 'This template already exists'
                        ]"
                      />
                      <div class="tw:space-y-3">
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.armor_percentage + '%'
                            "
                            :disable="!armorOn"
                            class="tw:px-3"
                            style="min-width: 236px"
                            aria-label="Armor percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.equipment_percentage + '%'
                            "
                            :disable="!equipmentOn"
                            class="tw:px-3"
                            style="min-width: 236px"
                            aria-label="Equipment percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.shield_percentage + '%'
                            "
                            :disable="!shieldOn"
                            class="tw:px-3"
                            style="min-width: 236px"
                            aria-label="Shield percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.weapon_percentage + '%'
                            "
                            :disable="!weaponOn"
                            class="tw:px-3"
                            style="min-width: 236px"
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
                  <q-btn-group flat class="tw:px-1.5">
                    <q-btn
                      v-close-popup
                      flat
                      label="Cancel"
                      type="button"
                      class="full-width tw:px-6! tw:text-blue-600! tw:dark:text-blue-400!"
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
                      class="full-width tw:px-6! tw:text-blue-600! tw:dark:text-blue-400!"
                      @click="addTemplate()"
                    />
                  </q-btn-group>
                </q-card-actions>
              </q-card>
            </q-dialog>
            <div class="tw:flex tw:justify-center tw:grow">
              <q-btn
                class="tw:my-auto!"
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
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Duplicate template
                </q-tooltip>
              </q-btn>
            </div>
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
                      (val: string) => !!val || 'Field is required',
                      (val: string) =>
                        !template_list.some(
                          name => name.toLowerCase() === val.toLowerCase()
                        ) || 'This template already exists'
                    ]"
                    @keyup.enter="duplicateTemplate"
                  />
                </q-card-section>

                <q-card-actions align="center" class="text-primary">
                  <q-btn
                    flat
                    label="Cancel"
                    class="tw:text-blue-600! tw:dark:text-blue-400!"
                    aria-label="Close dialog"
                    @click="duplicateTemplateDialog = false"
                  />
                  <q-btn
                    flat
                    label="Duplicate"
                    class="tw:text-blue-600! tw:dark:text-blue-400!"
                    aria-label="Duplicate template"
                    @click="duplicateTemplate"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <div class="tw:flex tw:justify-center tw:grow">
              <q-btn
                class="tw:my-auto!"
                :icon="biPencilSquare"
                size="sm"
                padding="sm"
                flat
                round
                dense
                :disable="tmpFilters.shop_template!.default"
                aria-label="Edit current template"
                @click="openEditDialog()"
              >
                <q-tooltip
                  v-if="tmpFilters.shop_template!.default"
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Can't edit default template
                </q-tooltip>
                <q-tooltip
                  v-else
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Edit template
                </q-tooltip>
              </q-btn>
            </div>
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
                  <div class="text-h6 tw:min-w-65">Template Editor</div>
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
                  <q-tab-panel name="General" class="tw:px-3!">
                    <q-card-section
                      class="tw:space-y-3"
                      style="max-height: 46rem"
                    >
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
                          (val: string) => !!val || 'Field is required',
                          (val: string) =>
                            !template_list.some(
                              name =>
                                name.toLowerCase() === val.toLowerCase() &&
                                newTemplate.name !==
                                  template_store.all_templates[
                                    template_store.activeTemplate
                                  ]!.name
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
                      <q-separator class="tw:my-4!" />
                      <q-select
                        v-model="newTemplate.item_sources"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="
                          Object.freeze(filters_store.itemFilters.sources)
                        "
                        use-input
                        input-debounce="0"
                        label="Source"
                        virtual-scroll-item-size="32"
                        @filter="filterSourcesFn"
                      />
                      <q-select
                        ref="editTraitSelect"
                        v-model="selectedTraits"
                        multiple
                        dense
                        outlined
                        options-dense
                        :options="traitOptions"
                        map-options
                        emit-value
                        use-input
                        input-debounce="0"
                        label="Traits"
                        :virtual-scroll-slice-size="traitOptions.length"
                        @filter="filterTraitsFn"
                      >
                        <template #selected-item="scope">
                          <q-chip
                            removable
                            dense
                            class="tw:text-white"
                            :color="scope.opt.state === true ? 'green' : 'red'"
                            :tabindex="scope.tabindex"
                            @remove="
                              selectedTraits[scope.index]!.state = null;
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
                                :color="
                                  scope.opt.state === true ? 'positive' : 'red'
                                "
                                :keep-color="scope.opt.state !== null"
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
                            class="tw:text-[#7d838b] tw:hover:text-[#bcbfc3] cursor-pointer"
                            @click.stop.prevent="
                              for (const trait of selectedTraits) {
                                trait.state = null;
                              }
                              selectedTraits = [];
                            "
                          />
                        </template>
                      </q-select>
                      <q-select
                        v-model="newTemplate.item_rarities"
                        multiple
                        dense
                        outlined
                        clearable
                        options-dense
                        :options="
                          Object.freeze([
                            'Common',
                            'Uncommon',
                            'Rare',
                            'Unique'
                          ])
                        "
                        input-debounce="0"
                        label="Rarity"
                        class="tw:mb-2 tw:pb-0.5"
                      />
                    </q-card-section>
                  </q-tab-panel>
                  <q-tab-panel name="Advanced" class="tw:px-3! tw:mb-2!">
                    <q-card-section class="tw:flex" style="max-height: 46rem">
                      <q-input
                        ref="editNameInput"
                        v-model="newTemplate.name"
                        outlined
                        dense
                        autofocus
                        label="Name"
                        counter
                        class="tw:hidden!"
                        :maxlength="50"
                        :no-error-icon="true"
                        :rules="[
                          (val: string) => !!val || 'Field is required',
                          (val: string) =>
                            !template_list.some(
                              name =>
                                name.toLowerCase() === val.toLowerCase() &&
                                newTemplate.name !==
                                  template_store.all_templates[
                                    template_store.activeTemplate
                                  ]!.name
                            ) || 'This template already exists'
                        ]"
                      />
                      <div class="tw:space-y-3">
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.armor_percentage + '%'
                            "
                            :disable="!armorOn"
                            class="tw:px-3"
                            style="min-width: 236px"
                            aria-label="Armor percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.equipment_percentage + '%'
                            "
                            :disable="!equipmentOn"
                            class="tw:px-3"
                            style="min-width: 236px"
                            aria-label="Equipment percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.shield_percentage + '%'
                            "
                            :disable="!shieldOn"
                            class="tw:px-3"
                            style="min-width: 236px"
                            aria-label="Shield percentage"
                            role="menuitem"
                          />
                          <q-separator />
                        </div>
                        <div class="tw:flex tw:flex-col">
                          <div class="tw:flex tw:flex-row">
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
                            :label-value="
                              'Min: ' + newTemplate.weapon_percentage + '%'
                            "
                            :disable="!weaponOn"
                            class="tw:px-3"
                            style="min-width: 236px"
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
                  <q-btn-group flat class="tw:px-1.5">
                    <q-btn
                      v-close-popup
                      flat
                      label="Cancel"
                      type="button"
                      class="full-width tw:px-6! tw:text-blue-600! tw:dark:text-blue-400!"
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
                      class="full-width tw:px-6! tw:text-blue-600! tw:dark:text-blue-400!"
                      @click="editTemplate()"
                    />
                  </q-btn-group>
                </q-card-actions>
              </q-card>
            </q-dialog>
            <div class="tw:flex tw:justify-center tw:grow">
              <q-btn
                class="tw:my-auto!"
                :icon="biTrash"
                size="sm"
                padding="sm"
                flat
                round
                dense
                :disable="tmpFilters.shop_template!.default"
                aria-label="Remove current template"
                @click="removeTemplateDialog = true"
              >
                <q-tooltip
                  v-if="tmpFilters.shop_template!.default"
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Can't remove default template
                </q-tooltip>
                <q-tooltip
                  v-else
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Remove template
                </q-tooltip>
              </q-btn>
            </div>
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
                    class="tw:text-blue-600! tw:dark:text-blue-400!"
                    @click="removeTemplateDialog = false"
                  />
                  <q-btn
                    flat
                    label="Remove"
                    class="tw:text-red-600! tw:dark:text-red-400!"
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
        <q-btn-group flat class="tw:px-1.5">
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
            label="Generate new Shop"
            type="button"
            class="full-width tw:text-blue-600! tw:dark:text-blue-400!"
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
input[type="number"] {
  appearance: textfield;
}
</style>
