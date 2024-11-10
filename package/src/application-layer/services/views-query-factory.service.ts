// import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@easylayer/components/cqrs';
import { GetAnyQuery } from '@easylayer/common/domain-cqrs-components/bitcoin-indexer';

@Injectable()
export class ViewsQueryFactoryService {
  constructor(private readonly queryBus: QueryBus) {}

  public async getAnyQuery(dto: any): Promise<void> {
    return this.queryBus.execute(new GetAnyQuery({ ...dto }));
  }
}
