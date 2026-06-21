import { defineStore } from "pinia";

import type { valid_genders } from "@/types/npcs";

function splitPascalCase(input: string): string {
  return input.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
}

export const npcParametersStore = defineStore("npc_parameters_store", {
  actions: {
    updateAncestries(newAncestries: string[]) {
      this.npcParameters.ancestries = newAncestries.map(splitPascalCase);
    },
    updateClasses(newClasses: string[]) {
      this.npcParameters.classes = newClasses.map(splitPascalCase);
    },
    updateCultures(newCultures: string[]) {
      this.npcParameters.cultures = newCultures.map(splitPascalCase);
    },
    updateGenders(newGenders: string[]) {
      this.npcParameters.genders = newGenders.map(splitPascalCase);
    },
    updateJobs(newJobs: string[]) {
      const ai = newJobs.indexOf("AIOperator");
      if (ai !== -1) {
        newJobs[ai] = "AI Operator";
      }
      this.npcParameters.jobs = newJobs.map(splitPascalCase);
    },
    updateValidGenders(newValidGenders: valid_genders[]) {
      this.npcParameters.valid_genders = newValidGenders;
    }
  },
  state: (): {
    npcParameters: {
      genders: string[];
      ancestries: string[];
      cultures: string[];
      valid_genders: valid_genders[];
      classes: string[];
      jobs: string[];
    };
  } => ({
    npcParameters: {
      ancestries: [],
      classes: [],
      cultures: [],
      genders: [],
      jobs: [],
      valid_genders: []
    }
  })
});
