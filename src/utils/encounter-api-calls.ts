import { backendUrl } from 'src/boot/globals';
import type { creature } from 'src/types/creature';
import type { encounter, random_encounter } from 'src/types/encounter';
import type { alignments, sizes, rarities, challenges, roles, variants } from 'src/types/filters';

export async function requestCreatures(start: number, page_size: number, version: string) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      backendUrl +
        '/bestiary/list?cursor=' +
        start +
        '&page_size=' +
        page_size +
        '&pathfinder_version=' +
        version,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data.results as creature[];
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
    const response = await fetch(backendUrl + '/bestiary/' + filter, requestOptions);
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

export async function requestCreatureId(creature_id: number, variant: variants) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      backendUrl +
        '/bestiary/' +
        variant.toLowerCase() +
        '/' +
        creature_id +
        '?extra_data=true&combat_data=true&spell_casting_data=true',
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
    const response = await fetch(backendUrl + '/encounter/info', requestOptions);
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
  traits: string[] | undefined;
  alignments: alignments[] | undefined;
  sizes: sizes[] | undefined;
  rarities: rarities[] | undefined;
  families: string[] | undefined;
  creature_types: string[] | undefined;
  challenge: challenges | undefined;
  party_levels: number[];
  min_creatures: number;
  max_creatures: number;
  allow_weak_variants: boolean;
  allow_elite_variants: boolean;
  creature_roles: roles[] | undefined;
  is_pwl_on: boolean;
  pathfinder_version: string;
}) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(backendUrl + '/encounter/generator', requestOptions);
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
