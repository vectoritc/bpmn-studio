import {IEvent,
        IEventBus,
        IPageModel,
        ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Forms {
  public title: string = 'Forms';
  public path: string = '/indextaps/forms/forms';
  public sections: Array<ISection>;
  private eventBus: IEventBus;

  private basicsSection: ISection = new BasicsSection();

  public canHandleElement: boolean;

  private activate(model: IPageModel): void {

    this.eventBus = model.modeler.get('eventBus');

    this.sections = [
      this.basicsSection,
    ];

    // const selectedEvent: any = model.modeler.get('selection')._selectedElements;
    // console.log(selectedEvent);
    // this.eventBus.on('element.click', (event: IEvent) => {

    // this.canHandleElement = this.sections.some((section: ISection) => {
    //     return section.checkElement(event.element.businessObject);
    //   });
    // });
  }

}
