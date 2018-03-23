import {
  IBpmnModdle,
  IExtensionElement,
  IModdleElement,
  IPageModel,
  IProperty,
  IPropertyElement,
  ISection,
  IShape,
} from '../../../../../../contracts';

export class ProcessSection {
  public path: string = '/sections/process/process';
  public canHandleElement: boolean = false;

  private businessObjInPanel: IModdleElement;
  private moddle: IBpmnModdle;

  private properties: Array<any> = [];
  private selectedElement: IModdleElement;
  private newNames: Array<string> = [];
  private newValues: Array<string> = [];
  private propertyElement: IPropertyElement;

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.moddle = model.modeler.get('moddle');
    this._init();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (element.businessObject === undefined) {
      return false;
    }

    const elementHasExtensions: boolean = element.businessObject.$type === 'bpmn:Participant';

    return elementHasExtensions;
  }

  public addProperty(): void {
    const bpmnPropertyProperties: Object = {
      name: '',
      value: '',
    };
    const bpmnProperty: IProperty = this.moddle.create('camunda:Property', bpmnPropertyProperties);

    this.newNames.push('');
    this.newValues.push('');

    this.propertyElement.values.push(bpmnProperty);
    this.properties.push(bpmnProperty);
  }

  public removeProperty(index: number): void {
    this.propertyElement.values.splice(index, 1);
    this._reloadProperties();
  }

  public changeName(index: number): void {
    this.propertyElement.values[index].name = this.newNames[index];
  }

  public changeValue(index: number): void {
    this.propertyElement.values[index].value = this.newValues[index];
  }

  private _init(): void {
    this.propertyElement = this._getPropertyElement();
    this.selectedElement = this.businessObjInPanel;
    this._reloadProperties();
  }

  private _reloadProperties(): void {
    this.properties = [];
    this.newNames = [];
    this.newValues = [];

    const elementHasNoProperties: boolean = this.propertyElement === undefined
                                         || this.propertyElement === null
                                         || this.propertyElement.values === undefined
                                         || this.propertyElement.values === null
                                         || this.propertyElement.values.length === 0;

    if (elementHasNoProperties) {
      return;
    }

    const properties: Array<IProperty> = this.propertyElement.values;
    for (const property of properties) {
      if (property.$type !== 'camunda:Property') {
        continue;
      }
      this.newNames.push(property.name);
      this.newValues.push(property.value);
      this.properties.push(property);
    }
  }

  private _getPropertyElement(): IPropertyElement {

    const hasBusinessObjExtensionElements: boolean = this.businessObjInPanel.processRef.extensionElements === undefined
                                                  || this.businessObjInPanel.processRef.extensionElements === null;

    if (hasBusinessObjExtensionElements) {
      this._createExtensionElement();
    }

    const propertyElement: IPropertyElement = this.businessObjInPanel
                                                  .processRef
                                                  .extensionElements
                                                  .values.find((extensionValue: IExtensionElement) => {
      const extensionIsPropertyElement: boolean = extensionValue.$type === 'camunda:Properties'
                                               && extensionValue.values !== undefined
                                               && extensionValue.values !== null;

      return extensionIsPropertyElement;
    });

    if (propertyElement === undefined) {
      this._createEmptyPropertyElement();

      return this._getPropertyElement();
    }

    return propertyElement;
  }

  private _createExtensionElement(): void {
    const bpmnExecutionListenerProperties: Object = {
      class: '',
      event: '',
    };
    const bpmnExecutionListener: IModdleElement = this.moddle.create('camunda:ExecutionListener', bpmnExecutionListenerProperties);

    const extensionValues: Array<IModdleElement> = [];
    const propertyValues: Array<IProperty> = [];
    const propertyElement: IPropertyElement = this.moddle.create('camunda:Properties', {values: propertyValues});
    extensionValues.push(bpmnExecutionListener);
    extensionValues.push(propertyElement);

    const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: extensionValues});
    this.businessObjInPanel.processRef.extensionElements = extensionElements;
  }

  private _createEmptyPropertyElement(): void {
    const propertyValues: Array<IProperty> = [];

    const extensionPropertyElement: IPropertyElement = this.moddle.create('camunda:Properties', {values: propertyValues});
    this.businessObjInPanel.extensionElements.values.push(extensionPropertyElement);
  }
}
