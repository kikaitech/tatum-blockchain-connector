import { TezosService } from './TezosService';
import { TezosError } from './TezosError';
import { Get, Param } from '@nestjs/common';
import { BlockHeaderResponse, BlockResponse } from '@taquito/rpc';


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

}