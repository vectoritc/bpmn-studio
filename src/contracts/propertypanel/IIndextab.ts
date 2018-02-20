import {IModdleElement} from '../bpmnmodeler/bpmnElements/IModdleElement';
import {IShape} from '../bpmnmodeler/IShape';
import {ISection} from './ISection';

export interface IIndextab {
  title: string;
  path: string;
  elementInPanel: IShape;
  canHandleElement: boolean;
  sections: Array<ISection>;
  isSuitableForElement(element: IShape): boolean;
}
