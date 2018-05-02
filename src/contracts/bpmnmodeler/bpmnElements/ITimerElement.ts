import {IModdleElement} from './IModdleElement';

export interface ITimerElement extends IModdleElement {
  $type: string;
  body: string;
}
