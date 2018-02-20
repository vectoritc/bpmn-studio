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
  public elementInPanel: IShape;
  public canHandleElement: boolean = false;

  private eventBus: IEventBus;

  private basicsSection: ISection = new BasicsSection();

  public sections: Array<ISection> = [
    this.basicsSection,
  ];

  public activate(model: IPageModel): void {
    this.elementInPanel = model.elementInPanel;
  }

  public isSuitableForElement(element: IShape): boolean {
    if (!element) {
      return false;
    }

    this.sections.forEach((section: ISection) => {
      section.canHandleElement = section.isSuitableForElement(element);
    });

    return this.sections.some((section: ISection) => {
      return section.canHandleElement;
    });
  }

}
