<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { matPriorityHigh } from '@quasar/extras/material-icons';
import { biXLg, biQuestionCircle } from '@quasar/extras/bootstrap-icons';
import { itemsStore, settingsStore } from 'src/stores/store';
import { shopGenerator } from 'src/utils/shop-api-calls';
import { debounce } from 'lodash-es';
import { min_item } from 'src/types/item';

const $q = useQuasar();

const settings = settingsStore();
const shop = itemsStore();

const dialog = ref(false);

const fixedConsumableDice = ref(false);
const fixedEquipmentDice = ref(false);

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

const consumable_dices = ref({ dice_size: { label: 'D4', value: 4 }, n_of_dices: 3 });
const equipment_dices = ref({ dice_size: { label: 'D4', value: 4 }, n_of_dices: 3 });
const levels = ref({ min: 0, max: 25 });
const shop_template = ref<'Blacksmith' | 'Alchemist' | 'General'>('General');

const tmpFilters = ref({
  consumable_dices: consumable_dices.value,
  equipment_dices: equipment_dices.value,
  levels: levels.value,
  shop_template: shop_template.value
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
  tmpFilters.value.equipment_dices = {
    dice_size: {
      label: equipment_dices.value.dice_size.label,
      value: equipment_dices.value.dice_size.value
    },
    n_of_dices: equipment_dices.value.n_of_dices
  };
  tmpFilters.value.levels = levels.value;
  tmpFilters.value.shop_template = shop_template.value;
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
    equipment_dices: [
      {
        dice_size: tmpFilters.value.equipment_dices.dice_size.value,
        n_of_dices: tmpFilters.value.equipment_dices.n_of_dices
      }
    ],
    min_level: tmpFilters.value.levels.min,
    max_level: tmpFilters.value.levels.max,
    shop_template: tmpFilters.value.shop_template,
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
    post.equipment_dices = [
      {
        dice_size: 1,
        n_of_dices: tmpFilters.value.equipment_dices.n_of_dices
      }
    ];
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

const saveChanges = () => {
  consumable_dices.value = tmpFilters.value.consumable_dices;
  equipment_dices.value = tmpFilters.value.equipment_dices;
  levels.value = tmpFilters.value.levels;
  shop_template.value = tmpFilters.value.shop_template;
};

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
    const value = tmpFilters.value.equipment_dices.n_of_dices;
    if (value < 0) {
      tmpFilters.value.equipment_dices.n_of_dices = 0;
    }
    if (value > 20) {
      tmpFilters.value.equipment_dices.n_of_dices = 20;
    }
    tmpFilters.value.equipment_dices.n_of_dices = Math.round(
      tmpFilters.value.equipment_dices.n_of_dices
    );
  }
};

defineExpose({ generateShop });
</script>

<template>
  <q-btn push label="Generator Settings" @click="restoreSettings" id="v-step-1" />
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
              dense
              outlined
              v-model.number="tmpFilters.equipment_dices.n_of_dices"
              @update:model-value="validateNumber(false)"
              type="number"
              label="Number"
              class="tw-w-32 tw-pr-2"
            />
            <q-select
              v-if="!fixedEquipmentDice"
              dense
              outlined
              v-model="tmpFilters.equipment_dices.dice_size"
              :options="Object.freeze(diceSelect)"
              label="Size"
              class="tw-w-32 tw-pl-2"
            >
              <template v-slot:option="scope">
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
              dense
              outlined
              v-model.number="tmpFilters.consumable_dices.n_of_dices"
              @update:model-value="validateNumber(true)"
              type="number"
              label="Number"
              class="tw-w-32 tw-pr-2"
            />
            <q-select
              v-if="!fixedConsumableDice"
              dense
              outlined
              v-model="tmpFilters.consumable_dices.dice_size"
              :options="Object.freeze(diceSelect)"
              label="Size"
              class="tw-w-32 tw-pl-2"
            >
              <template v-slot:option="scope">
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

          <div class="tw-flex tw-flex-row">
            <q-select
              dense
              outlined
              options-dense
              v-model="tmpFilters.shop_template"
              :options="Object.freeze(['Alchemist', 'Blacksmith', 'General'])"
              label="Shop template"
              class="tw-w-56"
            >
              <q-tooltip
                v-if="tmpFilters.shop_template === 'Alchemist'"
                class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>Alchemist</strong>
                <br />
                Only equipments and consumables,<br />
                no weapons, armors or shields
              </q-tooltip>
              <q-tooltip
                v-if="tmpFilters.shop_template === 'Blacksmith'"
                class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>Blacksmith</strong>
                <br />
                Mainly weapons, armors and shields,<br />
                sometimes equipments and consumables
              </q-tooltip>
              <q-tooltip
                v-if="tmpFilters.shop_template === 'General'"
                class="text-caption text-center tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>General</strong>
                <br />
                All kinds of items
              </q-tooltip>
            </q-select>
            <q-icon flat round size="xs" :name="biQuestionCircle" class="tw-m-auto">
              <q-tooltip
                class="text-caption text-left tw-bg-gray-700 tw-text-gray-200 tw-rounded-md tw-shadow-sm dark:tw-bg-slate-700"
                anchor="top middle"
                self="bottom middle"
              >
                <strong>Shop templates</strong>
                <hr />
                <b>• Alchemist: </b> Only equipments and consumables
                <br />
                <b>• Blacksmith: </b> Weapons, armors and shields
                <br />
                <b>• General: </b> All kinds of items
              </q-tooltip>
            </q-icon>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn-group flat class="tw-px-1.5">
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
            label="Generate new Shop"
            type="button"
            class="full-width tw-text-blue-600 dark:tw-text-blue-400"
            v-close-popup
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
