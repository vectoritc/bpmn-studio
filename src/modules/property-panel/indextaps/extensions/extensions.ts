import {ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Extensions {
  public title: string = 'Extensions';
  public path: string = '/indextaps/extensions/extensions';
  public sections: Array<ISection>;

  public basicsSection: ISection = new BasicsSection();

  public attached(): void {
    this.sections = [
      this.basicsSection,
    ];
  }

}
