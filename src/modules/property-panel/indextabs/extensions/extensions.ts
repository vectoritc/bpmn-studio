import {IIndextab, ISection, IShape} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Extensions implements IIndextab {
  public title: string = 'Extensions';
  public path: string = '/indextabs/extensions/extensions';
  public elementInPanel: IShape;
  public canHandleElement: boolean = true;

  private basicsSection: ISection = new BasicsSection();

  public sections: Array<ISection>;

  constructor() {
    this.sections = [
      this.basicsSection,
    ];
  }

  public isSuitableForElement(element: IShape): boolean {

    if (!element) {
      return false;
    }

    return this.sections.some((section: ISection) => {
      return section.isSuitableForElement(element);
    });
  }
}
