import {IModdleElement} from './IModdleElement';

export interface IDefinition {
  $type: string;
  diagrams: Array<IModdleElement>;
  id: string;
  rootElements: Array<IModdleElement>;
  get(element: string): Array<IModdleElement>;
}
