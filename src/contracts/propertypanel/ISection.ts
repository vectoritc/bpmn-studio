import {IModdleElement, IModeling, IShape} from '../bpmnmodeler/index';
import {IEventBus} from '../eventbus/IEventBus';
import {IPageModel} from './IPageModel';

export interface ISection {
  path: string;
  canHandleElement: boolean;
  activate(model: IPageModel): void;
  isSuitableForElement(element: IShape): boolean;
}
