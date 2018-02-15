import {IModdleElement} from './IModdleElement';

export interface IExtensionElement extends IModdleElement {
  $type: string;
  values?: Array<IModdleElement>;
}
