import { apiFetch } from 'src/utils/fetch';

import type { repo_info } from 'src/types/github';

export async function requestRepoInfo(repo: string) {
  try {
    return await apiFetch<repo_info>(`https://api.github.com/repos/${repo}/releases/latest`);
  } catch (error) {
    console.error(error);
  }
}
