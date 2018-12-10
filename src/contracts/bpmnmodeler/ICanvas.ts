import {IShape} from './IShape';
import {IViewbox} from './IViewbox';

export interface ICanvas {
  _container: HTMLElement;
  getRootElement(): IShape;

  /*
  *  Gets or sets the viewbox of the canvas.
  *
  * @param viewbox The new viewbox for the canvas.
  * @returns The current viewbox.
  */
  viewbox(viewbox?: IViewbox): IViewbox;

  zoom(zoomLevel: number | string, element?: IShape): void;
}
