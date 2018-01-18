import {ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';
export class General {
  public title: string = 'General';

  private basicsSection: ISection = new BasicsSection();

  public showSection(section: ISection): boolean {
    return section.canHandleElement();
  }

}
