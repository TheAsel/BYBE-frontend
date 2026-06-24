<script setup lang="ts">
import {
  fasAngleLeft,
  fasAngleRight,
  fasBackward,
  fasDragon,
  fasForward,
  fasLandMineOn,
  fasMagnifyingGlass,
  fasUser
} from "@quasar/extras/fontawesome-v7";
import { matPriorityHigh } from "@quasar/extras/material-icons";
import {
  mdiAccountGroup,
  mdiAccountMultipleOutline,
  mdiClose,
  mdiPlus,
  mdiSwordCross
} from "@quasar/extras/mdi-v7";
import { useQuasar } from "quasar";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

import { requestCreatureId, requestHazardId } from "@/api/encounter-api-calls";
import { settingsStore } from "@/stores/settings";
import { openSheet } from "@/utils/sheet";
import { trackerStore } from "@/stores/tracker";

import type { creature } from "@/types/creature";
import type { encounter_list } from "@/types/encounter";
import type { hazard } from "@/types/hazard";
import type { party } from "@/types/party";
import type { min_tracker } from "@/types/tracker";

const router = useRouter();
const $q = useQuasar();

const settings_store = settingsStore();
const tracker_store = trackerStore();

const sessionData = sessionStorage.getItem("tracker_data");

const isGenerating = ref(false);

const trackerData = ref<{
  party: party | null;
  encounter_list: encounter_list | null;
}>({ encounter_list: null, party: null });

const creature_list: creature[] = [];
const hazard_list: hazard[] = [];

if (sessionData) {
  trackerData.value = JSON.parse(sessionData) as {
    party: party | null;
    encounter_list: encounter_list | null;
  };
} else {
  console.error("Failed to start tracker");
  $q.notify({
    icon: matPriorityHigh,
    message: "Failed to start tracker",
    progress: true,
    type: "warning"
  });
  await router.push({
    name: "encounter",
    query: { game: settings_store.game }
  });
}

async function initializeTracker(): Promise<void> {
  if (
    trackerData.value === null ||
    trackerData.value.encounter_list === null ||
    trackerData.value.party === null
  ) {
    console.error("Invalid tracker data");
    $q.notify({
      icon: matPriorityHigh,
      message: "Invalid tracker data",
      progress: true,
      type: "warning"
    });
    await router.push({
      name: "encounter",
      query: { game: settings_store.game }
    });
    return;
  }

  isGenerating.value = true;
  const tmpTrackerList: min_tracker[] = [];

  const results = await Promise.all(
    trackerData.value.encounter_list.creatures.map(
      async (
        item
      ): Promise<{ success: true; item: min_tracker } | { success: false }> => {
        try {
          if (item.is_hazard) {
            const itemData = await requestHazardId(item.game, item.id);
            if (!itemData) {
              console.error("Missing hazard ID");
              return { success: false };
            }
            hazard_list.push(itemData);
            return {
              item: {
                element: item,
                health: itemData.core_hazard.essential.has_health
                  ? itemData.core_hazard.essential.hp
                  : null,
                initiative: null,
                is_player: false,
                max_health: itemData.core_hazard.essential.has_health
                  ? itemData.core_hazard.essential.hp
                  : null,
                perception: itemData.core_hazard.essential.stealth ?? 0
              },
              success: true
            };
          }
          const itemData = await requestCreatureId(
            item.game,
            item.id,
            item.variant!,
            settings_store.is_pwl_on
          );
          if (!itemData) {
            console.error("Missing creature ID");
            return { success: false };
          }
          creature_list.push(itemData);
          return {
            item: {
              element: item,
              health: itemData.core_data.essential.hp,
              initiative: null,
              is_player: false,
              max_health: itemData.core_data.essential.hp,
              perception: itemData.extra_data?.perception ?? 0
            },
            success: true
          };
        } catch (error) {
          console.error(error);
          return { success: false };
        }
      }
    )
  );

  if (results.some(r => !r.success)) {
    $q.notify({
      icon: matPriorityHigh,
      message: "Some items could not be loaded",
      progress: true,
      type: "warning"
    });
    await router.push({
      name: "encounter",
      query: { game: settings_store.game }
    });
    return;
  }

  tmpTrackerList.push(
    ...results
      .filter((r): r is Extract<typeof r, { success: true }> => r.success)
      .map(r => r.item)
  );

  const explodedCreatureList: min_tracker[] = tmpTrackerList.flatMap(
    ({ element, ...rest }) => {
      if (!rest.is_player && typeof element !== "string") {
        return Array.from({ length: element.quantity ?? 1 }, () => ({
          element,
          ...rest
        }));
      }
      return [];
    }
  );

  const explodedPlayerList: min_tracker[] = [];

  for (let i = 0; i < trackerData.value.party.members.length; i += 1) {
    explodedPlayerList.push({
      element: `Player ${String(i + 1)}`,
      health: 1,
      initiative: null,
      is_player: true,
      max_health: 1,
      perception: 0
    });
  }

  tracker_store.updateTracker(explodedCreatureList.concat(explodedPlayerList));
  isGenerating.value = false;
}

