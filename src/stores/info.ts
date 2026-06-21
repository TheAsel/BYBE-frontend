import { defineStore } from "pinia";

import type { encounter } from "@/types/encounter";

export const infoStore = defineStore("info_store", {
  actions: {
    setInfo(info: encounter) {
      const colorMap = {
        Extreme: "red",
        Impossible: "purple-10",
        Low: "green",
        Moderate: "amber",
        Severe: "orange",
        Trivial: "lime"
      } as const;

      this.info = {
        ...info,
        color: colorMap[info.challenge] ?? "lime"
      };
    }
  },
  state: (): { info: encounter } => ({
    info: {
      challenge: "Trivial",
      color: "lime",
      encounter_exp_levels: {
        Extreme: 0,
        Impossible: 0,
        Low: 0,
        Moderate: 0,
        Severe: 0,
        Trivial: 0
      },
      experience: 0
    }
  })
});
