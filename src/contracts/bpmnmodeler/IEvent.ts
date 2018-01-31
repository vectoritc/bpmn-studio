import {IShape} from './IShape';

export interface IEvent {
  element: IShape;
  newSelection?: Array<IShape>;
  oldSelection?: Array<IShape>;
}
