import {IOverlay} from './IOverlay';
import {IOverlayDescriptor} from './IOverlayDescriptor';
import {IShape} from './IShape';

export interface IOverlayManager {
  _overlays: Map<string, IOverlay>;

  add(elementOrElementId: string | IShape, overlayDescriptor: IOverlayDescriptor): void;
  remove(elementOrElementId: string | IShape): void;
  clear(): void;
}
