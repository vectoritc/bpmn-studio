import {EventAggregator} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';

import {IBpmnModdle,
        IModdleElement,
        IPageModel,
        IPropertiesElement,
        IProperty,
        ISection,
        IShape} from '../../../../../../contracts';
import environment from '../../../../../../environment';

@inject(EventAggregator)
export class ServiceTaskSection implements ISection {

  public path: string = '/sections/service-task/service-task';
  public canHandleElement: boolean = false;
  public businessObjInPanel: IModdleElement;
  @observable public selectedKind: string;
  public selectedHttpMethod: string;

  private _eventAggregator: EventAggregator;
  private _moddle: IBpmnModdle;

  constructor(eventAggregator?: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this._moddle = model.modeler.get('moddle');
  }

  public attached(): void {
    this._initServiceTask();
  }

  public isSuitableForElement(element: IShape): boolean {
    return this._elementIsServiceTask(element);
  }

  public selectedKindChanged(): void {
    console.log('before', this.businessObjInPanel);

    if (this.selectedKind === 'HttpService') {
      console.log('create called');
      this._createHttpProperties();
    } else {
      console.log('delete called');
      this._deleteHttpProperties();
    }

    console.log('after', this.businessObjInPanel);
  }

  public selectedHttpMethodChanged(): void {
    console.log(this.businessObjInPanel);
    const property: IProperty = this._getProperty('method');
    property.value = this.selectedHttpMethod;
  }

  private _elementIsServiceTask(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:ServiceTask';
  }

  private _createHttpProperties(): void {

    const methodPropertyExists: boolean = this._getProperty('method') !== undefined;
    const paramPropertyExists: boolean = this._getProperty('params') !== undefined;

    if (methodPropertyExists && paramPropertyExists) {
      return;
    }

    const propertiesElement: IPropertiesElement = this._getPropertiesElement();

    if (!methodPropertyExists) {
      const methodPropertyObject: Object = {
        name: 'method',
        value: '',
      };

      const methodProperty: IProperty = this._moddle.create('camunda:Property', methodPropertyObject);

      propertiesElement.values.push(methodProperty);
    }

    if (!paramPropertyExists) {
      const paramPropertyObject: Object = {
        name: 'params',
        value: '',
      };

      const paramProperty: IProperty = this._moddle.create('camunda:Property', paramPropertyObject);

      propertiesElement.values.push(paramProperty);
    }

    this._getProperty('module').value = 'HttpService';
  }

  private _deleteHttpProperties(): void {
    const propertiesElement: IPropertiesElement = this._getPropertiesElement();
    propertiesElement.values.forEach((element: IProperty, index: number) => {

      if (element.name === 'method' || element.name === 'params') {
        propertiesElement.values.splice(index, 1);
      }

      if (element.name === 'module') {
        element.value = '';
      }
    });
  }

  private _getPropertiesElement(): IPropertiesElement {
    const propertiesElement: IPropertiesElement = this.businessObjInPanel.extensionElements.values.find((element: IPropertiesElement) => {
      return element.$type === 'camunda:Properties' && element.values !== undefined;
    });

    return propertiesElement;
  }

  private _getProperty(propertyName: string): IProperty {
    let property: IProperty;

    const propertiesElement: IPropertiesElement = this._getPropertiesElement();

    property = propertiesElement.values.find((element: IProperty) => {
      return element.name === propertyName;
    });

    return property;
  }

  private _initServiceTask(): void {
    const extensionElementExists: boolean = this.businessObjInPanel.extensionElements !== undefined
                                          && this.businessObjInPanel.extensionElements.values !== undefined;

    if (extensionElementExists) {
      const moduleProp: IProperty = this._getProperty('module');
      const modulePropertyExists: boolean = moduleProp !== undefined;

      if (modulePropertyExists) {
        this.selectedKind = moduleProp.value;
        this.selectedHttpMethod = this._getProperty('method').value;

        return;
      }
    }
    const extensionValues: Array<IModdleElement> = [];

    const modulePropertyObject: Object = {
      name: 'module',
      value: '',
    };
    const moduleProperty: IProperty = this._moddle.create('camunda:Property', modulePropertyObject);

    const properties: Array<IProperty> = [];
    const propertiesElement: IPropertiesElement = this._moddle.create('camunda:Properties', {values: properties});

    propertiesElement.values.push(moduleProperty);
    extensionValues.push(propertiesElement);

    if (extensionElementExists) {
      this.businessObjInPanel.extensionElements.values.push(propertiesElement);
    } else {
      const extensionElements: IModdleElement = this._moddle.create('bpmn:ExtensionElements', {values: extensionValues});
      this.businessObjInPanel.extensionElements = extensionElements;
    }

    console.log('init finished', this.businessObjInPanel);
  }

  private _publishDiagramChange(): void {
    this._eventAggregator.publish(environment.events.diagramChange);
  }

}
