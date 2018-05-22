import {NotificationType} from './constants';
import {INotificationOptions} from './index';

export interface INotification {
  type: NotificationType;
  message: string;
  nonDisappearing: boolean;
}
