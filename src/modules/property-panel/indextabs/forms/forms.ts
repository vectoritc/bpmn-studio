import {IEvent,
        IEventBus,
        IIndextab,
        IModdleElement,
        IPageModel,
        ISection,
        IShape} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Forms implements IIndextab {
  public title: string = 'Forms';
  public path: string = '/indextabs/forms/forms';
  private eventBus: IEventBus;

  private basicsSection: ISection = new BasicsSection();

  public canHandleElement: boolean;

  public sections: Array<ISection> = [
    this.basicsSection,
  ];

  public checkElement(element: IShape): boolean {
    if (!element) {
      return false;
    }

    return this.sections.some((section: ISection) => {
      return section.checkElement(element.businessObject);
    });
  }

}
