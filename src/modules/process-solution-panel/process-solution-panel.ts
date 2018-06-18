import {inject} from 'aurelia-framework';

import {
  BpmnStudioClient,
  IPagination,
  IProcessDefEntity,
} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {AuthenticationStateEvent} from '../../contracts/index';
import environment from '../../environment';

@inject('BpmnStudioClient', EventAggregator)
export class ProcessSolutionPanel {
  private _bpmnStudioClient: BpmnStudioClient;
  private _subscriptions: Array<Subscription>;
  private _eventAggregator: EventAggregator;

  public processes: IPagination<IProcessDefEntity>;

  constructor(bpmnStudioClient: BpmnStudioClient, eventAggregator: EventAggregator) {
    this._bpmnStudioClient = bpmnStudioClient;
    this._eventAggregator = eventAggregator;
    this._refreshProcesslist();
  }

  public async attached(): Promise<void> {
    this._refreshProcesslist();
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);

    window.localStorage.setItem('processSolutionExplorerHideState', 'show');

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(environment.events.refreshProcessDefs, () => {
        this._refreshProcesslist();
      }),
    ];
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);

    window.localStorage.setItem('processSolutionExplorerHideState', 'hide');
  }

  private async _refreshProcesslist(): Promise<void> {
    this.processes = await this._bpmnStudioClient.getProcessDefList();
  }
}
