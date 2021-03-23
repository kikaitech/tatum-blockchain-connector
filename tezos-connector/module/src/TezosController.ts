import { TezosService } from './TezosService';
import { TezosError } from './TezosError';

function throwError(e) {
  throw new TezosError(
    `Unexpected error occurred. Reason: ${e.message || e.response?.data || e}`,
    'cardano.error',
  );
}

export abstract class TezosController {
  protected constructor(protected readonly appService: TezosService) {}

}