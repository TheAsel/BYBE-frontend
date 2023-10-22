import { creature } from 'src/types/creature';
import { encounter } from 'src/types/encounter';
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
      traits: [] as string[],
      alignment: [] as string[],
      size: [] as string[],
      rarity: [] as string[],
      family: [] as string[]
    }
  }),
  getters: {
    getFilters: (state) => state.filters
  },
  actions: {
    updateTraits(newTraits: string[]) {
      this.filters.traits = newTraits;
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
    },
    updateFamilies(newFamilies: string[]) {
      this.filters.family = newFamilies;
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

export const infoStore = defineStore('info', {
  state: () => ({
    info: {
      experience: 0,
      challenge: 'Trivial',
      encounter_exp_levels: {
        Moderate: 0,
        Trivial: 0,
        Low: 0,
        Extreme: 0,
        Severe: 0,
        Impossible: 0
      },
      color: 'lime'
    } as encounter
  }),
  getters: {
    getInfo: (state) => state.info
  },
  actions: {
    setInfo(info: encounter) {
      this.info = info;
      switch (info.challenge) {
        case 'Trivial':
          this.info.color = 'lime';
          break;
        case 'Low':
          this.info.color = 'green';
          break;
        case 'Moderate':
          this.info.color = 'amber';
          break;
        case 'Severe':
          this.info.color = 'orange';
          break;
        case 'Extreme':
          this.info.color = 'red';
          break;
        case 'Impossible':
          this.info.color = 'purple-10';
          break;
        default:
          this.info.color = 'lime';
          break;
      }
    }
  }
});
