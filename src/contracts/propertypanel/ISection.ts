import {IModeling} from '../bpmnmodeler/IModeling';
import {IModdleElement} from '../bpmnmodeler/index';
import {IShape} from '../bpmnmodeler/IShape';
import {IEventBus} from '../eventbus/IEventBus';
import {IPageModel} from './IPageModel';

export interface ISection {
  path: string;
  canHandleElement: boolean;
  activate(model: IPageModel): void;
  isSuitableForElement(element: IShape): boolean;
}
