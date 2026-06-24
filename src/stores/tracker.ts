import { defineStore } from "pinia";

import type { creature } from "@/types/creature";
import type { hazard } from "@/types/hazard";
import type { min_tracker, tracker_list } from "@/types/tracker";

export const trackerStore = defineStore("tracker_store", {
  state: (): {
    selectedCreature: creature | null;
    selectedHazard: hazard | null;
    trackerList: tracker_list;
    running: boolean;
    round: number;
    lockSheet: boolean;
  } => ({
    round: 0,
    running: false,
    selectedCreature: null,
    selectedHazard: null,
    trackerList: { active_index: 0, detail_index: 0, list: [] },
    lockSheet: false
  }),
  actions: {
    addPlayer() {
      this.trackerList.list.push({
        element: "Player",
        health: 1,
        initiative: null,
        is_player: true,
        max_health: 1,
        perception: 0,
        ac: null,
        fortitude: null,
        reflex: null,
        will: null
      });
    },
    findNextValidIndex(startIndex: number, direction: 1 | -1 = 1): number {
      for (let step = 1; step < this.trackerList.list.length; step += 1) {
        const candidate =
          (startIndex + step * direction + this.trackerList.list.length) %
          this.trackerList.list.length;
        const entry = this.trackerList.list[candidate];
        if (!entry) {
          continue;
        }
        if (entry.health !== null && entry.health <= 0) {
          continue;
        }
        if (!entry.is_player && entry.disabled) {
          continue;
        }
        return candidate;
      }
      return startIndex;
    },
    nextRound() {
      if (!this.running) {
        return;
      }
      this.round += 1;
      this.trackerList.active_index = this.findNextValidIndex(-1, 1);
    },
    nextTurn() {
      if (!this.running) {
        return;
      }
      const current = this.trackerList.active_index;
      const next = this.findNextValidIndex(current, 1);
      if (next <= current) {
        this.round += 1;
      }
      this.trackerList.active_index = next;
    },
    prevRound() {
      if (!this.running) {
        return;
      }
      this.round = Math.max(1, this.round - 1);
      this.trackerList.active_index = this.findNextValidIndex(0, -1);
    },
    prevTurn() {
      if (!this.running) {
        return;
      }
      const current = this.trackerList.active_index;
      const prev = this.findNextValidIndex(current, -1);
      if (prev >= current) {
        this.round = Math.max(1, this.round - 1);
      }
      this.trackerList.active_index = prev;
    },
    removeFromTracker(index: number) {
      this.trackerList.list.splice(index, 1);
    },
    removeSelectedCreature() {
      this.selectedCreature = null;
    },
    removeSelectedHazard() {
      this.selectedHazard = null;
    },
    resetTracker() {
      this.trackerList.active_index = 0;
      this.running = false;
      this.round = 0;
      for (const item of this.trackerList.list) {
        item.health = item.max_health;
        item.initiative = null;
        if (!item.is_player) {
          item.disabled = false;
        }
      }
    },
    setSelectedCreature(newSelectedCreature: creature) {
      this.selectedHazard = null;
      this.selectedCreature = newSelectedCreature;
    },
    setSelectedHazard(newSelectedHazard: hazard) {
      this.selectedCreature = null;
      this.selectedHazard = newSelectedHazard;
    },
    sortList() {
      const old_detail = this.trackerList.list[this.trackerList.detail_index];
      const withInit = [];
      const withoutInit = [];
      for (const item of this.trackerList.list) {
        if (item.initiative === null) {
          withoutInit.push(item);
        } else {
          withInit.push(item);
        }
      }
      withInit.sort((a, b) => {
        const ai = a.initiative ?? -1;
        const bi = b.initiative ?? -1;
        return bi - ai;
      });
      this.trackerList.list = [...withInit, ...withoutInit];
      if (old_detail) {
        this.trackerList.detail_index =
          this.trackerList.list.indexOf(old_detail);
      }
    },
    updateTracker(newTracker: min_tracker[]) {
      this.trackerList.list = newTracker;
    }
  }
});
