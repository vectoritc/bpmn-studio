import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {RouteConfig, Router} from 'aurelia-router';
import { IProcessDefEntity } from '../../contracts';

@inject(Router, EventAggregator)
export class NavBar {
  private router: Router;
  private eventAggregator: EventAggregator;
  private exportButton: HTMLButtonElement;
  private exportSpinner: HTMLElement;
  private exportIcon: HTMLElement;

  @bindable() public showSolutionExplorer: boolean;
  public activeRouteTitle: string;
  public showTools: boolean = false;
  public process: IProcessDefEntity;

  constructor(router: Router, eventAggregator: EventAggregator) {
    this.router = router;
    this.eventAggregator = eventAggregator;
  }

  public attached(): void {
    this.dertermineActiveRoute();
    this.eventAggregator.subscribe('router:navigation:complete', () => {
      this.dertermineActiveRoute();
    });

    this.eventAggregator.subscribe('navbar:tools:show', (process: IProcessDefEntity) => {
      this.showTools = true;
      this.process = process;
    });

    this.eventAggregator.subscribe('navbar:tools:hide', () => {
      this.showTools = false;
    });

    this.eventAggregator.subscribe('navbar:process:update', (process: IProcessDefEntity) => {
      this.process = process;
    });
  }

  public navigate(routeTitle: string): void {
    const route: RouteConfig = this.router.routes.find((r: RouteConfig) => {
      return r.title === routeTitle;
    });

    this.router.navigate(`/${route.route}`);
  }

  public navigateBack(): void {
    this.router.navigateBack();
  }

  public toggleSolutionExplorer(): void {
    this.showSolutionExplorer = !this.showSolutionExplorer;
  }

  public saveDiagram(): void {
    this.eventAggregator.publish('processdefdetail:diagram:save');
  }

  public exportDiagram(exportAs: string): void {
    this.eventAggregator.publish(`processdefdetail:diagram:exportAs:${exportAs}`);
  }

  public startProcess(): void {
    this.eventAggregator.publish('processdefdetail:process:start');
  }

  private isRouteActive(routeTitle: string): boolean {
    if (this.router.currentInstruction.config.title === routeTitle) {
      return true;
    }
    return false;
  }

  private dertermineActiveRoute(): void {
    this.router.routes.forEach((route: RouteConfig) => {
      if (this.isRouteActive(route.title)) {
        this.activeRouteTitle = route.title;
      }
    });
  }
}
