import { IModdleElement } from './IModdleElement';

export interface IModeling {
  setColor(elements: Array<IModdleElement>, options: {
    fill: string,
    stroke: string,
  }): void;
}
