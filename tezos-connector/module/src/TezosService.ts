import { PinoLogger } from 'nestjs-pino';
import axios from 'axios';

export abstract class TezosService {
  protected constructor(protected readonly logger: PinoLogger) {}

  protected abstract getNodesUrl(): Promise<string[]>;

  protected abstract getTezosGraphQLPort(): Promise<number>;

  public async getGraphQLEndpoint(): Promise<string> {
    const [[url], port] = await Promise.all([
      this.getNodesUrl(),
      this.getTezosGraphQLPort(),
    ]);
    return `${url}:${port}/graphql`;
  };

  public async getBlock(hash: string): Promise<any> {
    const graphQLUrl = await this.getGraphQLEndpoint();
    const { block } = (
      await axios.post(graphQLUrl, {
        query: `{ block (block: "${hash}"){
          protocol
          chainId
          header { level proto predecessor timestamp operationsHash validationPass }
          metadata { protocol baker }
          constants { bakingRewardPerEndorsement initialEndorsers blocksPerRollSnapshot }
          operations { info { protocol hash chainId  signature } }
        } }`,
      })
    ).data.data;
    return block
  }
}
