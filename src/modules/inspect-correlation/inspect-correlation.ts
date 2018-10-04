import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';

import {IEventFunction} from '../../contracts/index';
import environment from '../../environment';
import {IInspectCorrelationService} from './contracts';

interface RouteParameters {
  processModelId: string;
}

@inject('InspectCorrelationService', EventAggregator)
export class InspectCorrelation {
  @bindable() public processModelId: string;
  @bindable() public selectedCorrelation: Correlation;
  @bindable() public inspectPanelFullscreen: boolean = false;
  @observable public bottomPanelHeight: number = 250;

  public correlations: Array<Correlation>;
  public token: string;
  public showInspectPanel: boolean = true;
  public showTokenViewer: boolean = false;
  public bottomPanelResizeDiv: HTMLDivElement;
  public selectedFlowNodeId: String;

  private _inspectCorrelationService: IInspectCorrelationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _menuBarHeight: number = 40;
  private _minInspectPanelHeight: number = 250;

  constructor(inspectCorrelationService: IInspectCorrelationService,
              eventAggregator: EventAggregator) {

    this._inspectCorrelationService = inspectCorrelationService;
    this._eventAggregator = eventAggregator;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this.processModelId = routeParameters.processModelId;
  }

  public attached(): void {
    this._eventAggregator.publish(environment.events.statusBar.showInspectViewButtons, true);
    this._eventAggregator.publish(environment.events.navBar.updateProcessName, this.processModelId);
    this._eventAggregator.publish(environment.events.statusBar.showInspectCorrelationButtons, true);

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.inspectCorrelation.showInspectPanel, (showInspectPanel: boolean) => {
        this.showInspectPanel = showInspectPanel;
      }),
      this._eventAggregator.subscribe(environment.events.inspectCorrelation.showTokenViewer, (showTokenViewer: boolean) => {
        this.showTokenViewer = showTokenViewer;
      }),
    ];

    this.bottomPanelResizeDiv.addEventListener('mousedown', (mouseDownEvent: Event) => {
      const windowEvent: Event = mouseDownEvent || window.event;
      windowEvent.cancelBubble = true;

      const mousemoveFunction: IEventFunction = (mouseMoveEvent: MouseEvent): void => {
        this.resizeInspectPanel(mouseMoveEvent);
        document.getSelection().empty();
      };

      const mouseUpFunction: IEventFunction = (): void => {
        document.removeEventListener('mousemove', mousemoveFunction);
        document.removeEventListener('mouseup', mouseUpFunction);
      };

      document.addEventListener('mousemove', mousemoveFunction);
      document.addEventListener('mouseup', mouseUpFunction);
    });
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.statusBar.showInspectViewButtons, false);
    this._eventAggregator.publish(environment.events.statusBar.showInspectCorrelationButtons, false);

    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public async processModelIdChanged(): Promise<void> {
    this.correlations = await this._inspectCorrelationService.getAllCorrelationsForProcessModelId(this.processModelId);
  }

  public resizeInspectPanel(mouseEvent: MouseEvent): void {
    const mouseYPosition: number = mouseEvent.clientY;
    const inspectPanelHeightWithStatusBar: number = this.bottomPanelResizeDiv.parentElement.parentElement.clientHeight + this._menuBarHeight;
    const newBottomPanelHeight: number = inspectPanelHeightWithStatusBar - mouseYPosition;

    this.bottomPanelHeight = Math.max(newBottomPanelHeight, this._minInspectPanelHeight);
  }
}
