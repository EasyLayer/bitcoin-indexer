import { InitIndexerCommandHandler } from './init-indexer.command-handler';
import { IndexBatchCommandHandler } from './index-batch.command-handler';
import { ProcessReorganisationCommandHandler } from './process-reorganisation.command-handler';

export const CommandHandlers = [
  InitIndexerCommandHandler,
  IndexBatchCommandHandler,
  ProcessReorganisationCommandHandler,
];
