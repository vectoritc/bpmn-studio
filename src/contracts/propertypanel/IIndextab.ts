import {IShape} from '../bpmnmodeler/IShape';
import {ISection} from './ISection';

export interface IIndextab {
  title: string;
  path: string;
  canHandleElement: boolean;
  sections: Array<ISection>;
  checkElement(element: IShape): boolean;
}
