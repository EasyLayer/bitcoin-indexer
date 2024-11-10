import { BitcoinIndexerBlocksIndexedEventHandler } from './blocks-indexed.event-handler';
import { BitcoinIndexerInitializedEventHandler } from './indexer-initialized.event-handler';
import { BitcoinIndexerReorganisationProcessedEventHandler } from './reorganisation-processed.event-handler';

export const EventsHandlers = [
  BitcoinIndexerBlocksIndexedEventHandler,
  BitcoinIndexerInitializedEventHandler,
  BitcoinIndexerReorganisationProcessedEventHandler,
];
