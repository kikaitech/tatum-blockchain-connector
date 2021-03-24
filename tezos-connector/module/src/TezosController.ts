import { TezosService } from './TezosService';
import { TezosError } from './TezosError';
import { Get, Param } from '@nestjs/common';

function throwError(e) {
  throw new TezosError(
    `Unexpected error occurred. Reason: ${e.message || e.response?.data || e}`,
    'cardano.error',
  );
}

export abstract class TezosController {
  protected constructor(protected readonly service: TezosService) {}

  @Get('/v3/tezos/:hash')
  async getBlock(@Param('hash') hash: string): Promise<any> {
    try {
      return await this.service.getBlock(hash);
    } catch (e) {
      throwError(e);
    }
  }

}