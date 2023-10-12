import { backendUrl } from 'src/boot/globals';

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
    return data.results;
  } catch (error) {
    console.log(error);
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
    return data;
  } catch (error) {
    console.log(error);
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
    return data;
  } catch (error) {
    console.log(error);
  }
}
