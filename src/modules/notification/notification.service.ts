import {INotification, NotificationType} from '../../contracts/index';

export class NotificationService {

  private toastrInstance: any;
  private _savedNotifications: Array<INotification> = [];

  public showNotification(type: NotificationType, message: string): void {
    const notification: INotification = {
      type: type,
      message: message,
    };

    if (this.toastrInstance === undefined) {
      this._saveNotification(notification);
      return;
    }

    this._showNotification(notification);
  }

  public setToastrInstance(toastr: any): void {
    this.toastrInstance = toastr;
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
    if (notification.type === NotificationType.SUCCESS) {
      this.toastrInstance.success(notification.message);
    } else if (notification.type === NotificationType.ERROR) {
      this.toastrInstance.error(notification.message);
    } else if (notification.type === NotificationType.INFO) {
      this.toastrInstance.info(notification.message);
    } else if (notification.type === NotificationType.WARNING) {
      this.toastrInstance.warning(notification.message);
    }
  }

  private _initializeToastr(): void {
    this.toastrInstance.options.preventDuplicates = true;
  }
}
