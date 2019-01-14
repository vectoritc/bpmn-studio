import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

@inject(EventAggregator)
export class StartPage {
  private _eventAggregator: EventAggregator;
  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

}
