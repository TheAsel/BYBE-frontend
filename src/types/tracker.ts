import type { min_creature_hazard } from "./encounter";

export type min_tracker = {
  element?: min_creature_hazard | string;
  is_player: boolean;
  health: number | null;
  max_health: number | null;
  initiative: number | null;
  perception: number;
};

export type tracker_list = {
  list: min_tracker[];
  active_index: number;
};
