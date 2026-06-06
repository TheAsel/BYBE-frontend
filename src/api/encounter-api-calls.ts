import type { creature, creature_response } from 'src/types/creature';
import type {
  encounter,
  encounter_data,
  encounter_info,
  random_encounter,
  shareable_encounter
} from 'src/types/encounter';
import type {
  bestiary_ranges,
  creature_columns,
  creature_filters,
  games,
  hazard_columns,
  hazard_filters,
  hazard_ranges,
  variants
} from 'src/types/filters';
import type { hazard, hazard_response } from 'src/types/hazard';

export async function requestCreatures(
  game: games,
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
      '/' +
      game +
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
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as creature_response;
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazards(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: hazard_columns,
  order_by: 'ascending' | 'descending',
  body: hazard_filters
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
      '/' +
      game +
      '/hazard/list?cursor=' +
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
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as hazard_response;
  } catch (error) {
    console.error(error);
  }
}

export async function requestFilters(
  game: games,
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
    const response = await fetch(
      process.env.API_URL + '/' + game + '/bestiary/' + filter,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as string[];
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazardFilters(
  game: games,
  filter: 'traits' | 'sizes' | 'rarities' | 'sources'
) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/hazard/' + filter,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as string[];
  } catch (error) {
    console.error(error);
  }
}

export async function requestCreatureRanges(game: games) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/bestiary/ranges',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as bestiary_ranges;
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazardRanges(game: games) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/hazard/ranges',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as hazard_ranges;
  } catch (error) {
    console.error(error);
  }
}

export async function requestCreatureId(
  game: games,
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
        '/' +
        game +
        '/bestiary/' +
        variant.toLowerCase() +
        '/' +
        creature_id +
        '?extra_data=true&combat_data=true&spellcasting_data=true&is_pwl_on=' +
        is_pwl_on,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data.results as creature;
  } catch (error) {
    console.error(error);
  }
}

export async function requestHazardId(game: games, hazard_id: number) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/hazard/' + hazard_id,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data.results as hazard;
  } catch (error) {
    console.error(error);
  }
}

export async function encounterInfo(game: games, encounter: encounter_info) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(encounter)
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/encounter/info',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as encounter;
  } catch (error) {
    console.error(error);
  }
}

export async function encounterGenerator(game: games, body: encounter_data) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/encounter/generator',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as random_encounter;
  } catch (error) {
    console.error(error);
  }
}

export async function generateEncounterLink(body: shareable_encounter) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(
      process.env.API_URL + '/shareable/encounter/encode',
      requestOptions
    );
    const data = await response.text();
    if (!response.ok) {
      throw new Error(data);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function decodeEncounterLink(encoded_data: string) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/shareable/encounter/decode/' + encoded_data,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as shareable_encounter;
  } catch (error) {
    console.error(error);
  }
}
