import type { repo_info } from '../types/github';

export async function requestRepoInfo(repo: string) {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      'https://api.github.com/repos/' + repo + '/releases/latest',
      requestOptions
    );
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message ?? response.status;
      throw new Error(error);
    }
    return data as repo_info;
  } catch (error) {
    console.error(error);
  }
}