initializeTracker(); // oxlint-disable-line prefer-top-level-await

const showItem = (item: min_tracker): void => {
  if (
    !tracker_store.lockSheet ||
    (tracker_store.selectedCreature === null &&
      tracker_store.selectedHazard === null)
  ) {
    if (item.is_player) {
      tracker_store.removeSelectedCreature();
      tracker_store.removeSelectedHazard();
    } else if (item.element.is_hazard) {
      const found_hazard = hazard_list.find(
        hazard => hazard.core_hazard.essential.id === item.element.id
      );
      if (found_hazard) {
        tracker_store.setSelectedHazard(found_hazard);
      }
    } else {
      const found_creature = creature_list.find(
        creature => creature.core_data.essential.id === item.element.id
      );
      if (found_creature) {
        tracker_store.setSelectedCreature(found_creature);
      }
    }
  }
};

function showDetails(index: number): void {
  tracker_store.trackerList.detail_index = index;
}

const rollInitiative = (index: number): void => {
  const rollDice = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
  if (tracker_store.trackerList.list[index]) {
    tracker_store.trackerList.list[index]!.initiative =
      rollDice + tracker_store.trackerList.list[index].perception;
  }
};

const rollAll = (): void => {
  for (let i = 0; i < tracker_store.trackerList.list.length; i += 1) {
    rollInitiative(i);
  }
  tracker_store.sortList();
};

const rollAllNpcs = (): void => {
  for (let i = 0; i < tracker_store.trackerList.list.length; i += 1) {
    if (!tracker_store.trackerList.list[i]?.is_player) {
      rollInitiative(i);
    }
  }
  tracker_store.sortList();
};

const validateNumber = (newValue: unknown): number => {
  const val = Number(newValue);
  if (Number.isNaN(val) || val < 0) {
    return 0;
  } else if (val > 9999) {
    return 9999;
  }
  return Math.round(val);
};

const setSheetFromIndex = (index: number): void => {
  const element = tracker_store.trackerList.list[index];
  if (element) {
    showItem(element);
  }
};

// Checks if typing to prevent stealing shortcuts
function isTextInput(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(
    el?.closest('input, textarea, [contenteditable="true"], .q-editor')
  );
}

// Global shortcuts
function onGlobalKey(evt: KeyboardEvent): void {
  if (isTextInput(evt.target) || !tracker_store.running) {
    return;
  }
  switch (evt.key) {
    case " ": {
      tracker_store.running = !tracker_store.running;
      if (tracker_store.running) {
        tracker_store.round = 1;
        setSheetFromIndex(tracker_store.trackerList.active_index);
      } else {
        tracker_store.resetTracker();
      }
      break;
    }
    case "ArrowLeft": {
      tracker_store.prevRound();
      setSheetFromIndex(tracker_store.trackerList.active_index);
      break;
    }
    case "ArrowUp": {
      tracker_store.prevTurn();
      setSheetFromIndex(tracker_store.trackerList.active_index);
      break;
    }
    case "ArrowRight": {
      tracker_store.nextRound();
      setSheetFromIndex(tracker_store.trackerList.active_index);
      break;
    }
    case "ArrowDown": {
      tracker_store.nextTurn();
      setSheetFromIndex(tracker_store.trackerList.active_index);
      break;
    }
    default:
      break;
  }
}

onMounted(() => {
  globalThis.addEventListener("keydown", onGlobalKey);
});

