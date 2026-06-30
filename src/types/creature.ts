import type {
  alignments,
  games,
  rarities,
  roles,
  sizes,
  variants
} from "@/types/filters";
import type {
  action,
  range,
  resistance,
  trait,
  weakness,
  weapon
} from "@/types/generic";
import type { item } from "@/types/item";
import type { condition } from "@/types/tracker";

type KeyValue = Record<string, number>;

export type creature = {
  game: games;
  combat_data?: {
    ac: number;
    armors: [
      {
        item_core: item["core_item"];
        armor_data: item["armor_data"];
      }
    ];
    conditions: condition[];
    immunities: string[];
    resistances: resistance[];
    weaknesses: weakness[];
    saving_throws: {
      fortitude: number;
      fortitude_detail: string;
      reflex: number;
      reflex_detail: string;
      will: number;
      will_detail: string;
    };
    weapons: weapon[];
  };
  core_data: {
    essential: {
      id: number;
      aon_id: number;
      name: string;
      hp: number;
      base_level: number;
      size: sizes;
      family: string;
      rarity: rarities;
      alignment: alignments;
      license: string;
      remaster: boolean;
      source: string;
      cr_type: string;
      focus_points: number;
    };
    derived: {
      archive_link: string;
      attack_data: {
        melee: boolean;
        ranged: boolean;
        spellcaster: boolean;
      };
      role_data: {
        brute: number;
        magical_striker: number;
        skill_paragon: number;
        skirmisher: number;
        sniper: number;
        soldier: number;
        spellcaster: number;
      };
      creature_role?: roles[];
    };
    traits: trait[];
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
    actions: action[];
    has_vision: boolean;
    hp_detail: string;
    items: [item["core_item"]];
    language_detail: string;
    languages: string[];
    perception: number;
    perception_detail: string;
    senses: [
      {
        acuity: string;
        id: number;
        name: string;
        range?: range;
      }
    ];
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
  spellcaster_data?: {
    spellcaster_entries: [
      {
        spellcaster_data: {
          heighten_level: number;
          id: number;
          is_spellcasting_flexible: number | null;
          spellcasting_atk_mod: number;
          spellcasting_dc_mod: number;
          spellcasting_name: string;
          spellcasting_tradition: string;
          type_of_spellcaster: string;
        };
        spells: {
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
          range?: range;
          rarity: string;
          remaster: boolean;
          saving_throw_is_basic: boolean;
          saving_throw_statistic: string;
          slot: number;
          source: string;
          spellcasting_entry_id: number;
          sustained: boolean;
          target: string;
        }[];
      }
    ];
  };
  variant_data?: {
    archive_link: string;
    level: number;
    variant: variants;
  };
};

export type creature_response = {
  count: number;
  total: number;
  next: string;
  results: creature[];
};
