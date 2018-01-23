import {ISection} from '../../../../contracts';
import {FormSection} from './sections/forms/forms';

export class Forms {
  public title: string = 'Forms';
  public sections: Array<ISection>;

  public formSection: ISection = new FormSection();

  public attached(): void {
    this.sections = [
      this.formSection,
    ];
  }

}
