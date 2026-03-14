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

export type complexities = 'Simple' | 'Complex';

export type games = 'pf' | 'sf';

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
  min_stealth_filter?: number;
  max_stealth_filter?: number;
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

export type bestiary_ranges = {
  min_level: number;
  max_level: number;
  min_hp: number;
  max_hp: number;
  min_focus_points: number;
  max_focus_points: number;
};

export type hazard_ranges = {
  min_level: number;
  max_level: number;
  min_hp: number;
  max_hp: number;
  min_stealth: number;
  max_stealth: number;
  min_ac: number;
  max_ac: number;
  min_fortitude: number;
  max_fortitude: number;
  min_will: number;
  max_will: number;
  min_reflex: number;
  max_reflex: number;
  min_hardness: number;
  max_hardness: number;
};

export type shop_ranges = {
  min_level: number;
  max_level: number;
  min_hp: number;
  max_hp: number;
  min_price: number;
  max_price: number;
  min_quantity: number;
  max_quantity: number;
  min_bulk: number;
  max_bulk: number;
  min_number_of_uses: number;
  max_number_of_uses: number;
};
