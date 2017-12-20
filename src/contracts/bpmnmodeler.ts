export interface IBpmnModelerConstructor {
  new(options: {
    additionalModules?: Array<IDependencyHook>,
    container?: string,
  }): IBpmnModeler;
}

export interface IDependencyHook {
  __depends__: Array<string>;
  __init__: Array<string>;
  [index: string]: [string, any] | Array<string>;
}

export interface IBpmnModeler {
  definitions: any;
  attachTo(wrapper: HTMLElement): void;
  saveXML(options: any,
          callback: (error: Error, result: String) => void): void;
  importXML(xml: string,
            errorHandler: (err: Error) => void): void;
}

export interface IModdleElement {
  id: string;
  get: any;
  $type: string;
  $attrs?: any;
  $parent?: IModdleElement;
}

export interface IShape {
  businessObject: IModdleElement;
  id: string;
  type: string;
  label: IShape;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICanvas {
  getRootElement(): IShape;
}
