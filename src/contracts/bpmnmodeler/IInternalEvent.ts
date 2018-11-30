import {IDescriptor} from './IDescriptor';

export interface IInternalEvent {
  cancelBubble: boolean;
  createdElements: object;
  descriptor: IDescriptor;
  returnValue: IInternalEvent;
  type: undefined;
}
