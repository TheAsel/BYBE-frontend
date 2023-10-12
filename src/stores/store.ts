import { creature } from '../types/creature';
import { defineStore } from 'pinia';

export const partyStore = defineStore('party', {
  state: () => ({ party: [1, 1, 1, 1] }),
  getters: {
    getParty: (state) => state.party
  },
  actions: {
    updateParty(newParty: number[]) {
      this.party = newParty;
    },
    updatePartyIndex(newValue: number, index: number) {
      this.party[index] = newValue;
    },
    addPlayer() {
      this.party.push(1);
    },
    removePlayer(index: number) {
      this.party.splice(index, 1);
    }
  }
});

export const filtersStore = defineStore('filters', {
  state: () => ({
    filters: {
      family: [] as string[],
      alignment: [] as string[],
      size: [] as string[],
      rarity: [] as string[]
    }
  }),
  getters: {
    getFilters: (state) => state.filters
  },
  actions: {
    updateFamilies(newFamilies: string[]) {
      this.filters.family = newFamilies;
    },
    updateAlignments(newAlignments: string[]) {
      this.filters.alignment = newAlignments;
    },
    updateSizes(newSizes: string[]) {
      newSizes.reverse();
      this.filters.size = newSizes;
    },
    updateRarities(newRarities: string[]) {
      this.filters.rarity = newRarities;
    }
  }
});

export const creaturesStore = defineStore('creatures', {
  state: () => ({ creatures: [] as creature[] }),
  getters: {
    getCreatures: (state) => state.creatures,
    getCreatureId: (state) => (id: number) => state.creatures.find((creature) => creature.id === id)
  },
  actions: {
    updateCreatures(newCreatures: creature[]) {
      this.creatures = newCreatures;
    },
    updateCreatureIndex(newValue: creature, index: number) {
      this.creatures[index] = newValue;
    },
    addPlayer(newCreature: creature) {
      this.creatures.push(newCreature);
    },
    removePlayer(index: number) {
      this.creatures.splice(index, 1);
    }
  }
});

export const encounterStore = defineStore('encounter', {
  state: () => ({ encounter: [] as creature[] }),
  getters: {
    getEncounter: (state) => state.encounter
  },
  actions: {
    clearEncounter() {
      this.encounter.splice(0, this.encounter.length);
    },
    clearCreature(creature: creature) {
      const index = this.encounter.indexOf(creature);
      this.encounter.splice(index, 1);
    },
    changeVariant(index: number, variant: 'weak' | 'base' | 'elite') {
      this.encounter[index].variant = variant;
    },
    addToEncounter(creature: creature, index?: number, variant?: 'weak' | 'base' | 'elite') {
      if (index! >= 0) {
        if (creature.quantity) {
          creature.quantity!++;
        } else {
          creature.quantity = 1;
        }
        this.encounter.splice(index!, 1, creature);
      } else {
        const newCreature = { ...creature };
        newCreature.quantity = 1;
        newCreature.variant = variant || 'base';
        this.encounter.push(newCreature);
      }
    },
    removeFromEncounter(index: number) {
      if (this.encounter[index].quantity! > 1) {
        this.encounter[index].quantity!--;
      } else {
        this.encounter.splice(index, 1);
      }
    }
  }
});
