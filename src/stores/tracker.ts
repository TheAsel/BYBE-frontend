import { defineStore } from "pinia";

import type { creature } from "@/types/creature";
import type { hazard } from "@/types/hazard";
import type { min_tracker, tracker_list } from "@/types/tracker";

export const trackerStore = defineStore("tracker", {
  state: (): {
    selectedCreature: creature | null;
    selectedHazard: hazard | null;
    trackerList: tracker_list;
    running: boolean;
    round: number;
  } => ({
    selectedCreature: null,
    selectedHazard: null,
    trackerList: { list: [], active_index: 0 },
    running: false,
    round: 0
  }),
  actions: {
    setSelectedCreature(newSelectedCreature: creature) {
      this.selectedHazard = null;
      this.selectedCreature = newSelectedCreature;
    },
    setSelectedHazard(newSelectedHazard: hazard) {
      this.selectedCreature = null;
      this.selectedHazard = newSelectedHazard;
    },
    removeSelectedCreature() {
      this.selectedCreature = null;
    },
    removeSelectedHazard() {
      this.selectedHazard = null;
    },
    addPlayer() {
      this.trackerList.list.push({
        element: "Player",
        is_player: true,
        health: 1,
        max_health: 1,
        initiative: null,
        perception: 0
      });
    },
    removeFromTracker(index: number) {
      this.trackerList.list.splice(index, 1);
    },
    updateTracker(newTracker: min_tracker[]) {
      this.trackerList.list = newTracker;
    },
    prevRound() {
      this.round--;
      if (this.round <= 0) {
        this.round = 1;
        this.trackerList.active_index = 0;
      } else {
        this.trackerList.active_index = this.trackerList.list.length - 1;
      }
    },
    nextRound() {
      this.round++;
      this.trackerList.active_index = 0;
    },
    prevTurn() {
      this.trackerList.active_index--;
      if (this.trackerList.active_index < 0) {
        this.trackerList.active_index = this.trackerList.list.length - 1;
        this.prevRound();
      }
    },
    nextTurn() {
      this.trackerList.active_index++;
      if (this.trackerList.active_index >= this.trackerList.list.length) {
        this.trackerList.active_index = 0;
        this.nextRound();
      }
    },
    sortList() {
      this.trackerList.list.sort((a, b) => {
        if (a.initiative == null) return 1;
        if (b.initiative == null) return -1;
        return b.initiative - a.initiative;
      });
    },
    resetTracker() {
      this.trackerList.active_index = 0;
      this.running = false;
      this.round = 0;
      this.trackerList.list.forEach(item => {
        item.health = item.max_health;
        item.initiative = null;
      });
    }
  }
});
