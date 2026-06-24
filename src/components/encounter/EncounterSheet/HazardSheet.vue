<script setup lang="ts">
import {
  biBoxArrowUpRight,
  biLock,
  biUnlock,
  biXLg
} from "@quasar/extras/bootstrap-icons";
import { useRouter } from "vue-router";

import TraitsList from "@/components/generic/TraitsList.vue";
import { encounterStore } from "@/stores/encounter";
import { settingsStore } from "@/stores/settings";
import { trackerStore } from "@/stores/tracker";
import {
  addPlus,
  cleanDescription,
  getGameAonLink,
  getGameFont,
  getGameFontSize,
  openSheet,
  pfActionSymbol
} from "@/utils/sheet";
import { computed } from "vue";

const router = useRouter();

const encounter_store = encounterStore();
const settings_store = settingsStore();
const tracker_store = trackerStore();

const selectedHazard = computed(() => encounter_store.selectedHazard);
const coreHazard = computed(() => selectedHazard.value?.core_hazard);
</script>

<template>
  <span v-if="selectedHazard && coreHazard">
    <div
      class="tw:flex tw:font-bold tw:text-2xl tw:text-gray-800 tw:dark:text-white"
      :style="
        'font-family: ' +
        getGameFont(selectedHazard.game ?? settings_store.game) +
        ', sans-serif; font-variant-caps: small-caps'
      "
    >
      <div class="tw:my-auto!">
        <q-btn
          :icon="tracker_store.lockSheet ? biLock : biUnlock"
          flat
          round
          dense
          size="md"
          padding="sm"
          class="tw:mr-1 tw:my-auto only-screen tracker-page-element"
          :aria-label="
            (tracker_store.lockSheet ? 'Unlock' : 'Lock') + ' hazard sheet'
          "
          @click="tracker_store.lockSheet = !tracker_store.lockSheet"
        >
          <q-tooltip
            class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
            anchor="top middle"
            self="bottom middle"
          >
            {{
              (tracker_store.lockSheet ? "Unlock" : "Lock") + " hazard sheet"
            }}
          </q-tooltip>
        </q-btn>
      </div>
      <div class="tw:my-auto!">
        <q-btn
          :icon="biBoxArrowUpRight"
          flat
          round
          dense
          size="sm"
          padding="sm"
          class="tw:mr-1 tw:my-auto only-screen encounter-page-element"
          aria-label="Open hazard sheet"
          @click="
            openSheet(
              router,
              'hazard',
              selectedHazard.game ?? settings_store.game,
              coreHazard.essential.id ?? 0
            )
          "
        >
          <q-tooltip
            class="text-caption tw:bg-gray-700! tw:text-gray-200! tw:rounded-md tw:shadow-sm tw:dark:bg-slate-700!"
            anchor="top middle"
            self="bottom middle"
          >
            Open hazard sheet
          </q-tooltip>
        </q-btn>
      </div>
      <a
        class="tw:my-auto"
        :href="
          'https://2e.' +
          getGameAonLink(selectedHazard.game ?? settings_store.game) +
          '.com/search?q=' +
          encodeURIComponent(coreHazard.essential.name) +
          ' type%3A(hazard)&type=eqs'
        "
        target="_blank"
        rel="noopener"
      >
        <h1
          :class="
            getGameFontSize(
              encounter_store.selectedHazard?.game ?? settings_store.game
            ) +
            ' tw:mr-4 tw:leading-8 tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400'
          "
        >
          {{ coreHazard.essential.name }}
        </h1>
      </a>
      <q-space />
      <div class="tw:my-1 tw:text-2xl!">
        Hazard
        <span>{{ coreHazard.essential.level }}</span>
      </div>
      <div class="tw:my-auto!">
        <q-btn
          class="tw:ml-2! only-screen encounter-page-element"
          :icon="biXLg"
          size="sm"
          padding="sm"
          flat
          round
          dense
          aria-label="Remove selected hazard"
          @click="
            encounter_store.removeSelectedHazard();
            tracker_store.removeSelectedHazard();
          "
        />
      </div>
    </div>
    <q-separator class="tw:my-2!" style="height: 2px" />
    <hr
      class="only-print"
      style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
    />
    <div class="tw:flex tw:flex-wrap tw:font-bold tw:text-sm tw:text-white">
      <div
        v-if="coreHazard.essential.rarity === 'Uncommon'"
        class="tw:bg-[#c45500] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ coreHazard.essential.rarity.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ coreHazard.essential.rarity.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "Something of uncommon rarity requires special training or comes from a particular culture or part of the world. Some character choices give access to uncommon options, and the GM can choose to allow access for anyone. Less is known about uncommon creatures than common creatures. They typically can't be summoned. The DC of Recall Knowledge checks related to these creature is increased by 2."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        v-else-if="coreHazard.essential.rarity === 'Rare'"
        class="tw:bg-[#0c1466] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ coreHazard.essential.rarity.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ coreHazard.essential.rarity.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "This rarity indicates that a rules element is very difficult to find in the game world. A rare feat, spell, item or the like is available to players only if the GM decides to include it in the game, typically through discovery during play. Creatures with this trait are rare. They typically can't be summoned. The DC of Recall Knowledge checks related to these creatures is increased by 5."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        v-else-if="coreHazard.essential.rarity === 'Unique'"
        class="tw:bg-[#800080] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ coreHazard.essential.rarity.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ coreHazard.essential.rarity.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "A rules element with this trait is one-of-a-kind. The DC of Recall Knowledge checks related to creatures with this trait is increased by 10."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        class="tw:bg-[#478c42] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <a
          class="tw:text-white! tw:decoration-2 tw:hover:underline"
          :href="
            settings_store.game === 'sf'
              ? 'https://2e.aonsrd.com/rules/407-size-space-and-reach'
              : 'https://2e.aonprd.com/rules?id=2359'
          "
          target="_blank"
          rel="noopener"
        >
          {{ coreHazard.essential.size.toUpperCase() }}
        </a>
      </div>
      <div
        v-if="coreHazard.essential.complexity === 'Complex'"
        class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >COMPLEX<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>COMPLEX</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span>{{
              "A hazard with this trait takes turns in an encounter_store."
            }}</span>
          </q-tooltip>
        </span>
      </div>
      <div
        v-for="item in coreHazard.traits"
        :key="item.name"
        class="tw:bg-[#522e2c] tw:border-2 tw:border-[#d8c483] tw:my-1 tw:p-1"
      >
        <span
          v-if="item.description !== null"
          class="tw:text-white! tw:decoration-2 tw:hover:underline"
          >{{ item.display_name?.toUpperCase()
          }}<q-tooltip
            style="
              font-family:
                Good Pro,
                sans-serif;
            "
            class="tw:text-base! tw:max-w-md! tw:border tw:rounded-md tw:shadow-sm tw:text-gray-800! tw:dark:text-gray-200! tw:bg-white! tw:dark:bg-gray-800! tw:border-gray-800! tw:dark:border-white!"
          >
            <strong>{{ item.display_name?.toUpperCase() }}</strong>
            <q-separator class="tw:my-1!" style="height: 2px" />
            <span v-html="cleanDescription(item.description)" /> </q-tooltip
        ></span>
        <span v-else>{{ item.display_name?.toUpperCase() }}</span>
      </div>
    </div>
    <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
      <div
        v-if="coreHazard.essential.source"
        class="tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <strong>Source </strong>
        <a
          :href="
            'https://store.paizo.com/search.php?search_query=' +
            encodeURIComponent(coreHazard.essential.source) +
            '&section=product'
          "
          target="_blank"
          rel="noopener"
        >
          <i
            class="tw:text-blue-600 tw:decoration-2 tw:hover:underline tw:dark:text-blue-400"
          >
            {{ coreHazard.essential.source }}
          </i>
        </a>
      </div>
      <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
        <strong>Complexity </strong>
        {{ coreHazard.essential.complexity }}
      </div>
      <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
        <strong>Stealth</strong>
        <span v-if="coreHazard.essential.stealth !== null">
          {{ " DC " + (coreHazard.essential.stealth + 10) + " " }}
        </span>
        <span
          v-if="coreHazard.essential.stealth_detail"
          class="v-html"
          v-html="cleanDescription(coreHazard.essential.stealth_detail)"
        />
      </div>
      <div
        v-if="coreHazard.essential.description"
        class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
        v-html="
          '<strong>Description</strong> ' +
          cleanDescription(coreHazard.essential.description)
        "
      />
    </div>
    <q-separator class="tw:my-2!" style="height: 2px" />
    <hr
      class="only-print"
      style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
    />
    <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
      <div
        v-if="coreHazard.essential.disable_description"
        class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
        v-html="
          '<strong>Disable</strong> ' +
          cleanDescription(coreHazard.essential.disable_description)
        "
      />
      <div
        v-if="
          coreHazard.essential.ac ||
          coreHazard.essential.fortitude ||
          coreHazard.essential.reflex ||
          coreHazard.essential.will
        "
        class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <span v-if="coreHazard.essential.ac">
          <strong>AC</strong>
          {{ " " + coreHazard.essential.ac + "; " }}
        </span>
        <span v-if="coreHazard.essential.fortitude">
          <strong>Fort</strong>
          {{ " " + addPlus(coreHazard.essential.fortitude) + "; " }}
        </span>
        <span v-if="coreHazard.essential.reflex">
          <strong>Ref</strong>
          {{ " " + addPlus(coreHazard.essential.reflex) + "; " }}
        </span>
        <span v-if="coreHazard.essential.will">
          <strong>Will</strong>
          {{ " " + addPlus(coreHazard.essential.will) + "; " }}
        </span>
      </div>
      <div
        v-if="
          coreHazard.essential.hardness ||
          (coreHazard.essential.has_health && coreHazard.essential.hp)
        "
        class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
      >
        <span v-if="coreHazard.essential.hardness">
          <strong>Hardness</strong>
          {{ " " + coreHazard.essential.hardness + "; " }}
        </span>
        <span v-if="coreHazard.essential.has_health && coreHazard.essential.hp">
          <strong>HP</strong>
          {{ " " + coreHazard.essential.hp + "; " }}
        </span>
      </div>
      <span v-for="action in coreHazard.actions" :key="action.core_action.name">
        <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
          <strong>{{ action.core_action.name + " " }}</strong>
          <span
            style="font-family: Pathfinder2eActions, sans-serif"
            class="tw:text-2xl"
            >{{
              pfActionSymbol(
                action.core_action.n_of_actions,
                action.core_action.action_type
              ) + " "
            }}
          </span>
          <TraitsList :traits="action.traits" />
          <span
            class="v-html"
            v-html="' ' + cleanDescription(action.core_action.description)"
          />
        </div>
      </span>
    </div>
    <span v-if="coreHazard.essential.routine_description">
      <q-separator class="tw:my-2!" style="height: 2px" />
      <hr
        class="only-print"
        style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
      />
      <div class="tw:-indent-2 tw:pl-2 q-gutter-y-xs">
        <div class="tw:text-base tw:text-gray-800 tw:dark:text-white">
          <span
            class="v-html"
            v-html="
              '<p><strong>Routine</strong> ' +
              cleanDescription(coreHazard.essential.routine_description)
            "
          />
        </div>
      </div>
    </span>
    <q-separator
      v-if="coreHazard.essential.reset_description"
      class="tw:my-2!"
      style="height: 2px"
    />
    <hr
      v-if="coreHazard.essential.reset_description"
      class="only-print"
      style="border: 1px solid #e0e0e0; margin-top: 0; margin-bottom: 8px"
    />
    <div
      v-if="coreHazard.essential.reset_description"
      class="tw:-indent-2 tw:pl-2 q-gutter-y-xs"
    >
      <div
        class="v-html tw:text-base tw:text-gray-800 tw:dark:text-white"
        v-html="
          '<p><strong>Reset</strong> ' +
          cleanDescription(coreHazard.essential.reset_description) +
          '</p>'
        "
      />
    </div>
  </span>
</template>

<style>
.action-glyph {
  font-family: "Pathfinder2eActions", sans-serif;
  font-size: 24px;
  line-height: calc(2 / 1.5);
}

.v-html > p {
  margin: 0 0 4px !important;
}
</style>

<style scoped>
.hazard-sheet {
  font-family: "Good Pro", sans-serif;
}

.q-select:deep(.q-field__native) > span {
  font-weight: bold;
}
</style>
