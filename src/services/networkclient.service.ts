// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, gql } from '@apollo/client/core';
import { toChecksumAddress } from '@ethereumjs/util';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Injectable } from '@nestjs/common';
import { ContractSDK } from '@subql/contract-sdk';
import {
  GraphqlQueryClient,
  IPFSClient,
  bytes32ToCid,
} from '@subql/network-clients';

import { IPFS_URLS, NETWORK_CONFIGS, SQNetworks } from '@subql/network-config';
import {
  ChannelStatus,
  GetConsumerOngoingFlexPlans,
  GetConsumerOngoingFlexPlansQuery,
  GetConsumerOngoingServiceAgreementsQuery,
  GetProjectQuery,
  ServiceAgreementFields,
} from '@subql/network-query';

import { network, networkEndpoint } from '../config';
import { FlexPlan } from '../types';
import { getLogger } from '../utils/logger';
import { RedisService } from './redis.service';
import { ServiceAgreement } from './types';

const logger = getLogger('client');

const config = NETWORK_CONFIGS[network as SQNetworks];

@Injectable()
export class NetworkclientService {
  private networkQueryClient: ApolloClient<unknown>;
  private ipfsClient: IPFSClient;
  private contractSDK: ContractSDK;

  constructor(private readonly redisService: RedisService) {
    const client = new GraphqlQueryClient(config);
    this.networkQueryClient = client.networkClient;
    this.ipfsClient = new IPFSClient(IPFS_URLS.metadata);

    const provider = new StaticJsonRpcProvider(
      networkEndpoint ?? config.defaultEndpoint
    );
    this.contractSDK = new ContractSDK(provider, config.sdkOptions);
  }

  async getServiceAgreements(
    deploymentId: string,
    consumer: string,
    indexer?: string
  ): Promise<ServiceAgreement[]> {
    consumer = toChecksumAddress(consumer);
    indexer = indexer ? toChecksumAddress(indexer) : undefined;

    const result =
      await this.networkQueryClient.query<GetConsumerOngoingServiceAgreementsQuery>(
        {
          query: gql`
            query GetOngoingServiceAgreements(
              $deploymentId: String!
              $consumerAddress: String!
              $now: Datetime!
            ) {
              serviceAgreements(
                filter: {
                  deploymentId: { equalTo: $deploymentId }
                  consumerAddress: { equalTo: $consumerAddress }
                  endTime: { greaterThanOrEqualTo: $now }
                }
                orderBy: END_TIME_ASC
              ) {
                totalCount
                nodes {
                  ...ServiceAgreementFields
                }
              }
            }
            ${ServiceAgreementFields}
          `,
          variables: {
            deploymentId,
            consumerAddress: consumer,
            now: new Date(),
          },
        }
      );

    const sas = result.data.serviceAgreements?.nodes;
    if (!sas) return [];
    return sas.filter(
      (sa) =>
        sa &&
        sa.deploymentId === deploymentId &&
        (indexer
          ? sa.indexerAddress.toLowerCase() === indexer.toLowerCase()
          : true)
    ) as ServiceAgreement[];
  }

  /**
   * @deprecated
   */
  async getFlexPlans(
    deploymentId: string,
    consumer: string
  ): Promise<FlexPlan[]> {
    consumer = toChecksumAddress(consumer);

    const result =
      await this.networkQueryClient.query<GetConsumerOngoingFlexPlansQuery>({
        query: GetConsumerOngoingFlexPlans,
        variables: { consumer, now: new Date() },
      });

    const flexPlans = result.data.stateChannels?.nodes ?? [];
    return flexPlans.filter(
      (fp) =>
        fp &&
        fp.deployment?.id === deploymentId &&
        fp.status === ChannelStatus.OPEN
    ) as FlexPlan[];
  }

  async getLatestIndexerUrl(address: string) {
    try {
      const metadata = await this.contractSDK.indexerRegistry.metadata(address);
      const cid = bytes32ToCid(metadata);
      const indexerMetadata = await this.ipfsClient.getJSON<{
        name: string;
        url: string;
      }>(cid);

      return indexerMetadata.url;
    } catch (e) {
      logger.error(`Failed to get indexer latest url: ${String(e)}`);
      return '';
    }
  }

  async getChainId(deploymentId: string) {
    const chainIdKey = `chainId:${deploymentId}`;
    const result = await this.redisService.get<{ chainId: string }>(chainIdKey);
    if (result?.chainId) return result.chainId;

    const project = await this.ipfsClient.cat(deploymentId);
    const match =
      project.match(/chainId:\s*'(.*?)'/) ||
      project.match(/chainId:\s*"(.*?)"/) ||
      project.match(/chainId:\s*([^\s]*)/);

    const decodedChainId = match ? match[1] : '';

    await this.redisService.set(
      chainIdKey,
      JSON.stringify({ chainId: decodedChainId })
    );
    return decodedChainId;
  }

  async getIndexerUrl(address: string): Promise<string | undefined> {
    address = toChecksumAddress(address);

    const indexerUrlKey = `indexerUrl:${address}`;
    const result = await this.redisService.get<{ url: string }>(indexerUrlKey);
    if (result?.url) return result.url;

    const url = await this.getLatestIndexerUrl(address);
    if (!url) return;

    const random = Math.round(Math.random() * 10) - 5;

    const expiredSeconds = 60 * (30 + random); // 25 - 35 minutes
    await this.redisService.set(
      indexerUrlKey,
      JSON.stringify({ url }),
      expiredSeconds
    );
    return url;
  }

  async getDeploymentId(projectId: string): Promise<string | undefined> {
    projectId = ('' + projectId).toLowerCase();

    const deploymentIdKey = `deploymentId:${projectId}`;
    const result = await this.redisService.get<{ deploymentId: string }>(
      deploymentIdKey
    );
    if (result?.deploymentId) return result.deploymentId;

    const project = await this.networkQueryClient.query<GetProjectQuery>({
      query: gql`
        query GetProject($id: String!) {
          project(id: $id) {
            deploymentId
          }
        }
      `,
      variables: { id: projectId },
    });

    const deploymentId = project?.data?.project?.deploymentId;

    if (!deploymentId) return;

    await this.redisService.set(
      deploymentIdKey,
      JSON.stringify({ deploymentId }),
      24 * 60 * 60 // 1 day
    );
    return deploymentId;
  }
}
