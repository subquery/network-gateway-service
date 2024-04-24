// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StateChannel } from '@subql/network-query';
import { Request as RequestType } from 'express';

export type FlexPlan = Omit<StateChannel, 'nodeId'>;

export type Request<T, P = unknown> = RequestType<P, P, T>;
