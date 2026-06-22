import { defineStore } from "pinia";

import type { npc, npc_list } from "@/types/npc";

export const npcStore = defineStore("npc_store", {
  state: (): {
    npcs: npc_list[];
    activeNpc: number;
    generating: boolean;
    locks: {
      name: boolean;
      nickname: boolean;
      gender: boolean;
      ancestry: boolean;
      culture: boolean;
      class: boolean;
      job: boolean;
      level: boolean;
    };
  } => ({
    activeNpc: 0,
    generating: false,
    locks: {
      ancestry: false,
      class: false,
      culture: false,
      gender: false,
      job: false,
      level: false,
      name: false,
      nickname: false
    },
    npcs: [
      {
        culture: false,
        name: "Default",
        npc: {
          ancestry: "",
          class: "",
          culture: "",
          custom_fields: [{ name: "", body: "" }],
          description: "",
          game: "pf",
          gender: "",
          ideology: "",
          job: "",
          languages: "",
          level: -1,
          name: "",
          nickname: "",
          personality: "",
          quirk: "",
          relationships: ""
        }
      }
    ]
  }),
  actions: {
    addNpc(npcName: string) {
      this.npcs.push({
        culture: false,
        name: npcName,
        npc: {
          ancestry: "",
          class: "",
          culture: "",
          custom_fields: [{ body: "", name: "" }],
          description: "",
          game: "pf",
          gender: "",
          ideology: "",
          job: "",
          languages: "",
          level: -1,
          name: "",
          nickname: "",
          personality: "",
          quirk: "",
          relationships: ""
        }
      });
      this.activeNpc = this.npcs.length - 1;
    },
    changeActiveNpc(npcIndex: number) {
      if (npcIndex >= this.npcs.length || npcIndex < 0) {
        this.activeNpc = 0;
      } else {
        this.activeNpc = npcIndex;
      }
    },
    clearNpc() {
      const tmpNpc: npc = {
        ancestry: "",
        class: "",
        culture: "",
        custom_fields: [{ body: "", name: "" }],
        description: "",
        game: "pf",
        gender: "",
        ideology: "",
        job: "",
        languages: "",
        level: -1,
        name: "",
        nickname: "",
        personality: "",
        quirk: "",
        relationships: ""
      };
      this.npcs[this.activeNpc]!.npc = tmpNpc;
    },
    getNpcIndex(npcName: string): number {
      return this.npcs.map(npc => npc.name).indexOf(npcName);
    },
    removeNpc() {
      this.npcs.splice(this.activeNpc, 1);
      this.activeNpc = 0;
      if (this.npcs.length <= 0) {
        this.npcs = [
          {
            culture: false,
            name: "Default",
            npc: {
              ancestry: "",
              class: "",
              culture: "",
              custom_fields: [{ body: "", name: "" }],
              description: "",
              game: "pf",
              gender: "",
              ideology: "",
              job: "",
              languages: "",
              level: -1,
              name: "",
              nickname: "",
              personality: "",
              quirk: "",
              relationships: ""
            }
          }
        ];
      }
    },
    setActiveNpc(newActiveNpc: number) {
      this.activeNpc = newActiveNpc;
    },
    setGenerating(newGenerating: boolean) {
      this.generating = newGenerating;
    },
    updateNpc(npcName: string, newNpc: npc) {
      const npcIndex = this.getNpcIndex(npcName);
      if (npcIndex >= 0) {
        this.npcs[npcIndex]!.npc = newNpc;
      }
    },
    updateNpcs(newNpcs: npc_list[]) {
      this.npcs = newNpcs;
    }
  }
});
