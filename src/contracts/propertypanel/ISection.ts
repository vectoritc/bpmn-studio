import {IPageModel, IShape} from '../index';

export interface ISection {
  path: string;
  canHandleElement: boolean;
  activate(model: IPageModel): void;
  isSuitableForElement(element: IShape): boolean;
}
