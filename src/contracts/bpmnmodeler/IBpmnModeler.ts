export interface IBpmnModeler {
  definitions: any;
  attachTo(wrapper: HTMLElement): void;
  saveXML(options: any,
          callback: (error: Error, result: String) => void): void;
  importXML(xml: string,
            errorHandler: (err: Error) => void): void;
}
