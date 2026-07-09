import { defineStore } from "pinia";

import type { party } from "@/types/party";

export const partyStore = defineStore("party_store", {
  state: (): { parties: party[]; activeParty: number } => ({
    activeParty: 0,
    parties: [
      {
        advanced: false,
        name: "Default",
        level: 1,
        size: 4,
        members: [
          { level: 1, name: "Player 1" },
          { level: 1, name: "Player 2" },
          { level: 1, name: "Player 3" },
          { level: 1, name: "Player 4" }
        ]
      }
    ]
  }),
  actions: {
    addParty(partyName: string) {
      this.parties.push({
        advanced: false,
        name: partyName,
        level: 1,
        size: 4,
        members: [
          { level: 1, name: "Player 1" },
          { level: 1, name: "Player 2" },
          { level: 1, name: "Player 3" },
          { level: 1, name: "Player 4" }
        ]
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
            name: "Default",
            level: 1,
            size: 4,
            members: [
              { level: 1, name: "Player 1" },
              { level: 1, name: "Player 2" },
              { level: 1, name: "Player 3" },
              { level: 1, name: "Player 4" }
            ]
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
