import { defineStore } from "pinia";

import type { games } from "@/types/filters";

export const settingsStore = defineStore("settings_store", {
  state: (): {
    game: games;
    game_version: string;
    hidden_nav: boolean;
    is_pwl_on: boolean;
    table_links: boolean;
  } => ({
    game: "pf",
    game_version: "Any",
    hidden_nav: true,
    is_pwl_on: false,
    table_links: true
  }),
  actions: {
    setGame(newGame: games) {
      this.game = newGame;
    },
    setGameVersion(newgameVersion: string) {
      this.game_version = newgameVersion;
    },
    setHiddenNav(newHiddenNav: boolean) {
      this.hidden_nav = newHiddenNav;
    },
    setPwL(newPwl: boolean) {
      this.is_pwl_on = newPwl;
    },
    setTableLinks(newTableLinks: boolean) {
      this.table_links = newTableLinks;
    }
  }
});
