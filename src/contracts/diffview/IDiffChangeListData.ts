import {IElementChange} from './IElementChange';

export interface IDiffChangeListData {
  added: Array<IElementChange>;
  changed: Array<IElementChange>;
  layoutChanged: Array<IElementChange>;
  removed: Array<IElementChange>;
}
