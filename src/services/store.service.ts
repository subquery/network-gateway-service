// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
import { IStore } from '@subql/network-support';
import { RedisService } from './redis.service';

const ttl = 86_400;

@Injectable()
export class StoreService implements IStore {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.redisService.get<T>(key)) || undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.redisService.set(key, JSON.stringify(value), ttl);
  }

  async remove(key: string): Promise<void> {
    await this.redisService.client.del(key);
  }
}
