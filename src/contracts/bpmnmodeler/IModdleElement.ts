import { IProcessRef } from './IProcessRef';

export interface IModdleElement {
  id: string;
  name: string;
  documentation: string;
  get: any;
  $type: string;
  $attrs?: any;
  $parent?: IModdleElement;
  di?: any;
  processRef?: IProcessRef;
  eventDefinitions?: Array<IModdleElement>;
  messageRef?: IModdleElement;
}
