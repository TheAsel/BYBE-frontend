import type { min_creature_hazard } from "@/types/encounter";

export type condition = {
  condition_group: string | null;
  is_perpetual: boolean;
  is_stackable: boolean;
  license: string;
  name: string;
  note: string | null;
  remaster: boolean;
  rule: string;
  source: string;
  summary: string | null;
  value: number | null;
  default: boolean | null;
};

type tracker_base = {
  health: number | null;
  max_health: number | null;
  initiative: number | null;
  perception: number;
  ac: number | null;
  fortitude: number | null;
  reflex: number | null;
  will: number | null;
  conditions: condition[];
  note: string;
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
