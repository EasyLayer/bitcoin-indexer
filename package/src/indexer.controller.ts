import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';
import { ViewsQueryFactoryService } from './application-layer/services';

@Controller()
export class IndexerController {
  constructor(private readonly viewsQueryFactory: ViewsQueryFactoryService) {}

  @Get('/healthcheck')
  @HttpCode(200)
  @ApiOperation({
    operationId: 'Healthcheck',
    description: 'Checking the status of the Bitcoin Balances Indexer module',
  })
  @ApiOkResponse({ description: 'The service is working fine' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  healthCheck() {
    return { status: 'OK' };
  }

  @Get('/find/:key')
  async find(
    @Param('key') key: string,
    @Query('conditions') conditions?: Record<any, any>,
    @Query('relations') relations?: string
  ) {
    const relationsArray = relations ? relations.split(',') : undefined;
    return this.viewsQueryFactory.getAnyQuery({
      key,
      ...(conditions ? { conditions } : {}),
      ...(relationsArray ? { relations } : {}),
    });
  }
}
