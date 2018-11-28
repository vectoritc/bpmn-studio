import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {RouteConfig, Router} from 'aurelia-router';

import { IDiagram, ISolution } from '@process-engine/solutionexplorer.contracts';
import {ISolutionEntry, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface INavbarProcessInformation {
  id?: string;
  name?: string;
  uri?: string;
}

@inject(Router, EventAggregator, 'NotificationService')
export class NavBar {

  @bindable() public activeRouteName: string;

  /**
   * Todo: see below!
   */
  public process: INavbarProcessInformation;

  public activeSolutionEntry: ISolutionEntry;
  public activeDiagram: IDiagram;

  public diagramInfo: HTMLElement;
  public dropdown: HTMLElement;
  public solutionExplorerIsActive: boolean = true;
  public showTools: boolean = false;
  public showInspectTools: boolean = false;
  public disableStartButton: boolean = true;
  public validationError: boolean = false;
  public showProcessName: boolean = false;
  public disableDiagramUploadButton: boolean = true;
  public disableHeatmapButton: boolean = true;
  public disableDashboardButton: boolean = false;
  public disableInspectCorrelationButton: boolean = false;
  public diagramContainsUnsavedChanges: boolean = false;
  public inspectView: string = 'dashboard';
  public disableDesignLink: boolean = false;
  public latestSource: string;
  public navbarTitle: string = '';
  @bindable() public processOpenedFromProcessEngine: boolean = false;

  private _router: Router;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _notificationService: NotificationService;

  constructor(router: Router, eventAggregator: EventAggregator, notificationService: NotificationService) {
    this._router = router;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
  }

  public attached(): void {
    this._dertermineActiveRoute();

    this.solutionExplorerIsActive = window.localStorage.getItem('SolutionExplorerVisibility') === 'true';

    this._subscriptions = [
      this._eventAggregator.subscribe('router:navigation:complete', () => {
        this._dertermineActiveRoute();
      }),

      this._eventAggregator.subscribe(environment.events.navBar.showTools, () => {
        this.showTools = true;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.showProcessName, (process: INavbarProcessInformation) => {
        this.showProcessName = true;

        /**
         * TODO: See below
         */
        this.process = process;

        this._updateNavbarTitle();
      }),

      this._eventAggregator.subscribe(environment.events.navBar.hideTools, () => {
        this.showTools = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.updateProcess, (process: INavbarProcessInformation) => {

        /*
         * TODO: Currently the process can be of one of two different types.
         * One of them has an attribute 'name' which should be used for the
         * navbar title. The other one does not have this attribute.
         * At the moment we use the 'id' if there is no 'name'.
         *
         * Either the navbar or the processdef-detail needs a refactoring
         * to prevent this issue!
         *
         * See https://github.com/process-engine/bpmn-studio/issues/962
         * for more informations.
         */
        this.process = process;
        this.diagramContainsUnsavedChanges = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.hideProcessName, () => {
        this.showProcessName = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.validationError, () => {
        this.validationError = true;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.updateProcessName, (processName: string) => {
        this.diagramContainsUnsavedChanges = false;

        /**
         * Only changing the navbar title here would lead to an
         * inconsistent state, since currently the navbar held a reference
         * to a Diagram like object.
         *
         * Since this object is passed around at some point, we need to create
         * a new Diagram object when changing the navbar title.
         *
         * This will hopefully be obsolete once the navbar gets refactored.
         */
        const updatedProcess: INavbarProcessInformation = ((): INavbarProcessInformation => {
          const latestSourceIsProcessEngine: boolean = this.latestSource === 'process-engine';

          if (latestSourceIsProcessEngine) {
            return {
              id: processName,
            };
          } else {
            return {
              name: processName,
            };
          }

        })();

        const uriWasDefined: boolean = this.process.id !== undefined;
        if (uriWasDefined) {
          Object.assign(updatedProcess, {uri: this.process.uri});
        }

        this.process = updatedProcess;
        this._updateNavbarTitle();
      }),

      // this._eventAggregator.subscribe(environment.events.navBar.disableSaveButton, () => {
      //   this.disableStartButton = true;
      // }),

      this._eventAggregator.subscribe(environment.events.navBar.noValidationError, () => {
        this.validationError = false;
      }),

      // this._eventAggregator.subscribe(environment.events.navBar.enableStartButton, () => {
      //   this.disableStartButton = false;
      // }),

      // this._eventAggregator.subscribe(environment.events.navBar.disableDiagramUploadButton, () => {
      //   this.disableDiagramUploadButton = true;
      // }),

      // this._eventAggregator.subscribe(environment.events.navBar.enableDiagramUploadButton, () => {
      //   this.disableDiagramUploadButton = false;
      // }),

      this._eventAggregator.subscribe(environment.events.differsFromOriginal, (isDiagramChanged: boolean) => {
        this.diagramContainsUnsavedChanges = isDiagramChanged;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.diagramSuccessfullySaved, () => {
        this.diagramContainsUnsavedChanges = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.inspectNavigateToHeatmap, () => {
        this.inspectView = 'heatmap';
      }),

      this._eventAggregator.subscribe(environment.events.navBar.inspectNavigateToDashboard, () => {
        this.inspectView = 'dashboard';
      }),

      this._eventAggregator.subscribe(environment.events.navBar.showInspectButtons, () => {
        this.showInspectTools = true;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.hideInspectButtons, () => {
        this.showInspectTools = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.toggleHeatmapView, () => {
        this.disableHeatmapButton = true;
        this.disableDashboardButton = false;
        this.disableInspectCorrelationButton = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.toggleDashboardView, () => {
        this.disableHeatmapButton = false;
        this.disableDashboardButton = true;
        this.disableInspectCorrelationButton = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.toggleInspectCorrelationView, () => {
        this.disableHeatmapButton = false;
        this.disableDashboardButton = false;
        this.disableInspectCorrelationButton = true;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.updateActiveSolutionAndDiagram, ({solutionEntry, diagram}: any) => {
        this.activeDiagram = diagram;
        this.activeSolutionEntry = solutionEntry;

        this._updateNavbarTitle();
        this._updateNavbarTools();
      }),
    ];
  }

  public detached(): void {
    this._disposeAllSubscriptions();
  }

  @computedFrom('processOpenedFromProcessEngine')
  public get getClassNameForNavbarIcon(): string {
    const iconClassName: string = ((): string => {
      if (this.processOpenedFromProcessEngine) {
        return 'fa-database';
      } else {
        return 'fa-folder';
      }
    })();
    return iconClassName;
  }

  private _disposeAllSubscriptions(): void {
    this._subscriptions.forEach((subscription: Subscription) => {
      subscription.dispose();
    });
  }

  public navigateBack(): void {
    this._router.navigateBack();
  }

  public showDashboard(): void {
    this.disableDashboardButton = true;
    this.disableHeatmapButton = false;
    this.disableInspectCorrelationButton = false;

    this._router.navigateToRoute('inspect', {
      processModelId: this.process.id,
      view: 'dashboard',
      latestSource: this.latestSource,
    });

    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, 'dashboard');
  }

  public showHeatmap(): void {
    this.disableHeatmapButton = true;
    this.disableDashboardButton = false;
    this.disableInspectCorrelationButton = false;

    this._router.navigateToRoute('inspect', {
      processModelId: this.process.id,
      view: 'heatmap',
      latestSource: this.latestSource,
    });

    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, 'heatmap');
  }

  public showInspectCorrelation(): void {
    this.disableHeatmapButton = false;
    this.disableDashboardButton = false;
    this.disableInspectCorrelationButton = true;

    this._router.navigateToRoute('inspect', {
      processModelId: this.process.id,
      view: 'inspect-correlation',
      latestSource: this.latestSource,
    });

    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, 'inspect-correlation');
  }

  public navigateToInspect(): void {
    this._dertermineActiveRoute();

    const activeRouteIsInspect: boolean = this.activeRouteName === 'inspect';

    if (activeRouteIsInspect) {
      return;
    }

    this._router.navigateToRoute('inspect', {
      processModelId: this.process.id,
      view: this.inspectView,
      latestSource: this.latestSource,
    });
  }

  public navigateToDesigner(): void {

    const processIsUndefined: boolean = this.activeDiagram === undefined;

    if (processIsUndefined) {
      this._notificationService.showNotification(NotificationType.INFO, 'In order to open the designer, you have to select a diagram first!');

      return;
    }

    this._router.navigateToRoute('diagram-detail', {
      diagramName: this.activeDiagram.name,
    });

  }

  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsActive = !this.solutionExplorerIsActive;
    this._eventAggregator.publish(environment.events.processSolutionPanel.toggleProcessSolutionExplorer);
  }

  public saveDiagram(): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(environment.events.processDefDetail.saveDiagram);
  }

  public printDiagram(): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(environment.events.processDefDetail.printDiagram);
  }

  public exportDiagram(exportAs: string): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(`${environment.events.processDefDetail.exportDiagramAs}:${exportAs}`);
  }

  public startProcess(): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(environment.events.processDefDetail.startProcess);
  }

  public uploadProcess(): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(environment.events.processDefDetail.uploadProcess);
  }

  private _isRouteActive(routeName: string): boolean {
    if (this._router.currentInstruction.config.name === routeName) {
      return true;
    }
    return false;
  }

  private _dertermineActiveRoute(): void {
    const activeRoute: RouteConfig = this._router.routes.find((route: RouteConfig) => {
      return this._isRouteActive(route.name);
    });
    this.activeRouteName = activeRoute.name;
  }

  /**
   * Updates the title of the navbar including the navbar icon which
   * indicates, if the process was opened from the local filesystem
   * or a remote ProcessEngine
   */
  private _updateNavbarTitle(): void {

    const activeSolutionIsRemoteSolution: boolean = this.activeSolutionEntry.uri.startsWith('http');

    this.navbarTitle = ((): string => {
      if (activeSolutionIsRemoteSolution) {
        return this.activeDiagram.id;
      } else {
        return this.activeDiagram.name;
      }
    })();

    this.processOpenedFromProcessEngine = activeSolutionIsRemoteSolution;
  }

  private _updateNavbarTools(): void {
    const activeSolutionIsRemoteSolution: boolean = this.activeSolutionEntry.uri.startsWith('http');

    this.disableStartButton = !activeSolutionIsRemoteSolution;
    this.disableDiagramUploadButton = activeSolutionIsRemoteSolution;

  }

}
