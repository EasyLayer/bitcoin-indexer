import { CommandHandler, ICommandHandler } from '@easylayer/components/cqrs';
import { Transactional, EventStoreRepository } from '@easylayer/components/eventstore';
import { ProcessReorganisationCommand } from '@easylayer/common/domain-cqrs-components/bitcoin-indexer';
import { AppLogger, RuntimeTracker } from '@easylayer/components/logger';
import { Indexer } from '../models/indexer.model';
import { IndexerModelFactoryService } from '../services';

@CommandHandler(ProcessReorganisationCommand)
export class ProcessReorganisationCommandHandler implements ICommandHandler<ProcessReorganisationCommand> {
  constructor(
    private readonly log: AppLogger,
    private readonly indexerModelFactory: IndexerModelFactoryService,
    private readonly eventStore: EventStoreRepository
  ) {}

  @Transactional({ connectionName: 'indexer-eventstore' })
  @RuntimeTracker({ showMemory: true })
  async execute({ payload }: ProcessReorganisationCommand) {
    try {
      // NOTE: blocks - need to be reorganised (from IndexerModel),
      // height - is height of reorganisation(the last height where the blocks matched)
      const { blocks, height, requestId } = payload;

      const indexerModel: Indexer = await this.indexerModelFactory.initModel();

      // NOTE: We could not store transactions in the aggregator, but get them here from the provider,
      // but this will increase the cost, so we store them for now

      await indexerModel.processReorganisation({
        blocks,
        height,
        requestId,
        logger: this.log,
      });

      await this.eventStore.save(indexerModel);

      this.indexerModelFactory.updateCache(indexerModel);

      await indexerModel.commit();
    } catch (error) {
      this.log.error('execute()', error, this.constructor.name);
      this.indexerModelFactory.clearCache();
      throw error;
    }
  }
}
