import { defineStore } from 'pinia';

import type { valid_genders } from 'src/types/npcs';

function splitPascalCase(input: string): string {
  return input.replaceAll(/([a-z])([A-Z])/g, '$1 $2');
}

export const npcParametersStore = defineStore('npcparameters', {
  state: () => ({
    npcParameters: {
      genders: [] as string[],
      ancestries: [] as string[],
      cultures: [] as string[],
      valid_genders: [] as valid_genders[],
      classes: [] as string[],
      jobs: [] as string[]
    }
  }),
  getters: {
    getNpcParameters: (state) => state.npcParameters
  },
  actions: {
    updateGenders(newGenders: string[]) {
      this.npcParameters.genders = newGenders.map(splitPascalCase);
    },
    updateAncestries(newAncestries: string[]) {
      this.npcParameters.ancestries = newAncestries.map(splitPascalCase);
    },
    updateCultures(newCultures: string[]) {
      this.npcParameters.cultures = newCultures.map(splitPascalCase);
    },
    updateValidGenders(newValidGenders: valid_genders[]) {
      this.npcParameters.valid_genders = newValidGenders;
    },
    updateClasses(newClasses: string[]) {
      this.npcParameters.classes = newClasses.map(splitPascalCase);
    },
    updateJobs(newJobs: string[]) {
      const ai = newJobs.indexOf('AIOperator');
      if (ai !== -1) {
        newJobs[ai] = 'AI Operator';
      }
      this.npcParameters.jobs = newJobs.map(splitPascalCase);
    }
  }
});
