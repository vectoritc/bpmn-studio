import {bindable, inject} from 'aurelia-framework';

import * as clipboard from 'clipboard-polyfill';

import {LogEntry} from '@process-engine/logging_api_contracts';
import {Correlation} from '@process-engine/management_api_contracts';

import {ILogSortSettings, LogSortProperty, NotificationType} from '../../../../../../contracts/index';
import {DateService} from '../../../../../date-service/date.service';
import {NotificationService} from '../../../../../notification/notification.service';
import {IInspectCorrelationService} from '../../../../contracts';

@inject('NotificationService', 'InspectCorrelationService')
export class LogViewer {
  @bindable() public log: Array<LogEntry>;
  @bindable({ changeHandler: 'correlationChanged' }) public correlation: Correlation;
  public LogSortProperty: typeof LogSortProperty = LogSortProperty;
  public sortedLog: Array<LogEntry>;
  public sortSettings: ILogSortSettings = {
    ascending: false,
    sortProperty: undefined,
  };

  private _dateService: DateService;
  private _notificationService: NotificationService;
  private _inspectCorrelationService: IInspectCorrelationService;

  constructor(notificationService: NotificationService, inspectCorrelationService: IInspectCorrelationService) {
    this._notificationService = notificationService;
    this._dateService = new DateService();
    this._inspectCorrelationService = inspectCorrelationService;
  }

  public async correlationChanged(): Promise<void> {
    this.log = await this._inspectCorrelationService.getLogsForCorrelation(this.correlation);
    // this.log.forEach((logEntry: LogEntry) => {
    //   logEntry.logLevel = logEntry.logLevel.toUpperCase();
    // });

    // this.sortList(LogSortProperty.Time);
  }

  public copyToClipboard(textToCopy: string): void {
    (clipboard as any).writeText(textToCopy);

    this._notificationService.showNotification(NotificationType.SUCCESS, 'Successfully copied to clipboard.');
  }

  public getDateStringFromTimestamp(timestamp: number): string {
    const dateString: string = this._dateService.getDateStringFromTimestamp(timestamp);

    return dateString;
  }

  public sortList(property: LogSortProperty): void {
    this.sortedLog = [];
    const isSamePropertyAsPrevious: boolean = this.sortSettings.sortProperty === property;
    const ascending: boolean = isSamePropertyAsPrevious ? !this.sortSettings.ascending
                                                        : true;

    this.sortSettings.ascending = ascending;
    this.sortSettings.sortProperty = property;

    const sortedLog: Array<LogEntry> = this._getSortedLogByProperty(property);

    this.sortedLog = ascending ? sortedLog
                                     : sortedLog.reverse();
  }

  private _getSortedLogByProperty(property: LogSortProperty): Array<LogEntry> {
    const sortedLog: Array<LogEntry> =
      this.log.sort((firstEntry: LogEntry, secondEntry: LogEntry) => {
        const firstEntryIsBigger: boolean = firstEntry[property] > secondEntry[property];
        if (firstEntryIsBigger) {
          return 1;
        }

        const secondEntryIsBigger: boolean = firstEntry[property] < secondEntry[property];
        if (secondEntryIsBigger) {
          return -1;
        }

        return 0;
      });

    return sortedLog;
  }
}
