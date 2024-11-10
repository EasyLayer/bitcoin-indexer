import { v4 as uuidv4 } from 'uuid';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '@easylayer/components/logger';
import { IndexerCommandFactoryService } from './application-layer/services';
// import { OutputsReadService } from './domain-layer/services';

@Injectable()
export class IndexerService implements OnModuleInit {
  constructor(
    private readonly log: AppLogger,
    private readonly indexerCommandFactory: IndexerCommandFactoryService
    // private readonly outputsReadService: OutputsReadService
  ) {}

  async onModuleInit() {
    await this.initialization();
  }

  private async initialization(): Promise<void> {
    this.log.info('Initialization Bitcoin Balances Indexer systems');

    try {
      const indexedHeight = -1; //await this.outputsReadService.getLastOutput();

      await this.indexerCommandFactory.init({
        requestId: uuidv4(),
        indexedHeight,
      });
    } catch (error) {
      this.log.error('initialization()', error, this.constructor.name);
      throw error;
    }
  }
}
