import { PinoLogger } from 'nestjs-pino';
import { TezosToolkit } from '@taquito/taquito';
import { TezBridgeSigner } from '@taquito/tezbridge-signer';

// const tezos = new TezosToolkit('https://edonet-tezos.giganode.io/');
// tezos.setProvider({ signer: new TezBridgeSigner() });

import { BlockHeaderResponse, BlockResponse, RpcClient } from '@taquito/rpc';

export abstract class TezosService {
  protected constructor(protected readonly logger: PinoLogger) {}

  protected abstract getRpcClient(): Promise<string>;

  public async getBlockChainInfo(): Promise<BlockHeaderResponse> {
    const url = await this.getRpcClient();
    const block = new RpcClient(url).getBlockHeader();
    return block;
  }

  public async getBlock(hash:string): Promise<BlockResponse> {
    const url = await this.getRpcClient();
    const block = new RpcClient(url).getBlock({ block: `${hash}` });
    return block;
  }

}
