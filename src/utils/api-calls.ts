import { backendUrl } from 'src/boot/globals';
import { creature } from 'src/types/creature';
import { encounter, randomEncounter } from 'src/types/encounter';
import { alignments, sizes, rarities, challenges } from 'src/types/filters';

export async function requestCreatures(start: number, end: number) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      backendUrl +
        '/bestiary/list?sort_key=Name&order_by=Ascending&cursor=' +
        start +
        '&page_size=' +
        end,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = (data && data.message) || response.status;
      throw error;
    }
    return data.results as creature[];
  } catch (error) {
    console.error(error);
  }
}

export async function requestFilters(
  filter: 'traits' | 'alignments' | 'sizes' | 'rarities' | 'families' | 'creature_types' | 'sources'
) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(backendUrl + '/bestiary/' + filter, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = (data && data.message) || response.status;
      throw error;
    }
    return data as string[];
  } catch (error) {
    console.error(error);
  }
}

export async function encounterInfo(encounter: { enemy_levels: number[]; party_levels: number[] }) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(encounter)
    };
    const response = await fetch(backendUrl + '/encounter/info', requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = (data && data.message) || response.status;
      throw error;
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
      const error = (data && data.message) || response.status;
      throw error;
    }
    return data as randomEncounter;
  } catch (error) {
    console.error(error);
  }
}