onUnmounted(() => {
  globalThis.removeEventListener("keydown", onGlobalKey);
});
</script>

<template>
  <div class="tw:h-full">
    <q-layout
      view="lHh lpr lFf"
      container
      class="tw:h-full tw:opacity-85 tw:dark:opacity-90 tw:border tw:border-gray-200! tw:rounded-xl tw:shadow-sm tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
    >
      <q-header
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:flex tw:flex-row tw:my-1 tw:mx-4 tw:gap-2">
          <div class="tw:basis-1/3">
            <q-btn
              :icon="mdiAccountGroup"
              flat
              rounded
              aria-label="Roll all"
              @click="rollAll"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Roll all
              </q-tooltip>
            </q-btn>
            <q-btn
              :icon="mdiAccountMultipleOutline"
              flat
              rounded
              aria-label="Roll NPCs"
              @click="rollAllNpcs"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Roll NPCs
              </q-tooltip>
            </q-btn>
          </div>
          <b
            class="tw:basis-1/3 tw:my-auto! tw:text-center tw:max-h-[33.15px]!"
          >
            {{
              tracker_store.running
                ? "Round " + tracker_store.round
                : "Not Started"
            }}
          </b>
          <div class="tw:basis-1/3 tw:my-auto! tw:text-end">
            <q-btn
              :icon="mdiPlus"
              flat
              rounded
              aria-label="Add player"
              @click="tracker_store.addPlayer"
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                Add player
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-header>
      <q-page-container v-if="!isGenerating">
        <q-page class="tw:min-h-auto!">
          <div
            v-for="(item, index) in tracker_store.trackerList.list"
            :key="index"
            class="tw:m-1"
            :class="
              index === tracker_store.trackerList.active_index &&
              tracker_store.running
                ? 'tw:outline-solid tw:outline-red-600 tw:rounded-md'
                : ''
            "
          >
            <div
              class="tw:flex tw:flex-row tw:flex-wrap tw:justify-center tw:my-1 tw:ml-2"
            >
              <q-btn
                class="tw:my-auto! tw:mr-2! tw:max-h-[33.15px]!"
                :icon="mdiClose"
                size="sm"
                padding="sm"
                flat
                round
                dense
                aria-label="Remove element"
                @click="tracker_store.removeFromTracker(index)"
              >
                <q-tooltip
                  class="tw:text-nowrap text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  {{
                    "Remove " +
                    (item.is_player
                      ? "player"
                      : item.element.is_hazard
                        ? "hazard"
                        : "creature")
                  }}
                </q-tooltip>
              </q-btn>
              <div
                v-if="!item.is_player"
                class="tw:flex-1 tw:my-auto tw:mx-1 cursor-pointer"
                style="min-width: 100px"
                @click="showItem(item)"
              >
                <q-chip
                  v-if="item.element.is_hazard === false"
                  text-color="white"
                  clickable
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Creature type"
                  @click="
                    openSheet(
                      router,
                      'bestiary',
                      item.element.game ?? settings_store.game,
                      item.element.id,
                      item.element.variant
                    )
                  "
                >
                  <q-avatar class="tw:visible" :icon="fasDragon" color="blue">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Creature
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <q-chip
                  v-if="item.element.is_hazard === true"
                  text-color="white"
                  clickable
                  :ripple="false"
                  class="tw:p-1! tw:invisible"
                  aria-label="Hazard type"
                  @click="
                    openSheet(
                      router,
                      'hazard',
                      item.element.game ?? settings_store.game,
                      item.element.id
                    )
                  "
                >
                  <q-avatar
                    class="tw:visible"
                    :icon="fasLandMineOn"
                    color="red"
                  >
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Hazard
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <span class="tw:align-middle">
                  <a
                    v-if="item.element.archive_link"
                    :href="
                      item.element.archive_link +
                      (!item.element.is_hazard
                        ? '&Weak=' +
                          (item.element.variant === 'Weak') +
                          '&Elite=' +
                          (item.element.variant === 'Elite')
                        : '')
                    "
                    target="_blank"
                    rel="noopener"
                  >
                    <span
                      class="tw:text-blue-600! tw:decoration-2 tw:hover:underline tw:dark:text-blue-400!"
                      :class="
                        item.health !== null && item.health <= 0
                          ? 'tw:line-through tw:text-red-600! tw:dark:text-red-400!'
                          : ''
                      "
                      >{{
                        !item.element.is_hazard &&
                        (item.element.variant === "Elite" ||
                          item.element.variant === "Weak")
                          ? item.element.variant + " "
                          : ""
                      }}{{ item.element.name }}</span
                    >
                  </a>
                  <span
                    v-else
                    :class="
                      item.health !== null && item.health === 0
                        ? 'tw:line-through! tw:text-red-600! tw:dark:text-red-400!'
                        : ''
                    "
                    >{{
                      !item.element.is_hazard &&
                      (item.element.variant === "Elite" ||
                        item.element.variant === "Weak")
                        ? item.element.variant + " "
                        : ""
                    }}{{ item.element.name }}</span
                  >
                </span>
              </div>
              <div v-else class="tw:flex tw:grow tw:mx-1">
                <q-chip
                  v-if="item.is_player"
                  text-color="white"
                  :ripple="false"
                  class="tw:p-1! tw:my-auto! tw:invisible"
                  aria-label="Player type"
                >
                  <q-avatar class="tw:visible" :icon="fasUser" color="green">
                    <q-tooltip
                      class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      Player
                    </q-tooltip>
                  </q-avatar>
                </q-chip>
                <q-input
                  v-if="item.is_player"
                  v-model="item.element"
                  dense
                  class="tw:align-middle tw:max-w-18! tw:md:max-w-64!"
                  :input-class="
                    item.health !== null && item.health === 0
                      ? 'tw:line-through! tw:text-red-600! tw:dark:text-red-400!'
                      : ''
                  "
                />
              </div>
              <div class="tw:flex tw:my-auto">
                <q-input
                  v-if="item.max_health !== null"
                  :model-value="item.health"
                  dense
                  borderless
                  stack-label
                  class="tw:w-11 tw:pr-2"
                  type="number"
                  label="Health"
                  @update:model-value="
                    (v: unknown) => (item.health = validateNumber(v))
                  "
                />
                <div v-else class="tw:w-11 tw:pr-2" />
                <q-btn
                  v-if="item.initiative === null"
                  flat
                  round
                  dense
                  class="tw:p-2.25!"
                  size="md"
                  aria-label="Random encounter"
                  @click="
                    rollInitiative(index);
                    tracker_store.sortList();
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 512.021 512.021"
                    fill="currentColor"
                    aria-label="D20 dice"
                  >
                    <path
                      d="M490.421,137.707c-0.085-1.003-0.149-2.005-0.555-2.987c-0.107-0.256-0.32-0.427-0.448-0.683
			                 c-0.277-0.533-0.597-0.981-0.96-1.472c-0.725-1.003-1.536-1.835-2.517-2.517c-0.256-0.171-0.363-0.491-0.64-0.64l-224-128
			                 c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-0.256,0.171-0.363,0.469-0.619,0.64c-1.024,0.704-1.899,1.557-2.645,2.624
			                 c-0.299,0.427-0.597,0.811-0.832,1.28c-0.149,0.277-0.384,0.469-0.512,0.768c-0.469,1.173-0.619,2.389-0.661,3.584
			                 c0,0.128-0.107,0.256-0.107,0.384v0.171c0,0.021,0,0.021,0,0.043v234.304c0,0.021,0,0.064,0,0.085v0.064
			                 c0,0.213,0.149,0.405,0.171,0.619c0.085,1.493,0.32,2.987,1.045,4.352c0.043,0.085,0.128,0.107,0.171,0.192
			                 c0.277,0.491,0.768,0.811,1.131,1.259c0.789,0.981,1.557,1.941,2.603,2.603c0.107,0.064,0.149,0.192,0.235,0.235l224,128
			                 c1.664,0.939,3.477,1.408,5.312,1.408s3.648-0.469,5.291-1.408l224-128c0.107-0.064,0.149-0.192,0.256-0.256
			                 c0.981-0.597,1.664-1.493,2.411-2.389c0.427-0.512,1.003-0.896,1.323-1.472c0.043-0.064,0.107-0.107,0.149-0.171
			                 c0.576-1.109,0.683-2.325,0.853-3.52c0.064-0.491,0.384-0.939,0.384-1.451V138.688
			                 C490.677,138.347,490.443,138.048,490.421,137.707z M455.52,136.981l-78.251,31.296L291.211,43.093L455.52,136.981z
			                 M256.011,29.504l97.067,141.184H158.944L256.011,29.504z M220.747,43.115l-86.037,125.163L56.48,136.981L220.747,43.115z
			                 M42.677,154.432l80.768,32.32L42.677,332.16V154.432z M138.635,203.392l98.325,178.773L49.248,364.288L138.635,203.392z
			                 M245.344,482.965l-165.12-94.336l165.12,15.573V482.965z M256.011,372.544l-99.285-180.523h198.571L256.011,372.544z
			                 M266.677,482.965v-78.571l165.035-15.723L266.677,482.965z M274.997,382.357l98.411-178.901l89.365,160.853L274.997,382.357z
			                 M469.344,332.203l-80.811-145.451l80.811-32.32V332.203z"
                    />
                  </svg>
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Roll initiative
                  </q-tooltip>
                </q-btn>
                <q-input
                  v-else
                  :model-value="item.initiative"
                  dense
                  filled
                  outlined
                  stack-label
                  class="tw:w-18 tw:mr-2"
                  type="number"
                  label="Initiative"
                  @update:model-value="
                    (v: unknown) => (item.initiative = validateNumber(v))
                  "
                  @blur="tracker_store.sortList()"
                />
                <q-btn
                  class="tw:my-auto! tw:mr-2! tw:p-2.25!"
                  :icon="fasMagnifyingGlass"
                  size="sm"
                  flat
                  round
                  dense
                  aria-label="Show details"
                  @click="showDetails(index)"
                >
                  <q-tooltip
                    class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    Show details
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
            <q-separator class="tw:bg-gray-200! tw:dark:bg-gray-700!" />
          </div>
        </q-page>
      </q-page-container>
      <q-page-container v-else class="tw:flex" style="height: 78vh">
        <div class="tw:m-auto">
          <q-spinner-gears
            class="tw:mx-auto tw:text-black tw:dark:text-white"
            size="5em"
          />
        </div>
      </q-page-container>
      <q-footer
        bordered
        class="tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:dark:border-gray-700!"
      >
        <div class="tw:mx-2">
          <div
            class="tw:flex tw:flex-wrap! tw:justify-center tw:my-1.5 tw:w-full"
          >
            <span>
              <q-btn
                v-if="tracker_store.running"
                class="tw:px-4!"
                :icon="fasBackward"
                aria-label="Previous round"
                @click="
                  tracker_store.prevRound();
                  setSheetFromIndex(tracker_store.trackerList.active_index);
                "
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Previous round
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="tracker_store.running"
                class="tw:px-4!"
                :icon="fasAngleLeft"
                aria-label="Previous turn"
                @click="
                  tracker_store.prevTurn();
                  setSheetFromIndex(tracker_store.trackerList.active_index);
                "
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Previous turn
                </q-tooltip>
              </q-btn>
            </span>
            <q-btn
              class="tw:grow!"
              :icon="tracker_store.running ? mdiClose : mdiSwordCross"
              :label="
                tracker_store.running ? 'End Encounter' : 'Begin Encounter'
              "
              aria-label="Toggle tracker running"
              @click="
                tracker_store.running = !tracker_store.running;
                if (tracker_store.running) {
                  tracker_store.round = 1;
                  setSheetFromIndex(tracker_store.trackerList.active_index);
                } else {
                  tracker_store.resetTracker();
                }
              "
            />
            <span>
              <q-btn
                v-if="tracker_store.running"
                class="tw:px-4!"
                :icon="fasAngleRight"
                aria-label="Next round"
                @click="
                  tracker_store.nextTurn();
                  setSheetFromIndex(tracker_store.trackerList.active_index);
                "
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Next turn
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="tracker_store.running"
                class="tw:px-4!"
                :icon="fasForward"
                aria-label="Previous turn"
                @click="
                  tracker_store.nextRound();
                  setSheetFromIndex(tracker_store.trackerList.active_index);
                "
              >
                <q-tooltip
                  class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                  anchor="top middle"
                  self="bottom middle"
                >
                  Next round
                </q-tooltip>
              </q-btn>
            </span>
          </div>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>

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
