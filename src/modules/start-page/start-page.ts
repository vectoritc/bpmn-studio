import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

@inject(EventAggregator)
export class StartPage {
  private _eventAggregator: EventAggregator;

  public isRunningInElectron: boolean = (window as any).nodeRequire;
  public isRunningOnWindows: boolean = process.platform === 'win32';
  public isRunningOnMacOS: boolean = process.platform === 'darwin';

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

}
