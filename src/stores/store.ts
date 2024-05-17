import type { party } from 'src/types/party';
import type { creature, creature_encounter } from 'src/types/creature';
import type { encounter, encounterList } from 'src/types/encounter';
import { defineStore } from 'pinia';
import { capitalize } from 'lodash';
import type { roles } from 'src/types/filters';

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
      sources: [] as string[],
      creature_roles: [] as string[]
    }
  }),
  getters: {
    getFilters: (state) => state.filters
  },
  actions: {
    updateTraits(newTraits: string[]) {
      this.filters.traits = newTraits.map((trait) => {
        return capitalize(trait);
      });
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
    },
    updateRoles(newRoles: string[]) {
      this.filters.creature_roles = newRoles;
    }
  }
});

export const creaturesStore = defineStore('creatures', {
  state: () => ({ creatures: [] as creature[] }),
  getters: {
    getCreatures: (state) => state.creatures,
    getCreatureId: (state) => (id: number) =>
      state.creatures.find((creature) => creature.core_data.essential.id === id)
  },
  actions: {
    updateCreatures(newCreatures: creature[]) {
      // calculate the role of the creature, by picking the highest percentage that is at least over 50%
      newCreatures.forEach((creature) => {
        const rolePercentages: { role: roles; percentage: number }[] = [
          { role: 'Brute', percentage: creature.core_data.derived.brute_percentage },
          {
            role: 'Magical Striker',
            percentage: creature.core_data.derived.magical_striker_percentage
          },
          {
            role: 'Skill Paragon',
            percentage: creature.core_data.derived.skill_paragon_percentage
          },
          { role: 'Skirmisher', percentage: creature.core_data.derived.skirmisher_percentage },
          { role: 'Sniper', percentage: creature.core_data.derived.sniper_percentage },
          { role: 'Soldier', percentage: creature.core_data.derived.soldier_percentage },
          { role: 'SpellCaster', percentage: creature.core_data.derived.spell_caster_percentage }
        ];
        const highestRole = rolePercentages.reduce((prev, current) => {
          return prev.percentage > current.percentage ? prev : current;
        });
        if (highestRole.percentage >= 50) {
          creature.core_data.derived.creature_role = highestRole.role;
        } else {
          creature.core_data.derived.creature_role = 'None';
        }
      });
      this.creatures = newCreatures;
    }
  }
});

export const encounterStore = defineStore('encounter', {
  state: () => ({
    encounters: [{ name: 'Default', creatures: [] }] as encounterList[],
    activeEncounter: 0,
    is_pwl_on: false,
    generating: false
  }),
  getters: {
    getEncounters: (state) => state.encounters,
    getActive: (state) => state.activeEncounter,
    getActiveEncounter: (state) => state.encounters[state.activeEncounter],
    getGenerating: (state) => state.generating
  },
  actions: {
    clearEncounter() {
      this.encounters[this.activeEncounter].creatures.splice(
        0,
        this.encounters[this.activeEncounter].creatures.length
      );
    },
    clearCreature(creature: creature_encounter) {
      const index = this.encounters[this.activeEncounter].creatures.indexOf(creature);
      this.encounters[this.activeEncounter].creatures.splice(index, 1);
    },
    changeVariant(index: number, variant: 'Weak' | 'Base' | 'Elite') {
      this.encounters[this.activeEncounter].creatures[index].variant = variant;
    },
    addToEncounter(creature: creature_encounter, index?: number) {
      if (index! >= 0) {
        if (creature.quantity) {
          creature.quantity!++;
        } else {
          creature.quantity = 1;
        }
        this.encounters[this.activeEncounter].creatures.splice(index!, 1, creature);
      } else {
        const newCreature = { ...creature };
        newCreature.quantity = 1;
        this.encounters[this.activeEncounter].creatures.push(newCreature);
      }
    },
    removeFromEncounter(index: number) {
      if (this.encounters[this.activeEncounter].creatures[index].quantity! > 1) {
        this.encounters[this.activeEncounter].creatures[index].quantity!--;
      } else {
        this.encounters[this.activeEncounter].creatures.splice(index, 1);
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
    updateEncounter(encounterName: string, newCreatures: creature_encounter[]) {
      const encounterIndex = this.getEncounterIndex(encounterName);
      if (encounterIndex >= 0) {
        this.encounters[encounterIndex].creatures = newCreatures;
      }
    },
    updateEncounters(newEncounters: encounterList[]) {
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
