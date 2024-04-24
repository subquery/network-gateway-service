// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Body,
  Controller,
  Get,
  Header,
  HttpException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { requestAuthToken } from '@subql/apollo-links';

import { chainId, consumer, network, sk } from '../config';
import { chainIdToDeploymentId } from '../constants';
import { NetworkclientService } from '../services/networkclient.service';
import { OrderService } from '../services/order.service';
import { OrdersResult } from '../services/types';
import { getLogger } from '../utils/logger';

class RequestTokenDto {
  @ApiProperty()
  indexer: string;
  @ApiProperty()
  agreementId: string;
  @ApiPropertyOptional()
  projectId?: string;
  @ApiPropertyOptional()
  deploymentId?: string;
}

class ReportHealthDto {
  @ApiProperty()
  indexer: string;
  @ApiProperty()
  agreementId: string;
  @ApiPropertyOptional()
  projectId?: string;
  @ApiPropertyOptional()
  deploymentId?: string;
  @ApiProperty()
  healthy: boolean;
}

@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(
    private readonly networkClient: NetworkclientService,
    private readonly orderService: OrderService
  ) {}

  @Get('dictionary/:id')
  @ApiParam({ name: 'id', type: 'string' })
  async requestOrdersWithChainId(
    @Param('id') id: string,
    @Query('apikey') apikey?: string
  ): Promise<OrdersResult> {
    try {
      const deploymentId = chainIdToDeploymentId[network as string][id];
      const orders = await this.orderService.getOrders(
        deploymentId,
        apikey,
        true
      );

      return orders;
    } catch (e) {
      throw new HttpException(
        { code: 1000, error: `Failed to get orders` },
        500
      );
    }
  }

  @Get('deployment/:id')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiParam({ name: 'id', type: 'string' })
  async requestOrdersWithDeploymentId(
    @Param('id') id: string,
    @Query('apikey') apikey?: string
  ): Promise<OrdersResult> {
    try {
      const orders = await this.orderService.getOrders(id, apikey);
      return orders;
    } catch (e) {
      throw new HttpException(
        { code: 1000, error: 'Failed to get orders' },
        500
      );
    }
  }

  @Post('token')
  async requestToken(
    @Body()
    {
      indexer,
      projectId = '',
      deploymentId: projectCID,
      agreementId,
    }: RequestTokenDto
  ) {
    const deploymentId = this.orderService.getOrderDeploymentId(
      projectId,
      projectCID
    );
    const indexerUrl = await this.networkClient.getIndexerUrl(indexer);
    if (!indexerUrl) {
      throw new HttpException(
        { code: 1010, error: `Failed to get indexer detail: ${indexer}` },
        500
      );
    }

    try {
      const timestamp = Date.now();
      const agreement = agreementId;
      const message = { indexer, consumer, agreement, deploymentId, timestamp };
      const authUrl = new URL('/token', indexerUrl).toString();
      const token = await requestAuthToken(
        authUrl,
        message,
        sk!,
        Number(chainId)
      );
      getLogger('token').info(
        `Get token for indexer: ${indexer} with agreement: ${agreement} and url: ${authUrl}`
      );

      return { token };
    } catch (e) {
      getLogger('token').error(
        e,
        `Failed to get token for indexer: ${indexer} with error`
      );
      throw new HttpException(
        { code: 1010, error: `Failed to get token for indexer: ${indexer}` },
        500
      );
    }
  }

  @Post('health')
  async reportHealth(
    @Body()
    {
      indexer,
      projectId = '',
      deploymentId: projectCID,
      agreementId,
      healthy,
    }: ReportHealthDto
  ) {
    try {
      const deploymentId = this.orderService.getOrderDeploymentId(
        projectId,
        projectCID
      );
      const scoreKey = this.orderService.scoreCacheKey(
        indexer,
        deploymentId,
        agreementId
      );
      await this.orderService.updateOrderScore(scoreKey, healthy);

      return { success: true };
    } catch (e) {
      getLogger('health').error(
        e,
        `Failed to report health for indexer: ${indexer}`
      );
      throw new HttpException(
        { code: 1020, error: `Failed to report health: ${String(e)}` },
        500
      );
    }
  }
}
