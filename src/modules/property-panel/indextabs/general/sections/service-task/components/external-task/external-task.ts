import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';
import environment from '../../../../../../../../environment';

import {
  IBpmnModdle,
  IPageModel,
  IPropertiesElement,
  IServiceTaskElement,
  IProperty
} from '../../../../../../../../contracts';

@inject(EventAggregator)
export class ExternalTask {

  @bindable() public model: IPageModel;
  public businessObjInPanel: IServiceTaskElement;
  @observable public selectedTopic: string;
  @observable public selectedPayload: string;

  private _eventAggregator: EventAggregator;
  private _moddle: IBpmnModdle;

  constructor(eventAggregator?: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public attached(): void {
    this.businessObjInPanel = this.model.elementInPanel.businessObject;
    this._moddle = this.model.modeler.get('moddle');
    this.selectedTopic = this.businessObjInPanel.topic;
    this.selectedPayload = this._getPayloadFromModel();
  }

  public modelChanged(): void {
    this.businessObjInPanel = this.model.elementInPanel.businessObject;
    this._moddle = this.model.modeler.get('moddle');
    this.selectedTopic = this.businessObjInPanel.topic;
    this.selectedPayload = this._getPayloadFromModel();
  }

  public selectedTopicChanged(): void {
    this.businessObjInPanel.topic = this.selectedTopic;
    this._publishDiagramChange();
  }

  public selectedPayloadChanged(): void {
    this._setPayloadToModel(this.selectedPayload);
    this._publishDiagramChange();
  }

  private _getPayloadFromModel(): string {
    const payloadProperty: IProperty = this._getProperty('payload');

    const payloadPropertyExists: boolean = payloadProperty !== undefined;
    if (payloadPropertyExists) {
      return payloadProperty.value;
    } else {
      return undefined;
    }
  }

  private _setPayloadToModel(value: string): void {
    let payloadProperty: IProperty = this._getProperty('payload');

    const payloadPropertyNotExists: boolean = payloadProperty === undefined;

    if (payloadPropertyNotExists) {
      payloadProperty = this._createProperty('payload');
    }

    payloadProperty.value = value;
  }

  private _publishDiagramChange(): void {
    this._eventAggregator.publish(environment.events.diagramChange);
  }

  private _createProperty(propertyName: string): IProperty {
    const propertiesElement: IPropertiesElement = this._getPropertiesElement();

    const propertyObject: Object = {
      name: propertyName,
      value: '',
    };

    const property: IProperty = this._moddle.create('camunda:Property', propertyObject);

    propertiesElement.values.push(property);

    return property;
  }

  private _getPropertiesElement(): IPropertiesElement {
    const propertiesElement: IPropertiesElement = this.businessObjInPanel.extensionElements.values.find((element: IPropertiesElement) => {
      return element.$type === 'camunda:Properties' && element.values !== undefined;
    });

    return propertiesElement;
  }

  private _getProperty(propertyName: string): IProperty {
    const propertiesElement: IPropertiesElement = this._getPropertiesElement();

    const property: IProperty = propertiesElement.values.find((element: IProperty) => {
      return element.name === propertyName;
    });

    return property;
  }
}
