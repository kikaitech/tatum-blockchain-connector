import { Injectable } from '@nestjs/common';
import { InjectPinoLogger } from 'nestjs-pino';
import { PinoLogger } from 'pino-logger';
import { TezosService } from '../../module/npm';

@Injectable()
export class AppService extends TezosService {
  constructor(@InjectPinoLogger(AppService.name) logger: PinoLogger) {
    super(logger);
  }

  protected getNodesUrl(): Promise<string[]> {
    return Promise.resolve(['http://192.168.99.193']);
  }

  protected getTezosGraphQLPort(): Promise<number> {
    return Promise.resolve(3100);
  }
}
