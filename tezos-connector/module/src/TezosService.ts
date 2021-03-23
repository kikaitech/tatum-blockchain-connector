import { PinoLogger } from 'nestjs-pino';

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
}
