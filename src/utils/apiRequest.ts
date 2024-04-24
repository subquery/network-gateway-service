// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';

export async function POST<T>(
  url: string,
  body: Record<string, string | number | string[] | undefined>
) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await axios.post<T>(url, body, { headers, timeout: 60_000 });

  return res.data;
}

export async function GET<T>(url: string) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await axios.get<T>(url, { headers, timeout: 60_000 });

  return res.data;
}
