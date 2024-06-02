import { backendUrl } from 'src/boot/globals';
import type { item_filters } from 'src/types/filters';
import type { item, item_response } from 'src/types/item';

export async function requestItems(
  start: number,
  page_size: number,
  filters: item_filters,
  version: string
) {
  if (page_size === 0) {
    page_size = -1;
  }
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    let request =
      backendUrl +
      '/shop/list?cursor=' +
      start +
      '&page_size=' +
      page_size +
      '&pathfinder_version=' +
      version +
      '&sort_by=' +
      filters.sort_by +
      '&order_by=' +
      filters.order_by;
    if (filters.name) {
      request += '&name_filter=' + filters.name;
    }
    if (filters.level.min != undefined) {
      request += '&min_level_filter=' + filters.level.min;
    }
    if (filters.level.max != undefined) {
      request += '&max_level_filter=' + filters.level.max;
    }
    if (filters.type) {
      request += '&type_filter=' + filters.type;
    }
    const response = await fetch(request, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as item_response;
  } catch (error) {
    console.error(error);
  }
}

export async function requestItemId(item_id: number) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(backendUrl + '/shop/item/' + item_id, requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data.results as item;
  } catch (error) {
    console.error(error);
  }
}

export async function shopGenerator(body: {
  consumable_dices: {
    dice_size: number | null;
    n_of_dices: number | null;
  }[];
  equipment_dices: {
    dice_size: number | null;
    n_of_dices: number | null;
  }[];
  min_level: number;
  max_level: number;
  shop_type: '' | 'Blacksmith' | 'Alchemist' | 'General' | null;
  pathfinder_version: string;
}) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(backendUrl + '/shop/generator', requestOptions);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as item_response;
  } catch (error) {
    console.error(error);
  }
}
