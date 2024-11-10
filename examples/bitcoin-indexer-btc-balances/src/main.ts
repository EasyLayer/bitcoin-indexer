import { bootstrap } from '@easylayer/bitcoin-indexer';
import { OutputSchema, BalanceSchema } from './models';
import { Mapper } from './mapper';

bootstrap({
  appName: 'easylayer',
  schemas: [OutputSchema, BalanceSchema],
  mapper: Mapper,
  isServer: true
}).catch((error: Error) => console.error(error));