import type { creature, creature_response } from '../types/creature';
import type { adventure_groups, encounter, random_encounter } from '../types/encounter';
import type {
  alignments,
  sizes,
  rarities,
  challenges,
  roles,
  variants,
  creature_columns,
  creature_filters
} from '../types/filters';

export async function requestCreatures(
  cursor: number,
  page_size: number,
  sort_by: creature_columns,
  order_by: 'ascending' | 'descending',
  body: creature_filters
) {
  if (page_size === 0) {
    page_size = -1;
  }

  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const request =
      process.env.API_URL +
      '/bestiary/list?cursor=' +
      cursor +
      '&page_size=' +
      page_size +
      '&sort_by=' +
      sort_by +
      '&order_by=' +
      order_by;
    const response = await fetch(request, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as creature_response;
  } catch (error) {
    console.error(error);
  }
}

export async function requestFilters(
  filter:
    | 'traits'
    | 'alignments'
    | 'sizes'
    | 'rarities'
    | 'families'
    | 'creature_types'
    | 'sources'
    | 'creature_roles'
) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(process.env.API_URL + '/bestiary/' + filter, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as string[];
  } catch (error) {
    console.error(error);
  }
}

export async function requestCreatureId(
  creature_id: number,
  variant: variants,
  is_pwl_on: boolean
) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL +
        '/bestiary/' +
        variant.toLowerCase() +
        '/' +
        creature_id +
        '?extra_data=true&combat_data=true&spell_casting_data=true&is_pwl_on=' +
        is_pwl_on,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data.results as creature;
  } catch (error) {
    console.error(error);
  }
}

export async function encounterInfo(encounter: {
  enemy_levels: number[];
  is_pwl_on: boolean;
  party_levels: number[];
}) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(encounter)
    };
    const response = await fetch(process.env.API_URL + '/encounter/info', requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as encounter;
  } catch (error) {
    console.error(error);
  }
}

export async function encounterGenerator(body: {
  trait_whitelist_filter: string[] | undefined;
  alignment_filter: alignments[] | undefined;
  size_filter: sizes[] | undefined;
  rarity_filter: rarities[] | undefined;
  family_filter: string[] | undefined;
  type_filter: string[] | undefined;
  challenge?: challenges;
  party_levels: number[];
  min_creatures?: number;
  max_creatures?: number;
  allow_weak_variants: boolean;
  allow_elite_variants: boolean;
  role_filter: roles[] | undefined;
  is_pwl_on: boolean;
  pathfinder_version: string;
  adventure_group?: adventure_groups;
}) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(process.env.API_URL + '/encounter/generator', requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as random_encounter;
  } catch (error) {
    console.error(error);
  }
}
