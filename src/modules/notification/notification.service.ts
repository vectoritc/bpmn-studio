import {inject} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as toastr from 'toastr';
import {INotification, INotificationOptions, NotificationType} from '../../contracts/index';

const defaultNotificationOptions: INotificationOptions = {
  noTimeOut: false,
};

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
  public showNotification(type: NotificationType, message: string, options: INotificationOptions = defaultNotificationOptions): void {
    const notification: INotification = {
      type: type,
      message: message,
      options: options,
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
    const toastrOptions: ToastrOptions = this._convertToToastrOptions(notification.options);

    switch (notification.type) {
      case NotificationType.SUCCESS:
        this._toastrInstance.success(notification.message, undefined, toastrOptions);
        break;
      case NotificationType.ERROR:
        this._toastrInstance.error(notification.message, undefined, toastrOptions);
        break;
      case NotificationType.INFO:
        this._toastrInstance.info(notification.message, undefined, toastrOptions);
        break;
      case NotificationType.WARNING:
        this._toastrInstance.warning(notification.message, undefined, toastrOptions);
        break;
      default:
        break;
    }
  }

  private _convertToToastrOptions(options: INotificationOptions): ToastrOptions {
    if (options.noTimeOut) {
      return {
        timeOut: -1,
        closeButton: true,
      };
    }
    return {};
  }

  private _initializeToastr(): void {
    this._toastrInstance.options.preventDuplicates = true;
  }
}
