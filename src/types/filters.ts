export type alignments =
  | 'CE'
  | 'CN'
  | 'CG'
  | 'NE'
  | 'N'
  | 'NG'
  | 'LE'
  | 'LN'
  | 'LG'
  | 'No Alignment';

export type sizes = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type rarities = 'Common' | 'Uncommon' | 'Rare' | 'Unique';

export type challenges = 'Trivial' | 'Low' | 'Moderate' | 'Severe' | 'Extreme' | 'Impossible';

export type creature_type = 'Creature' | 'NPC';

export type roles =
  | 'None'
  | 'Brute'
  | 'Magical Striker'
  | 'Skill Paragon'
  | 'Skirmisher'
  | 'Sniper'
  | 'Soldier'
  | 'Spellcaster';

export type variants = 'Weak' | 'Base' | 'Elite';

export type creature_columns =
  | 'id'
  | 'source'
  | 'name'
  | 'level'
  | 'hp'
  | 'trait'
  | 'alignment'
  | 'size'
  | 'rarity'
  | 'family'
  | 'type'
  | 'attack'
  | 'role';

export type creature_filters = {
  source_filter?: string[];
  name_filter?: string;
  min_level_filter?: number;
  max_level_filter?: number;
  min_hp_filter?: number;
  max_hp_filter?: number;
  trait_blacklist_filter?: string[];
  trait_whitelist_filter?: string[];
  alignment_filter?: alignments[];
  size_filter?: sizes[];
  rarity_filter?: rarities[];
  family_filter?: string[];
  type_filter?: creature_type[];
  attack_data_filter: {
    melee?: boolean | null;
    ranged?: boolean | null;
    spellcaster?: boolean | null;
  };
  role_filter?: roles[];
  role_threshold: number;
  game_system_version: string;
};

export type hazard_columns =
  | 'id'
  | 'source'
  | 'name'
  | 'level'
  | 'hp'
  | 'trait'
  | 'complexity'
  | 'size'
  | 'rarity'
  | 'stealth'
  | 'ac'
  | 'fortitude'
  | 'reflex'
  | 'will'
  | 'hardness';

export type hazard_filters = {
  source_filter?: string[];
  name_filter?: string;
  min_level_filter?: number;
  max_level_filter?: number;
  min_hp_filter?: number;
  max_hp_filter?: number;
  trait_blacklist_filter?: string[];
  trait_whitelist_filter?: string[];
  complexity_filter?: complexities;
  size_filter?: sizes[];
  rarity_filter?: rarities[];
  min_stealth?: number;
  max_stealth?: number;
  min_ac_filter?: number;
  max_ac_filter?: number;
  min_fortitude_filter?: number;
  max_fortitude_filter?: number;
  min_reflex_filter?: number;
  max_reflex_filter?: number;
  min_will_filter?: number;
  max_will_filter?: number;
  min_hardness_filter?: number;
  max_hardness_filter?: number;
  game_system_version: string;
};

export type item_columns = 'id' | 'name' | 'level' | 'trait' | 'rarity' | 'type' | 'source';

export type item_filters = {
  name_filter?: string;
  min_level_filter?: number;
  max_level_filter?: number;
  trait_whitelist_filter?: string[];
  rarity_filter?: rarities[];
  type_filter?: string[];
  source_filter?: string[];
  game_system_version: string;
};

export type games = 'pf' | 'sf';

export type complexities = 'Simple' | 'Complex';
