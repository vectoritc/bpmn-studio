import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/core_contracts';
import {
  BpmnStudioClient,
  IPagination,
  IProcessDefEntity,
} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {ISolutionExplorerService} from 'solutionexplorer.service.contracts';
import {AuthenticationStateEvent} from '../../contracts/index';
import environment from '../../environment';

@inject('BpmnStudioClient', EventAggregator, 'SolutionExplorerService')
export class ProcessSolutionPanel {
  private _bpmnStudioClient: BpmnStudioClient;
  private _subscriptions: Array<Subscription>;
  private _eventAggregator: EventAggregator;
  private _solutionExplorerService: ISolutionExplorerService;

  public processes: IPagination<IProcessDefEntity>;

  constructor(bpmnStudioClient: BpmnStudioClient, eventAggregator: EventAggregator, solutionExplorerService: ISolutionExplorerService) {
    this._bpmnStudioClient = bpmnStudioClient;
    this._eventAggregator = eventAggregator;
    this._solutionExplorerService = solutionExplorerService;
    this._refreshProcesslist();

    const i: IIdentity = {
      id: 'test',
      name: 'test',
      roles: ['test'],
    };

    this._solutionExplorerService.openSolution('.', i);
    this._solutionExplorerService.loadSolution();
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
