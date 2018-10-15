import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';

import {IBpmnModdle,
        IModdleElement,
        IPageModel,
        IPropertiesElement,
        IProperty,
        IServiceTaskElement} from '../../../../../../../../contracts';
import environment from '../../../../../../../../environment';

interface IAuthParameters {
  headers: {
    'Content-Type'?: string,
    Authorization?: string,
  };
}
@inject(EventAggregator)
export class ExternalTask {

  @bindable() public model: IPageModel;
  public businessObjInPanel: IServiceTaskElement;
  @observable public selectedTopic: string;

  private _eventAggregator: EventAggregator;

  constructor(eventAggregator?: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public attached(): void {
    this.businessObjInPanel = this.model.elementInPanel.businessObject;
    this.selectedTopic = this.businessObjInPanel.topic;
  }

  public modelChanged(): void {
    this.businessObjInPanel = this.model.elementInPanel.businessObject;
    this.selectedTopic = this.businessObjInPanel.topic;
  }

  public selectedTopicChanged(): void {
    this.businessObjInPanel.topic = this.selectedTopic;
  }

  private _publishDiagramChange(): void {
    this._eventAggregator.publish(environment.events.diagramChange);
  }

}
