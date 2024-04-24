// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createFetch } from '@subql/network-support';
import { getLogger } from '../utils/logger';
import {
  cleanupOrderManagerMap,
  getOrCreateOrderManager,
} from '../utils/orderManager';
import { StoreService } from './store.service';

const logger = getLogger('QueryCommonService');
const fetchLogger = getLogger('QueryCommonService:Fetch');

@Injectable()
export class QueryCommonService {
  private static readonly MAX_RETRY = 3;
  private static readonly TIMEOUT = 35_000;

  constructor(private readonly storeService: StoreService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  runCleanupOrderManagerMap() {
    cleanupOrderManagerMap();
  }

  async query(
    deploymentId: string,
    requestBody: any,
    apikey?: string,
    fallbackServiceUrl?: string
  ) {
    const orderManager = getOrCreateOrderManager(
      deploymentId,
      apikey,
      this.storeService,
      fallbackServiceUrl
    );
    return Promise.race([
      createFetch(
        orderManager,
        QueryCommonService.MAX_RETRY,
        fetchLogger
      )({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // for fallbackServiceUrl
        },
        body: JSON.stringify(requestBody),
      }).then((res: Response) => res.json()),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout')),
          QueryCommonService.TIMEOUT
        )
      ),
    ]);
  }
}
