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

interface IAuthParameters {
  headers: {
    'Content-Type'?: string,
    Authorization?: string,
  };
}
@inject(EventAggregator)
export class ServiceTaskSection implements ISection {

  public path: string = '/sections/service-task/service-task';
  public canHandleElement: boolean = false;
  public businessObjInPanel: IModdleElement;
  public model: IPageModel;
  @observable public selectedKind: string;

  private _eventAggregator: EventAggregator;
  private _moddle: IBpmnModdle;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public activate(model: IPageModel): void {
    this.businessObjInPanel = model.elementInPanel.businessObject;
    this.model = model;
    this._moddle = model.modeler.get('moddle');

    this._initServiceTask();
  }

  public isSuitableForElement(element: IShape): boolean {
    return this._elementIsServiceTask(element);
  }

  public selectedKindChanged(): void {
    const selectedKindIsHttpService: boolean = this.selectedKind === 'HttpService';
    const selectedKindIsExternalTask: boolean = this.selectedKind === 'external';

    if (selectedKindIsHttpService) {
      let moduleProperty: IProperty = this._getProperty('module');
      const modulePropertyExists: boolean = moduleProperty !== undefined;

      if (modulePropertyExists) {
        moduleProperty.value = this.selectedKind;
      } else {
        this._createModuleProperty();
        moduleProperty = this._getProperty('module');
        moduleProperty.value = this.selectedKind;
      }
    }

    this._publishDiagramChange();
  }

  private _elementIsServiceTask(element: IShape): boolean {
    return element !== undefined
        && element.businessObject !== undefined
        && element.businessObject.$type === 'bpmn:ServiceTask';
  }

  private _resetServiceTask(): void {
    this.selectedKind = null;
  }

  private _publishDiagramChange(): void {
    this._eventAggregator.publish(environment.events.diagramChange);
  }

  private _getPropertiesElement(): IPropertiesElement {
    const propertiesElement: IPropertiesElement = this.businessObjInPanel.extensionElements.values.find((element: IPropertiesElement) => {
      return element.$type === 'camunda:Properties' && element.values !== undefined;
    });

    console.log('properties element', propertiesElement);

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

  private _createModuleProperty(): void {
    const propertiesElement: IPropertiesElement = this._getPropertiesElement();

    const modulePropertyObject: Object = {
      name: 'module',
      value: 'HttpService',
    };

    const moduleProperty: IProperty = this._moddle.create('camunda:Property', modulePropertyObject);

    propertiesElement.values.push(moduleProperty);
  }

  private _initServiceTask(): void {

    const extensionElementExists: boolean = this.businessObjInPanel.extensionElements !== undefined
                                          && this.businessObjInPanel.extensionElements.values !== undefined;
    const propertyElementExists: boolean = this._getPropertiesElement() !== undefined;

    console.log('extension element exists', extensionElementExists);
    console.log('property element exists', propertyElementExists);
    if (extensionElementExists && propertyElementExists) {
      const modulePropertyExists: boolean = this._getProperty('module') !== undefined;

      if (modulePropertyExists) {
        this.selectedKind = this._getProperty('module').value;
      }

      return;
    }

    const extensionValues: Array<IModdleElement> = [];

    const properties: Array<IProperty> = [];
    const propertiesElement: IPropertiesElement = this._moddle.create('camunda:Properties', {values: properties});

    extensionValues.push(propertiesElement);

    const extensionElements: IModdleElement = this._moddle.create('bpmn:ExtensionElements', {values: extensionValues});
    this.businessObjInPanel.extensionElements = extensionElements;

  }
}
