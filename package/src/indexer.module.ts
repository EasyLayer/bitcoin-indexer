import { Module, DynamicModule } from '@nestjs/common';
import { transformAndValidate } from 'class-transformer-validator';
import { LoggerModule } from '@easylayer/components/logger';
import { ArithmeticService } from '@easylayer/common/arithmetic';
import { EventStoreModule } from '@easylayer/components/eventstore';
import { CqrsModule } from '@easylayer/components/cqrs';
import { CqrsTransportModule } from '@easylayer/components/cqrs-transport';
import { ViewsKeyValueDatabaseModule } from '@easylayer/components/views-keyvalue-db';
import { BlocksQueueModule } from '@easylayer/components/bitcoin-blocks-queue';
import { NetworkProviderModule } from '@easylayer/components/bitcoin-network-provider';
import { IndexerController } from './indexer.controller';
import { IndexerService } from './indexer.service';
import { IndexerSaga } from './application-layer/sagas';
import {
  IndexerCommandFactoryService,
  ReadStateExceptionHandlerService,
  BlocksCommandFactoryService,
  ViewsQueryFactoryService,
} from './application-layer/services';
import { ViewsReadRepositoryService, ViewsWriteRepositoryService } from './infrastructure-layer/services';
import { LastBlockSchema } from './infrastructure-layer/view-models';
import { IndexerModelFactoryService } from './domain-layer/services';
import { CommandHandlers } from './domain-layer/command-handlers';
import { EventsHandlers } from './domain-layer/events-handlers';
import { QueryHandlers } from './infrastructure-layer/query-handlers';
import {
  AppConfig,
  EventStoreConfig,
  ReadDatabaseConfig,
  BusinessConfig,
  BlocksQueueConfig,
  ProvidersConfig,
} from './config';
import { Schema, MapperType } from './protocol';

interface IndexerModuleOptions {
  appName: string;
  schemas: Schema[];
  mapper: MapperType;
  //...
}

@Module({})
export class BitcoinIndexerModule {
  static async register({ schemas, mapper }: IndexerModuleOptions): Promise<DynamicModule> {
    const eventstoreConfig = await transformAndValidate(EventStoreConfig, process.env, {
      validator: { whitelist: true },
    });
    const readdatabaseConfig = await transformAndValidate(ReadDatabaseConfig, process.env, {
      validator: { whitelist: true },
    });
    const appConfig = await transformAndValidate(AppConfig, process.env, {
      validator: { whitelist: true },
    });
    const businessConfig = await transformAndValidate(BusinessConfig, process.env, {
      validator: { whitelist: true },
    });
    const blocksQueueConfig = await transformAndValidate(BlocksQueueConfig, process.env, {
      validator: { whitelist: true },
    });
    const providersConfig = await transformAndValidate(ProvidersConfig, process.env, {
      validator: { whitelist: true },
    });

    return {
      module: BitcoinIndexerModule,
      controllers: [IndexerController],
      imports: [
        LoggerModule.forRoot({ componentName: 'BitcoinIndexerPlugin' }),
        CqrsTransportModule.forRoot({ isGlobal: true }),
        CqrsModule.forRoot({ isGlobal: true }),
        // IMPORTANT: BitcoinNetworkProviderModule must be global inside one plugin
        NetworkProviderModule.forRootAsync({
          isGlobal: true,
          quickNodesUrls: providersConfig.BITCOIN_INDEXER_NETWORK_PROVIDER_QUICK_NODE_URLS,
          selfNodesUrl: providersConfig.BITCOIN_INDEXER_NETWORK_PROVIDER_SELF_NODE_URL,
        }),
        EventStoreModule.forRootAsync({
          name: 'indexer-eventstore',
          logging: eventstoreConfig.isLogging(),
          type: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_TYPE,
          synchronize: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_SYNCHRONIZE,
          database: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_NAME,
          ...(eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_HOST && {
            host: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_HOST,
          }),
          ...(eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_PORT && {
            port: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_PORT,
          }),
          ...(eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_USERNAME && {
            username: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_USERNAME,
          }),
          ...(eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_PASSWORD && {
            password: eventstoreConfig.BITCOIN_INDEXER_EVENTSTORE_DB_PASSWORD,
          }),
        }),
        BlocksQueueModule.forRootAsync({
          blocksCommandExecutor: BlocksCommandFactoryService,
          isTransportMode: appConfig.BITCOIN_INDEXER_IS_TRANSPORT_MODE,
          maxBlockHeight: businessConfig.BITCOIN_INDEXER_MAX_BLOCK_HEIGHT,
          queueLoaderRequestBlocksBatchSize:
            blocksQueueConfig.BITCOIN_INDEXER_BLOCKS_QUEUE_LOADER_REQUEST_BLOCKS_BATCH_SIZE,
          maxQueueSize: blocksQueueConfig.BITCOIN_INDEXER_BLOCKS_QUEUE_ITERATOR_BLOCKS_BATCH_SIZE,
          minTransferSize: blocksQueueConfig.BITCOIN_INDEXER_BLOCKS_QUEUE_MIN_TRANSFER_SIZE,
          queueLoaderStrategyName: blocksQueueConfig.BITCOIN_INDEXER_BLOCKS_QUEUE_LOADER_STRATEGY_NAME,
          queueIteratorBlocksBatchSize: blocksQueueConfig.BITCOIN_INDEXER_BLOCKS_QUEUE_ITERATOR_BLOCKS_BATCH_SIZE,
          queueLoaderConcurrency: blocksQueueConfig.BITCOIN_INDEXER_BLOCKS_QUEUE_LOADER_CONCURRENCY_COUNT,
        }),
        ViewsKeyValueDatabaseModule.forRootAsync({
          database: readdatabaseConfig.BITCOIN_INDEXER_READ_DB_NAME,
          type: readdatabaseConfig.BITCOIN_INDEXER_READ_DB_TYPE,
          schemas: [LastBlockSchema, ...schemas],
        }),
      ],
      providers: [
        {
          provide: AppConfig,
          useValue: appConfig,
        },
        {
          provide: BusinessConfig,
          useValue: businessConfig,
        },
        {
          provide: EventStoreConfig,
          useValue: eventstoreConfig,
        },
        {
          provide: ReadDatabaseConfig,
          useValue: readdatabaseConfig,
        },
        {
          provide: 'IndexerMapper',
          useClass: mapper,
        },
        ViewsQueryFactoryService,
        ViewsReadRepositoryService,
        ViewsWriteRepositoryService,
        ArithmeticService,
        IndexerService,
        IndexerModelFactoryService,
        BlocksCommandFactoryService,
        IndexerSaga,
        IndexerCommandFactoryService,
        ReadStateExceptionHandlerService,
        ...CommandHandlers,
        ...EventsHandlers,
        ...QueryHandlers,
      ],
      exports: [],
    };
  }
}
