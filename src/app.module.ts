// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChannelController } from './controllers/channel.controller';
import { HealthController } from './controllers/healthy.controller';
import { OrderController } from './controllers/order.controller';
import { ProxyQueryController } from './controllers/query.controller';
import { ChainInfoService } from './services/chain.service';
import { NetworkclientService } from './services/networkclient.service';
import { OrderService } from './services/order.service';
import { QueryCommonService } from './services/query.common.service';
import { QueryService } from './services/query.service';
import { RedisService } from './services/redis.service';
import { StoreService } from './services/store.service';

@Module({
  // imports: [
  //   SentryModule.forRoot({
  //     dsn: process.env.SENTRY_DSN,
  //     environment: process.env.NODE_ENV,
  //   }),
  // ],
  imports: [ScheduleModule.forRoot()],
  controllers: [
    OrderController,
    ChannelController,
    ProxyQueryController,
    HealthController,
  ],
  providers: [
    NetworkclientService,
    RedisService,
    OrderService,
    ChainInfoService,
    QueryService,
    QueryCommonService,
    ProxyQueryController,
    StoreService,
    //   {
    //     provide: APP_INTERCEPTOR,
    //     useFactory: () => new SentryInterceptor({
    //       filters: [{
    //         type: HttpException,
    //         filter: (exception: HttpException) => {
    //           const statusCode = exception.getStatus();
    //           return statusCode >= 400 && statusCode < 600;
    //         },
    //       }]
    //     }),
    //   }
  ],
})
export class AppModule {}
