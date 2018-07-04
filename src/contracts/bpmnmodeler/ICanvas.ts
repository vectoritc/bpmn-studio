import {IShape} from './IShape';

export interface ICanvas {
  _container: HTMLElement;
  getRootElement(): IShape;
  viewbox(viewbox?: string): string;
}
