import {bindable, inject} from 'aurelia-framework';

import {Correlation, TokenHistoryEntry} from '@process-engine/management_api_contracts';
import {IShape} from '../../../../contracts';
import {IInspectCorrelationService, IPayLoadEntry, IPayLoadEntryValue, ITokenEntry} from '../../contracts';

@inject('InspectCorrelationService')
export class TokenViewer {
  @bindable() public correlation: Correlation;
  @bindable() public processModelId: string;
  @bindable() public flowNode: IShape;
  @bindable() public token: string;
  public tokenEntries: Array<ITokenEntry> = [];
  public showTokenEntries: boolean = false;
  public firstElementSelected: boolean = false;
  public shouldShowFlowNodeId: boolean = false;

  private _inspectCorrelationService: IInspectCorrelationService;

  constructor(inspectCorrelationService: IInspectCorrelationService) {
    this._inspectCorrelationService = inspectCorrelationService;
  }

  public correlationChanged(newCorrelation: Correlation): void {
    const correlationWasInitiallyOpened: boolean = this.flowNode === undefined;
    if (correlationWasInitiallyOpened) {
      return;
    }

    const flowNodeIsSequenceFlow: boolean = this.flowNode.type === 'bpmn:SequenceFlow';
    if (flowNodeIsSequenceFlow) {
      this.shouldShowFlowNodeId = false;
      this.showTokenEntries = false;
      this.tokenEntries = [];

      return;
    }

    this.updateFlowNode();
  }

  public flowNodeChanged(newFlowNode: IShape): Promise<void> {
    const flowNodeIsSequenceFlow: boolean = newFlowNode.type === 'bpmn:SequenceFlow';
    if (flowNodeIsSequenceFlow) {
      this.shouldShowFlowNodeId = false;
      this.showTokenEntries = false;
      this.tokenEntries = [];

      return;
    }

    this.updateFlowNode();
  }

  public async updateFlowNode(): Promise<void> {
    this.firstElementSelected = true;
    this.tokenEntries = [];

    const tokenHistoryEntries: Array<TokenHistoryEntry> = await this._inspectCorrelationService
      .getTokenForFlowNodeInstance(this.processModelId, this.correlation.id, this.flowNode.id);

    this.tokenEntries = this._getTokenEntriesForFlowNode(tokenHistoryEntries);

    this.showTokenEntries = this.tokenEntries.length > 0;
    this.shouldShowFlowNodeId = this.tokenEntries.length > 0;
  }

  private _getTokenEntriesForFlowNode(tokenHistoryEntries: Array<TokenHistoryEntry>): Array<ITokenEntry> {
    const tokenEntries: Array<ITokenEntry> = [];

    const elementHasNoToken: boolean = tokenHistoryEntries === undefined;
    if (elementHasNoToken) {
      return tokenEntries;
    }

    tokenHistoryEntries.forEach((historyEntry: TokenHistoryEntry, index: number) => {
      const historyEntryPayload: any = historyEntry.payload;

      const historyEntryHasNoPayload: boolean = historyEntryPayload === undefined;
      if (historyEntryHasNoPayload) {
        return;
      }

      const tokenEntryPayload: Array<IPayLoadEntry> = this._convertHistoryEntryPayloadToTokenEntryPayload(historyEntryPayload);

      const tokenEntry: ITokenEntry = {
        entryNr: index,
        eventType: historyEntry.tokenEventType,
        createdAt: historyEntry.createdAt,
        payload: tokenEntryPayload,
      };

      tokenEntries.push(tokenEntry);
    });

    return tokenEntries;
  }

  private _convertHistoryEntryPayloadToTokenEntryPayload(tokenEntryPayload: any): Array<IPayLoadEntry> {
    const formattedTokenEntryPayload: Array<IPayLoadEntry> = [];

    const payloadIsNotAnObjectOrArray: boolean = typeof tokenEntryPayload !== 'object';
    if (payloadIsNotAnObjectOrArray) {
      const payloadEntry: IPayLoadEntry = this._getPayloadEntryForNonObject(tokenEntryPayload);

      formattedTokenEntryPayload.push(payloadEntry);
    } else {
      const payloadEntries: Array<IPayLoadEntry> = this._getAllPayloadEntriesForObject(tokenEntryPayload);

      formattedTokenEntryPayload.push(...payloadEntries);
    }

    return formattedTokenEntryPayload;
  }

  private _getAllPayloadEntriesForObject(payload: any): Array<IPayLoadEntry> {
    const payloadEntries: Array<IPayLoadEntry> = [];

    for (const loadIndex in payload) {
      const currentLoad: any = payload[loadIndex];

      const payloadEntry: IPayLoadEntry = this._getPayloadEntryForObject(currentLoad, loadIndex);

      payloadEntries.push(payloadEntry);
    }

    return payloadEntries;
  }

  private _getPayloadEntryForObject(load: any, loadName: string): IPayLoadEntry {
    const payloadEntry: IPayLoadEntry = {
      name: loadName,
      values: [],
    };

    const entryIsNotAnObject: boolean = typeof load !== 'object';
    if (entryIsNotAnObject) {
      const payloadEntryValues: Array<IPayLoadEntryValue> = this._getPayloadEntryValuesForNonObject(load);

      payloadEntry.values = payloadEntryValues;
    } else {
      const payloadEntryValues: Array<IPayLoadEntryValue> = this._getPayloadEntryValuesForObject(load);

      payloadEntry.values = payloadEntryValues;
    }

    return payloadEntry;
  }

  private _getPayloadEntryValuesForObject(payload: any): Array<IPayLoadEntryValue> {
    const payloadEntryValues: Array<IPayLoadEntryValue> = [];

    for (const entryIndex in payload) {
      // tslint:disable-next-line no-magic-numbers
      const payloadEntryValue: string = JSON.stringify(payload[entryIndex], null, 2);

      payloadEntryValues.push({
        title: entryIndex,
        value:  payloadEntryValue,
      });
    }

    return payloadEntryValues;
  }

  private _getPayloadEntryForNonObject(payload: any): IPayLoadEntry {
    const payloadEntryValues: any = this._getPayloadEntryValuesForNonObject(payload);

    const payloadEntry: IPayLoadEntry = {
      values: payloadEntryValues,
    };

    return payloadEntry;
  }

  private _getPayloadEntryValuesForNonObject(payload: any): Array<IPayLoadEntryValue> {
    const payloadIsString: boolean = typeof payload === 'string';

    const payloadEntryValue: string = payloadIsString
                                  ? `"${payload}"`
                                  : payload;

    const payloadEntryValues: Array<IPayLoadEntryValue> = [
      { value: payloadEntryValue },
    ];

    return payloadEntryValues;
  }
}
