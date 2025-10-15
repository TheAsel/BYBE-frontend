import type { games, item_columns, item_filters } from '../types/filters';
import type { item, item_response } from '../types/item';
import type { template_data } from '../types/template';
import type { shareable_shop } from 'src/types/shop';

export async function requestFilters(game: games, filter: 'sources' | 'traits') {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/shop/' + filter,
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

export async function requestTemplates(game: games) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/shop/templates_data',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as template_data[];
  } catch (error) {
    console.error(error);
  }
}

export async function requestItems(
  game: games,
  cursor: number,
  page_size: number,
  sort_by: item_columns,
  order_by: 'ascending' | 'descending',
  body: item_filters
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
      '/shop/list?cursor=' +
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
    return data as item_response;
  } catch (error) {
    console.error(error);
  }
}

export async function requestItemId(game: games, item_id: number) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/shop/item/' + item_id,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data.results as item;
  } catch (error) {
    console.error(error);
  }
}

export async function shopGenerator(
  game: games,
  body: {
    consumable_dices: {
      dice_size: number | null;
      n_of_dices: number | null;
    }[];
    equippable_dices: {
      dice_size: number | null;
      n_of_dices: number | null;
    }[];
    min_level: number;
    max_level: number;
    shop_template?: string;
    pathfinder_version: string;
  }
) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/shop/generator',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as item_response;
  } catch (error) {
    console.error(error);
  }
}

export async function generateShopLink(body: shareable_shop) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(process.env.API_URL + '/shareable/shop/encode', requestOptions);
    const data = await response.text();
    if (!response.ok) {
      throw new Error(data);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function decodeShopLink(encoded_data: string) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/shareable/shop/decode/' + encoded_data,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as shareable_shop;
  } catch (error) {
    console.error(error);
  }
}
