import {IModdleElement} from './IModdleElement';

export interface IBpmnFunction {
  trigger(selection: Array<IModdleElement>, option: string): void;
}
