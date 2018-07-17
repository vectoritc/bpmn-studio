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

  private businessObjInPanel: IModdleElement;
  private moddle: IBpmnModdle;

  private properties: Array<IProperty> = [];
  private selectedElement: IModdleElement;
  private newNames: Array<string> = [];
  private newValues: Array<string> = [];
  private propertyElement: IPropertiesElement;

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
    this.selectedElement = this.businessObjInPanel;
    this.propertyElement = this._getPropertiesElement();
    this._reloadProperties();
  }

  private _reloadProperties(): void {
    this.properties = [];
    this.newNames = [];
    this.newValues = [];

    const elementHasNoProperties: boolean = !Array.isArray(this.propertyElement.values)
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

  private _getPropertiesElement(): IPropertiesElement {

    const hasNoBusinessObjExtensionElements: boolean = this.businessObjInPanel.processRef.extensionElements === undefined
                                                  || this.businessObjInPanel.processRef.extensionElements === null;

    if (hasNoBusinessObjExtensionElements) {
      this._createExtensionElement();
    }

    const propertiesElement: IPropertiesElement = this.businessObjInPanel
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
    const propertiesElement: IPropertiesElement = this.moddle.create('camunda:Properties', {values: properties});

    const bpmnExecutionListenerProperties: Object = {
      class: '',
      event: '',
    };

    const bpmnExecutionListener: IModdleElement = this.moddle.create('camunda:ExecutionListener', bpmnExecutionListenerProperties);

    const extensionValues: Array<IModdleElement> = [bpmnExecutionListener, propertiesElement];

    const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: extensionValues});

    // Set the extension elements of the process reference.
    this.businessObjInPanel
        .processRef
        .extensionElements = extensionElements;
  }

  private _createEmptyPropertyElement(): void {
    const properties: Array<IProperty> = [];

    const extensionPropertiesElement: IPropertiesElement = this.moddle.create('camunda:Properties', {values: properties});

    // Append to the extension elements of the process reference.
    this.businessObjInPanel
        .extensionElements
        .values
        .push(extensionPropertiesElement);
  }
}
