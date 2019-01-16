import {IDescriptor} from './IDescriptor';
import {IShape} from './IShape';

export interface IInternalEvent {
  cancelBubble?: boolean;
  createdElements?: object;
  descriptor?: IDescriptor;
  returnValue?: IInternalEvent;
  keyEvent?: KeyboardEvent;
  type: undefined;
  element?: IShape;
}
