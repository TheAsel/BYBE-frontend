export type encounter = {
  experience: number;
  difficulty: 'Trivial' | 'Low' | 'Moderate' | 'Severe' | 'Extreme' | 'Impossible';
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
