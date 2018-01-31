import {IModdleElement} from './index';

export interface IBpmnFunction {
  trigger(selection: Array<IModdleElement>, option: string): void;
}
