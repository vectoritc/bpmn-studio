import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Redirect, Router} from 'aurelia-router';

import {IManagementApiService, ManagementContext} from '@process-engine/management_api_contracts';
import {ProcessModelExecution} from '@process-engine/management_api_contracts';
import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import {IAuthenticationService, IModdleElement, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  diagramUri: string;
}

@inject('SolutionExplorerServiceFileSystem', 'ManagementApiClientService', 'AuthenticationService', 'NotificationService', EventAggregator, Router)
export class DiagramDetail {

  public diagram: IDiagram;
  public bpmnio: BpmnIo;

  private _solutionExplorerService: ISolutionExplorerService;
  private _managementClient: IManagementApiService;
  private _authenticationService: IAuthenticationService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _router: Router;
  private _diagramHasChanged: boolean;

  // This identity is used for the filesystem actions. Needs to be refactored.
  private _identity: any;

  constructor(solutionExplorerService: ISolutionExplorerService,
              managementClient: IManagementApiService,
              authenticationService: IAuthenticationService,
              notificationService: NotificationService,
              eventAggregator: EventAggregator,
              router: Router) {
    this._solutionExplorerService = solutionExplorerService;
    this._managementClient = managementClient;
    this._authenticationService = authenticationService;
    this._notificationService = notificationService;
    this._eventAggregator = eventAggregator;
    this._router = router;
  }

  public determineActivationStrategy(): string {
    return 'replace';
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this.diagram = await this._solutionExplorerService.openSingleDiagram(routeParameters.diagramUri, this._identity);

    this._diagramHasChanged = false;
  }

  public attached(): void {
    this._eventAggregator.publish(environment.events.navBar.showTools, this.diagram);
    this._eventAggregator.publish(environment.events.navBar.showDiagramUploadButton);

    this._eventAggregator.publish(environment.events.statusBar.showDiagramViewButtons);

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram();
      }),
      this._eventAggregator.subscribe(environment.events.diagramChange, () => {
        this._diagramHasChanged = true;
      }),
      this._eventAggregator.subscribe(environment.events.processDefDetail.uploadProcess, () => {
        this._uploadProcess();
      }),
    ];
  }

  public async canDeactivate(): Promise<Redirect> {

    const _modal: Promise<boolean> = new Promise((resolve: Function, reject: Function): boolean | void => {
      if (!this._diagramHasChanged) {
        resolve(true);
      } else {

        const modal: HTMLElement = document.getElementById('saveModalLeaveView');
        modal.classList.add('show-modal');

        // register onClick handler
        document.getElementById('dontSaveButtonLeaveView').addEventListener('click', () => {
          modal.classList.remove('show-modal');
          this._diagramHasChanged = false;
          resolve(true);
        });
        document.getElementById('saveButtonLeaveView').addEventListener('click', () => {
          this._saveDiagram();
          modal.classList.remove('show-modal');
          this._diagramHasChanged = false;
          resolve(true);
        });
        document.getElementById('cancelButtonLeaveView').addEventListener('click', () => {
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
    this._eventAggregator.publish(environment.events.navBar.hideDiagramUploadButton);

    this._eventAggregator.publish(environment.events.statusBar.hideDiagramViewButtons);
  }

  private async _saveDiagram(): Promise<void> {
    try {
      this.diagram.xml = await this.bpmnio.getXML();
      this._solutionExplorerService.saveSingleDiagram(this.diagram, this._identity);
      this._diagramHasChanged = false;
      this._notificationService
          .showNotification(NotificationType.SUCCESS, `File saved!`);
    } catch (error) {
      this._notificationService
          .showNotification(NotificationType.ERROR, `Unable to save the file: ${error}`);
    }
  }

  private async _uploadProcess(): Promise<void> {
    const rootElements: Array<IModdleElement> = this.bpmnio.modeler._definitions.rootElements;
    const payload: ProcessModelExecution.UpdateProcessModelRequestPayload = {
      xml: this.diagram.xml,
    };

    const processModel: IModdleElement = rootElements.find((definition: IModdleElement) => {
      return definition.$type === 'bpmn:Process';
    });
    const processModelId: string = processModel.id;

    try {
      await this._managementClient.updateProcessModelById(this._getManagementContext(), processModelId, payload);
    } catch (error) {
      this._notificationService
          .showNotification(NotificationType.ERROR, `Unable to update diagram: ${error}`);
    }
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
