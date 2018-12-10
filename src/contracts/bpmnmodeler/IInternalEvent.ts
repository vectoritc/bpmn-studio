import {IDescriptor} from './IDescriptor';

export interface IInternalEvent {
  cancelBubble?: boolean;
  createdElements?: object;
  descriptor?: IDescriptor;
  returnValue?: IInternalEvent;
  keyEvent?: KeyboardEvent;
  type: undefined;
}
