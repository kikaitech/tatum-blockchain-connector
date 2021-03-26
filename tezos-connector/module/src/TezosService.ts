import { PinoLogger } from 'nestjs-pino';
import axios from 'axios';
// import { TezosToolkit } from '@taquito/taquito';
// import { TezBridgeSigner } from '@taquito/tezbridge-signer';

// const tezos = new TezosToolkit('https://edonet-tezos.giganode.io/');
// tezos.setProvider({ signer: new TezBridgeSigner() });

import {
  BlockHeaderResponse,
  BlockResponse,
  ContractResponse,
  PreapplyResponse,
  RpcClient
} from '@taquito/rpc';

export abstract class TezosService {
  protected constructor(protected readonly logger: PinoLogger) {}

  protected abstract getRpcClient(): Promise<string>;

  protected abstract getNodesUrl(): Promise<string>;

  public async getBlockChainInfo(): Promise<BlockHeaderResponse> {
    const url = await this.getRpcClient();
    const block = new RpcClient(url).getBlockHeader();
    return block;
  }

  public async getBlock(hash:string): Promise<BlockResponse> {
    const url = await this.getRpcClient();
    const block = new RpcClient(url).getBlock({ block: hash });
    return block;
  }

  public async getAccount(address: string): Promise<ContractResponse> {
    const url = await this.getRpcClient();
    const account = new RpcClient(url).getContract(address);
    return account;
  }

  public async getTransactionsByAccount(address: string): Promise<PreapplyResponse[]> {
    const url = await this.getNodesUrl();
    const transactions = (await axios.get(`${url}/operations?limit=500&account_id=${address}&operation_kind=transaction&offset=0`)).data;
    return transactions;
  }

  public async getTransaction(hash: string): Promise<PreapplyResponse> {
    const url = await this.getNodesUrl();
    const transaction = (await axios.get(`${url}/operations?limit=10&operation_id=${hash}&offset=0`)).data;
    return transaction[0];
  }

}
