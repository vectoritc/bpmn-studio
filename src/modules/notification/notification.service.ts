export class NotificationService {

  private toastrInstance: any;
  private _savedNotifications: Array<string> = [];

  public showNotification(message: string): void {
    if (this.toastrInstance === undefined) {
      this._saveNotification(message);
      return;
    }

    this._showNotification(message);
  }

  public setToastrInstance(toastr: any): void {
    this.toastrInstance = toastr;
    this._initializeToastr();
    for (const notification of this._savedNotifications) {
      this._showNotification(notification);
    }
    this._savedNotifications = [];
  }

  private _saveNotification(message: string): void {
    this._savedNotifications.push(message);
  }

  private _showNotification(message: string): void {
    if (message === 'success') {
      this.toastrInstance.success('Diagram successfully imported!');
    } else {
      this.toastrInstance.error(`Error while importing file: ${message}`);
    }
  }

  private _initializeToastr(): void {
    this.toastrInstance.options.preventDuplicates = true;
  }
}
