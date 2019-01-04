import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {Redirect, Router} from 'aurelia-router';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {activationStrategy, NavigationInstruction, Redirect, RouteConfig, Router} from 'aurelia-router';
import {ISolutionEntry, ISolutionService, NotificationType} from '../../contracts';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';
import {DiagramDetail} from './diagram-detail/diagram-detail';

export interface IDesignRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

type IEventListener = {
  name: string,
  function: Function,
};

@inject(EventAggregator, 'SolutionService', Router, 'NotificationService')
export class Design {

  @bindable() public activeDiagram: IDiagram;
  @bindable() public activeSolutionEntry: ISolutionEntry;

  public showQuitModal: boolean;
  public showLeaveModal: boolean;

  public showDetail: boolean = true;
  public showXML: boolean;
  public showDiff: boolean;
  public propertyPanelShown: boolean;
  public showPropertyPanelButton: boolean = true;
  public showDiffDestinationButton: boolean = false;
  public diffDestinationIsLocal: boolean = true;

  @bindable() public xmlForDiffOld: string;
  @bindable() public xmlForDiffNew: string;
  public diagramDetail: DiagramDetail;

  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;
  private _solutionService: ISolutionService;
  private _subscriptions: Array<Subscription>;
  private _router: Router;
  private _routeView: string;
  private _ipcRenderer: any;
  private _ipcRendererEventListeners: Array<IEventListener> = [];
  private _suppressSaveChangesModal: boolean;

  constructor(eventAggregator: EventAggregator, solutionService: ISolutionService, router: Router, notificationService: NotificationService) {
    this._eventAggregator = eventAggregator;
    this._solutionService = solutionService;
    this._router = router;
    this._notificationService = notificationService;
  }

  public async activate(routeParameters: IDesignRouteParameters): Promise<void> {
    const isRunningInElectron: boolean = Boolean((window as any).nodeRequire);
    if (isRunningInElectron) {
      this._prepareSaveModalForClosing();
    }

    const solutionIsSet: boolean = routeParameters.solutionUri !== undefined;
    const diagramNameIsSet: boolean = routeParameters.diagramName !== undefined;

    if (solutionIsSet) {
      this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(routeParameters.solutionUri);

      /**
       * We have to open the solution here again since if we come here after a
       * reload the solution might not be opened yet.
       */
      await this.activeSolutionEntry.service.openSolution(this.activeSolutionEntry.uri, this.activeSolutionEntry.identity);

      const isSingleDiagram: boolean = this.activeSolutionEntry.uri === 'Single Diagrams';

      if (isSingleDiagram) {
        const persistedDiagrams: Array<IDiagram> = this._solutionService.getSingleDiagrams();

        this.activeDiagram = persistedDiagrams.find((diagram: IDiagram) => {
          return diagram.name === routeParameters.diagramName;
        });

      } else {

        this.activeDiagram = diagramNameIsSet ? await this.activeSolutionEntry.service.loadDiagram(routeParameters.diagramName) : undefined;
      }

      const diagramNotFound: boolean = this.activeDiagram === undefined;

      if (diagramNotFound) {
        this._router.navigateToRoute('start-page');
        this._notificationService.showNotification(NotificationType.INFO, 'Diagram could not be opened!');
      }
    }

    const routeViewIsDetail: boolean = routeParameters.view === 'detail';
    const routeViewIsXML: boolean = routeParameters.view === 'xml';
    const routeViewIsDiff: boolean = routeParameters.view === 'diff';
    this._routeView = routeParameters.view;

    if (routeViewIsDetail) {
      this.showDetail = true;
      this.showXML = false;
      this.showDiff = false;
      this.showPropertyPanelButton = true;
      this.showDiffDestinationButton = false;
    } else if (routeViewIsXML) {
      this.showDetail = false;
      this.showXML = true;
      this.showDiff = false;
      this.showDiffDestinationButton = false;
      this.showPropertyPanelButton = false;
    } else if (routeViewIsDiff) {
      /**
       * We need to check this, because after a reload the diagramdetail component is not attached yet.
       */
      const diagramDetailIsNotAttached: boolean = this.diagramDetail === undefined;
      if (diagramDetailIsNotAttached) {
        return;
      }

      const previousRouteIsDiff: boolean = this._router.currentInstruction.params.view === 'diff';

      if (previousRouteIsDiff) {
        this.xmlForDiffOld = this.activeDiagram.xml;
        this.xmlForDiffNew = await this.diagramDetail.getXML();
      } else {
        this.xmlForDiffOld = await this.diagramDetail.getXML();
        this.xmlForDiffNew = undefined;
      }

      this._showDiff();
    }
  }

