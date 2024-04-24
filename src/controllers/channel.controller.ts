// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { consumerHostApiKey, consumerHostUrl } from '../config';
import { NetworkclientService } from '../services/networkclient.service';
import * as API from '../utils/apiRequest';

type ChannelState = {
  channelId: string;
  indexer: string;
  consumer: string;
  spent: string;
  remote: string;
  isFinal: boolean;
  indexerSign: string;
  consumerSign: string;
};

type AuthState = {
  authorization: string;
};

class RequestSignatureDto {
  @ApiProperty()
  deployment: string;
  @ApiProperty()
  channelId: string;
  @ApiProperty()
  apikey?: string;
}

class RequestStateDto {
  @ApiProperty()
  channelId: string;
  @ApiProperty()
  spent: string;
  @ApiProperty()
  isFinal: string;
  @ApiProperty()
  indexerSign: string;
  @ApiProperty()
  consumerSign: string;
  @ApiProperty()
  remote: string;
  @ApiProperty()
  apikey?: string;
}

@Controller('channel')
@ApiTags('channel')
export class ChannelController {
  constructor(private readonly networkClient: NetworkclientService) {}

  @Post('/sign')
  async requestSignature(
    @Body() { deployment, channelId, apikey }: RequestSignatureDto
  ): Promise<AuthState> {
    try {
      const url = `${consumerHostUrl}/sign/${deployment}?apikey=${
        apikey || consumerHostApiKey
      }&channel=${channelId}`;
      const state = await API.POST<AuthState>(url, {});

      // FIXME: the kepler consumer host still use the `Authorization` structure
      // @ts-ignore
      let authorization = state?.authorization ?? state?.Authorization;
      if (!authorization) {
        authorization = Buffer.from(JSON.stringify(state), 'utf-8').toString(
          'base64'
        );
      }

      return { authorization };
    } catch (e) {
      throw new HttpException(
        { code: 2000, error: 'Failed to get channel state' },
        500
      );
    }
  }

  @Post('/state')
  async requestState(
    @Body()
    {
      channelId,
      spent,
      isFinal,
      indexerSign,
      consumerSign,
      remote,
      apikey,
    }: RequestStateDto
  ): Promise<ChannelState> {
    try {
      const url = `${consumerHostUrl}/state/${channelId}?apikey=${
        apikey || consumerHostApiKey
      }`;

      const body = { spent, isFinal, indexerSign, consumerSign, remote };
      const state = await API.POST<ChannelState>(url, body);
      return state;
    } catch (e) {
      throw new HttpException(
        { code: 2000, error: 'Failed to sync channel state' },
        500
      );
    }
  }
}
