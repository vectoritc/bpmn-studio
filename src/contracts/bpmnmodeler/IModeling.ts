import {IModdleElement, IShape} from './index';

export interface IModeling {
  updateProperties(element: IShape, properties: any): void;
  setColor(elements: Array<IShape>, options: {
    fill: string,
    stroke: string,
  }): void;
}
