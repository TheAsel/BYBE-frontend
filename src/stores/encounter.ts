import { defineStore } from 'pinia';

import type { creature } from 'src/types/creature';
import type { encounter_list, min_creature_hazard } from 'src/types/encounter';
import type { variants } from 'src/types/filters';
import type { hazard } from 'src/types/hazard';

export const encounterStore = defineStore('encounter', {
  state: () => ({
    selectedCreature: {} as creature | null,
    selectedHazard: {} as hazard | null,
    encounters: [{ name: 'Default', creatures: [] }] as encounter_list[],
    activeEncounter: 0,
    is_pwl_on: false,
    generating: false
  }),
  getters: {
    getSelectedCreature: (state) => state.selectedCreature,
    getSelectedHazard: (state) => state.selectedHazard,
    getEncounters: (state) => state.encounters,
    getActive: (state) => state.activeEncounter,
    getActiveEncounter: (state) => state.encounters[state.activeEncounter],
    getPwl: (state) => state.is_pwl_on,
    getGenerating: (state) => state.generating
  },
  actions: {
    setSelectedCreature(newSelectedCreature: creature) {
      this.selectedHazard = null;
      this.selectedCreature = newSelectedCreature;
    },
    setSelectedHazard(newSelectedHazard: hazard) {
      this.selectedCreature = null;
      this.selectedHazard = newSelectedHazard;
    },
    removeSelectedCreature() {
      this.selectedCreature = null;
    },
    removeSelectedHazard() {
      this.selectedHazard = null;
    },
    clearEncounter() {
      this.encounters[this.activeEncounter]!.creatures.splice(
        0,
        this.encounters[this.activeEncounter]!.creatures.length
      );
    },
    clearCreature(creature: min_creature_hazard) {
      const index = this.encounters[this.activeEncounter]!.creatures.indexOf(creature);
      this.encounters[this.activeEncounter]!.creatures.splice(index, 1);
    },
    changeVariant(index: number, variant: variants) {
      this.encounters[this.activeEncounter]!.creatures[index]!.variant = variant;
    },
    addToEncounter(creature: min_creature_hazard, index?: number) {
      if (index! >= 0) {
        if (creature.quantity) {
          creature.quantity++;
        } else {
          creature.quantity = 1;
        }
        this.encounters[this.activeEncounter]!.creatures.splice(index!, 1, creature);
      } else {
        const newCreature = { ...creature };
        newCreature.quantity = 1;
        this.encounters[this.activeEncounter]!.creatures.push(newCreature);
      }
    },
    removeFromEncounter(index: number) {
      if (this.encounters[this.activeEncounter]!.creatures[index]!.quantity! > 1) {
        this.encounters[this.activeEncounter]!.creatures[index]!.quantity!--;
      } else {
        this.encounters[this.activeEncounter]!.creatures.splice(index, 1);
      }
    },
    changeActiveEncounter(encounterIndex: number) {
      if (encounterIndex >= this.encounters.length || encounterIndex < 0) {
        this.activeEncounter = 0;
      } else {
        this.activeEncounter = encounterIndex;
      }
    },
    addEncounter(encounterName: string) {
      this.encounters.push({ name: encounterName, creatures: [] });
      this.activeEncounter = this.encounters.length - 1;
    },
    removeEncounter() {
      this.encounters.splice(this.activeEncounter, 1);
      this.activeEncounter = 0;
      if (this.encounters.length <= 0) {
        this.encounters = [{ name: 'Default', creatures: [] }];
      }
    },
    getEncounterIndex(encounterName: string): number {
      return this.encounters.map((encounter) => encounter.name).indexOf(encounterName);
    },
    updateEncounter(encounterName: string, newCreatures: min_creature_hazard[]) {
      const encounterIndex = this.getEncounterIndex(encounterName);
      if (encounterIndex >= 0) {
        this.encounters[encounterIndex]!.creatures = newCreatures;
      }
    },
    updateEncounters(newEncounters: encounter_list[]) {
      this.encounters = newEncounters;
    },
    setPwL(newPwl: boolean) {
      this.is_pwl_on = newPwl;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    }
  }
});
