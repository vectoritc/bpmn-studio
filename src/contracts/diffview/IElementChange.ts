import {IModdleElement, IShape} from '../index';

export interface IElementChange {
  $type: string;
  model: IShape;
  attrs: IModdleElement;
  name?: string;
}