  public async attached(): Promise<void> {
    setTimeout(async() => {
      this.xmlForDiffOld = await this.diagramDetail.getXML();
    }, 0);

    const routeViewIsDiff: boolean = this._routeView === 'diff';
    if (routeViewIsDiff) {
      this._showDiff();
    }

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.bpmnio.propertyPanelActive, (showPanel: boolean) => {
        this.propertyPanelShown = showPanel;
      }),
      this._eventAggregator.subscribe(environment.events.diagramDetail.suppressUnsavedChangesModal, () => {
        this._suppressSaveChangesModal = true;
      }),
    ];

    this._eventAggregator.publish(environment.events.statusBar.showDiagramViewButtons);
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.statusBar.hideDiagramViewButtons);
    this._subscriptions.forEach((subscription: Subscription) => subscription.dispose());
  }

  /**
   * We abuse this method to obtain the router target, since asking
   * the router in the canDeactivate method is kinda broken.
   *
   * We also use invoke-lifecycle to cache the current instance of
   * the design view.
   *
   * @param routeParams Current router parameters for the destination route
   */
  public determineActivationStrategy(routeParams: IDesignRouteParameters): string {
    console.log(routeParams);
    return activationStrategy.invokeLifecycle;
  }

  public toggleDiffDestination(): void {
    this.diffDestinationIsLocal = !this.diffDestinationIsLocal;
    const diffDestination: string = this.diffDestinationIsLocal ? 'local' : 'deployed';

    this._eventAggregator.publish(environment.events.diffView.setDiffDestination, diffDestination);
  }

  public togglePanel(): void {
    this._eventAggregator.publish(environment.events.bpmnio.togglePropertyPanel);
  }

  public async canDeactivate(): Promise<Redirect> {
    const modalResult: boolean = await this.canDeactivateModal();

    if (!modalResult) {
      /*
      * As suggested in https://github.com/aurelia/router/issues/302, we use
      * the router directly to navigate back, which results in staying on this
      * component-- and this is the desired behaviour.
      */
      return new Redirect(this._router.currentInstruction.fragment, {trigger: false, replace: false});
    }
  }

  public async canDeactivateModal(): Promise<boolean> {
    if (this._suppressSaveChangesModal) {
      this._suppressSaveChangesModal = false;

      return true;
    }

    const modalResult: Promise<boolean> = new Promise((resolve: Function, reject: Function): boolean | void => {
      if (!this.diagramDetail.diagramHasChanged) {
        resolve(true);

        return;
      }

      this.showLeaveModal = true;

      // register onClick handler
      document.getElementById('dontSaveButtonLeaveView').addEventListener('click', () => {
        this.showLeaveModal = false;
        this.diagramDetail.diagramHasChanged = false;
        this._eventAggregator.publish(environment.events.navBar.diagramChangesResolved);

        resolve(true);
      });

      document.getElementById('saveButtonLeaveView').addEventListener('click', async() => {
        if (this.diagramDetail.diagramIsInvalid) {
          resolve(false);
        }

        this.showLeaveModal = false;
        await this.diagramDetail.saveDiagram();
        this.diagramDetail.diagramHasChanged = false;

        resolve(true);
      });

      document.getElementById('cancelButtonLeaveView').addEventListener('click', () => {
        this.showLeaveModal = false;

        resolve(false);
      });
    });

    return modalResult;
  }

  public deactivate(): void {
    this.diagramDetail.deactivate();

    for (const eventListener of this._ipcRendererEventListeners) {
      this._ipcRenderer.removeListener(eventListener.name, eventListener.function);
    }
  }

  private _showDiff(): void {
    this.showDiff = true;
    this.showDetail = false;
    this.showXML = false;
    this.showPropertyPanelButton = false;
    this.showDiffDestinationButton = true;
  }

  private _prepareSaveModalForClosing(): void {
    this._ipcRenderer = (window as any).nodeRequire('electron').ipcRenderer;

    const showCloseModalEventName: string = 'show-close-modal';

    const showCloseModalFunction: Function = (): void => {
      this.showQuitModal = true;
    };

    this._ipcRenderer.on(showCloseModalEventName, showCloseModalFunction);
    this._ipcRendererEventListeners.push({
                                            name: showCloseModalEventName,
                                            function: showCloseModalFunction,
                                        });

  }

  public quitWithoutSaving(): void {
    this._ipcRenderer.send('can-not-close', false);
    this._ipcRenderer.send('close-bpmn-studio');
  }

  public async quitWithSaving(): Promise<void> {
    if (this.diagramDetail.diagramIsInvalid) {
      return;
    }

    await this.diagramDetail.saveDiagram();
    this.diagramDetail.diagramHasChanged = false;

    this._ipcRenderer.send('close-bpmn-studio');
  }

  public cancelQuitting(): void {
    this.showQuitModal = false;
  }

}
