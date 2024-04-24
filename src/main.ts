// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as process from 'process';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import swStats from 'swagger-stats';

import { NestLogger } from './utils/logger';

async function bootstrap() {
  const isLocal = process.env.NODE_ENV === 'local';
  if (isLocal) {
    const dotenv = await import('dotenv');
    dotenv.config();
  }

  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule, {
    logger: new NestLogger(),
    cors: true,
  });

  const config = new DocumentBuilder()
    .setTitle('SQN Auth Service')
    .setDescription('The SQN Auth API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  if (isLocal) {
    SwaggerModule.setup('openapi', app, document);
  }

  app.use(
    swStats.getMiddleware({
      uriPath: '/stats',
      swaggerSpec: document,
      timelineBucketDuration: 300 * 1000, // makes /metrics reflecting 5 min period summary
    })
  );
  await app.listen(process.env.PORT ?? 3031);
}

void bootstrap();
