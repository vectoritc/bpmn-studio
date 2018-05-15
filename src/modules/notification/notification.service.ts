import {inject} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as toastr from 'toastr';
import {INotification, NotificationType} from '../../contracts/index';

@inject(EventAggregator)
export class NotificationService {

  private _eventAggregator: EventAggregator;
  private _toastrInstance: Toastr;
  private _savedNotifications: Array<INotification> = [];

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
    this._eventAggregator.subscribeOnce('router:navigation:complete', () => {
      this.setToastrInstance(toastr);
    });
  }

  // TODO: Could better be named 'notify' or 'show'
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

  public setToastrInstance(toastrInstance: Toastr): void {
    this._toastrInstance = toastrInstance;
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
