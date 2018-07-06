import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Redirect, Router} from 'aurelia-router';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  diagramName: string;
}

@inject('SolutionExplorerServiceFileSystem', 'NotificationService', EventAggregator, Router)
export class DiagramDetail {

  public diagram: IDiagram;
  public bpmnio: BpmnIo;

  private _solutionExplorerService: ISolutionExplorerService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _router: Router;
  private _diagramHasChanged: boolean;

  constructor(solutionExplorerService: ISolutionExplorerService,
              notificationService: NotificationService,
              eventAggregator: EventAggregator,
              router: Router) {
    this._solutionExplorerService = solutionExplorerService;
    this._notificationService = notificationService;
    this._eventAggregator = eventAggregator;
    this._router = router;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this.diagram = await this._solutionExplorerService.loadDiagram(routeParameters.diagramName);

    this._diagramHasChanged = false;
  }

  public attached(): void {
    this._eventAggregator.publish(environment.events.navBar.showTools, this.diagram);
    this._eventAggregator.publish(environment.events.statusBar.showXMLButton);

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram();
      }),
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
      }),
    ];
  }

  public async canDeactivate(): Promise<Redirect> {

    const _modal: Promise<boolean> = new Promise((resolve: Function, reject: Function): boolean | void => {
      if (!this._diagramHasChanged) {
        resolve(true);
      } else {

        const modal: HTMLElement = document.getElementById('saveModal');
        modal.classList.add('show-modal');

        // register onClick handler
        document.getElementById('dontSaveButton').addEventListener('click', () => {
          modal.classList.remove('show-modal');
          this._diagramHasChanged = false;
          resolve(true);
        });
        document.getElementById('saveButton').addEventListener('click', () => {
          this._saveDiagram();
          modal.classList.remove('show-modal');
          this._diagramHasChanged = false;
          resolve(true);
        });
        document.getElementById('cancelButton').addEventListener('click', () => {
          modal.classList.remove('show-modal');
          resolve(false);
        });
      }
    });

    const result: boolean = await _modal;
    if (result === false) {
      /*
       * As suggested in https://github.com/aurelia/router/issues/302, we use
       * the router directly to navgiate back, which results in staying on this
       * component-- and this is the desired behaviour.
       */
      return new Redirect(this._router.currentInstruction.fragment, {trigger: false, replace: false});
    }
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }

    this._eventAggregator.publish(environment.events.navBar.hideTools);
    this._eventAggregator.publish(environment.events.statusBar.hideXMLButton);
  }

  private async _saveDiagram(): Promise<void> {
    try {
      this.diagram.xml = await this.bpmnio.getXML();
      this._solutionExplorerService.saveDiagram(this.diagram);
      this._diagramHasChanged = false;
      this._notificationService
          .showNotification(NotificationType.SUCCESS, `File saved!`);
    } catch (error) {
      this._notificationService
          .showNotification(NotificationType.ERROR, `Unable to save the file: ${error}`);
    }
  }
}
