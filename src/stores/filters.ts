import { capitalize } from "lodash-es";
import { defineStore } from "pinia";

import type {
  bestiary_ranges,
  hazard_ranges,
  shop_ranges
} from "@/types/filters";

export const filtersStore = defineStore("filters", {
  state: () => ({
    creatureFilters: {
      traits: [] as string[],
      alignments: [] as string[],
      sizes: [] as string[],
      rarities: [] as string[],
      families: [] as string[],
      creature_types: [] as string[],
      sources: [] as string[],
      creature_roles: [] as string[]
    },
    creatureRanges: {} as bestiary_ranges,
    hazardFilters: {
      traits: [] as string[],
      complexities: [] as string[],
      sizes: [] as string[],
      rarities: [] as string[],
      sources: [] as string[]
    },
    hazardRanges: {} as hazard_ranges,
    itemFilters: {
      sources: [] as string[],
      traits: [{}] as { label: string; value: string }[]
    },
    shopRanges: {} as shop_ranges
  }),
  actions: {
    updateTraits(newTraits: string[]) {
      this.creatureFilters.traits = newTraits.map(trait => {
        return capitalize(trait);
      });
    },
    updateAlignments(newAlignments: string[]) {
      this.creatureFilters.alignments = newAlignments;
    },
    updateSizes(newSizes: string[]) {
      newSizes.reverse();
      this.creatureFilters.sizes = newSizes;
    },
    updateRarities(newRarities: string[]) {
      this.creatureFilters.rarities = newRarities;
    },
    updateFamilies(newFamilies: string[]) {
      this.creatureFilters.families = newFamilies;
    },
    updateCreatureType(newCreatureType: string[]) {
      this.creatureFilters.creature_types = newCreatureType;
    },
    updateSources(newSources: string[]) {
      this.creatureFilters.sources = newSources;
    },
    updateRoles(newRoles: string[]) {
      this.creatureFilters.creature_roles = newRoles;
    },
    updateHazardTraits(newTraits: string[]) {
      this.hazardFilters.traits = newTraits.map(trait => {
        return capitalize(trait);
      });
    },
    updateHazardSizes(newSizes: string[]) {
      newSizes.reverse();
      this.hazardFilters.sizes = newSizes;
    },
    updateHazardRarities(newRarities: string[]) {
      this.hazardFilters.rarities = newRarities;
    },
    updateHazardSources(newSources: string[]) {
      this.hazardFilters.sources = newSources;
    },
    updateItemSources(newSources: string[]) {
      this.itemFilters.sources = newSources;
    },
    updateItemTraits(newTraits: string[]) {
      this.itemFilters.traits = newTraits.map(trait => ({
        label: trait
          .split("-")
          .map(str => capitalize(str))
          .join(" ")
          .replace("Additive", "Additive "),
        value: trait
      }));
    }
  }
});
