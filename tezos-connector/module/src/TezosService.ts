import { PinoLogger } from 'nestjs-pino';
import axios from 'axios';
import {
  Currency,
  generateWallet,
  Wallet,
} from '@tatumio/tatum';
// import { TezosToolkit } from '@taquito/taquito';
// import { TezBridgeSigner } from '@taquito/tezbridge-signer';

// const tezos = new TezosToolkit('https://edonet-tezos.giganode.io/');
// tezos.setProvider({ signer: new TezBridgeSigner() });

import {
  BlockHeaderResponse,
  BlockResponse,
  ContractResponse,
  PreapplyResponse,
  // RpcClient
} from '@taquito/rpc';

export abstract class TezosService {
  protected constructor(protected readonly logger: PinoLogger) { }

  protected abstract getRpcClient(): Promise<string>;

  protected abstract getNodesUrl(): Promise<string>;

  protected abstract isTestnet(): Promise<boolean>;

  public async getBlockChainInfo(): Promise<BlockHeaderResponse> {
    const url = await this.getNodesUrl();
    const [block] = (await axios.get(`${url}/blocks?limit=1&offset=0`)).data;
    return block;
  }

  public async getBlock(hash: string): Promise<BlockResponse> {
    const url = await this.getNodesUrl();
    const [block] = (await axios.get(`${url}/operations?limit=1&block_id=${hash}&operation_kind=transaction&offset=0`)).data;
    return block;
  }

  public async getAccount(address: string): Promise<ContractResponse> {
    const url = await this.getNodesUrl();
    const account = (await axios.get(`${url}/accounts/${address}?account=${address}&limit=1&offset=0`)).data;
    return account;
  }

  public async getTransactionsByAccount(address: string): Promise<PreapplyResponse[]> {
    const url = await this.getNodesUrl();
    const transactions = (await axios.get(`${url}/operations?limit=500&account_id=${address}&operation_kind=transaction&offset=0`)).data;
    return transactions;
  }

  public async getTransaction(hash: string): Promise<PreapplyResponse> {
    const url = await this.getNodesUrl();
    const transaction = (await axios.get(`${url}/operations?limit=1&operation_id=${hash}&offset=0`)).data;
    return transaction[0];
  }

  // public async generateWallet(mnem?: string): Promise<Wallet> {
  //   return generateWallet(Currency.ZTX, await this.isTestnet(), mnem);
  // }

}