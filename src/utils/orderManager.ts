// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IStore, OrderManager, ProjectType } from '@subql/network-support';
import { port, serviceUrl } from '../config';
import { getLogger } from './logger';

export interface OrderManagerStore {
  orderManager: OrderManager;
  lastUsed: number;
}

const logger = getLogger('utils:OrderManager');
const orderManagerMap = new Map<string, OrderManagerStore>();
const CLEANUP_TIMEOUT = 1800_000;

function getOrderManagerKey(deploymentId: string, apikey?: string) {
  return `${deploymentId}${apikey ? '-' : ''}${apikey || ''}`;
}

export function getOrderManager(deploymentId: string, apikey?: string) {
  const key = getOrderManagerKey(deploymentId, apikey);
  logger.debug(`Get OrderManager: ${key}`);
  return orderManagerMap.get(key);
}

export function getOrCreateOrderManager(
  deploymentId: string,
  apikey?: string,
  scoreStore?: IStore,
  fallbackServiceUrl?: string
) {
  const key = getOrderManagerKey(deploymentId, apikey);
  logger.debug(`Get or create OrderManager: ${key}`);
  let orderManagerStore = orderManagerMap.get(key);
  if (!orderManagerStore) {
    orderManagerStore = {
      orderManager: new OrderManager({
        logger: getLogger('OrderManager'),
        authUrl: `${serviceUrl}:${port}`,
        apikey,
        projectId: deploymentId,
        projectType: ProjectType.deployment,
        scoreStore,
        fallbackServiceUrl,
        selector: {
          // runnerAddresses: [''],
        },
      }),
      lastUsed: Date.now(),
    };
    orderManagerMap.set(key, orderManagerStore);
    logger.info(`OrderManager ${key} is added to the map`);
  } else {
    orderManagerStore.lastUsed = Date.now();
  }
  return orderManagerStore.orderManager;
}

export function cleanupOrderManagerMap() {
  const now = Date.now();
  for (const [key, value] of orderManagerMap) {
    if (now - value.lastUsed > CLEANUP_TIMEOUT) {
      value.orderManager.cleanup();
      orderManagerMap.delete(key);
      logger.info(`OrderManager ${key} is removed from the map`);
    }
  }
}
