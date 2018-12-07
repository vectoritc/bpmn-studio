import {IOverlayPosition} from './IOverlayPosition';
import {IShape} from './IShape';

export interface IOverlay {
  element: IShape;
  html: string;
  htmlContainer: HTMLElement;
  id: string;
  position: IOverlayPosition;
  scale: boolean;
  show: boolean;
  type: string;
}
