import { TezosService } from './TezosService';
import { TezosError } from './TezosError';
import { Get, Param } from '@nestjs/common';
import {
  BlockHeaderResponse,
  BlockResponse,
  ContractResponse,
  PreapplyResponse
} from '@taquito/rpc';


function throwError(e) {
  throw new TezosError(
    `Unexpected error occurred. Reason: ${e.message || e.response?.data || e}`,
    'cardano.error',
  );
}

export abstract class TezosController {
  protected constructor(protected readonly service: TezosService) {}

  @Get('/v3/tezos/info')
  async getInfo(): Promise<BlockHeaderResponse> {
    try {
      return await this.service.getBlockChainInfo();
    } catch (e) {
      throwError(e);
    }
  }

  @Get('/v3/tezos/block/:hash')
  async getBlock(@Param('hash') hash: string): Promise<BlockResponse> {
    try {
      return await this.service.getBlock(hash);
    } catch (e) {
      throwError(e);
    }
  }

  @Get('/v3/tezos/account/:address')
  async getAccount(@Param('address') address: string): Promise<ContractResponse> {
    try {
      return await this.service.getAccount(address);
    } catch (e) {
      throwError(e);
    }
  }

  @Get('/v3/tezos/account/:address/transactions')
  async getTransactionsByAccount(@Param('address') address: string): Promise<PreapplyResponse[]> {
    try {
      return await this.service.getTransactionsByAccount(address);
    } catch (e) {
      throwError(e);
    }
  }

  @Get('/v3/tezos/transaction/:hash')
  async getTransaction(@Param('hash') hash: string): Promise<PreapplyResponse> {
    try {
      return await this.service.getTransaction(hash);
    } catch (e) {
      throwError(e);
    }
  }

}