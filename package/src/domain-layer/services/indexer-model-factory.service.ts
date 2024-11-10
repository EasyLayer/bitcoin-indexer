// import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@easylayer/components/cqrs';
import { EventStoreRepository } from '@easylayer/components/eventstore';
import { Indexer } from '../models/indexer.model';

@Injectable()
export class IndexerModelFactoryService {
  private cache = new MemoryCache<Indexer>(60000); // TTL 60 seconds
  private readonly cacheKey = 'indexerModel';

  constructor(
    private readonly publisher: EventPublisher,
    private readonly indexerRepository: EventStoreRepository<Indexer>
  ) {}

  public createNewModel(): Indexer {
    return this.publisher.mergeObjectContext(new Indexer());
  }

  public async initModel(): Promise<Indexer> {
    const cachedModel = this.cache.get(this.cacheKey);

    if (cachedModel) {
      return cachedModel;
    }

    const model = await this.indexerRepository.getOne(this.createNewModel());
    // NOTE: If there is no such thing in the database, then we will return the base model.
    return model;
  }

  public async publishLastEvent(): Promise<void> {
    const model = await this.indexerRepository.getOne(this.createNewModel());
    const event = await this.indexerRepository.fetchLastEvent(model);
    if (event) {
      await model.republish(event);
    }
  }

  public updateCache(model: Indexer): void {
    this.cache.set(this.cacheKey, model);
  }

  public clearCache(): void {
    this.cache.clear(this.cacheKey);
  }
}

class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number) {
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  clear(key: string): void {
    this.cache.delete(key);
  }
}
