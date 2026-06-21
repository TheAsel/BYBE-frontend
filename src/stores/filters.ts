import { capitalize } from "lodash-es";
import { defineStore } from "pinia";

import type {
  bestiary_ranges,
  hazard_ranges,
  shop_ranges
} from "@/types/filters";

export const filtersStore = defineStore("filters_store", {
  actions: {
    updateAlignments(newAlignments: string[]) {
      this.creatureFilters.alignments = newAlignments;
    },
    updateCreatureType(newCreatureType: string[]) {
      this.creatureFilters.creature_types = newCreatureType;
    },
    updateFamilies(newFamilies: string[]) {
      this.creatureFilters.families = newFamilies;
    },
    updateHazardRarities(newRarities: string[]) {
      this.hazardFilters.rarities = newRarities;
    },
    updateHazardSizes(newSizes: string[]) {
      newSizes.reverse();
      this.hazardFilters.sizes = newSizes;
    },
    updateHazardSources(newSources: string[]) {
      this.hazardFilters.sources = newSources;
    },
    updateHazardTraits(newTraits: string[]) {
      this.hazardFilters.traits = newTraits.map(trait => capitalize(trait));
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
    },
    updateRarities(newRarities: string[]) {
      this.creatureFilters.rarities = newRarities;
    },
    updateRoles(newRoles: string[]) {
      this.creatureFilters.creature_roles = newRoles;
    },
    updateSizes(newSizes: string[]) {
      newSizes.reverse();
      this.creatureFilters.sizes = newSizes;
    },
    updateSources(newSources: string[]) {
      this.creatureFilters.sources = newSources;
    },
    updateTraits(newTraits: string[]) {
      this.creatureFilters.traits = newTraits.map(trait => capitalize(trait));
    }
  },
  state: (): {
    creatureFilters: {
      traits: string[];
      alignments: string[];
      sizes: string[];
      rarities: string[];
      families: string[];
      creature_types: string[];
      sources: string[];
      creature_roles: string[];
    };
    creatureRanges: bestiary_ranges;
    hazardFilters: {
      traits: string[];
      complexities: string[];
      sizes: string[];
      rarities: string[];
      sources: string[];
    };
    hazardRanges: hazard_ranges;
    itemFilters: {
      sources: string[];
      traits: {
        label: string;
        value: string;
      }[];
    };
    shopRanges: shop_ranges;
  } => ({
    creatureFilters: {
      alignments: [],
      creature_roles: [],
      creature_types: [],
      families: [],
      rarities: [],
      sizes: [],
      sources: [],
      traits: []
    },
    creatureRanges: {
      max_focus_points: 0,
      max_hp: 0,
      max_level: 0,
      min_focus_points: 0,
      min_hp: 0,
      min_level: 0
    },
    hazardFilters: {
      complexities: [],
      rarities: [],
      sizes: [],
      sources: [],
      traits: []
    },
    hazardRanges: {
      max_ac: 0,
      max_fortitude: 0,
      max_hardness: 0,
      max_hp: 0,
      max_level: 0,
      max_reflex: 0,
      max_stealth: 0,
      max_will: 0,
      min_ac: 0,
      min_fortitude: 0,
      min_hardness: 0,
      min_hp: 0,
      min_level: 0,
      min_reflex: 0,
      min_stealth: 0,
      min_will: 0
    },
    itemFilters: {
      sources: [],
      traits: []
    },
    shopRanges: {
      max_bulk: 0,
      max_hp: 0,
      max_level: 0,
      max_number_of_uses: 0,
      max_price: 0,
      max_quantity: 0,
      min_bulk: 0,
      min_hp: 0,
      min_level: 0,
      min_number_of_uses: 0,
      min_price: 0,
      min_quantity: 0
    }
  })
});
