import { IModdleElement } from './IModdleElement';

export interface IProcessRef extends IModdleElement {
  extensionElement: Object;
  flowElement: Array<Object>;
  isExecutable: boolean;
  laneSets: Array<Object>;
  versionTag: string;
}
