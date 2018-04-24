import {Toastr} from 'toastr';
import {INotification, NotificationType} from '../../contracts/index';

export class NotificationService {

  private _toastrInstance: Toastr;
  private _savedNotifications: Array<INotification> = [];

  public showNotification(type: NotificationType, message: string): void {
    const notification: INotification = {
      type: type,
      message: message,
    };

    if (this._toastrInstance === undefined) {
      this._saveNotification(notification);
      return;
    }

    this._showNotification(notification);
  }

  public setToastrInstance(toastr: Toastr): void {
    this._toastrInstance = toastr;
    this._initializeToastr();
    for (const notification of this._savedNotifications) {
      this._showNotification(notification);
    }
    this._savedNotifications = [];
  }

  private _saveNotification(notification: INotification): void {
    this._savedNotifications.push(notification);
  }

  private _showNotification(notification: INotification): void {
    switch (notification.type) {
      case NotificationType.SUCCESS:
        this._toastrInstance.success(notification.message);
        break;
      case NotificationType.ERROR:
        this._toastrInstance.error(notification.message);
        break;
      case NotificationType.INFO:
        this._toastrInstance.info(notification.message);
        break;
      case NotificationType.WARNING:
        this._toastrInstance.warning(notification.message);
        break;
      default:
        break;
    }
  }

  private _initializeToastr(): void {
    this._toastrInstance.options.preventDuplicates = true;
  }
}
