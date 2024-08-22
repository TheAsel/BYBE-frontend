import type { creature, min_creature } from './creature';
import type { challenges } from './filters';

export type encounter = {
  experience: number;
  challenge: challenges;
  encounter_exp_levels: {
    Trivial: number;
    Low: number;
    Moderate: number;
    Severe: number;
    Extreme: number;
    Impossible: number;
  };
  color?: 'lime' | 'green' | 'amber' | 'orange' | 'red' | 'purple-10';
};

export type random_encounter = {
  count: number;
  encounter_info: encounter;
  results?: creature[];
};

export type encounter_list = {
  name: string;
  creatures: min_creature[];
};

export type adventure_groups =
  | 'BossAndLackeys'
  | 'BossAndLieutenant'
  | 'EliteEnemies'
  | 'LieutenantAndLackeys'
  | 'MatedPair'
  | 'Troop'
  | 'MookSquad';
