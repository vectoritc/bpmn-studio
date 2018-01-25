import {IModdleElement} from '../bpmnmodeler/IModdleElement';
import {IModeling} from '../bpmnmodeler/IModeling';
import {IShape} from '../bpmnmodeler/IShape';
import {IEventBus} from '../eventbus/IEventBus';
import {IPageModel} from './IPageModel';

export interface ISection {
  path: string;
  canHandleElement: boolean;
  activate(model: IPageModel): void;
  checkElement(element: IModdleElement): boolean;
  }
