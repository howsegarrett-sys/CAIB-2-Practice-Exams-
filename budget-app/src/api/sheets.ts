const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function request(token: string, url: string, options?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Sheets API ${res.status}: ${body}`);
  }
  return res.json();
}

/** Read a range and return a 2D array of strings (empty cells become ''). */
export async function getValues(
  token: string,
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const data = (await request(token, url)) as { values?: string[][] };
  return data.values ?? [];
}

/** Read a single cell value, returns '' if empty. */
export async function getSingleValue(
  token: string,
  spreadsheetId: string,
  range: string,
): Promise<string> {
  const rows = await getValues(token, spreadsheetId, range);
  return rows[0]?.[0] ?? '';
}

/**
 * Write a single value to a cell using USER_ENTERED input so that numbers
 * are treated as numbers (not text) by Sheets.
 */
export async function putValue(
  token: string,
  spreadsheetId: string,
  range: string,
  value: string | number,
): Promise<void> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  await request(token, url, {
    method: 'PUT',
    body: JSON.stringify({ values: [[value]] }),
  });
}

/** Fetch the logged-in user's email from the Google userinfo endpoint. */
export async function getUserEmail(token: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return '';
  const data = (await res.json()) as { email?: string };
  return data.email ?? '';
}
