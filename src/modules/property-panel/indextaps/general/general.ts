import {ISection} from '../../../../contracts';
import {BasicsSection} from './sections/basics/basics';
import {PoolSection} from './sections/pool/pool';

export class General {
  public title: string = 'General';
  public sections: Array<ISection>;

  public basicsSection: ISection = new BasicsSection();
  public poolSection: ISection = new PoolSection();

  public attached(): void {
    this.sections = [
      this.basicsSection,
      this.poolSection,
    ];
  }

}
