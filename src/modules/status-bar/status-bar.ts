import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {DiffMode, ISolutionEntry, ISolutionService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../../services/notification-service/notification.service';

type UpdateProgressData = {
  bytesPerSecond: number
  delta: number
  percent: number
  total: number
  transferred: number,
};

@inject(EventAggregator, Router, 'SolutionService', 'NotificationService')
export class StatusBar {

  public showDiagramViewButtons: boolean = false;
  public diffIsShown: boolean = false;
  public currentDiffMode: DiffMode;
  public xmlIsShown: boolean = false;
  public showInspectCorrelationButtons: boolean = false;
  public showChangeList: boolean = false;
  public currentXmlIdentifier: string;
  public previousXmlIdentifier: string;
  public showInspectPanel: boolean = true;
  public activeSolutionEntry: ISolutionEntry;
  public activeDiagram: IDiagram;
  public updateProgressData: UpdateProgressData;
  public updateAvailable: boolean = false;

  public DiffMode: typeof DiffMode = DiffMode;

  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _solutionService: ISolutionService;
  private _subscriptions: Array<Subscription>;
  private _designView: string;
  private _ipcRenderer: any;
  private _notificationService: NotificationService;

  constructor(eventAggregator: EventAggregator, router: Router, solutionService: ISolutionService, notificationService: NotificationService) {
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._solutionService = solutionService;
    this._notificationService = notificationService;

    const applicationRunsInElectron: boolean = (window as any).nodeRequire !== undefined;
    if (applicationRunsInElectron) {
      this._ipcRenderer = (window as any).nodeRequire('electron').ipcRenderer;

      this._ipcRenderer.on('update_error', () => {
        notificationService.showNotification(NotificationType.INFO, 'Update Error!');
      });

      this._ipcRenderer.on('update_available', () => {
        this.updateAvailable = true;

        const notification: string = `A new update is available.\nPlease click on the BPMN-Studio icon in the statusbar to start the download.`;
        this._notificationService.showNonDisappearingNotification(NotificationType.INFO, notification);
      });

      this._ipcRenderer.on('update_download_progress', (event: Event, updateProgressData: any) => {
        this.updateProgressData = updateProgressData;
      });

      this._ipcRenderer.on('update_downloaded', () => {
        // tslint:disable-next-line max-line-length
        const installButton: string = `<a class="btn btn-default" style="color: #000000;" href="javascript:nodeRequire('electron').ipcRenderer.send('quit_and_install')">Install</a>`;
        const cancelButton: string = `<a class="btn btn-default" style="color: #000000;" href="#">Cancel</a>`;

        const messageTitle: string = '<h4>Update ready!</h4>';
        const messageBody: string = `${cancelButton} ${installButton}`;

        this._notificationService.showNonDisappearingNotification(NotificationType.INFO, `${messageTitle}\n${messageBody}`);
      });
    }
  }

  public async attached(): Promise<void> {
    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.statusBar.showDiagramViewButtons, () => {
        this.showDiagramViewButtons = true;
      }),

      this._eventAggregator.subscribe(environment.events.statusBar.hideDiagramViewButtons, () => {
        this.showDiagramViewButtons = false;
        this.xmlIsShown = false;
        this.diffIsShown = false;
        this.showChangeList = false;
        this.currentDiffMode = DiffMode.NewVsOld;
      }),

      this._eventAggregator.subscribe(environment.events.statusBar.setXmlIdentifier, (xmlIdentifier: Array<string>) => {
        [this.previousXmlIdentifier, this.currentXmlIdentifier] = xmlIdentifier;
      }),

      this._eventAggregator.subscribe(environment.events.statusBar.showInspectCorrelationButtons, (showInspectCorrelation: boolean) => {
        this.showInspectCorrelationButtons = showInspectCorrelation;
      }),

      this._eventAggregator.subscribe('router:navigation:success', async() => {
        await this._updateStatusBar();
        this._refreshRightButtons();
      }),
    ];

    await this._updateStatusBar();

    this._refreshRightButtons();

    this.currentDiffMode = DiffMode.NewVsOld;
  }

  public detached(): void {
    this._disposeAllSubscriptions();
  }

  public toggleXMLView(): void {
    if (this.diffIsShown) {
      this.toggleDiffView();
    }

    this._designView = this.xmlIsShown ? 'detail' : 'xml';

    this._router.navigateToRoute('design', {
      diagramName: this.activeDiagram ? this.activeDiagram.name : undefined,
      solutionUri: this.activeSolutionEntry.uri,
      view: this._designView,
    });

    this.xmlIsShown = !this.xmlIsShown;
  }

  public changeDiffMode(mode: DiffMode): void {
    this.currentDiffMode = mode;
    this._eventAggregator.publish(environment.events.diffView.changeDiffMode, mode);
  }

  public toggleChangeList(): void {
    this.showChangeList = !this.showChangeList;
    this._eventAggregator.publish(environment.events.diffView.toggleChangeList);
  }

  public toggleDiffView(): void {
    if (this.xmlIsShown) {
      this.toggleXMLView();
    }

    this._designView = this.diffIsShown ? 'detail' : 'diff';

    this._router.navigateToRoute('design', {
      diagramName: this.activeDiagram ? this.activeDiagram.name : undefined,
      solutionUri: this.activeSolutionEntry.uri,
      view: this._designView,
    });

    this.diffIsShown = !this.diffIsShown;
  }

  public toggleInspectPanel(): void {
    this.showInspectPanel = !this.showInspectPanel;

    this._eventAggregator.publish(environment.events.inspectCorrelation.showInspectPanel, this.showInspectPanel);
  }

  public startUpdate(): void {
    this._ipcRenderer.send('download_update');
  }

  private _refreshRightButtons(): void {
    const currentView: string = this._router.currentInstruction.params.view;
    switch (currentView) {
      case 'xml':
        this.xmlIsShown = true;
        break;
      case 'diff':
        this.diffIsShown = true;
        break;
      default:
        this.xmlIsShown = false;
        this.diffIsShown = false;
        break;
    }
  }

  private _disposeAllSubscriptions(): void {
    this._subscriptions.forEach((subscription: Subscription) => {
      subscription.dispose();
    });
  }

  private async _updateStatusBar(): Promise<void> {
    const solutionUriFromNavigation: string = this._router.currentInstruction.queryParams.solutionUri;

    this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(solutionUriFromNavigation);

    const solutionIsSet: boolean = this.activeSolutionEntry !== undefined;
    const diagramName: string = this._router.currentInstruction.params.diagramName;
    const diagramIsSet: boolean = diagramName !== undefined;

    if (solutionIsSet && diagramIsSet) {
      const activeSolutionIsSingleDiagramSolution: boolean = solutionUriFromNavigation === 'Single Diagrams';
      if (activeSolutionIsSingleDiagramSolution) {
        const persistedDiagrams: Array<IDiagram> = this._solutionService.getSingleDiagrams();

        this.activeDiagram = persistedDiagrams.find((diagram: IDiagram) => {
          return diagram.name === diagramName;
        });
      } else {
        this.activeDiagram = await this.activeSolutionEntry
          .service
          .loadDiagram(diagramName);
      }
    }
  }
}
