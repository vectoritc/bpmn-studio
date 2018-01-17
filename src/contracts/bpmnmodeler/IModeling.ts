import {IShape} from './IShape';

export interface IModeling {
  updateProperties(element: IShape, properties: any): void;
}
