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
