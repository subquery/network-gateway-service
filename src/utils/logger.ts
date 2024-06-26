// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isMainThread, threadId } from 'node:worker_threads';
import { LoggerService } from '@nestjs/common';
import { Logger } from '@subql/utils';
import Pino from 'pino';

let logger: Logger;

export function initLogger(
  debug = false,
  outputFmt?: 'json' | 'colored',
  logLevel?: string
): void {
  logger = new Logger({
    level: debug ? 'debug' : logLevel,
    outputFormat: outputFmt,
    nestedKey: 'payload',
  });
}
initLogger(!!process.env.DEBUG, 'colored', 'info');

export function getLogger(category: string): Pino.Logger {
  return logger.getLogger(category);
}

export class NestLogger implements LoggerService {
  private logger = logger.getLogger(
    `nestjs${isMainThread ? '-0' : `-#${threadId}`}`
  );

  error(message: any, trace?: string): void {
    if (trace) {
      this.logger.error({ trace }, message);
    } else {
      this.logger.error(message);
    }
  }

  log(message: any): void {
    this.logger.info(message);
  }

  warn(message: any): void {
    this.logger.warn(message);
  }
}
