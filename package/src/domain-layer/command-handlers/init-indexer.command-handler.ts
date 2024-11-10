import { CommandHandler, ICommandHandler } from '@easylayer/components/cqrs';
import { Transactional, EventStoreRepository } from '@easylayer/components/eventstore';
import { InitIndexerCommand } from '@easylayer/common/domain-cqrs-components/bitcoin-indexer';
import { AppLogger, RuntimeTracker } from '@easylayer/components/logger';
import { Indexer } from '../models/indexer.model';
import { IndexerModelFactoryService } from '../services';

@CommandHandler(InitIndexerCommand)
export class InitIndexerCommandHandler implements ICommandHandler<InitIndexerCommand> {
  constructor(
    private readonly log: AppLogger,
    private readonly eventStore: EventStoreRepository,
    private readonly indexerModelFactory: IndexerModelFactoryService
  ) {}

  @Transactional({ connectionName: 'indexer-eventstore' })
  @RuntimeTracker({ showMemory: true })
  async execute({ payload }: InitIndexerCommand) {
    try {
      const { requestId, indexedHeight } = payload;

      this.log.info('Init Indexer Aggregate...', null, this.constructor.name);

      const indexerModel: Indexer = await this.indexerModelFactory.initModel();

      this.log.info('Indexer Aggregate successfully initialized.', null, this.constructor.name);

      await indexerModel.init({
        requestId,
        indexedHeight,
        // indexedHeight < this.businessConfig.BITCOIN_INDEXER_START_BLOCK_HEIGHT - 1
        //   ? this.businessConfig.BITCOIN_INDEXER_START_BLOCK_HEIGHT - 1
        //   : indexedHeight,
      });

      await this.eventStore.save(indexerModel);
      await indexerModel.commit();

      this.log.info('Aggregates successfull init', null, this.constructor.name);
    } catch (error) {
      this.log.error('execute()', error, this.constructor.name);
      throw error;
    }
  }
}
