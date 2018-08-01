import {IBpmnFunction} from './IBpmnFunction';
import {IDefinition} from './IDefinition';

export interface IBpmnModeler {
  _definitions: any;
  attachTo(dom: HTMLElement): void;
  detach(): void;
  destroy(): void;
  saveXML(options: object, callback: (error: Error, result: String) => void): void;
  saveSVG(options: object, callback: (error: Error, result: String) => void): void;
  importXML(xml: string, errorHandler: (err: Error) => void): void;
  get(object: string): any;
  on(event: string | Array<string>, callback: Function, priority?: number): void;
}
