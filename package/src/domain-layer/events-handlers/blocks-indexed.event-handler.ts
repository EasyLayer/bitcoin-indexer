import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@easylayer/components/cqrs';
import { RuntimeTracker } from '@easylayer/components/logger';
import { BlocksQueueService } from '@easylayer/components/bitcoin-blocks-queue';
import { BitcoinIndexerBlocksIndexedEvent } from '@easylayer/common/domain-cqrs-components/bitcoin-indexer';
import { ViewsWriteRepositoryService } from '../../infrastructure-layer/services';
import { LastBlockModel } from '../../infrastructure-layer/view-models';
import { IIndexerMapper } from '../../protocol';

@EventsHandler(BitcoinIndexerBlocksIndexedEvent)
export class BitcoinIndexerBlocksIndexedEventHandler implements IEventHandler<BitcoinIndexerBlocksIndexedEvent> {
  constructor(
    private readonly viewsWriteRepository: ViewsWriteRepositoryService,
    @Inject('BlocksQueueService') private readonly blocksQueueService: BlocksQueueService,
    @Inject('IndexerMapper')
    private readonly indexerMapper: IIndexerMapper
  ) {}

  @RuntimeTracker({ showMemory: true })
  async handle({ payload }: BitcoinIndexerBlocksIndexedEvent) {
    try {
      const { blocks } = payload;

      const confirmedBlocks = await this.blocksQueueService.confirmProcessedBatch(
        blocks.map((block: any) => block.hash)
      );

      for (const block of confirmedBlocks) {
        const results = await this.indexerMapper.index(block);
        const models = Array.isArray(results) ? results : [results];

        this.viewsWriteRepository.process(models);
      }

      // Update System entity
      const lastBlock = new LastBlockModel();
      const lastBlockHeight = confirmedBlocks[confirmedBlocks.length - 1]?.height;
      await lastBlock.put({ height: lastBlockHeight }, { value: '' });

      await this.viewsWriteRepository.commit();
    } catch (error) {
      throw error;
    }
  }
}
