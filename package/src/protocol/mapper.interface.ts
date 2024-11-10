import { BaseViewModel } from './base-view-model';

export type MapperType = new () => IIndexerMapper;

export interface IIndexerMapper {
  index(data: any): Promise<BaseViewModel | BaseViewModel[]>;
  reorganisation(data: any): Promise<BaseViewModel | BaseViewModel[]>;
}
