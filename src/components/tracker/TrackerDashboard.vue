<script setup lang="ts">
import {
  biBoxArrowUpRight,
  biDash,
  biPlus
} from "@quasar/extras/bootstrap-icons";
import {
  fasBrain,
  fasDumbbell,
  fasHeart,
  fasHeartCrack,
  fasPersonRunning,
  fasShield
} from "@quasar/extras/fontawesome-v7";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import { startCase } from "lodash-es";
import { useQuasar } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { requestConditions } from "@/api/encounter-api-calls";
import DiceIcon from "@/components/generic/DiceIcon.vue";
import { settingsStore } from "@/stores/settings";
import { trackerStore } from "@/stores/tracker";
import {
  cleanDescription,
  getGameFont,
  getGameFontSize,
  openSheet
} from "@/utils/sheet";

import type { condition } from "@/types/tracker";

const router = useRouter();

const $q = useQuasar();
const settings_store = settingsStore();
const tracker_store = trackerStore();

const conditionList = ref<condition[]>([]);
const conditionFilter = ref<condition[]>([]);
const detailedElement = computed(
  () => tracker_store.trackerList.list[tracker_store.trackerList.detail_index]
);

const changeHealthInput = ref(0);

let closeTimer: ReturnType<typeof setTimeout>;
const tooltipMap = ref<Record<number, boolean>>({});

const openTooltip = (id: number): void => {
  clearTimeout(closeTimer);
  for (const tooltip in tooltipMap.value) {
    tooltipMap.value[Number(tooltip)] = false;
  }
  tooltipMap.value[id] = true;
};

const cancelTooltipClose = (): void => {
  clearTimeout(closeTimer);
};

const scheduleTooltipClose = (): void => {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    for (const tooltip in tooltipMap.value) {
      tooltipMap.value[Number(tooltip)] = false;
    }
  }, 100);
};

onMounted(async () => {
  try {
    const conditionRequest = await requestConditions(settings_store.game);
    if (!conditionRequest) {
      throw new Error("Error fetching conditions");
    }
    for (let condition of conditionRequest) {
      condition.name = startCase(condition.name);
    }

    tracker_store.conditions = conditionRequest.toSorted((a, b) =>
      a.name.localeCompare(b.name)
    );
    conditionList.value = tracker_store.conditions;
    conditionFilter.value = tracker_store.conditions;
  } catch (error) {
    console.error(error);
    $q.notify({
      icon: matPriorityHigh,
      message: "Error fetching conditions",
      progress: true,
      type: "warning"
    });
  }
});

const validateNumber = (newValue: unknown): number => {
  const val = Number(newValue);
  if (Number.isNaN(val) || val < 0) {
    return 0;
  } else if (val > 999) {
    return 999;
  }
  return Math.round(val);
};

const validateSmallNumber = (newValue: unknown): number => {
  const val = Number(newValue);
  if (Number.isNaN(val) || val < 0) {
    return 0;
  } else if (val > 99) {
    return 99;
  }
  return Math.round(val);
};

const validateSmallNegativeNumber = (newValue: unknown): number => {
  const val = Number(newValue);
  if (Number.isNaN(val)) {
    return 0;
  } else if (val < -99) {
    return -99;
  } else if (val > 99) {
    return 99;
  }
  return Math.round(val);
};

const changeHealth = (newValue: unknown): void => {
  if (
    detailedElement.value &&
    detailedElement.value.health !== null &&
    detailedElement.value.max_health !== null
  ) {
    const sum = detailedElement.value.health + Number(newValue);
    if (sum < 0) {
      detailedElement.value.health = 0;
    } else if (sum > detailedElement.value.max_health) {
      detailedElement.value.health = detailedElement.value.max_health;
    } else {
      detailedElement.value.health = sum;
    }
  }
};

const rollInitiative = (index: number): void => {
  const rollDice = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
  if (tracker_store.trackerList.list[index]) {
    tracker_store.trackerList.list[index]!.initiative =
      rollDice + tracker_store.trackerList.list[index].perception;
  }
};

