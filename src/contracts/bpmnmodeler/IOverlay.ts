import {IOverlayDescriptor} from './IOverlayDescriptor';
import {IShape} from './IShape';

export interface IOverlay {
  add(elementOrElementId: string | IShape, overlayDescriptor: IOverlayDescriptor): void;
  remove(elemenId: string): void;
}
