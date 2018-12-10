import {IModdleElement} from './bpmnElements';

export interface IDescriptor {
  businessObject: IModdleElement;
  height: number;
  oldBusinessObject: IModdleElement;
  type: string;
  width: number;
  x: number;
  y: number;
}
