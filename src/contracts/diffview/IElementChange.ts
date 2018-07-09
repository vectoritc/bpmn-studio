import {IShape} from '../index';

export interface IElementChange {
  $type: string;
  model: IShape;
  attrs: object;
  name?: string;
}
