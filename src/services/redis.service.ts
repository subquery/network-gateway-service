// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
// import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import Redis from 'ioredis';
import { redisSentinelName, redisSentinels, redisUrl } from '../config';
import { getLogger } from '../utils/logger';

export const redisLogger = getLogger('redis');

@Injectable()
export class RedisService {
  private redisClient: Redis;
  constructor() {
    if (redisSentinels.length > 0) {
      redisLogger.info(`Use sentinels: ${redisSentinelName}`);
      for (const item of redisSentinels) {
        redisLogger.info(`Use sentinels: ${item.host}:${item.port}`);
      }
      this.redisClient = new Redis({
        sentinels: redisSentinels,
        name: redisSentinelName,
      });
    } else {
      redisLogger.info(`Use redis: ${redisUrl}`);
      this.redisClient = new Redis(redisUrl);
    }

    this.redisClient.on('connect', () =>
      redisLogger.info('Redis client connected!')
    );
    this.redisClient.on('error', (err: unknown) => {
      // FIXME: sentry
      // this.client
      //   .instance()
      //   .captureException(`Redis client error: ${String(err)}`);
      redisLogger.info(`Redis client error: ${String(err)}`);
    });
    this.redisClient.on('reconnecting', () =>
      redisLogger.info('Redis client is reconnecting')
    );
    this.redisClient.on('ready', () =>
      redisLogger.info('Redis client is ready')
    );
  }

  get client() {
    return this.redisClient;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;

    return JSON.parse(value);
  }

  async set(
    key: string,
    value: string | number | Buffer,
    seconds?: number
  ): Promise<void> {
    const _seconds = seconds || 60 * 60 * 24 * 7;
    await this.redisClient.set(key, value, 'EX', _seconds);
  }
}
