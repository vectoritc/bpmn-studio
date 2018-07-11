
import {IShape} from '../bpmnmodeler/index';
import {IPageModel} from './IPageModel';

export interface ISection {
  path: string;
  canHandleElement: boolean;
  activate(model: IPageModel): void;
  isSuitableForElement(element: IShape): boolean;
}
