import {IShape} from './IShape';

export interface ICanvas {
  _container: HTMLElement;
  getRootElement(): IShape;

  /*
  *  Gets or sets the viewbox of the canvas.
  *
  * @param viewbox The new viewbox for the canvas.
  * @returns The current viewbox.
  */
  viewbox(viewbox?: string): string;

  zoom(zoomLevel: number, element: IShape): void;
}
