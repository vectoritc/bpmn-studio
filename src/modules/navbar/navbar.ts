import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {RouteConfig, Router} from 'aurelia-router';
import {IProcessDefEntity} from '../../contracts';
import environment from '../../environment';

@inject(Router, EventAggregator)
export class NavBar {
  private _router: Router;
  private _eventAggregator: EventAggregator;

  @bindable() public showSolutionExplorer: boolean;
  public activeRouteTitle: string;
  public showTools: boolean = false;
  public disableSaveButton: boolean = false;
  public process: IProcessDefEntity;

  public diagramInfo: HTMLElement;
  public dropdown: HTMLElement;

  constructor(router: Router, eventAggregator: EventAggregator) {
    this._router = router;
    this._eventAggregator = eventAggregator;
  }

  public attached(): void {
    this._dertermineActiveRoute();

    document.addEventListener('click', this.dropdownClickListener);

    this._eventAggregator.subscribe('router:navigation:complete', () => {
      this._dertermineActiveRoute();
    });

    this._eventAggregator.subscribe(environment.events.navBar.showTools, (process: IProcessDefEntity) => {
      this.showTools = true;
      this.process = process;
    });

    this._eventAggregator.subscribe(environment.events.navBar.hideTools, () => {
      this.showTools = false;
    });

    this._eventAggregator.subscribe(environment.events.navBar.updateProcess, (process: IProcessDefEntity) => {
      this.process = process;
    });

    this._eventAggregator.subscribe(environment.events.navBar.disableSaveButton, () => {
      this.disableSaveButton = true;
    });

    this._eventAggregator.subscribe(environment.events.navBar.enableSaveButton, () => {
      this.disableSaveButton = false;
    });
  }

  public detached(): void {
    document.removeEventListener('click', this.dropdownClickListener);
  }

  public navigate(routeTitle: string): void {
    const route: RouteConfig = this._router.routes.find((r: RouteConfig) => {
      return r.title === routeTitle;
    });

    this._router.navigate(`/${route.route}`);
  }

  public navigateBack(): void {
    this._router.navigateBack();
  }

  public toggleSolutionExplorer(): void {
    this.showSolutionExplorer = !this.showSolutionExplorer;
  }

  public saveDiagram(): void {
    if (!this.disableSaveButton) {
      this._eventAggregator.publish(environment.events.processDefDetail.saveDiagram);
    }
  }

  public printDiagram(): void {
    this._eventAggregator.publish(environment.events.processDefDetail.printDiagram);
  }

  public exportDiagram(exportAs: string): void {
    this._eventAggregator.publish(`${environment.events.processDefDetail.exportDiagramAs}:${exportAs}`);
  }

  public startProcess(): void {
    this._eventAggregator.publish(environment.events.processDefDetail.startProcess);
  }

  private _isRouteActive(routeTitle: string): boolean {
    if (this._router.currentInstruction.config.title === routeTitle) {
      return true;
    }
    return false;
  }

  private _dertermineActiveRoute(): void {
    this._router.routes.forEach((route: RouteConfig) => {
      if (this._isRouteActive(route.title)) {
        this.activeRouteTitle = route.title;
      }
    });
  }

  public dropdownClickListener: EventListenerOrEventListenerObject =  (event: MouseEvent): void => {
    const eventTarget: Node = event.target as Node;
    if (this.dropdown.contains(eventTarget)) {
      this.diagramInfo.className = 'menu__element menu__element--title btn-group open';
    }
  }
}
