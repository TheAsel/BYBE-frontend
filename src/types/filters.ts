export type alignments =
  | 'Any'
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

export type roles =
  | 'None'
  | 'Brute'
  | 'Magical Striker'
  | 'Skill Paragon'
  | 'Skirmisher'
  | 'Sniper'
  | 'Soldier'
  | 'SpellCaster';

export type variants = 'Weak' | 'Base' | 'Elite';

export type item_columns = 'id' | 'name' | 'level' | 'trait' | 'rarity' | 'type' | 'source';

export type item_filters = {
  name_filter?: string;
  min_level_filter?: number;
  max_level_filter?: number;
  trait_whitelist_filter?: string[];
  rarity_filter?: rarities[];
  type_filter?: string[];
  source_filter?: string[];
  pathfinder_version: string;
};
