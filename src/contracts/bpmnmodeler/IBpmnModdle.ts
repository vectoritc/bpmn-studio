import {IDefinition} from './IDefinition';
import {IModdleElement} from './IModdleElement';

export interface IBpmnModdle {
  fromXML(xml: string, callback: (err: Error, definitions: IDefinition) => void): void;
  create(name: string, attributes: any): IModdleElement;
}
