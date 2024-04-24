// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';

export const port = process.env.PORT ?? 3030;
export const consumer = process.env.CONSUMER;
export const network = process.env.NETWORK;
export const networkEndpoint = process.env.NETWORK_ENDPOINT;
export const chainId = process.env.CHAIN_ID;
export const sk = process.env.SK;
export const serviceUrl =
  process.env.INTERNAL_SERVICE_URL ?? 'http://localhost';

export const consumerHostUrl =
  process.env.CONSUMER_HOST_URL ?? 'https://dev-chs.thechaindata.com';
export const consumerHostApiKey =
  process.env.CONSUMER_HOST_API_KEY ?? 'testKey';

export const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisSentinelName = process.env.REDIS_SENTINEL_NAME || 'mymaster';
export const redisSentinels: { host: string; port: number }[] = process.env
  .REDIS_SENTINELS
  ? process.env.REDIS_SENTINELS.split(';').map(function (item) {
      const lastIndex = item.lastIndexOf(':');
      const host = item.slice(0, lastIndex);
      const port = Number(item.slice(lastIndex + 1));
      return { host: host, port: port };
    })
  : [];

assert(port, 'PORT is required');
assert(consumer, 'CONSUMER is required');
assert(network, 'NETWORK is required');
assert(chainId, 'CHAIN_ID is required');
assert(sk, 'SK is required');
assert(consumerHostUrl, 'CONSUMER_HOST_URL is required');
assert(consumerHostApiKey, 'CONSUMER_HOST_API_KEY is required');
