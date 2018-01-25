import {IEvent,
        IEventBus,
        IPageModel,
        ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Forms {
  public title: string = 'Forms';
  public path: string = '/indextaps/forms/forms';
  public sections: Array<ISection>;
  public eventBus: IEventBus;

  public basicsSection: ISection = new BasicsSection();

  public canHandleElement: boolean;

  public activate(model: IPageModel): void {

    this.eventBus = model.modeler.get('eventBus');

    this.sections = [
      this.basicsSection,
    ];

    this.eventBus.on('element.click', (event: IEvent) => {

      this.canHandleElement = this.sections.some((section: ISection) => {
        return section.checkElement(event.element.businessObject);
      });
    });
  }

}
