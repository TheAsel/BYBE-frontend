import { backendUrl } from 'src/boot/globals';
import { creature } from 'src/types/creature';
import { encounter } from 'src/types/encounter';

export async function requestCreatures(start: number, end: number) {
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
}

export async function requestFilters(filter: 'families' | 'alignments' | 'sizes' | 'rarities') {
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
}

export async function encounterInfo(encounter: { enemy_levels: number[]; party_levels: number[] }) {
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
}
