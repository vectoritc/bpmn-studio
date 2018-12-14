import {bindable, bindingMode} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';

import {CorrelationListSortProperty, ICorrelationSortSettings, ICorrelationTableEntry} from '../../../../../../../contracts/index';
import {DateService} from '../../../../../../date-service/date.service';

export class CorrelationList {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) public selectedCorrelation: Correlation;
  @bindable({ changeHandler: 'correlationsChanged' }) public correlations: Array<Correlation>;
  public sortedTableData: Array<ICorrelationTableEntry>;
  public CorrelationListSortProperty: typeof CorrelationListSortProperty = CorrelationListSortProperty;
  public sortSettings: ICorrelationSortSettings = {
    ascending: false,
    sortProperty: undefined,
  };

  private _tableData: Array<ICorrelationTableEntry> = [];

  public selectCorrelation(selectedTableEntry: ICorrelationTableEntry): void {
    this.selectedCorrelation = this._getCorrelationForTableEntry(selectedTableEntry);
  }

  public correlationsChanged(correlations: Array<Correlation>): void {
    this._convertCorrelationsIntoTableData(correlations);

    // Select latest process instance
    const sortedTableData: Array<ICorrelationTableEntry> = this._sortListByStartDate();
    const tableDataIsExisiting: boolean = sortedTableData.length > 0;

    if (tableDataIsExisiting ) {
      const latestCorelationTableEntry: ICorrelationTableEntry = sortedTableData[sortedTableData.length - 1];

      this.selectCorrelation(latestCorelationTableEntry);
    }

    const sortSettingsExisitng: boolean = this.sortSettings.sortProperty !== undefined;
    if (sortSettingsExisitng) {
      this.sortSettings.ascending = !this.sortSettings.ascending;

      this.sortList(this.sortSettings.sortProperty);
    } else {
      this.sortSettings.sortProperty = CorrelationListSortProperty.Number;
      this.sortSettings.ascending = true;

      this.sortList(CorrelationListSortProperty.Number);
    }
  }

  private _convertCorrelationsIntoTableData(correlations: Array<Correlation>): void {
    this._tableData = [];

    for (const correlation of correlations) {
      const date: Date = new Date(correlation.createdAt);
      const formattedStartedDate: string = new DateService(date)
                                            .year()
                                            .month()
                                            .day()
                                            .hours()
                                            .minutes()
                                            .asFormattedDate();

      const index: number = this._getIndexForCorrelation(correlation, correlations);
      const state: string = correlation.state.toUpperCase();

      const tableEntry: ICorrelationTableEntry = {
        index: index,
        startedAt: formattedStartedDate,
        state: state,
        user: 'Not supported yet.',
        correlationId: correlation.id,
      };

      this._tableData.push(tableEntry);
    }
  }

  public sortList(property: CorrelationListSortProperty): void {
    this.sortedTableData = [];

    const isSameSortPropertyAsBefore: boolean = this.sortSettings.sortProperty === property;
    const ascending: boolean = isSameSortPropertyAsBefore ? !this.sortSettings.ascending
                                                          : true;

    this.sortSettings.ascending = ascending;
    this.sortSettings.sortProperty = property;

    const sortByDate: boolean = property === CorrelationListSortProperty.StartedAt;

    const sortedTableData: Array<ICorrelationTableEntry> = sortByDate
                                                                ? this._sortListByStartDate()
                                                                : this._sortList(property);

    this.sortedTableData = ascending
                            ? sortedTableData
                            : sortedTableData.reverse();
  }

  private _sortList(property: CorrelationListSortProperty): Array<ICorrelationTableEntry> {
    const sortedTableData: Array<ICorrelationTableEntry> =
      this._tableData.sort((firstEntry: ICorrelationTableEntry, secondEntry: ICorrelationTableEntry) => {
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

  private _sortListByStartDate(): Array<ICorrelationTableEntry> {
    const sortedTableData: Array<ICorrelationTableEntry> =
      this._tableData.sort((firstEntry: ICorrelationTableEntry, secondEntry: ICorrelationTableEntry) => {
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

  private _getCorrelationForTableEntry(tableEntry: ICorrelationTableEntry): Correlation {
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
