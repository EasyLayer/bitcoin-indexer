import { resolve } from 'node:path';
import { Injectable } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

type DatabaseTypes = 'rocksdb';

@Injectable()
export class ReadDatabaseConfig {
  @Transform(({ value }) => (value ? value : 'rocksdb'))
  @IsString()
  BITCOIN_INDEXER_READ_DB_TYPE: DatabaseTypes = 'rocksdb';

  @Transform(({ value }) => (value ? value : ''))
  @IsString()
  BITCOIN_INDEXER_READ_DB_NAME: string = resolve(process.cwd(), `data/indexer-views.db`);

  isLogging(): boolean {
    return process.env.DB_DEBUG === '1';
  }
}