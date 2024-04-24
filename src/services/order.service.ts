// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HttpException, Injectable } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import {
  chainId,
  consumer,
  consumerHostApiKey,
  consumerHostUrl,
} from '../config';
import { GET } from '../utils/apiRequest';
import { getLogger } from '../utils/logger';
import { getOrderManager } from '../utils/orderManager';
import { projectIdToDeploymentId } from '../utils/project';
import { ChainInfoService } from './chain.service';
import { NetworkclientService } from './networkclient.service';
import { RedisService } from './redis.service';
import {
  FlexPlan,
  IndexerOrder,
  IndexingMetadata,
  OrdersResult,
  ServiceAgreement,
  defaultIndexingMetadata,
} from './types';

const logger = getLogger('orders');

@Injectable()
export class OrderService {
  private indexingMetadataCache = new Map<string, IndexingMetadata>();
  constructor(
    private readonly networkClient: NetworkclientService,
    private readonly chainInfoService: ChainInfoService,
    private readonly reddisService: RedisService
  ) {}

  @Cron('*/2 * * * *')
  async updateIndexingMetadataPeriodically() {
    for (const key of this.indexingMetadataCache.keys()) {
      try {
        const [_, indexer, deploymentId] = key.split('_');

        const indexerUrl = await this.networkClient.getIndexerUrl(indexer);
        if (!indexerUrl) continue;

        // const latestBlockHeight =
        //   await this.chainInfoService.updateLatestBlockHeihgt(deploymentId);

        await this.updateIndexingMetadata(
          deploymentId,
          indexer,
          indexerUrl
          // latestBlockHeight
        );
      } catch (e) {
        logger.error(e, `updateIndexingMetadataPeriodically for ${key} error`);
      }
    }
  }

  async sortedOrders(
    deploymentId: string,
    orders: (IndexerOrder | undefined)[],
    dictionary: boolean
  ): Promise<IndexerOrder[]> {
    const { blockGap: otherBlockGap, dictionaryBlockGap } =
      (await this.chainInfoService.deploymentIdToChainConfig(deploymentId)) ?? {
        blockGap: 100,
        dictionaryBlockGap: 500,
      };
    const blockGap = dictionary ? dictionaryBlockGap : otherBlockGap;

    const indexerTopTargetHeight = Math.max(
      ...orders.map((order) => {
        return order?.metadata?.targetHeight || 0;
      })
    );

    let filteredOrders = orders.filter((order): order is IndexerOrder => {
      if (!order) return false;
      const lastProcessedHeight = order.metadata.lastProcessedHeight || 0;
      const lastHeight = order.metadata.lastHeight || lastProcessedHeight;
      const targetHeight = order.metadata.targetHeight;

      logger.info(
        `Indexer: ${order.indexer} order: ${order.id} lastHeight: ${lastHeight} targetHeight: ${targetHeight} indexerTopTargetHeight: ${indexerTopTargetHeight} blockGap: ${blockGap}`
      );
      // logger.info(`latestBlockHeight: ${latestBlockHeight}`); // use 3rd party service

      if (!targetHeight || !lastHeight) return false;
      return (
        targetHeight - lastHeight < blockGap &&
        indexerTopTargetHeight - lastHeight < blockGap * 1.5
      );
    });

    if (filteredOrders.length === 0) {
      logger.warn(
        `No available orders for ${deploymentId}, use top 3 highest orders instead`
      );
      filteredOrders = orders
        .filter((order): order is IndexerOrder => !!order)
        .sort((a, b) => {
          const aLastHeight = a.metadata?.lastHeight || 0;
          const bLastHeight = b.metadata?.lastHeight || 0;
          return bLastHeight - aLastHeight;
        })
        .slice(0, 3);
    }

    return filteredOrders;
  }

  async getIndexingMetadata(
    deploymentId: string,
    indexer: string,
    indexerUrl: string,
    latestBlockHeight?: number
  ): Promise<IndexingMetadata | undefined> {
    const cacheKey = `metadata_${indexer}_${deploymentId}`;
    const cachedMetadata = this.indexingMetadataCache.get(cacheKey);
    if (cachedMetadata) return cachedMetadata;

    const metadata = await this.updateIndexingMetadata(
      deploymentId,
      indexer,
      indexerUrl,
      latestBlockHeight
    );
    return metadata;
  }

  async updateIndexingMetadata(
    deploymentId: string,
    indexer: string,
    indexerUrl: string,
    latestBlockHeight?: number // FIXME
  ): Promise<IndexingMetadata | undefined> {
    const cacheKey = `metadata_${indexer}_${deploymentId}`;
    try {
      const url = new URL(`/metadata/${deploymentId}`, indexerUrl).toString();
      let indexingMetadata: IndexingMetadata;

      const data = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30_000,
      });

      try {
        indexingMetadata = data.data.data._metadata;
      } catch {
        indexingMetadata = data.data as IndexingMetadata;
      }

      const metadata = { ...indexingMetadata, latestBlockHeight };
      const cacheKey = `metadata_${indexer}_${deploymentId}`;
      this.indexingMetadataCache.set(cacheKey, metadata);

      logger.debug(`Update metadata: ${JSON.stringify(metadata)}`);

