import { defineStore } from 'pinia';

import type { games } from 'src/types/filters';

export const settingsStore = defineStore('settings', {
  state: () => ({
    hidden_nav: true,
    experimental_features: false,
    is_aon_links_on: false,
    game_version: 'Any',
    game: 'pf'
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
    setGameVersion(newgameVersion: string) {
      this.game_version = newgameVersion;
    },
    setGame(newGame: games) {
      this.game = newGame;
    }
  }
});
