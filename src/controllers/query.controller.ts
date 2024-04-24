// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Param,
  Query,
  Post,
  Get,
  Req,
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { BurstyRateLimiter, RateLimiterRedis } from 'rate-limiter-flexible';
import { NetworkclientService } from '../services/networkclient.service';
import { QueryCommonService } from '../services/query.common.service';
import { RedisService } from '../services/redis.service';
import { getLogger } from '../utils/logger';

const logger = getLogger('ProxyQueryController');

export class GraphQLQueryDto {
  @ApiProperty()
  query: string;

  @ApiProperty({ required: false })
  variables?: { [key: string]: any };
}

export class RpcQueryDto {
  @ApiProperty({ required: false })
  jsonrpc?: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  params: { [key: string]: any };

  @ApiProperty({ required: false })
  id?: number;
}

@Controller('query')
@ApiTags('query')
export class ProxyQueryController {
  private burstyLimiter: BurstyRateLimiter;

  constructor(
    private readonly redisService: RedisService,
    private readonly queryCommonService: QueryCommonService,
    private readonly networkClient: NetworkclientService
  ) {
    this.burstyLimiter = new BurstyRateLimiter(
      new RateLimiterRedis({
        storeClient: this.redisService.client,
        keyPrefix: 'gateway-rate-limit',
        points: 5,
        duration: 1,
      }),
      new RateLimiterRedis({
        storeClient: this.redisService.client,
        keyPrefix: 'gateway-rate-burst',
        points: 100,
        duration: 10,
      })
    );
  }

  @Get('/:id')
  @HttpCode(200)
  async proxyQueryGet(
    @Param('id') id: string,
    @Query() queryParam: GraphQLQueryDto | RpcQueryDto,
    @Req() req: any
  ) {
    return this.proxyQuery(id, queryParam, req);
  }

  @Post('/:id')
  @HttpCode(200)
  async proxyQuery(
    @Param('id') id: string,
    @Body() requestBody: GraphQLQueryDto | RpcQueryDto,
    @Req() req: any,
    fallbackServiceUrl?: string
  ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logger.debug(
      `Received query request from [${req.headers['x-forwarded-for']}] || [${req.connection.remoteAddress}] = [${ip}]`
    );
    if ((requestBody as RpcQueryDto).method && !req.path?.startsWith('/mx/')) {
      try {
        await this.burstyLimiter.consume(ip, 1);
      } catch (e) {
        throw new HttpException(
          { code: 2001, error: 'Rate limit exceeded' },
          429
        );
      }
    }

    try {
      const origin = id;
      if (id.startsWith('0x')) {
        id = (await this.networkClient.getDeploymentId(id)) ?? '';
      }
      if (!id.startsWith('Qm')) {
        throw new Error(`Invalid deploymentId [ ${origin} ]`);
      }
      const response = await this.queryCommonService.query(
        id,
        requestBody,
        req.query?.apikey,
        fallbackServiceUrl
      );
      return response;
    } catch (e) {
      logger.error(
        `Proxy request with deployment id ${id} failed: ${String(e)}`
      );
      throw new HttpException(
        { code: 2000, error: `Request failed: ${String(e)}` },
        500
      );
    }
  }
}
