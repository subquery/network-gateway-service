// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
import { ChainConfig, chainIdToConfig } from '../constants';
import { POST } from '../utils/apiRequest';
import { getLogger } from '../utils/logger';
import { NetworkclientService } from './networkclient.service';
import { RedisService } from './redis.service';

const logger = getLogger('chainInfo');

@Injectable()
export class ChainInfoService {
  private blockheights = new Map<string, number>();

  constructor(
    private readonly networkClient: NetworkclientService,
    private readonly redisService: RedisService
  ) {}

  async deploymentIdToChainConfig(
    deploymentId: string
  ): Promise<ChainConfig | undefined> {
    const cacheKey = `chainId:${deploymentId}`;
    const result = await this.redisService.get<{ chainId: string }>(cacheKey);
    if (result?.chainId) {
      return chainIdToConfig[result.chainId];
    }

    const chainId = await this.networkClient.getChainId(deploymentId);
    logger.info(`Project [ ${deploymentId} ] chainId: ${chainId}`);

    await this.redisService.set(cacheKey, JSON.stringify({ chainId }));

    return chainIdToConfig[chainId];
  }

  latestBlockHeight(deploymentId: string): number {
    const key = `latestBlockHeight:${deploymentId}`;
    return this.blockheights.get(key) || 0;
  }

  async updateLatestBlockHeihgt(deploymentId: string): Promise<number> {
    try {
      let blockHeight = 0;
      const { rpc, method } =
        (await this.deploymentIdToChainConfig(deploymentId)) ?? {};
      if (!rpc || !method) return blockHeight;

      const requestData = { method, params: [], jsonrpc: '2.0', id: 1 };
      const { result } = await POST<{ result: { number: string } | string }>(
        rpc,
        requestData
      );

      if (typeof result === 'string') {
        blockHeight = parseInt(result);
      } else if (result.number) {
        blockHeight = parseInt(result.number);
      }

      this.blockheights.set(`latestBlockHeight:${deploymentId}`, blockHeight);

      return blockHeight;
    } catch (e) {
      logger.error(
        `Failed to get latest block height for deployment: ${deploymentId}: ${String(
          e
        )}`
      );
      return 0;
    }
  }
}
