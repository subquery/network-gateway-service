// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ServiceAgreement as Agreement } from '@subql/network-query';

export type IndexingMetadata = {
  indexerHealthy: boolean; // TODO: remove this after upgrade
  subqueryHealthy: boolean;
  indexerNodeVersion: string;
  queryNodeVersion: string;
  lastProcessedHeight: number; // TODO: remove this after upgrade
  lastHeight: number;
  targetHeight: number;
};

export const defaultIndexingMetadata = {
  indexerHealthy: false,
  subqueryHealthy: false,
  indexerNodeVersion: '',
  queryNodeVersion: '',
  lastProcessedHeight: 0,
  lastHeight: 0,
  targetHeight: 0,
};

export type ServiceAgreement = Omit<Agreement, 'nodeId'>;

export type FlexPlan = {
  channel: string;
  indexer: string;
};

export type IndexerOrder = {
  id: string;
  url: string;
  indexer: string;
  metadata: IndexingMetadata;
};

export type OrdersResult = {
  agreements?: IndexerOrder[];
  plans?: IndexerOrder[];
  deploymentId?: string;
  networkChainId?: number;
  message?: string;
  code?: number;
  error?: string;
};
