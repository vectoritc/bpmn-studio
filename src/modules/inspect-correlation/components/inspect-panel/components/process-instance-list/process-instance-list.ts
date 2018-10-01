import {bindable, bindingMode} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';

import {IProcessInstanceSortSettings, IProcessInstanceTableEntry, ProcessInstanceListSortProperty} from '../../../../../../contracts/index';
import {DateService} from '../../../../../date-service/date.service';

export class ProcessInstanceList {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) public selectedCorrelation: Correlation;
  @bindable({ changeHandler: 'correlationsChanged' }) public correlations: Array<Correlation>;
  public sortedTableData: Array<IProcessInstanceTableEntry>;
  public ProcessInstanceListSortProperty: typeof ProcessInstanceListSortProperty = ProcessInstanceListSortProperty;
  public sortSettings: IProcessInstanceSortSettings = {
    ascending: false,
    sortProperty: undefined,
  };

  private _tableData: Array<IProcessInstanceTableEntry> = [];

  public selectCorrelation(selectedTableEntry: IProcessInstanceTableEntry): void {
    this.selectedCorrelation = this._getCorrelationForTableEntry(selectedTableEntry);
  }

  public correlationsChanged(correlations: Array<Correlation>): void {
    this._convertCorrelationsIntoTableData(correlations);
    this.sortList(ProcessInstanceListSortProperty.Number);
  }

  private _convertCorrelationsIntoTableData(correlations: Array<Correlation>): void {
    this._tableData = [];

    for (const correlation of correlations) {
      const date: Date = new Date(correlation.createdAt);
      const formattedStartedDate: string = new DateService(date)
                                            .getYear()
                                            .getMonth()
                                            .getDay()
                                            .getHours()
                                            .getMinutes()
                                            .asFormattedDate();

      const index: number = this._getIndexForCorrelation(correlation, correlations);
      const state: string = correlation.state.toUpperCase();

      const tableEntry: IProcessInstanceTableEntry = {
        index: index,
        startedAt: formattedStartedDate,
        state: state,
        user: 'Not supported yet.',
        correlationId: correlation.id,
      };

      this._tableData.push(tableEntry);
    }
  }

  public sortList(property: ProcessInstanceListSortProperty): void {
    this.sortedTableData = [];

    const isSameSortPropertyAsBefore: boolean = this.sortSettings.sortProperty === property;
    const ascending: boolean = isSameSortPropertyAsBefore ? !this.sortSettings.ascending
                                                          : true;

    this.sortSettings.ascending = ascending;
    this.sortSettings.sortProperty = property;

    const sortByDate: boolean = property === ProcessInstanceListSortProperty.StartedAt;

    const sortedTableData: Array<IProcessInstanceTableEntry> = sortByDate
                                                                ? this._sortListByStartDate()
                                                                : this._sortList(property);

    this.sortedTableData = ascending
                            ? sortedTableData
                            : sortedTableData.reverse();
  }

  private _sortList(property: ProcessInstanceListSortProperty): Array<IProcessInstanceTableEntry> {
    const sortedTableData: Array<IProcessInstanceTableEntry> =
      this._tableData.sort((firstEntry: IProcessInstanceTableEntry, secondEntry: IProcessInstanceTableEntry) => {
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

    return sortedTableData;
  }

  private _sortListByStartDate(): Array<IProcessInstanceTableEntry> {
    const sortedTableData: Array<IProcessInstanceTableEntry> =
      this._tableData.sort((firstEntry: IProcessInstanceTableEntry, secondEntry: IProcessInstanceTableEntry) => {
        const firstCorrelation: Correlation = this._getCorrelationForTableEntry(firstEntry);
        const secondCorrelation: Correlation = this._getCorrelationForTableEntry(secondEntry);

        const firstCorrelationDate: Date = new Date(firstCorrelation.createdAt);
        const secondCorrelationDate: Date = new Date(secondCorrelation.createdAt);

        const firstEntryIsBigger: boolean = firstCorrelationDate.getTime() > secondCorrelationDate.getTime();
        if (firstEntryIsBigger) {
          return 1;
        }

        const secondEntryIsBigger: boolean = firstCorrelationDate.getTime() < secondCorrelationDate.getTime();
        if (secondEntryIsBigger) {
          return -1;
        }

        return 0;
      });

    return sortedTableData;
  }

  private _getCorrelationForTableEntry(tableEntry: IProcessInstanceTableEntry): Correlation {
    const correlationForTableEntry: Correlation = this.correlations.find((correlation: Correlation) => {
      return correlation.id === tableEntry.correlationId;
    });

    return correlationForTableEntry;
  }

  private _getIndexForCorrelation(correlation: Correlation, correlations: Array<Correlation>): number {
    const correlationStartedDate: Date = new Date(correlation.createdAt);

    const earlierStartedCorrelations: Array<Correlation> = correlations.filter((entry: Correlation) => {
      const entryStartedDate: Date = new Date(entry.createdAt);

      return entryStartedDate.getTime() < correlationStartedDate.getTime();
    });

    const amountOfEarlierStartedCorrelations: number = earlierStartedCorrelations.length;
    const correlationIndex: number = amountOfEarlierStartedCorrelations + 1;

    return correlationIndex;
  }
}
