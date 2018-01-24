import {ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';

export class Forms {
  public title: string = 'Forms';
  public path: string = '/indextaps/forms/forms';
  public sections: Array<ISection>;

  public basicsSection: ISection = new BasicsSection();

  public attached(): void {
    this.sections = [
      this.basicsSection,
    ];
  }

}
