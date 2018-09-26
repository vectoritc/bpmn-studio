import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';

import {InspectPanelTab} from '../../../../contracts/index';
import environment from '../../../../environment';

@inject(EventAggregator)
export class InspectPanel {
  @bindable() public correlations: Array<Correlation>;
  @bindable() public selectedCorrelation: Correlation;
  @bindable() public fullscreen: boolean;
  public InspectPanelTab: typeof InspectPanelTab = InspectPanelTab;
  public showProcessInstanceList: boolean = true;
  public showLogViewer: boolean;

  private _eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;

    this._eventAggregator.publish(environment.events.inspect.disableTokenViewerButton, this.fullscreen);
  }

  public changeTab(inspectPanelTab: InspectPanelTab): void {
    const shouldShowProcessInstanceList: boolean = inspectPanelTab === InspectPanelTab.ProcessInstanceList;
    const shouldShowLogViewer: boolean = inspectPanelTab === InspectPanelTab.LogViewer;

    this.showProcessInstanceList = shouldShowProcessInstanceList;
    this.showLogViewer = shouldShowLogViewer;
  }
}
