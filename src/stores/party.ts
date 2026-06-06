import { defineStore } from 'pinia';

import type { party } from 'src/types/party';

export const partyStore = defineStore('party', {
  state: () => ({
    parties: [
      { name: 'Default', size: 4, level: 1, advanced: false, members: [1, 1, 1, 1] }
    ] as party[],
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
    updateParty(newParty: party) {
      const partyIndex = this.getPartyIndex(newParty.name);
      if (this.parties[partyIndex] && partyIndex >= 0) {
        this.parties[partyIndex] = newParty;
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
      this.parties.push({
        name: partyName,
        size: 4,
        level: 1,
        advanced: false,
        members: [1, 1, 1, 1]
      });
      this.activeParty = this.parties.length - 1;
    },
    removeParty() {
      this.parties.splice(this.activeParty, 1);
      this.activeParty = 0;
      if (this.parties.length <= 0) {
        this.parties = [
          { name: 'Default', size: 4, level: 1, advanced: false, members: [1, 1, 1, 1] }
        ];
      }
    }
  }
});
