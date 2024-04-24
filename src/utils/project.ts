// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isCID } from '@subql/network-clients';

import { network } from '../config';
import { chainIdToDeploymentId } from '../constants';

export function projectIdToDeploymentId(projectId: string): string | undefined {
  try {
    const deploymentId = chainIdToDeploymentId[network as string][projectId];
    if (deploymentId) return deploymentId;

    if (isCID(projectId)) return projectId;
    return undefined;
  } catch {
    return undefined;
  }
}
