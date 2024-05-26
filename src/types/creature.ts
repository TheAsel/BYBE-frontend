import type { alignments, rarities, roles, sizes, variants } from './filters';

interface KeyValue {
  [key: string]: number;
}

export type creature = {
  combat_data?: {
    ac: number;
    immunities: string[];
    resistances: KeyValue;
    weaknesses: KeyValue;
    saving_throws: {
      fortitude: number;
      fortitude_detail: string;
      reflex: number;
      reflex_detail: string;
      will: number;
      will_detail: string;
    };
    weapons: [
      {
        base: string;
        bonus_dmg: number;
        bulk: number;
        carry_type: string;
        category: string;
        creature_id: number;
        die_size: string;
        dmg_type: string;
        hands_held: number;
        hardness: number;
        hp_curr: number;
        hp_max: number;
        id: number;
        invested: boolean;
        level: number;
        license: string;
        n_of_dices: number;
        name: string;
        quantity: number;
        range: string;
        rarity: rarities;
        reload: string;
        remaster: boolean;
        size: string;
        source: string;
        to_hit_bonus: number;
        usage: string;
        weapon_group: string;
        wp_type: string;
      }
    ];
  };
  core_data: {
    essential: {
      id: number;
      aon_id: number;
      name: string;
      hp: number;
      level: number;
      size: sizes;
      family: string;
      rarity: rarities;
      alignment: alignments;
      license: string;
      remaster: boolean;
      source: string;
      cr_type: string;
    };
    derived: {
      archive_link: string;
      is_melee: boolean;
      is_ranged: boolean;
      is_spell_caster: boolean;
      brute_percentage: number;
      magical_striker_percentage: number;
      skill_paragon_percentage: number;
      skirmisher_percentage: number;
      sniper_percentage: number;
      soldier_percentage: number;
      spell_caster_percentage: number;
      creature_role?: roles[];
    };
    traits: string[];
  };
  extra_data?: {
    ability_scores: {
      charisma: number;
      constitution: number;
      dexterity: number;
      intelligence: number;
      strength: number;
      wisdom: number;
    };
    ac_detail: string;
    actions: [
      {
        action_type: string;
        category: string;
        creature_id: number;
        description: string;
        id: number;
        license: string;
        n_of_actions: number;
        name: string;
        rarity: rarities;
        remaster: boolean;
        slug: string;
        source: string;
      }
    ];
    hp_detail: string;
    language_detail: string;
    languages: string[];
    perception: number;
    perception_detail: string;
    senses: string[];
    skills: [
      {
        description: string;
        modifier: number;
        name: string;
        proficiency: number;
      }
    ];
    speeds: KeyValue;
  };
  spell_caster_data?: {
    spell_caster_entry: {
      is_spell_casting_flexible: boolean;
      spell_casting_atk_mod: number;
      spell_casting_dc_mod: number;
      spell_casting_name: string;
      spell_casting_tradition: string;
      type_of_spell_caster: string;
    };
    spells: [
      {
        action: string;
        area_type: string;
        area_value: number;
        counteraction: boolean;
        creature_id: number;
        duration: string;
        id: number;
        level: number;
        license: string;
        name: string;
        range: string;
        rarity: string;
        remaster: boolean;
        saving_throw_is_basic: boolean;
        saving_throw_statistic: string;
        source: string;
        sustained: boolean;
        target: string;
      }
    ];
  };
  variant_data?: {
    archive_link: string;
    level: number;
    variant: variants;
  };
};

export type creature_encounter = {
  archive_link: string;
  name: string;
  level: number;
  quantity?: number;
  variant?: variants;
};
