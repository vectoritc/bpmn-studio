import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';
import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {InspectPanelTab} from '../../../../../contracts/index';
import environment from '../../../../../environment';

@inject(EventAggregator)
export class InspectPanel {
  @bindable() public correlations: Array<Correlation>;
  @bindable() public selectedCorrelation: Correlation;
  @bindable() public fullscreen: boolean = false;
  @bindable() public activeDiagram: IDiagram;
  public InspectPanelTab: typeof InspectPanelTab = InspectPanelTab;
  public showCorrelationList: boolean = true;
  public showLogViewer: boolean;

  private _eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;

    this._eventAggregator.publish(environment.events.inspect.shouldDisableTokenViewerButton, this.fullscreen);
  }

  public activeDiagramChanged(): void {
    this.selectedCorrelation = undefined;

    this.showLogViewer = false;
    this.showCorrelationList = true;
  }

  public changeTab(inspectPanelTab: InspectPanelTab): void {
    const shouldShowCorrelationList: boolean = inspectPanelTab === InspectPanelTab.CorrelationList;
    const shouldShowLogViewer: boolean = inspectPanelTab === InspectPanelTab.LogViewer;

    this.showCorrelationList = shouldShowCorrelationList;
    this.showLogViewer = shouldShowLogViewer;
  }

  public correlationChanged(newCorrelation: Correlation, oldCorrelation: Correlation): void {
    const firstCorrelationGotSelected: boolean = oldCorrelation !== undefined;
    const shouldEnableTokenViewerButton: boolean = !(firstCorrelationGotSelected
                                                   || this.fullscreen);

    if (shouldEnableTokenViewerButton) {
      this._eventAggregator.publish(environment.events.inspect.shouldDisableTokenViewerButton, false);
    }
  }
}
