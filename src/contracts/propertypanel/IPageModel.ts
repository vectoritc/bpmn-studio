import {IBpmnModeler} from '../bpmnmodeler/IBpmnModeler';
import {IShape} from '../bpmnmodeler/IShape';

export interface IPageModel {
  modeler: IBpmnModeler;
  elementInPanel: IShape;
}
