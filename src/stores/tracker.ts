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
        perception: 0
      });
    },
    nextRound() {
      if (!this.running) {
        return;
      }
      this.round += 1;
      this.trackerList.active_index = 0;
    },
    nextTurn() {
      if (!this.running) {
        return;
      }
      this.trackerList.active_index += 1;
      if (this.trackerList.active_index >= this.trackerList.list.length) {
        this.trackerList.active_index = 0;
        this.nextRound();
      }
    },
    prevRound() {
      if (!this.running) {
        return;
      }
      this.round -= 1;
      if (this.round <= 0) {
        this.round = 1;
        this.trackerList.active_index = 0;
      } else {
        this.trackerList.active_index = this.trackerList.list.length - 1;
      }
    },
    prevTurn() {
      if (!this.running) {
        return;
      }
      this.trackerList.active_index -= 1;
      if (this.trackerList.active_index < 0) {
        this.trackerList.active_index = this.trackerList.list.length - 1;
        this.prevRound();
      }
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
      this.trackerList.list.sort((a, b) => {
        if (a.initiative === null) {
          return 1;
        }
        if (b.initiative === null) {
          return -1;
        }
        return b.initiative - a.initiative;
      });
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
