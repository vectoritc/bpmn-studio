import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {RouteConfig, Router} from 'aurelia-router';

@inject(Router, EventAggregator)
export class NavBar {
  private router: Router;
  private eventAggregator: EventAggregator;

  public activeRouteTitle: string;
  public showSolutionExplorer: boolean;

  constructor(router: Router, eventAggregator: EventAggregator) {
    this.router = router;
    this.eventAggregator = eventAggregator;
  }

  public attached(): void {
    this.dertermineActiveRoute();
    this.eventAggregator.subscribe('router:navigation:complete', () => {
      this.dertermineActiveRoute();
    });
  }

  public navigate(routeTitle: string): void {
    const route: RouteConfig = this.router.routes.find((r: RouteConfig) => {
      return r.title === routeTitle;
    });

    this.router.navigate(`/${route.route}`);
  }

  public toggelSolutionExplorer(): void {
    this.showSolutionExplorer = !this.showSolutionExplorer;
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
