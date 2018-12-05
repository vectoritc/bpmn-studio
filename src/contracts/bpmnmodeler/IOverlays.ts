import {IOverlay} from './IOverlay';
import {IOverlayDescriptor} from './IOverlayDescriptor';
import {IShape} from './IShape';

export interface IOverlays {
  _overlays: Array<IOverlay>;

  add(elementOrElementId: string | IShape, overlayDescriptor: IOverlayDescriptor): void;
  remove(elementOrElementId: string | IShape): void;
  clear(): void;
}
