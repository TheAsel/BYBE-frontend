import { backendUrl } from 'src/boot/globals';
import { creature } from 'src/types/creature';
import { encounter, randomEncounter } from 'src/types/encounter';

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

export async function requestFilters(filter: 'families' | 'alignments' | 'sizes' | 'rarities') {
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

export async function encounterGenerator(
  party: { party_levels: number[] },
  family?: string,
  alignment?: 'Any' | 'CE' | 'CN' | 'CG' | 'NE' | 'N' | 'NG' | 'LE' | 'LN' | 'LG' | 'No Alignment',
  size?: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan',
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Unique',
  challenge?: 'Trivial' | 'Low' | 'Moderate' | 'Severe' | 'Extreme' | 'Impossible'
) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(party)
    };
    let query = '';
    if (family) {
      query = query + 'family=' + family + '&';
    }
    if (alignment) {
      query = query + 'alignment=' + alignment + '&';
    }
    if (size) {
      query = query + 'size=' + size + '&';
    }
    if (rarity) {
      query = query + 'rarity=' + rarity + '&';
    }
    if (challenge) {
      query = query + 'challenge=' + challenge + '&';
    }
    const response = await fetch(backendUrl + '/encounter/generator?' + query, requestOptions);
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
