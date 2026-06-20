import { defineStore } from "pinia";

import type { games } from "@/types/filters";

export const settingsStore = defineStore("settings", {
  state: () => ({
    hidden_nav: true,
    experimental_features: false,
    is_aon_links_on: false,
    is_pwl_on: false,
    game_version: "Any",
    game: "" as games
  }),
  actions: {
    setHiddenNav(newHiddenNav: boolean) {
      this.hidden_nav = newHiddenNav;
    },
    setExperimentalFeatures(newExperimentalFeatures: boolean) {
      this.experimental_features = newExperimentalFeatures;
    },
    setAonLinks(newAonLinks: boolean) {
      this.is_aon_links_on = newAonLinks;
    },
    setPwL(newPwl: boolean) {
      this.is_pwl_on = newPwl;
    },
    setGameVersion(newgameVersion: string) {
      this.game_version = newgameVersion;
    },
    setGame(newGame: games) {
      this.game = newGame;
    }
  }
});
