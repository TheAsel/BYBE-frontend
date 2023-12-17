import { party } from 'src/types/party';
import { creature } from 'src/types/creature';
import { encounter } from 'src/types/encounter';
import { defineStore } from 'pinia';

export const partyStore = defineStore('party', {
  state: () => ({
    parties: [{ name: 'Default', members: [1, 1, 1, 1] }] as party[],
    activeParty: 0
  }),
  getters: {
    getParties: (state) => state.parties,
    getActive: (state) => state.activeParty,
    getActiveParty: (state) => state.parties[state.activeParty]
  },
  actions: {
    getPartyIndex(partyName: string): number {
      return this.parties.map((party) => party.name).indexOf(partyName);
    },
    updateParty(partyName: string, newMembers: number[]) {
      const partyIndex = this.getPartyIndex(partyName);
      if (partyIndex >= 0) {
        this.parties[partyIndex].members = newMembers;
      }
    },
    updateParties(newParties: party[]) {
      this.parties = newParties;
    },
    changeActiveParty(partyIndex: number) {
      if (partyIndex >= this.parties.length || partyIndex < 0) {
        this.activeParty = 0;
      } else {
        this.activeParty = partyIndex;
      }
    },
    addParty(partyName: string) {
      this.parties.push({ name: partyName, members: [1, 1, 1, 1] });
      this.activeParty = this.parties.length - 1;
    },
    removeParty() {
      this.parties.splice(this.activeParty, 1);
      this.activeParty = 0;
      if (this.parties.length <= 0) {
        this.parties = [{ name: 'Default', members: [1, 1, 1, 1] }];
      }
    }
  }
});

export const filtersStore = defineStore('filters', {
  state: () => ({
    filters: {
      traits: [] as string[],
      alignments: [] as string[],
      sizes: [] as string[],
      rarities: [] as string[],
      families: [] as string[],
      creature_types: [] as string[],
      sources: [] as string[]
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
      this.filters.alignments = newAlignments;
    },
    updateSizes(newSizes: string[]) {
      newSizes.reverse();
      this.filters.sizes = newSizes;
    },
    updateRarities(newRarities: string[]) {
      this.filters.rarities = newRarities;
    },
    updateFamilies(newFamilies: string[]) {
      this.filters.families = newFamilies;
    },
    updateCreatureType(newCreatureType: string[]) {
      this.filters.creature_types = newCreatureType;
    },
    updateSources(newSources: string[]) {
      this.filters.sources = newSources;
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
