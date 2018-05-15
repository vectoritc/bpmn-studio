import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import environment from '../../environment';

@inject(EventAggregator)
export class StatusBar {

  public baseRoute: string = environment.bpmnStudioClient.baseRoute;
  public showXMLButton: boolean = false;
  public xmlIsShown: boolean = false;

  private eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this.eventAggregator = eventAggregator;
  }

  public attached(): void {
    this.eventAggregator.subscribe('statusbar:xmlbutton:show', () => {
      this.showXMLButton = true;
    });

    this.eventAggregator.subscribe('statusbar:xmlbutton:hide', () => {
      this.showXMLButton = false;
    });
  }

  public toggleXMLView(): void {
    this.eventAggregator.publish('processdefdetail:xmlview:toggle');
    this.xmlIsShown = !this.xmlIsShown;
  }
}
