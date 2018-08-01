import {
  IBpmnModdle,
  IExtensionElement,
  IModdleElement,
  IPageModel,
  IPropertiesElement,
  IProperty,
  IShape,
} from '../../../../../../contracts';

export class ProcessSection {
  public path: string = '/sections/process/process';
  public canHandleElement: boolean = false;

  public newNames: Array<string> = [];
  public newValues: Array<string> = [];
  public properties: Array<IProperty> = [];

  private _businessObjInPanel: IModdleElement;
  private _moddle: IBpmnModdle;
  private _propertiesElement: IPropertiesElement;

  public activate(model: IPageModel): void {
    this._businessObjInPanel = model.elementInPanel.businessObject.participants[0];
    this._moddle = model.modeler.get('moddle');
    this._init();
  }

  public isSuitableForElement(element: IShape): boolean {
    const businessObjectIsNotExisting: boolean = element === undefined || element.businessObject === undefined;
    if (businessObjectIsNotExisting) {
      return false;
    }

    const elementIsRoot: boolean = element.businessObject.$type === 'bpmn:Collaboration';

    return elementIsRoot;
  }

  public addProperty(): void {
    const bpmnPropertyProperties: Object = {
      name: '',
      value: '',
    };
    const bpmnProperty: IProperty = this._moddle.create('camunda:Property', bpmnPropertyProperties);

    this.newNames.push('');
    this.newValues.push('');

    this._propertiesElement.values.push(bpmnProperty);
    this.properties.push(bpmnProperty);
  }

  public removeProperty(index: number): void {
    this._propertiesElement.values.splice(index, 1);
    this._reloadProperties();
  }

  public changeName(index: number): void {
    this._propertiesElement.values[index].name = this.newNames[index];
  }

  public changeValue(index: number): void {
    this._propertiesElement.values[index].value = this.newValues[index];
  }

  private _init(): void {
    this._propertiesElement = this._getPropertiesElement();
    this._reloadProperties();
  }

  private _reloadProperties(): void {
    this.properties = [];
    this.newNames = [];
    this.newValues = [];

    const elementHasNoProperties: boolean = !Array.isArray(this._propertiesElement.values)
                                          || this._propertiesElement.values.length === 0;

    if (elementHasNoProperties) {
      return;
    }

    const properties: Array<IProperty> = this._propertiesElement.values;
    for (const property of properties) {
      const propertyTypeIsNotCamunda: boolean = property.$type !== 'camunda:Property';
      if (propertyTypeIsNotCamunda) {
        continue;
      }

      this.newNames.push(property.name);
      this.newValues.push(property.value);
      this.properties.push(property);
    }
  }

  private _getPropertiesElement(): IPropertiesElement {

    const hasNoBusinessObjExtensionElements: boolean = this._businessObjInPanel.processRef.extensionElements === undefined
                                                  || this._businessObjInPanel.processRef.extensionElements === null;

    if (hasNoBusinessObjExtensionElements) {
      this._createExtensionElement();
    }

    const propertiesElement: IPropertiesElement = this._businessObjInPanel
                                                  .processRef
                                                  .extensionElements
                                                  .values
                                                  .find((extensionValue: IExtensionElement) => {

      const extensionIsPropertiesElement: boolean = extensionValue.$type === 'camunda:Properties'
                                               && extensionValue.values !== undefined
                                               && extensionValue.values !== null;

      return extensionIsPropertiesElement;
    });

    if (propertiesElement === undefined) {
      this._createEmptyPropertyElement();

      return this._getPropertiesElement();
    }

    return propertiesElement;
  }

  private _createExtensionElement(): void {
    const properties: Array<IProperty> = [];
    const propertiesElement: IPropertiesElement = this._moddle.create('camunda:Properties', {values: properties});

    const bpmnExecutionListenerProperties: Object = {
      class: '',
      event: '',
    };

    const bpmnExecutionListener: IModdleElement = this._moddle.create('camunda:ExecutionListener', bpmnExecutionListenerProperties);
    const extensionValues: Array<IModdleElement> = [bpmnExecutionListener, propertiesElement];
    const extensionElements: IModdleElement = this._moddle.create('bpmn:ExtensionElements', {values: extensionValues});

    // Set the extension elements of the process reference.
    this._businessObjInPanel
        .processRef
        .extensionElements = extensionElements;
  }

  private _createEmptyPropertyElement(): void {
    const properties: Array<IProperty> = [];

    const extensionPropertiesElement: IPropertiesElement = this._moddle.create('camunda:Properties', {values: properties});

    // Append to the extension elements of the process reference.
    this._businessObjInPanel
        .processRef
        .extensionElements
        .values
        .push(extensionPropertiesElement);
  }
}