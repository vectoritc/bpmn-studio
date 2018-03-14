import {
  IBpmnModdle,
  IBpmnModeler,
  IDefinition,
  IElementRegistry,
  IError,
  IErrorElement,
  IModdleElement,
  IPageModel,
  ISection,
  IShape,
} from '../../../../../../contracts';

import {inject} from 'aurelia-framework';
import {GeneralService} from '../../service/general.service';

@inject(GeneralService)
export class ErrorEventSection implements ISection {

  public path: string = '/sections/error-event/error-event';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IErrorElement;
  private moddle: IBpmnModdle;
  private modeler: IBpmnModeler;
  private generalService: GeneralService;

  public errors: Array<IError>;
  public selectedId: string;
  public selectedError: IError;
  public isEndEvent: boolean = false;

  private errorMessageVariable: string;

  constructor(generalService?: GeneralService) {
    this.generalService = generalService;
  }

  public async activate(model: IPageModel): Promise<void> {
    this.businessObjInPanel = model.elementInPanel.businessObject;

    this.moddle = model.modeler.get('moddle');
    this.modeler = model.modeler;
    this.errors = await this.getErrors();

    this.init();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (this.elementIsErrorEvent(element)) {
      this.isEndEvent = this.elementIsEndEvent(element);
      return true;
    }
    return false;
  }

  private elementIsErrorEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.eventDefinitions !== undefined
        && element.businessObject.eventDefinitions[0].$type === 'bpmn:ErrorEventDefinition';
  }

  private elementIsEndEvent(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:EndEvent';
  }

  private init(): void {
    const eventDefinitions: Array<IModdleElement> = this.businessObjInPanel.eventDefinitions;
    const businessObjecthasNoErrorEvents: boolean = eventDefinitions === undefined
                                                 || eventDefinitions === null
                                                 || eventDefinitions[0].$type !== 'bpmn:ErrorEventDefinition';

    if (businessObjecthasNoErrorEvents) {
      return;
    }

    const errorElement: IErrorElement = this.businessObjInPanel.eventDefinitions[0];
    const elementReferencesError: boolean = errorElement.errorRef !== undefined
                                         && errorElement.errorRef !== null;

    if (elementReferencesError) {
      this.selectedId = errorElement.errorRef.id;
      this.updateError();
    } else {
      this.selectedError = null;
      this.selectedId = null;
    }
  }

  private getErrors(): Array<IErrorElement> {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const errors: Array<IErrorElement> = rootElements.filter((element: IModdleElement) => {
      return element.$type === 'bpmn:Error';
    });

    return errors;
  }

  public updateError(): void {
    if (this.selectedId === undefined || this.selectedId === null) {
      this.selectedError = null;
      return;
    }

    this.selectedError = this.errors.find((error: IError) => {
      return error.id === this.selectedId;
    });

    const errorElement: IErrorElement = this.businessObjInPanel.eventDefinitions[0];

    errorElement.errorRef = this.selectedError;
    if (!this.isEndEvent) {
      this.errorMessageVariable = errorElement.errorMessageVariable;
    }
  }

  public updateErrorName(): void {
    const selectedError: IError = this._getSlectedError();
    selectedError.name = this.selectedError.name;
  }

  public updateErrorCode(): void {
    const selectedError: IError = this._getSlectedError();
    selectedError.errorCode = this.selectedError.errorCode;
  }

  private _getSlectedError(): IError {
    const rootElements: Array<IModdleElement> = this.modeler._definitions.rootElements;
    const selectedError: IError = rootElements.find((element: IModdleElement) => {
      return element.$type === 'bpmn:Error' && element.id === this.selectedId;
    });

    return selectedError;
  }

  public updateErrorMessage(): void {
    const errorElement: IErrorElement = this.businessObjInPanel.eventDefinitions[0];
    errorElement.errorMessageVariable = this.errorMessageVariable;
  }

  public async addError(): Promise<void> {

      const bpmnErrorObject: Object = {
        id: `Error_${this.generalService.generateRandomId()}`,
        name: 'Error Name',
      };
      const bpmnError: IError = this.moddle.create('bpmn:Error', bpmnErrorObject);

      this.modeler._definitions.rootElements.push(bpmnError);

      this.moddle.toXML(this.modeler._definitions, (toXMLError: Error, xmlStrUpdated: string) => {
        this.modeler.importXML(xmlStrUpdated, async(importXMLError: Error) => {
          await this.refreshErrors();
          await this.setBusinessObject();
          this.selectedId = bpmnError.id;
          this.selectedError = bpmnError;
          this.updateError();
        });
      });
  }

  private async refreshErrors(): Promise<void> {
    this.errors = await this.getErrors();
  }

  private setBusinessObject(): void {
    const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
    const elementInPanel: IShape = elementRegistry.get(this.businessObjInPanel.id);
    this.businessObjInPanel = elementInPanel.businessObject;
  }

  public clearName(): void {
    this.selectedError.name = '';
  }

  public clearCode(): void {
    this.selectedError.errorCode = '';
  }

  public clearMessage(): void {
    this.errorMessageVariable = '';
  }
}
