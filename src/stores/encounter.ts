import { defineStore } from "pinia";

import type { creature } from "@/types/creature";
import type { encounter_list, min_creature_hazard } from "@/types/encounter";
import type { variants } from "@/types/filters";
import type { hazard } from "@/types/hazard";

export const encounterStore = defineStore("encounter_store", {
  state: (): {
    selectedCreature: creature | null;
    selectedHazard: hazard | null;
    encounters: encounter_list[];
    activeEncounter: number;
    generating: boolean;
  } => ({
    activeEncounter: 0,
    encounters: [{ creatures: [], name: "Default" }],
    generating: false,
    selectedCreature: null,
    selectedHazard: null
  }),
  actions: {
    addEncounter(encounterName: string) {
      this.encounters.push({ creatures: [], name: encounterName });
      this.activeEncounter = this.encounters.length - 1;
    },
    addToEncounter(creature: min_creature_hazard, index?: number) {
      if (index! >= 0) {
        if (creature.quantity) {
          creature.quantity += 1;
        } else {
          creature.quantity = 1;
        }
        this.encounters[this.activeEncounter]!.creatures.splice(
          index!,
          1,
          creature
        );
      } else {
        const newCreature = { ...creature };
        newCreature.quantity = 1;
        this.encounters[this.activeEncounter]!.creatures.push(newCreature);
      }
    },
    changeActiveEncounter(encounterIndex: number) {
      if (encounterIndex >= this.encounters.length || encounterIndex < 0) {
        this.activeEncounter = 0;
      } else {
        this.activeEncounter = encounterIndex;
      }
    },
    changeVariant(index: number, variant: variants) {
      this.encounters[this.activeEncounter]!.creatures[index]!.variant =
        variant;
    },
    clearCreature(creature: min_creature_hazard) {
      const index =
        this.encounters[this.activeEncounter]!.creatures.indexOf(creature);
      this.encounters[this.activeEncounter]!.creatures.splice(index, 1);
    },
    clearEncounter() {
      this.encounters[this.activeEncounter]!.creatures.splice(
        0,
        this.encounters[this.activeEncounter]!.creatures.length
      );
    },
    getEncounterIndex(encounterName: string): number {
      return this.encounters
        .map(encounter => encounter.name)
        .indexOf(encounterName);
    },
    removeEncounter() {
      this.encounters.splice(this.activeEncounter, 1);
      this.activeEncounter = 0;
      if (this.encounters.length <= 0) {
        this.encounters = [{ creatures: [], name: "Default" }];
      }
    },
    removeFromEncounter(index: number) {
      if (
        this.encounters[this.activeEncounter]!.creatures[index]!.quantity! > 1
      ) {
        this.encounters[this.activeEncounter]!.creatures[index]!.quantity! -= 1;
      } else {
        this.encounters[this.activeEncounter]!.creatures.splice(index, 1);
      }
    },
    removeSelectedCreature() {
      this.selectedCreature = null;
    },
    removeSelectedHazard() {
      this.selectedHazard = null;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    },
    setSelectedCreature(newSelectedCreature: creature) {
      this.selectedHazard = null;
      this.selectedCreature = newSelectedCreature;
    },
    setSelectedHazard(newSelectedHazard: hazard) {
      this.selectedCreature = null;
      this.selectedHazard = newSelectedHazard;
    },
    updateEncounter(
      encounterName: string,
      newCreatures: min_creature_hazard[]
    ) {
      const encounterIndex = this.getEncounterIndex(encounterName);
      if (encounterIndex >= 0) {
        this.encounters[encounterIndex]!.creatures = newCreatures;
      }
    },
    updateEncounters(newEncounters: encounter_list[]) {
      this.encounters = newEncounters;
    }
  }
});
