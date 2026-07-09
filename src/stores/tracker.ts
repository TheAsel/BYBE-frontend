import { defineStore } from "pinia";

import type { creature } from "@/types/creature";
import type { hazard } from "@/types/hazard";
import type { condition, min_tracker, tracker_list } from "@/types/tracker";

export const trackerStore = defineStore("tracker_store", {
  state: (): {
    selectedCreature: creature | null;
    selectedHazard: hazard | null;
    trackerList: tracker_list;
    conditions: condition[];
    running: boolean;
    round: number;
    lockSheet: boolean;
  } => ({
    selectedCreature: null,
    selectedHazard: null,
    trackerList: { active_index: 0, detail_index: 0, list: [] },
    conditions: [],
    running: false,
    round: 0,
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
        ac: 0,
        fortitude: 0,
        reflex: 0,
        will: 0,
        conditions: [],
        note: ""
      });
    },
    findNextValidIndex(
      startIndex: number,
      direction: 1 | -1 = 1,
      wrap = true
    ): number {
      const length = this.trackerList.list.length;

      for (let step = 1; step < length; step += 1) {
        let candidate = startIndex + step * direction;

        if (wrap) {
          candidate = (candidate + length) % length;
        } else if (candidate < 0 || candidate >= length) {
          break;
        }

        const entry = this.trackerList.list[candidate];
        if (!entry) continue;
        if (entry.health !== null && entry.health <= 0) continue;
        if (!entry.is_player && entry.disabled) continue;

        return candidate;
      }
      return startIndex;
    },
    increaseCondition(element: min_tracker, condition: condition) {
      const conditionIndex = element.conditions
        .map(cond => cond.name)
        .indexOf(condition.name);

      if (conditionIndex < 0) {
        condition.value = 1;
        element.conditions.push(condition);
        return;
      }

      if (element.conditions[conditionIndex]) {
        if (condition.is_stackable) {
          if (element.conditions[conditionIndex].value === null) {
            element.conditions[conditionIndex].value = 1;
            return;
          }
          element.conditions[conditionIndex].value += 1;
          return;
        }
        element.conditions[conditionIndex].value = 1;
      }
    },
    decreaseCondition(element: min_tracker, condition: condition) {
      const conditionIndex = element.conditions
        .map(cond => cond.name)
        .indexOf(condition.name);

      if (conditionIndex < 0) {
        return;
      }

      const selectedCondition = element.conditions[conditionIndex];

      if (selectedCondition) {
        if (
          selectedCondition.value === null ||
          selectedCondition.value <= 1 ||
          Number.isNaN(selectedCondition.value)
        ) {
          if (!selectedCondition.default) {
            element.conditions.splice(conditionIndex, 1);
            return;
          }
          return;
        }
        selectedCondition.value -= 1;
      }
    },
    nextRound() {
      if (!this.running) {
        return;
      }

      const current = this.trackerList.active_index;

      this.round += 1;
      this.trackerList.active_index = this.findNextValidIndex(-1, 1);

      for (let i = current; i < this.trackerList.list.length; i += 1) {
        for (let condition of this.trackerList.list[i]!.conditions) {
          if (!condition.is_perpetual) {
            this.decreaseCondition(this.trackerList.list[i]!, condition);
          }
        }
      }
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

      for (let i = current; i < next; i += 1) {
        for (let condition of this.trackerList.list[i]!.conditions) {
          if (!condition.is_perpetual) {
            this.decreaseCondition(this.trackerList.list[i]!, condition);
          }
        }
      }
    },
    prevRound() {
      if (!this.running) {
        return;
      }

      if (this.round === 1) {
        this.trackerList.active_index = this.findNextValidIndex(-1, 1, false);
        return;
      }

      this.round -= 1;
      this.trackerList.active_index = this.findNextValidIndex(0, -1);
    },
    prevTurn() {
      if (!this.running) {
        return;
      }
      const current = this.trackerList.active_index;

      if (this.round === 1) {
        this.trackerList.active_index = this.findNextValidIndex(
          current,
          -1,
          false
        );
        return;
      }

      const prev = this.findNextValidIndex(current, -1);
      if (prev >= current) {
        this.round -= 1;
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
      this.trackerList.detail_index = 0;
      this.running = false;
      this.round = 0;
      for (const item of this.trackerList.list) {
        item.health = item.max_health;
        item.initiative = null;
        if (!item.is_player) {
          item.disabled = false;
        }
        item.conditions = item.conditions.filter(
          condition => condition.default === true
        );
        this.sortList();
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

        const an = a.is_player ? a.element : a.element.name;
        const bn = b.is_player ? b.element : b.element.name;

        // 1st priority: initiative
        // 2nd priority: creatures before players
        // 3rd priority: element name
        return (
          bi - ai ||
          Number(a.is_player) - Number(b.is_player) ||
          an.localeCompare(bn)
        );
      });

      withoutInit.sort((a, b) => {
        const ai = a.initiative ?? -1;
        const bi = b.initiative ?? -1;

        const an = a.is_player ? a.element : a.element.name;
        const bn = b.is_player ? b.element : b.element.name;

        // 1st priority: initiative
        // 2nd priority: creatures before players
        // 3rd priority: element name
        return (
          bi - ai ||
          Number(a.is_player) - Number(b.is_player) ||
          an.localeCompare(bn)
        );
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
