<script setup lang="ts">
import { settingsStore } from "@/stores/settings";
import { trackerStore } from "@/stores/tracker";
import { getGameFont, getGameFontSize, openSheet } from "@/utils/sheet";
import { biBoxArrowUpRight } from "@quasar/extras/bootstrap-icons";
import {
  fasHeart,
  fasHeartCrack,
  fasPenToSquare
} from "@quasar/extras/fontawesome-v7";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const settings_store = settingsStore();
const tracker_store = trackerStore();

const detailedElement = computed(
  () => tracker_store.trackerList.list[tracker_store.trackerList.detail_index]
);

const changeHealthInput = ref(0);

const validateNumber = (newValue: unknown): number => {
  const val = Number(newValue);
  if (Number.isNaN(val) || val < 0) {
    return 0;
  } else if (val > 9999) {
    return 9999;
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
</script>

<template>
  <div class="tw:h-full">
    <div
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
      <q-scroll-area class="tw:h-full">
        <div
          v-if="detailedElement"
          class="tw:h-full tw:m-6 tw:text-gray-800 tw:dark:text-white"
        >
          <div v-if="detailedElement.is_player" class="tw:flex tw:my-3">
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
          </div>
          <div
            v-else
            class="tw:flex tw:my-3"
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
              class="tw:px-2! only-screen encounter-page-element"
              aria-label="Open creature sheet"
              @click="
                openSheet(
                  router,
                  detailedElement.element.is_hazard ? 'hazard' : 'bestiary',
                  detailedElement.element.game ?? settings_store.game,
                  detailedElement.element.id ?? 0,
                  !detailedElement.element.is_hazard
                    ? detailedElement.element.variant
                    : null
                )
              "
            >
              <q-tooltip
                class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
                anchor="top middle"
                self="bottom middle"
              >
                {{
                  "Open " +
                  (detailedElement.element.is_hazard ? "hazard" : "creature") +
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
                'https://2e.aonsrd.com/search?q=' +
                encodeURIComponent(detailedElement.element.name) +
                ' type%3A(creature)&type=eqs'
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
          </div>
          <q-separator class="tw:my-2!" style="height: 2px" />
          <div
            v-if="
              detailedElement.is_player || detailedElement.max_health !== null
            "
          >
            <b class="tw:flex tw:text-xl tw:mt-3">
              <span class="tw:mt-1.5"> HP </span>
              <q-space />
              <span class="tw:flex">
                <q-input
                  :model-value="detailedElement.health"
                  dense
                  borderless
                  class="tw:max-w-12! tw:max-h-8! tw:text-xl! tw:mr-1"
                  input-class="tw:text-xl! tw:font-bold! tw:text-end"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.health = validateNumber(v))
                  "
                />
                <q-input
                  :model-value="detailedElement.max_health"
                  dense
                  borderless
                  prefix="/"
                  class="tw:max-w-20! tw:max-h-8! tw:text-xl!"
                  input-class="tw:text-xl! tw:font-bold!"
                  type="number"
                  @update:model-value="
                    (v: unknown) =>
                      (detailedElement!.max_health = validateNumber(v))
                  "
                >
                  <template v-slot:after>
                    <q-icon
                      :name="fasPenToSquare"
                      size="xs"
                      class="tw:my-4 tw:pb-1 tw:text-gray-800 tw:dark:text-white"
                    />
                  </template>
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
            <div class="tw:flex tw:justify-center">
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
                standout
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
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>
