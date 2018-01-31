import {IModdleElement} from './index';
import {IShape} from './IShape';
export interface IModeling {
  updateProperties(element: IShape, properties: any): void;
  setColor(elements: Array<IModdleElement>, options: {
    fill: string,
    stroke: string,
  }): void;
}
