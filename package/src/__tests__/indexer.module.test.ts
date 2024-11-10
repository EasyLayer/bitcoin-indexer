import { Test, TestingModule } from '@nestjs/testing';
import { BitcoinIndexerModule } from '../indexer.module';

describe('BitcoinIndexerModule', () => {
  let bitcoinIndexerModule: BitcoinIndexerModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [BitcoinIndexerModule],
    }).compile();

    bitcoinIndexerModule = module.get<BitcoinIndexerModule>(BitcoinIndexerModule);
  });

  it('should be defined', () => {
    expect(bitcoinIndexerModule).toBeDefined();
  });
});
