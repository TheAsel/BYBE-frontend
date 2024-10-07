import { repo_info } from 'src/types/github';

export async function requestRepoInfo() {
  try {
    const requestOptions = {
      method: 'GET',
      headers: { accept: 'application/json' }
    };
    const response = await fetch(
      'https://api.github.com/repos/' + process.env.REPO_URL + '/releases/latest',
      requestOptions
    );
    console.log(process.env.REPO_URL);
    const data = await response.json();
    if (!response.ok) {
      const error = data?.message || response.status;
      throw new Error(error);
    }
    return data as repo_info;
  } catch (error) {
    console.error(error);
  }
}
