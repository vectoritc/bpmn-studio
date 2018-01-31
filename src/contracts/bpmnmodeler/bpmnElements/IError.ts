import { IDocumentation } from './IDocumentation';
import {IError} from './IError';

export interface IError {
  $type: string;
  documentation: Array<IDocumentation>;
  errorCode?: string;
  id: string;
  name: string;
}
