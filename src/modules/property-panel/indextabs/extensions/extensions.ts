import {IIndextab,
        ISection,
        IShape} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Extensions implements IIndextab {
  public title: string = 'Extensions';
  public path: string = '/indextabs/extensions/extensions';
  public sections: Array<ISection>;
  public canHandleElement: boolean = true;

  private basicsSection: ISection = new BasicsSection();

  public attached(): void {
    this.sections = [
      this.basicsSection,
    ];
  }

  public checkElement(element: IShape): boolean {
    return true;
  }
}
