import { Block, PaymentAddress, Transaction } from '@cardano-graphql/client-ts';
import * as Tatum from '@tatumio/tatum';
import axios from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { CardanoBlockchainInfo } from './constants';
import { CardanoError } from './CardanoError';

export abstract class CardanoService {
  protected constructor(protected readonly logger: PinoLogger) {}

  protected abstract isTestnet(): Promise<boolean>;

  protected abstract getNodesUrl(): Promise<string[]>;

  protected abstract getCardanoGraphQLPort(): Promise<number>;

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
          merkleRoot
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

  public async getAccount(address: string): Promise<PaymentAddress> {
    const graphQLUrl = await this.getGraphQLEndpoint();
    const [account] = (
      await axios.post(graphQLUrl, {
        query: `{ paymentAddresses (addresses: "${address}") {
          summary {
            utxosCount
            assetBalances {
              asset { assetId assetName name description logo metadataHash url }
              quantity
            }
          }
        } }`,
      })
    ).data.data.paymentAddresses;
    return account;
  }

  public async getTransactionsByAccount(
    address: string,
    pageSize: number,
    offset: number,
  ): Promise<Transaction[]> {
    const graphQLUrl = await this.getGraphQLEndpoint();
    const { transactions } = (
      await axios.post(graphQLUrl, {
        query: `{ transactions (
          limit: ${pageSize}
          offset: ${offset}
          where: {
            _or: [
              { inputs: { address: { _eq: "${address}" } } }
              { outputs: { address: { _eq: "${address}" } } }
            ]
          }) {
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
          }
        }`,
      })
    ).data.data;
    return transactions;
  }

  public async generateAddress(
    xpub: string,
    i: number,
  ): Promise<{ address: string }> {
    const testnet = await this.isTestnet();
    const address = await Tatum.generateAddressFromXPub(
      Tatum.Currency.ADA,
      testnet,
      xpub,
      i,
    );
    return { address };
  }

  public async generatePrivateKey(
    mnemonic: string,
    i: number,
  ): Promise<{ key: string }> {
    const testnet = await this.isTestnet();
    const key = await Tatum.generatePrivateKeyFromMnemonic(
      Tatum.Currency.ADA,
      testnet,
      mnemonic,
      i,
    );
    return { key };
  }

  public async sendTransaction(
    body: Tatum.TransferAda,
  ): Promise<{ txId: string }> {
    const graphQLUrl = await this.getGraphQLEndpoint();
    const transaction = await Tatum.prepareADATransaction(body, graphQLUrl);
    const txId = (
      await axios.post(graphQLUrl, {
        query: `mutation {
          submitTransaction(transaction: "${transaction}") {
            hash
          }
        }`,
      })
    ).data.data.submitTransaction.hash;
    return { txId };
  }
}
