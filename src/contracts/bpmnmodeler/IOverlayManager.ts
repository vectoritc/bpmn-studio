import {IOverlayDescriptor} from './IOverlayDescriptor';
import {IOverlays} from './IOverlays';
import {IShape} from './IShape';

export interface IOverlayManager {
  _overlays: IOverlays;

  add(elementOrElementId: string | IShape, overlayDescriptor: IOverlayDescriptor): void;
  remove(elementOrElementId: string | IShape): void;
  clear(): void;
}
