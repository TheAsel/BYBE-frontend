import type { games } from '../types/filters';
import type { npc, shareable_npc, valid_genders } from '../types/npcs';

export async function requestParameters(
  game: games,
  parameter: 'genders' | 'classes' | 'jobs' | 'cultures'
) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/npc/' + parameter,
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

export async function requestAncestries(game: games) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/npc/ancestries',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as valid_genders[];
  } catch (error) {
    console.error(error);
  }
}

export async function npcGenerator(
  game: games,
  body: {
    gender_filter?: string[] | undefined;
    name_origin_filter?: {
      FromPf?: {
        FromAncestry?: string[] | undefined;
        FromCulture?: string[] | undefined;
      };
      FromSf?: {
        FromAncestry?: string[] | undefined;
        FromCulture?: string[] | undefined;
      };
    };
    class_filter?: string[] | undefined;
    job_filter?: string[] | undefined;
    level_filter?: {
      min_level: number | undefined;
      max_level: number | undefined;
    };
    generate_nickname: boolean;
  }
) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/npc/generator',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as npc;
  } catch (error) {
    console.error(error);
  }
}

export async function npcParametersGenerator(
  game: games,
  parameter: 'ancestry' | 'class' | 'gender' | 'job' | 'nickname' | 'level' | 'culture'
) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/npc/generator/' + parameter,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as string;
  } catch (error) {
    console.error(error);
  }
}

export async function npcLevelGenerator(game: games) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/npc/generator/level',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as number;
  } catch (error) {
    console.error(error);
  }
}

export async function npcNamesGenerator(
  game: games,
  body: {
    ancestry?: string | undefined;
    gender?: string | undefined;
  }
) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(
      process.env.API_URL + '/' + game + '/npc/generator/names',
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

export async function generateNpcLink(body: shareable_npc) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(process.env.API_URL + '/shareable/npc/encode', requestOptions);
    const data = await response.text();
    if (!response.ok) {
      throw new Error(data);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function decodeNpcLink(encoded_data: string) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/shareable/npc/decode/' + encoded_data,
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as shareable_npc;
  } catch (error) {
    console.error(error);
  }
}
