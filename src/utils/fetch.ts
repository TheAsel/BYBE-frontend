export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = data?.message ?? response.status;
    throw new Error(typeof error === "string" ? error : String(error));
  }

  return data;
}

export async function apiFetchText(
  url: string,
  options?: RequestInit
): Promise<string> {
  const response = await fetch(url, options);
  const data = await response.text();

  if (!response.ok) {
    throw new Error(data);
  }

  return data;
}

export function buildUrl(
  baseUrl: string,
  pathSegments: string[],
  searchParams?: Record<string, string | number | boolean>
): string {
  const url = new URL(baseUrl);
  url.pathname = pathSegments.filter(Boolean).join("/");

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}
