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
      const formattedStartedDate: string = new DateService(correlation.createdAt)
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

    const sortedTableData: Array<IProcessInstanceTableEntry> = sortByDate ? this._sortListByStartDate()
                                                                          : this._sortList(property);

    this.sortedTableData = ascending ? sortedTableData
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

        const firstEntryIsBigger: boolean = firstCorrelation.createdAt.getTime() > secondCorrelation.createdAt.getTime();
        if (firstEntryIsBigger) {
          return 1;
        }

        const secondEntryIsBigger: boolean = firstCorrelation.createdAt.getTime() < secondCorrelation.createdAt.getTime();
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
    const correlationStartedDate: number = correlation.createdAt.getTime();

    const earlierStartedCorrelations: Array<Correlation> = correlations.filter((entry: Correlation) => {
      return entry.createdAt.getTime() < correlationStartedDate;
    });

    const amountOfEarlierStartedCorrelations: number = earlierStartedCorrelations.length;
    const correlationIndex: number = amountOfEarlierStartedCorrelations + 1;

    return correlationIndex;
  }
}
