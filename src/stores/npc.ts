import { defineStore } from "pinia";

import type { npc, npc_list } from "@/types/npcs";

export const npcStore = defineStore("npc", {
  state: () => ({
    npcs: [
      {
        name: "Default",
        npc: {
          level: -1,
          gender: "",
          ancestry: "",
          culture: "",
          class: "",
          job: "",
          name: "",
          custom_fields: [{ name: "", body: "" }]
        },
        culture: false
      }
    ] as npc_list[],
    activeNpc: 0,
    generating: false,
    locks: {
      name: false,
      nickname: false,
      gender: false,
      ancestry: false,
      culture: false,
      class: false,
      job: false,
      level: false
    }
  }),
  actions: {
    setActiveNpc(newActiveNpc: number) {
      this.activeNpc = newActiveNpc;
    },
    clearNpc() {
      const tmpNpc: npc = {
        level: -1,
        gender: "",
        ancestry: "",
        culture: "",
        class: "",
        job: "",
        name: "",
        nickname: "",
        languages: "",
        description: "",
        personality: "",
        quirk: "",
        relationships: "",
        ideology: "",
        custom_fields: [{ name: "", body: "" }],
        game: "pf"
      };
      this.npcs[this.activeNpc]!.npc = tmpNpc;
    },
    changeActiveNpc(npcIndex: number) {
      if (npcIndex >= this.npcs.length || npcIndex < 0) {
        this.activeNpc = 0;
      } else {
        this.activeNpc = npcIndex;
      }
    },
    addNpc(npcName: string) {
      this.npcs.push({
        name: npcName,
        npc: {
          level: -1,
          gender: "",
          ancestry: "",
          culture: "",
          class: "",
          job: "",
          name: "",
          nickname: "",
          languages: "",
          description: "",
          personality: "",
          quirk: "",
          relationships: "",
          ideology: "",
          custom_fields: [{ name: "", body: "" }],
          game: "pf"
        },
        culture: false
      });
      this.activeNpc = this.npcs.length - 1;
    },
    removeNpc() {
      this.npcs.splice(this.activeNpc, 1);
      this.activeNpc = 0;
      if (this.npcs.length <= 0) {
        this.npcs = [
          {
            name: "Default",
            npc: {
              level: -1,
              gender: "",
              ancestry: "",
              culture: "",
              class: "",
              job: "",
              name: "",
              nickname: "",
              languages: "",
              description: "",
              personality: "",
              quirk: "",
              relationships: "",
              ideology: "",
              custom_fields: [{ name: "", body: "" }],
              game: "pf"
            },
            culture: false
          }
        ];
      }
    },
    getNpcIndex(npcName: string): number {
      return this.npcs.map(npc => npc.name).indexOf(npcName);
    },
    updateNpc(npcName: string, newNpc: npc) {
      const npcIndex = this.getNpcIndex(npcName);
      if (npcIndex >= 0) {
        this.npcs[npcIndex]!.npc = newNpc;
      }
    },
    updateNpcs(newNpcs: npc_list[]) {
      this.npcs = newNpcs;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    }
  }
});