      return metadata;
    } catch (e) {
      logger.error(
        `Failed to get metadata from indexer: ${indexer} and url: ${indexerUrl}: ${String(
          e
        )}`
      );

      this.indexingMetadataCache.set(cacheKey, defaultIndexingMetadata);
      return;
    }
  }

  async getFlexPlans(
    deploymentId: string,
    apikey?: string
  ): Promise<FlexPlan[]> {
    const url = new URL(
      `/list/${deploymentId}?apikey=${apikey || consumerHostApiKey}`,
      consumerHostUrl
    ).toString();
    const plans = await GET<FlexPlan[]>(url);
    return plans;
  }

  async getOrders(
    deploymentId: string | undefined,
    apikey: string | undefined,
    dictionary = false
  ): Promise<OrdersResult> {
    if (!deploymentId || !consumer) {
      return {
        message: `No project found for project Id ${deploymentId ?? ''}`,
      };
    }

    let sas: ServiceAgreement[] = [];
    let flexPlans: FlexPlan[] = [];

    try {
      sas = await this.networkClient.getServiceAgreements(
        deploymentId,
        consumer
      );
    } catch (e) {
      logger.warn(`Failed to get service agreements: ${e}`);
    }

    try {
      flexPlans = await this.getFlexPlans(deploymentId, apikey);
    } catch (e) {
      logger.warn(`Failed to get flex plans: ${e}`);
    }

    if (sas.length === 0 && flexPlans.length === 0) {
      return {
        message: `No service agreements and flex plans for ${deploymentId}`,
      };
    }

    await this.chainInfoService.updateLatestBlockHeihgt(deploymentId);

    logger.info(`Found ${sas.length} service agreements for ${deploymentId}`);
    const agreements = await this.formatServiceAgreements(
      deploymentId,
      sas,
      dictionary
    );
    logger.info(
      `Got ${agreements.length} available service agreements after filtering`
    );

    logger.info(`Found ${flexPlans.length} flex plans for ${deploymentId}`);
    const plans = await this.formatFlexPlans(
      deploymentId,
      flexPlans,
      dictionary,
      apikey
    );
    logger.info(`Got ${plans.length} available flex plans after filtering`);

    const networkChainId = Number(chainId);

    return { agreements, plans, deploymentId, networkChainId };
  }

  async formatServiceAgreements(
    deploymentId: string,
    agreements: ServiceAgreement[],
    dictionary: boolean
  ): Promise<IndexerOrder[]> {
    if (agreements.length === 0) return [];

    // const latestBlockHeight =
    //   this.chainInfoService.latestBlockHeight(deploymentId);

    const formatItems = await Promise.all(
      agreements.map<Promise<IndexerOrder | undefined>>(async (agreement) => {
        const { id, deploymentId, indexerAddress: indexer } = agreement;
        const indexerUrl = await this.networkClient.getIndexerUrl(indexer);
        if (!indexerUrl) return;

        const metadata = await this.getIndexingMetadata(
          deploymentId,
          indexer,
          indexerUrl
          // latestBlockHeight
        );
        if (!metadata) return;

        const url = new URL(`/query/${deploymentId}`, indexerUrl).toString();
        return { id, url, indexer, metadata };
      })
    );

    const sortedItems = await this.sortedOrders(
      deploymentId,
      formatItems,
      dictionary
    );
    return sortedItems;
  }

  async formatFlexPlans(
    deploymentId: string,
    plans: FlexPlan[],
    dictionary: boolean,
    apikey?: string
  ): Promise<IndexerOrder[]> {
    if (plans.length === 0) return [];

    // const latestBlockHeight =
    //   this.chainInfoService.latestBlockHeight(deploymentId);

    const formatItems = await Promise.all(
      plans.map<Promise<IndexerOrder | undefined>>(async (plan) => {
        const { channel, indexer } = plan;
        const indexerUrl = await this.networkClient.getIndexerUrl(indexer);
        if (!indexerUrl) {
          return;
        }

        const metadata = await this.getIndexingMetadata(
          deploymentId,
          indexer,
          indexerUrl
          // latestBlockHeight
        );
        if (!metadata) {
          logger.warn(`${indexer} metadata not found`);
          return;
        }

        const id = `0x${channel}`;
        const score = await this.getOrderScore(
          indexer,
          deploymentId,
          id,
          apikey
        );
        const url = new URL(`/payg/${deploymentId}`, indexerUrl).toString();

        return { id, url, indexer, metadata, score };
      })
    );

    const sortedItems = this.sortedOrders(
      deploymentId,
      formatItems,
      dictionary
    );
    return sortedItems;
  }

  getOrderDeploymentId(projectId: string, projectCID?: string): string {
    if (!projectCID && !projectId) {
      throw new HttpException(
        { message: 'No project chain id or deployment id provided' },
        500
      );
    }

    const deploymentId = projectCID ?? projectIdToDeploymentId(projectId);
    if (!deploymentId) {
      throw new HttpException({ message: 'No deployment found' }, 500);
    }

    return deploymentId;
  }

  scoreCacheKey(indexer: string, deploymentId: string, agreementId: string) {
    return `${indexer}_${deploymentId}_${agreementId}`;
  }

  async getOrderScore(
    indexer: string,
    deploymentId: string,
    agreementId: string,
    apikey?: string
  ): Promise<number> {
    const orderManager = getOrderManager(deploymentId, apikey)?.orderManager;
    if (orderManager) {
      return orderManager.getScore(indexer);
    }

    const key = this.scoreCacheKey(indexer, deploymentId, agreementId);
    const score = await this.reddisService.get<number>(key);

    return score ?? 100;
  }

  async updateOrderScore(key: string, healthy: boolean) {
    const score = await this.reddisService.get<number>(key);
    const currentScore = score ?? 100;
    const updatedScore = healthy
      ? Math.max(currentScore + 1, 100)
      : Math.min(currentScore - 1, 0);

    if (score === updatedScore) return;

    await this.reddisService.set(key, updatedScore);
  }
}
