import {IIndextab,
        IModdleElement,
        ISection,
        IShape} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Extensions implements IIndextab {
  public title: string = 'Extensions';
  public path: string = '/indextabs/extensions/extensions';
  public canHandleElement: boolean = true;

  private basicsSection: ISection = new BasicsSection();

  public sections: Array<ISection>;

  constructor() {
    this.sections = [
      this.basicsSection,
    ];
  }

  public checkElement(element: IShape): boolean {

    if (!element) {
      return false;
    }

    return this.sections.some((section: ISection) => {
      return section.checkElement(element);
    });
  }
}
