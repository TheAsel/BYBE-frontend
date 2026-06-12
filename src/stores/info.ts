import { defineStore } from "pinia";

import type { encounter } from "@/types/encounter";

export const infoStore = defineStore("info", {
  state: () => ({
    info: {
      experience: 0,
      challenge: "Trivial",
      encounter_exp_levels: {
        Moderate: 0,
        Trivial: 0,
        Low: 0,
        Extreme: 0,
        Severe: 0,
        Impossible: 0
      },
      color: "lime"
    }
  }),
  actions: {
    setInfo(info: encounter) {
      const colorMap = {
        Trivial: "lime",
        Low: "green",
        Moderate: "amber",
        Severe: "orange",
        Extreme: "red",
        Impossible: "purple-10"
      } as const;

      this.info = {
        ...info,
        color: colorMap[info.challenge] ?? "lime"
      };
    }
  }
});
