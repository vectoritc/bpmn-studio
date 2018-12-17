import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {RouteConfig, Router} from 'aurelia-router';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionEntry, ISolutionService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(Router, EventAggregator, 'NotificationService', 'SolutionService')
export class NavBar {

  @bindable() public activeRouteName: string;

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
  public navbarTitle: string = '';
  @bindable() public processOpenedFromProcessEngine: boolean = false;

  private _router: Router;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _notificationService: NotificationService;
  private _solutionService: ISolutionService;

  constructor(router: Router, eventAggregator: EventAggregator, notificationService: NotificationService, solutionService: ISolutionService) {
    this._router = router;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
    this._solutionService = solutionService;
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

      this._eventAggregator.subscribe(environment.events.navBar.hideTools, () => {
        this.showTools = false;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.validationError, () => {
        this.validationError = true;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.noValidationError, () => {
        this.validationError = false;
      }),

      this._eventAggregator.subscribe(environment.events.differsFromOriginal, (isDiagramChanged: boolean) => {
        this.diagramContainsUnsavedChanges = isDiagramChanged;
      }),

      this._eventAggregator.subscribe(environment.events.navBar.diagramChangesResolved, () => {
        this.diagramContainsUnsavedChanges = false;
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

      this._eventAggregator.subscribe(environment.events.navBar.updateActiveSolutionAndDiagram, () => {

        this.activeDiagram = this._solutionService.getActiveDiagram();
        this.activeSolutionEntry = this._solutionService.getActiveSolutionEntry();

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

    this.inspectView = 'dashboard';
    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, this.inspectView);

    this._router.navigateToRoute('inspect', {
      diagramName: this.activeDiagram ? this.activeDiagram.name : undefined,
      view: this.inspectView,
    });
  }

  public showHeatmap(): void {
    this.disableHeatmapButton = true;
    this.disableDashboardButton = false;
    this.disableInspectCorrelationButton = false;

    this.inspectView = 'heatmap';
    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, this.inspectView);

    this._router.navigateToRoute('inspect', {
      diagramName: this.activeDiagram ? this.activeDiagram.name : undefined,
      view: this.inspectView,
    });
  }

  public showInspectCorrelation(): void {
    this.disableHeatmapButton = false;
    this.disableDashboardButton = false;
    this.disableInspectCorrelationButton = true;

    this.inspectView = 'inspect-correlation';
    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, this.inspectView);

    this._router.navigateToRoute('inspect', {
      diagramName: this.activeDiagram ? this.activeDiagram.name : undefined,
      view: this.inspectView,
    });

  }

  public navigateToInspect(): void {
    this._dertermineActiveRoute();

    const activeRouteIsInspect: boolean = this.activeRouteName === 'inspect';

    if (activeRouteIsInspect) {
      return;
    }

    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect, this.inspectView);

    const diagramIsNotSelect: boolean = this.activeDiagram === undefined;

    const diagramName: string = diagramIsNotSelect
      ? undefined
      : this.activeDiagram.name;

    this._router.navigateToRoute('inspect', {
      diagramName: diagramName,
      view: this.inspectView,
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

    this._eventAggregator.publish(environment.events.diagramDetail.saveDiagram);
  }

  public printDiagram(): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(environment.events.diagramDetail.printDiagram);
  }

  public exportDiagram(exportAs: string): void {
    if (this.validationError) {
      return;
    }

    this._eventAggregator.publish(`${environment.events.diagramDetail.exportDiagramAs}:${exportAs}`);
  }

  public startProcess(): void {
    if (this.validationError || this.disableStartButton) {
      return;
    }

    this._eventAggregator.publish(environment.events.diagramDetail.startProcess);
  }

  public startProcessWithOptions(): void {
    if (this.validationError || this.disableStartButton) {
      return;
    }

    this._eventAggregator.publish(environment.events.diagramDetail.startProcessWithOptions);
  }

  public uploadProcess(): void {
    if (this.validationError || this.disableDiagramUploadButton) {
      return;
    }

    this._eventAggregator.publish(environment.events.diagramDetail.uploadProcess);
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
    const noActiveDiagram: boolean = this.activeDiagram === undefined;

    if (noActiveDiagram) {
      this.showProcessName = false;
      this.navbarTitle = '';

      return;
    }

    const activeSolutionIsRemoteSolution: boolean = this.activeSolutionEntry.uri.startsWith('http');
    this.showProcessName = this.activeDiagram.name !== undefined;

    this.navbarTitle = activeSolutionIsRemoteSolution ? this.activeDiagram.id : this.activeDiagram.name;

    this.processOpenedFromProcessEngine = activeSolutionIsRemoteSolution;
  }

  private _updateNavbarTools(): void {
    const activeSolutionIsRemoteSolution: boolean = this.activeSolutionEntry.uri.startsWith('http');

    this.disableStartButton = !activeSolutionIsRemoteSolution;
    this.disableDiagramUploadButton = activeSolutionIsRemoteSolution;
  }

}
