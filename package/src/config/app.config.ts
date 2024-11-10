import { Injectable } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@Injectable()
export class AppConfig {
  @Transform(({ value }) => (value !== undefined ? !!value : false))
  @IsBoolean()
  BITCOIN_INDEXER_IS_TRANSPORT_MODE: boolean = false;

  @Transform(({ value }) => value ?? 'development')
  @IsString()
  @JSONSchema({ description: 'Node environment', default: 'development' })
  NODE_ENV: string = 'development';

  @Transform(({ value }) => value ?? '0.0.0.0')
  @IsString()
  @JSONSchema({ description: 'Server host' })
  HOST: string = '0.0.0.0';

  @Transform(({ value }) => parseInt(value, 10) || 3000)
  @IsNumber()
  // Using min max as a replacement for isPort
  @Min(0)
  @Max(65535)
  @JSONSchema({ description: 'Server port' })
  PORT: number = 3000;

  @Transform(({ value }) => (value !== undefined ? value : 'BitcoinIndexer'))
  @IsString()
  BITCOIN_INDEXER_MODULE_NAME: string = 'BitcoinIndexer';

  isPRODUCTION(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  isDEVELOPMENT(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isDEBUG(): boolean {
    return process.env.DEBUG === '1';
  }

  isTEST(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}