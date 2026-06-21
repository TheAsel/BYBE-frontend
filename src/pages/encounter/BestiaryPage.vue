<script setup lang="ts">
import { matPrint, matPriorityHigh } from "@quasar/extras/material-icons";
import { useHead } from "@unhead/vue";
import { isNull } from "lodash-es";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { requestCreatureId } from "@/api/encounter-api-calls";
import EncounterSheet from "@/components/encounter/EncounterSheet.vue";
import { encounterStore } from "@/stores/encounter";
import { settingsStore } from "@/stores/settings";

import type { creature } from "@/types/creature";
import type { variants } from "@/types/filters";

const title = ref("Bestiary Sheet - BYBE");

useHead({
  link: [
    {
      href: "https://bybe.app/bestiary",
      rel: "canonical"
    }
  ],
  title
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const encounters = encounterStore();
const settings_store = settingsStore();

const creatureId = Number(route.query.id);
const queryVariant: string = String(route.query.variant).toLowerCase();
const creatureVariant = ref<variants>("Base");

let creatureData: creature | null;
try {
  if (creatureId && !Number.isNaN(creatureId)) {
    switch (queryVariant) {
      case "weak": {
        creatureVariant.value = "Weak";
        creatureData = await requestCreatureId(
          settings_store.game,
          creatureId,
          "Weak",
          settings_store.is_pwl_on
        );
        break;
      }
      case "elite": {
        creatureVariant.value = "Elite";
        creatureData = await requestCreatureId(
          settings_store.game,
          creatureId,
          "Elite",
          settings_store.is_pwl_on
        );
        break;
      }
      default: {
        creatureVariant.value = "Base";
        creatureData = await requestCreatureId(
          settings_store.game,
          creatureId,
          "Base",
          settings_store.is_pwl_on
        );
        break;
      }
    }
    if (!creatureData) {
      console.error("Missing creature ID");
      $q.notify({
        icon: matPriorityHigh,
        message: "Missing creature ID",
        progress: true,
        type: "warning"
      });
      await router.push({
        name: "encounter",
        query: { game: settings_store.game }
      });
    } else if (creatureVariant.value === "Base") {
      title.value = `${creatureData?.core_data.essential.name} - BYBE`;
      encounters.setSelectedCreature(creatureData);
    } else {
      title.value = `${creatureVariant.value} ${
        creatureData?.core_data.essential.name
      } - BYBE`;
      encounters.setSelectedCreature(creatureData);
    }
    if (creatureData?.combat_data?.weapons) {
      creatureData?.combat_data?.weapons.sort((a, b) => {
        if (
          a.weapon_data?.damage_data[0].dice?.dice_size &&
          b.weapon_data?.damage_data[0].dice?.dice_size
        ) {
          return (
            b.weapon_data.damage_data[0].dice?.dice_size -
            a.weapon_data.damage_data[0].dice?.dice_size
          );
        } else {
          return 0;
        }
      });
      creatureData?.combat_data?.weapons.sort((a, b) => {
        if (a.weapon_data?.to_hit_bonus && b.weapon_data?.to_hit_bonus) {
          return b.weapon_data.to_hit_bonus - a.weapon_data.to_hit_bonus;
        } else {
          return 0;
        }
      });
      creatureData?.combat_data?.weapons.sort((a, b) => {
        if (a.weapon_data?.weapon_type && b.weapon_data?.weapon_type) {
          return a.weapon_data.weapon_type.localeCompare(
            b.weapon_data.weapon_type
          );
        } else {
          return 0;
        }
      });
    }
  } else {
    console.error("Invalid creature ID");
    $q.notify({
      icon: matPriorityHigh,
      message: "Invalid creature ID",
      progress: true,
      type: "warning"
    });
    await router.push({
      name: "encounter",
      query: { game: settings_store.game }
    });
  }
} catch (error) {
  console.error(error);
}

const printPage = (): void => {
  globalThis.print();
};
</script>

<template>
  <EncounterSheet
    class="tw:mx-auto encounter-page q-pa-md tw:w-full tw:md:w-228"
  />
  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
    class="tw:z-10 only-screen tw:opacity-85"
  >
    <q-btn
      fab
      :icon="matPrint"
      color="primary"
      aria-label="Print creature sheet"
      @click="printPage"
    />
  </q-page-sticky>
</template>
