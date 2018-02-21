import {IBpmnModdle,
        IModdleElement,
        IPageModel,
        IProperty,
        IPropertyElement,
        ISection,
        IShape} from '../../../../../../contracts';

export class BasicsSection implements ISection {

  public path: string = '/sections/basics/basics';
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
    this.init();
  }

  public isSuitableForElement(element: IShape): boolean {
    if (element.businessObject === undefined) {
      return false;
    }

    const elementHasExtensions: boolean = (element.businessObject.$type !== 'bpmn:Process') &&
                                      (element.businessObject.$type !== 'bpmn:Collaboration');

    return elementHasExtensions;
  }

  private init(): void {
    this.propertyElement = this.getPropertyElement();
    this.selectedElement = this.businessObjInPanel;
    this.reloadProperties();
  }

  private addProperty(): void {
    const bpmnProperty: IProperty = this.moddle.create('camunda:Property',
                                                        { name: '',
                                                          value: '',
                                                        });

    this.newNames.push('');
    this.newValues.push('');

    this.propertyElement.values.push(bpmnProperty);
    this.properties.push(bpmnProperty);
  }

  private removeProperty(index: number): void {
    this.propertyElement.values.splice(index, 1);
    this.reloadProperties();
  }

  private reloadProperties(): void {
    this.properties = [];
    this.newNames = [];
    this.newValues = [];

    if (!this.propertyElement || !this.propertyElement.values) {
      return;
    }

    const properties: Array<IProperty> = this.propertyElement.values;
    for (const property of properties) {
      if (property.$type === `camunda:Property`) {
        this.newNames.push(property.name);
        this.newValues.push(property.value);
        this.properties.push(property);
      }
    }
  }

  private getPropertyElement(): IPropertyElement {
    let propertyElement: IPropertyElement;
    if (!this.businessObjInPanel.extensionElements) {
      this.createExtensionElement();
    }

    for (const extensionValue of this.businessObjInPanel.extensionElements.values) {
      if (extensionValue.$type === 'camunda:Properties' && extensionValue.values) {
        propertyElement = extensionValue;
      }
    }

    if (!propertyElement) {
      const propertyValues: Array<IProperty> = [];

      const extensionPropertyElement: IPropertyElement = this.moddle.create('camunda:Properties', {values: propertyValues});
      this.businessObjInPanel.extensionElements.values.push(extensionPropertyElement);
      return this.getPropertyElement();
    }

    return propertyElement;
  }

  private createExtensionElement(): void {
    const bpmnExecutionListener: IModdleElement = this.moddle.create('camunda:ExecutionListener',
                                                                      { class: '',
                                                                        event: '',
                                                                      });

    const extensionValues: Array<IModdleElement> = [];
    const propertyValues: Array<IProperty> = [];
    const propertyElement: IPropertyElement = this.moddle.create('camunda:Properties', {values: propertyValues});
    extensionValues.push(bpmnExecutionListener);
    extensionValues.push(propertyElement);

    const extensionElements: IModdleElement = this.moddle.create('bpmn:ExtensionElements', {values: extensionValues});
    this.businessObjInPanel.extensionElements = extensionElements;
  }

  private changeName(index: number): void {
    this.propertyElement.values[index].name = this.newNames[index];
  }

  private changeValue(index: number): void {
    this.propertyElement.values[index].value = this.newValues[index];
  }

}
