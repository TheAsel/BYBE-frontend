import type { npc, valid_genders } from '../types/npcs';

export async function requestParameters(parameter: 'genders' | 'classes' | 'jobs') {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(process.env.API_URL + '/npc/' + parameter, requestOptions);
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

export async function requestAncestries() {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(process.env.API_URL + '/npc/ancestries', requestOptions);
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

export async function npcGenerator(body: {
  gender_filter?: string[] | undefined;
  ancestry_filter?: string[] | undefined;
  class_filter?: string[] | undefined;
  job_filter?: string[] | undefined;
  generate_nickname: boolean;
}) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(process.env.API_URL + '/npc/generator', requestOptions);
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
  parameter: 'ancestry' | 'class' | 'gender' | 'job' | 'nickname' | 'level'
) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' }
    };
    const response = await fetch(
      process.env.API_URL + '/npc/generator/' + parameter,
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

export async function npcNamesGenerator(body: {
  ancestry?: string | undefined;
  gender?: string | undefined;
}) {
  try {
    const requestOptions = {
      method: 'POST',
      headers: { accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    const response = await fetch(process.env.API_URL + '/npc/generator/names', requestOptions);
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
