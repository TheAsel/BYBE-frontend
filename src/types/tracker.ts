import type { min_creature_hazard } from "./encounter";

type tracker_base = {
  health: number | null;
  max_health: number | null;
  initiative: number | null;
  perception: number;
};

export type min_tracker =
  | (tracker_base & {
      element: min_creature_hazard;
      is_player: false;
      disabled: boolean;
    })
  | (tracker_base & {
      element: string;
      is_player: true;
    });

export type tracker_list = {
  list: min_tracker[];
  active_index: number;
  detail_index: number;
};
