import {IShape} from './IShape';

export interface IElementRegistry {
  get(id: string): IShape;
}
