import {IPayLoadEntry} from './IPayLoadEntry';

export interface ITokenEntry {
  entryNr: number;
  eventType: string;
  createdAt: Date;
  payload: Array<IPayLoadEntry>;
}
