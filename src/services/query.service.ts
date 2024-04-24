// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { Injectable } from '@nestjs/common';

import { DeploymentAuthOptions, deploymentHttpLink } from '@subql/apollo-links';
import { port, serviceUrl } from '../config';
import { getLogger } from '../utils/logger';

const defaultOptions = {
  authUrl: `${serviceUrl}:${port}`,
  httpOptions: { fetchOptions: { timeout: 5000 } },
};

@Injectable()
export class QueryService {
  private queryClients = new Map<string, ApolloClient<any>>();
  private logger = getLogger('QueryService');

  createGraphQLClient(deploymentId: string) {
    const options: DeploymentAuthOptions = {
      ...defaultOptions,
      deploymentId,
    };

    const { link } = deploymentHttpLink(options);
    const client = new ApolloClient({
      cache: new InMemoryCache({
        resultCaching: false,
        resultCacheMaxSize: 100,
      }),
      link,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    });

    return client;
  }

  getQueryClient(deploymentId: string) {
    let client = this.queryClients.get(deploymentId);
    if (!client) {
      client = this.createGraphQLClient(deploymentId);
      this.queryClients.set(deploymentId, client);
      this.logger.info(`Query client length: ${this.queryClients.size}`);
    }

    return client;
  }

  async query(
    deploymentId: string,
    operation: string,
    variables?: { [key: string]: any }
  ) {
    const client = this.getQueryClient(deploymentId);
    const query = gql`
      ${operation}
    `;

    // @ts-ignore
    const response = await client.query({
      query,
      variables,
      fetchPolicy: 'no-cache',
    });
    return response;
  }

  removeQueryClient(deploymentId: string) {
    const client = this.queryClients.get(deploymentId);
    if (client) {
      client.stop();
      this.queryClients.delete(deploymentId);
      this.logger.info(`Query client length: ${this.queryClients.size}`);
    }
  }
}
