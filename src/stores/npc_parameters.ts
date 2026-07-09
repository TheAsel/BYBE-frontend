import { defineStore } from "pinia";

import type { valid_genders } from "@/types/npc";

function splitPascalCase(input: string): string {
  return input.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");
}

export const npcParametersStore = defineStore("npc_parameters_store", {
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
  }),
  actions: {
    updateAncestries(newAncestries: string[]) {
      this.npcParameters.ancestries = newAncestries.map(element =>
        splitPascalCase(element)
      );
    },
    updateClasses(newClasses: string[]) {
      this.npcParameters.classes = newClasses.map(element =>
        splitPascalCase(element)
      );
    },
    updateCultures(newCultures: string[]) {
      this.npcParameters.cultures = newCultures.map(element =>
        splitPascalCase(element)
      );
    },
    updateGenders(newGenders: string[]) {
      this.npcParameters.genders = newGenders.map(element =>
        splitPascalCase(element)
      );
    },
    updateJobs(newJobs: string[]) {
      const ai = newJobs.indexOf("AIOperator");
      if (ai !== -1) {
        newJobs[ai] = "AI Operator";
      }
      this.npcParameters.jobs = newJobs.map(element =>
        splitPascalCase(element)
      );
    },
    updateValidGenders(newValidGenders: valid_genders[]) {
      this.npcParameters.valid_genders = newValidGenders;
    }
  }
});
