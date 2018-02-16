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

  public canHandleElement: boolean = false;

  public sections: Array<ISection> = [
    this.basicsSection,
  ];

  public checkElement(element: IShape): boolean {
    if (!element) {
      return false;
    }

    this.sections.forEach((section: ISection) => {
      section.canHandleElement = section.checkElement(element);
      console.log(section.canHandleElement);
    });

    return this.sections.some((section: ISection) => {
      return section.canHandleElement;
    });
  }

}
