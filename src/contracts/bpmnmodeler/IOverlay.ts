import {IOverlayDescriptor} from './IOverlayDescriptor';
import {IShape} from './IShape';

export interface IOverlay {
  add(elementOrElementId: string | IShape, overlayDescriptor: IOverlayDescriptor): void;
  remove(elementOrElementId: string | IShape): void;
  clear(): void;
}