const filterConditionsFn = (
  val: string,
  update: (fn: () => void) => void
): void => {
  update(() => {
    const filter = val.toLowerCase();
    conditionList.value = conditionFilter.value.filter(v =>
      v.name.toLowerCase().includes(filter)
    );
  });
};
</script>

<template>
  <div class="tw:h-full">
    <div
      id="shepherd-4"
      class="tw:h-full tw:text-left tw:opacity-85 tw:dark:opacity-90 tw:rounded-xl tw:border tw:bg-white tw:border-gray-200 tw:dark:bg-gray-800 tw:dark:border-gray-700"
      :class="
        tracker_store.running &&
        tracker_store.trackerList.detail_index ===
          tracker_store.trackerList.active_index
          ? 'tw:outline-solid tw:outline-red-600 tw:rounded-md'
          : ''
      "
      style="
        font-family:
          Good Pro,
          sans-serif;
      "
    >
      <q-scroll-area v-if="tracker_store.running" class="tw:h-full">
        <div
          v-if="detailedElement"
          class="tw:h-full tw:m-4 tw:text-gray-800 tw:dark:text-white"
        >
          <div class="tw:flex">
            <span v-if="detailedElement.is_player" class="tw:flex">
              <h1
                :class="
                  getGameFontSize(settings_store.game) +
                  ' tw:mr-4 tw:leading-8 tw:my-auto tw:break-all'
                "
                :style="
                  'font-family: ' +
                  getGameFont(settings_store.game) +
                  ', sans-serif; font-variant-caps: small-caps'
                "
              >
                {{ detailedElement.element }}
              </h1>
            </span>
            <span
              v-else
              class="tw:flex tw:my-auto"
              :style="
                'font-family: ' +
                getGameFont(
                  !detailedElement.is_player
                    ? detailedElement.element.game
                    : settings_store.game
                ) +
                ', sans-serif; font-variant-caps: small-caps'
              "
            >
              <q-btn
                :icon="biBoxArrowUpRight"
                flat
                round
                dense
                size="sm"
                padding="sm"
                class="only-screen encounter-page-element"
                aria-label="Open creature sheet"
                @click="
                  if (!detailedElement.is_player) {
                    openSheet(
                      router,
                      detailedElement.element.is_hazard ? 'hazard' : 'bestiary',
                      detailedElement.element.game ?? settings_store.game,
                      detailedElement.element.id ?? 0,
                      !detailedElement.element.is_hazard
                        ? detailedElement.element.variant
                        : null
                    );
                  }
                "
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  {{
                    "Open " +
                    (detailedElement.element.is_hazard
                      ? "hazard"
                      : "creature") +
                    " sheet"
                  }}
                </q-tooltip>
              </q-btn>
              <a
                v-if="
                  !detailedElement.element.is_hazard &&
                  detailedElement.element.archive_link
                "
                class="tw:my-auto"
                :href="
                  detailedElement.element.archive_link +
                  '&Weak=' +
                  (detailedElement.element.variant === 'Weak') +
                  '&Elite=' +
                  (detailedElement.element.variant === 'Elite')
                "
                target="_blank"
                rel="noopener"
              >
                <h1
                  :class="
                    getGameFontSize(
                      detailedElement.element.game ?? settings_store.game
                    ) +
                    ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
                  "
                >
                  <span v-if="detailedElement.element.variant === 'Weak'"
                    >Weak
                  </span>
                  <span v-else-if="detailedElement.element.variant === 'Elite'"
                    >Elite
                  </span>
                  {{ detailedElement.element.name }}
                </h1>
              </a>
              <a
                v-else-if="
                  detailedElement.element.game === 'sf' ||
                  detailedElement.element.is_hazard
                "
                class="tw:my-auto"
                :href="
                  'https://2e.aonsrd.com/search?type=eqs&q=type%3A(creature) ' +
                  encodeURIComponent(detailedElement.element.name)
                "
                target="_blank"
                rel="noopener"
              >
                <h1
                  :class="
                    getGameFontSize(
                      detailedElement.element.game ?? settings_store.game
                    ) +
                    ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
                  "
                >
                  <span
                    v-if="
                      !detailedElement.element.is_hazard &&
                      detailedElement.element.variant === 'Weak'
                    "
                    >Weak
                  </span>
                  <span
                    v-else-if="
                      !detailedElement.element.is_hazard &&
                      detailedElement.element.variant === 'Elite'
                    "
                    >Elite
                  </span>
                  {{ detailedElement.element.name }}
                </h1>
              </a>
              <h1
                v-else
                :class="
                  getGameFontSize(
                    detailedElement.element.game ?? settings_store.game
                  ) + ' tw:mr-4 tw:leading-8 tw:my-auto'
                "
              >
                <span
                  v-if="
                    !detailedElement.element.is_hazard &&
                    detailedElement.element.variant === 'Weak'
                  "
                  >Weak
                </span>
                <span
                  v-else-if="
                    !detailedElement.element.is_hazard &&
                    detailedElement.element.variant === 'Elite'
                  "
                  >Elite
                </span>
                {{ detailedElement.element.name }}
              </h1>
            </span>
            <q-space />
            <q-input
              v-if="detailedElement.is_player"
              :model-value="detailedElement.perception"
              dense
              filled
              stack-label
              type="number"
              class="tw:mr-4 tw:my-auto tw:w-16 tw:min-w-16"
              label="Initiative"
              @update:model-value="
                (v: unknown) =>
                  (detailedElement!.perception = validateSmallNegativeNumber(v))
              "
            />
            <q-btn
              color="primary tw:my-auto!"
              round
              unelevated
              aria-label="Roll initiative"
              @click="
                rollInitiative(tracker_store.trackerList.detail_index);
                tracker_store.sortList();
              "
            >
              <DiceIcon v-if="detailedElement.initiative === null" />
              <b v-else class="tw:text-xl">
                {{ detailedElement.initiative }}
              </b>
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Roll initiative
              </q-tooltip>
            </q-btn>
          </div>
          <div
            v-if="
              detailedElement.is_player || detailedElement.max_health !== null
            "
          >
            <q-separator class="tw:my-2!" style="height: 2px" />
            <b class="tw:flex tw:text-xl">
              <span class="tw:my-2"> HP </span>
              <q-space />
              <span class="tw:flex">
                <q-input
                  :model-value="detailedElement.health"
                  dense
                  filled
                  class="tw:max-w-14! tw:max-h-8! tw:text-xl!"
                  input-class="tw:text-xl! tw:font-bold! tw:text-end"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.health = validateNumber(v))
                  "
                />
                <b class="tw:text-xl! tw:mx-1 tw:pt-1.5">/</b>
                <q-input
                  :model-value="detailedElement.max_health"
                  dense
                  filled
                  class="tw:max-w-14! tw:max-h-8! tw:text-xl!"
                  input-class="tw:text-xl! tw:font-bold! tw:text-start"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.max_health = validateNumber(v))
                  "
                >
                </q-input>
              </span>
            </b>
            <q-slider
              v-model="detailedElement.health"
              class="tw:px-2!"
              aria-label="Filter level"
              role="menuitem"
              :color="detailedElement.health ? 'green' : 'red'"
              track-size="10px"
              thumb-size="25px"
              :min="0"
              :max="detailedElement.max_health ?? 1"
            />
            <div class="tw:flex tw:justify-center tw:mb-4!">
              <q-btn
                :icon="fasHeartCrack"
                unelevated
                round
                dense
                class="tw:my-auto! tw:p-1!"
                color="red"
                aria-label="Remove health"
                @click="changeHealth(-changeHealthInput)"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Damage
                </q-tooltip>
              </q-btn>
              <q-input
                :model-value="changeHealthInput"
                dense
                filled
                stack-label
                type="number"
                class="tw:mx-4 tw:max-w-15"
                label="Amount"
                @update:model-value="
                  (v: unknown) => (changeHealthInput = validateNumber(v))
                "
              />
              <q-btn
                :icon="fasHeart"
                unelevated
                dense
                round
                class="tw:my-auto! tw:p-1!"
                color="green"
                aria-label="Add health"
                @click="changeHealth(changeHealthInput)"
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Heal
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div
            v-if="
              detailedElement.is_player ||
              detailedElement.ac ||
              detailedElement.fortitude ||
              detailedElement.reflex ||
              detailedElement.will
            "
          >
            <q-separator class="tw:my-2!" style="height: 2px" />
            <div
              class="tw:flex tw:flex-wrap tw:gap-4 tw:justify-items-center tw:my-4"
            >
              <div
                v-if="detailedElement.is_player || detailedElement.ac"
                class="tw:flex tw:grow tw:flex-col"
              >
                <q-icon
                  :name="fasShield"
                  size="md"
                  class="tw:min-h-11 tw:mx-auto tw:pb-2"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Armor Class
                  </q-tooltip>
                </q-icon>
                <b
                  v-if="!detailedElement.is_player"
                  class="tw:text-xl tw:mx-auto tw:my-1.5"
                  >{{ detailedElement.ac }}
                </b>
                <q-input
                  v-else
                  :model-value="detailedElement.ac"
                  dense
                  filled
                  class="tw:max-w-18! tw:text-xl! tw:mx-auto"
                  input-class="tw:text-xl! tw:font-bold! tw:text-center"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.ac = validateSmallNumber(v))
                  "
                />
              </div>
              <div
                v-if="detailedElement.is_player || detailedElement.fortitude"
                class="tw:flex tw:grow tw:flex-col"
              >
                <q-icon
                  :name="fasDumbbell"
                  size="md"
                  class="tw:min-h-11 tw:mx-auto tw:pb-2"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Fortitude Save
                  </q-tooltip>
                </q-icon>
                <span
                  v-if="!detailedElement.is_player && detailedElement.fortitude"
                  class="tw:flex tw:mx-auto tw:mt-1.5"
                >
                  <b class="tw:text-xl"
                    >{{
                      (detailedElement.fortitude >= 0 ? "+" : "") +
                      detailedElement.fortitude
                    }}
                  </b>
                </span>
                <q-input
                  v-else
                  :model-value="detailedElement.fortitude"
                  dense
                  filled
                  class="tw:max-w-18! tw:text-sm! tw:mx-auto"
                  input-class="tw:text-xl! tw:font-bold! tw:text-center"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.fortitude =
                        validateSmallNegativeNumber(v))
                  "
                />
              </div>
              <div
                v-if="detailedElement.is_player || detailedElement.reflex"
                class="tw:flex tw:grow tw:flex-col"
              >
                <q-icon
                  :name="fasPersonRunning"
                  size="md"
                  class="tw:min-h-11 tw:mx-auto tw:pb-2"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Reflex Save
                  </q-tooltip>
                </q-icon>
                <span
                  v-if="!detailedElement.is_player && detailedElement.reflex"
                  class="tw:flex tw:mx-auto tw:mt-1.5"
                >
                  <b class="tw:text-xl"
                    >{{
                      (detailedElement.reflex >= 0 ? "+" : "") +
                      detailedElement.reflex
                    }}
                  </b>
                </span>
                <q-input
                  v-else
                  :model-value="detailedElement.reflex"
                  dense
                  filled
                  class="tw:max-w-18! tw:text-sm! tw:mx-auto"
                  input-class="tw:text-xl! tw:font-bold! tw:text-center"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.reflex = validateSmallNegativeNumber(v))
                  "
                />
              </div>
              <div
                v-if="detailedElement.is_player || detailedElement.will"
                class="tw:flex tw:grow tw:flex-col"
              >
                <q-icon
                  :name="fasBrain"
                  size="md"
                  class="tw:min-h-11 tw:mx-auto tw:pb-2"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Will Save
                  </q-tooltip>
                </q-icon>
                <span
                  v-if="!detailedElement.is_player && detailedElement.will"
                  class="tw:flex tw:mx-auto tw:mt-1.5"
                >
                  <b class="tw:text-xl"
                    >{{
                      (detailedElement.will >= 0 ? "+" : "") +
                      detailedElement.will
                    }}
                  </b>
                </span>
                <q-input
                  v-else
                  :model-value="detailedElement.will"
                  dense
                  filled
                  class="tw:max-w-18! tw:text-sm! tw:mx-auto"
                  input-class="tw:text-xl! tw:font-bold! tw:text-center"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.will = validateSmallNegativeNumber(v))
                  "
                />
              </div>
            </div>
          </div>
          <div>
            <q-separator class="tw:my-2!" style="height: 2px" />
            <q-select
              v-model="detailedElement.conditions"
              multiple
              filled
              use-chips
              options-dense
              :options="conditionList"
              option-label="name"
              use-input
              input-debounce="0"
              label="Conditions"
              class="tw:mx-auto tw:my-4 tw:w-fit! tw:min-w-64"
              @filter="filterConditionsFn"
            >
              <template #selected-item="scope">
                <q-chip
                  :removable="
                    detailedElement.conditions[scope.index]!.default !== true
                  "
                  dense
                  clickable
                  class="tw:text-white"
                  :tabindex="scope.tabindex"
                  @remove="
                    detailedElement!.conditions[scope.index]!.value = null;
                    scope.removeAtIndex(scope.index);
                  "
                  @click="
                    if (detailedElement) {
                      tracker_store.increaseCondition(
                        detailedElement,
                        scope.opt
                      );
                    }
                  "
                  @contextmenu.prevent="
                    if (detailedElement) {
                      tracker_store.decreaseCondition(
                        detailedElement,
                        scope.opt
                      );
                    }
                  "
                  @mouseenter="openTooltip(scope.index)"
                  @mouseleave="scheduleTooltipClose"
                >
                  {{
                    scope.opt.name +
                    (scope.opt.is_stackable ? ` ${scope.opt.value}` : "")
                  }}
                  <q-menu
                    :model-value="tooltipMap[scope.index] ?? false"
                    style="
                      font-family:
                        Good Pro,
                        sans-serif;
                    "
                    class="tw:text-base! tw:max-w-md! tw:p-2! tw:border tw:rounded-md tw:shadow-sm! tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
                    :offset="[0, 8]"
                    anchor="top middle"
                    self="bottom middle"
                    @mouseenter="cancelTooltipClose"
                    @mouseleave="scheduleTooltipClose"
                  >
                    <strong>{{ scope.opt.name.toUpperCase() }} </strong>
                    <q-separator class="tw:my-1!" style="height: 2px" />
                    <span v-html="cleanDescription(scope.opt.rule)" />
                  </q-menu>
                </q-chip>
              </template>
              <template #option="scope">
                <q-item
                  dense
                  class="tw:max-h-8 tw:dark:hover:bg-[#4d5560]! tw:hover:bg-[#dddddd]"
                >
                  <q-item-section
                    class="cursor-pointer"
                    @click="
                      if (detailedElement) {
                        tracker_store.increaseCondition(
                          detailedElement,
                          scope.opt
                        );
                      }
                    "
                  >
                    <q-item-label
                      @contextmenu.prevent="
                        if (detailedElement) {
                          tracker_store.decreaseCondition(
                            detailedElement,
                            scope.opt
                          );
                        }
                      "
                      >{{ scope.opt.name }}</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      :icon="biDash"
                      round
                      dense
                      flat
                      @click="
                        if (detailedElement) {
                          tracker_store.decreaseCondition(
                            detailedElement,
                            scope.opt
                          );
                        }
                      "
                    />
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      :icon="biPlus"
                      round
                      dense
                      flat
                      @click="
                        if (detailedElement) {
                          tracker_store.increaseCondition(
                            detailedElement,
                            scope.opt
                          );
                        }
                      "
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div>
            <q-separator class="tw:my-2!" style="height: 2px" />
            <q-input
              v-model="detailedElement.note"
              class="tw:my-4"
              label="Note"
              filled
              autogrow
              type="textarea"
            />
          </div>
        </div>
      </q-scroll-area>
      <div v-else class="tw:text-center tw:text-lg tw:pt-[38vh]">
        Start the encounter to display its details
      </div>
    </div>
  </div>
</template>
