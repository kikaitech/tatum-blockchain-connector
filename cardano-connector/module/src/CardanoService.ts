import { Block, Transaction } from '@cardano-graphql/client-ts';
import axios from 'axios';
import { PinoLogger } from 'nestjs-pino';
import * as Tatum from '@tatumio/tatum';
import { CardanoBlockchainInfo } from './constants';

export abstract class CardanoService {
  protected constructor(protected readonly logger: PinoLogger) {}

  protected abstract isTestnet(): Promise<boolean>;

  protected abstract getNodesUrl(): Promise<string[]>;

  protected abstract getCardanoGraphQLPort(): Promise<number>;

  protected abstract getCardanoWalletPort(): Promise<number>;

  public async getGraphQLEndpoint(): Promise<string> {
    const [[url], port] = await Promise.all([
      this.getNodesUrl(),
      this.getCardanoGraphQLPort(),
    ]);
    return `${url}:${port}/graphql`;
  }

  public async getBlockChainInfo(): Promise<CardanoBlockchainInfo> {
    const [testnet, graphQLUrl] = await Promise.all([
      this.isTestnet(),
      this.getGraphQLEndpoint(),
    ]);
    const { tip } = (
      await axios.post(graphQLUrl, {
        query: '{ cardano { tip { number slotNo epoch { number } }} }',
      })
    ).data.data.cardano;
    return {
      testnet,
      tip,
    };
  }

  public async generateWallet(mnem?: string): Promise<Tatum.Wallet> {
    return Tatum.generateAdaWallet(mnem);
  }

  public async getBlock(hash: string): Promise<Block> {
    const graphQLUrl = await this.getGraphQLEndpoint();
    const [block] = (
      await axios.post(graphQLUrl, {
        query: `{ blocks (where: { hash: { _eq: "${hash}" } }) {
          fees
          slotLeader { description, hash }
          forgedAt
          merkelRoot
          number
          opCert
          slotInEpoch
          slotNo
          protocolVersion
          size
          transactionsCount
          transactions { hash }
          nextBlock { hash, number }
          previousBlock { hash, number  }
          vrfKey
        } }`,
      })
    ).data.data.blocks;
    return block;
  }

  public async getTransaction(hash: string): Promise<Transaction> {
    const graphQLUrl = await this.getGraphQLEndpoint();
    const [transaction] = (
      await axios.post(graphQLUrl, {
        query: `{ transactions (where: { hash: { _eq: "${hash}" } }) {
          block { hash number }
          blockIndex
          deposit
          fee
          inputs { address sourceTxHash sourceTxIndex }
          inputs_aggregate { aggregate { count } }
          outputs { address index txHash value }
          outputs_aggregate { aggregate { count }}
          invalidBefore
          invalidHereafter
          size
          totalOutput
          includedAt
          withdrawals { address amount transaction { hash }}
          withdrawals_aggregate { aggregate { count } }
        } }`,
      })
    ).data.data.transactions;
    return transaction;
  }
}