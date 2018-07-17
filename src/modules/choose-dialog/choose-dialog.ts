import {bindable} from 'aurelia-framework';
import {IChooseDialogOption} from '../../contracts';

export class ChooseDialog {

  @bindable() public options: Array<IChooseDialogOption>;

  @bindable() public onSelected: ((option: IChooseDialogOption) => void);

  public onSelect(selected: IChooseDialogOption): void {
    if (this.onSelected) {
      this.onSelected(selected.value);
    }
  }
}
