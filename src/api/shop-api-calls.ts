import { apiFetch, apiFetchText, buildUrl } from 'src/utils/fetch';

import type { games, item_columns, item_filters, shop_ranges } from 'src/types/filters';
import type { item, item_response } from 'src/types/item';
import type { shareable_shop, shop_data } from 'src/types/shop';
import type { template_data } from 'src/types/template';

export async function requestFilters(game: games, filter: 'sources' | 'traits') {
  try {
    return await apiFetch<string[]>(buildUrl(process.env.API_URL!, [game, 'shop', filter]));
  } catch (error) {
    console.error(error);
  }
}

export async function requestTemplates(game: games) {
  try {
    return await apiFetch<template_data[]>(
      buildUrl(process.env.API_URL!, [game, 'shop', 'templates_data'])
    );
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
  try {
    const url = buildUrl(process.env.API_URL!, [game, 'shop', 'list'], {
      cursor: String(cursor),
      page_size: String(page_size === 0 ? -1 : page_size),
      sort_by,
      order_by
    });
    return await apiFetch<item_response>(url, {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error(error);
  }
}

export async function requestShopRanges(game: games) {
  try {
    return await apiFetch<shop_ranges>(buildUrl(process.env.API_URL!, [game, 'shop', 'ranges']));
  } catch (error) {
    console.error(error);
  }
}

export async function requestItemId(game: games, item_id: number) {
  try {
    const data = await apiFetch<{ results: item }>(
      buildUrl(process.env.API_URL!, [game, 'shop', 'item', String(item_id)])
    );
    return data.results;
  } catch (error) {
    console.error(error);
  }
}

export async function shopGenerator(game: games, body: shop_data) {
  try {
    return await apiFetch<item_response>(
      buildUrl(process.env.API_URL!, [game, 'shop', 'generator']),
      {
        method: 'POST',
        headers: { accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function generateShopLink(body: shareable_shop) {
  try {
    return await apiFetchText(buildUrl(process.env.API_URL!, ['shareable', 'shop', 'encode']), {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error(error);
  }
}

export async function decodeShopLink(encoded_data: string) {
  try {
    return await apiFetch<shareable_shop>(
      buildUrl(process.env.API_URL!, ['shareable', 'shop', 'decode', encoded_data])
    );
  } catch (error) {
    console.error(error);
  }
}
