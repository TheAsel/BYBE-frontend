import { defineStore } from "pinia";

import type { party } from "@/types/party";

export const partyStore = defineStore("party_store", {
  state: (): { parties: party[]; activeParty: number } => ({
    activeParty: 0,
    parties: [
      {
        name: "Default",
        size: 4,
        level: 1,
        advanced: false,
        members: [1, 1, 1, 1]
      }
    ]
  }),
  actions: {
    addParty(partyName: string) {
      this.parties.push({
        advanced: false,
        level: 1,
        members: [1, 1, 1, 1],
        name: partyName,
        size: 4
      });
      this.activeParty = this.parties.length - 1;
    },
    changeActiveParty(partyIndex: number) {
      if (partyIndex >= this.parties.length || partyIndex < 0) {
        this.activeParty = 0;
      } else {
        this.activeParty = partyIndex;
      }
    },
    getPartyIndex(partyName: string): number {
      return this.parties.map(party => party.name).indexOf(partyName);
    },
    removeParty() {
      this.parties.splice(this.activeParty, 1);
      this.activeParty = 0;
      if (this.parties.length <= 0) {
        this.parties = [
          {
            advanced: false,
            level: 1,
            members: [1, 1, 1, 1],
            name: "Default",
            size: 4
          }
        ];
      }
    },
    updateParties(newParties: party[]) {
      this.parties = newParties;
    },
    updateParty(newParty: party) {
      const partyIndex = this.getPartyIndex(newParty.name);
      if (this.parties[partyIndex] && partyIndex >= 0) {
        this.parties[partyIndex] = newParty;
      }
    }
  }
});
