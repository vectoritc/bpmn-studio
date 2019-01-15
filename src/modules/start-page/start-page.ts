import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

import environment from '../../environment';

@inject(EventAggregator)
export class StartPage {
  private _eventAggregator: EventAggregator;

  public isRunningInElectron: boolean = (window as any).nodeRequire;
  public isRunningOnWindows: boolean;
  public isRunningOnMacOS: boolean;
  public isRunningOnLinux: boolean;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public activate(): void {
    if (this.isRunningInElectron) {
      this.isRunningOnWindows = process.platform === 'win32';
      this.isRunningOnMacOS = process.platform === 'darwin';
      this.isRunningOnLinux = process.platform === 'linux';
    }
  }

  public openLocalSolution(): void {
    this._eventAggregator.publish(environment.events.startPage.openLocalSolution);
  }

  public openSingleDiagram(): void {
    this._eventAggregator.publish(environment.events.startPage.openSingleDiagram);
  }

  public createNewSingleDiagram(): void {
    this._eventAggregator.publish(environment.events.startPage.createSingleDiagram);
  }
}
