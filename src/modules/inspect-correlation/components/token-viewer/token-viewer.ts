import {bindable, inject} from 'aurelia-framework';

import {Correlation, TokenHistoryEntry} from '@process-engine/management_api_contracts';
import {IShape} from '../../../../contracts';
import {IInspectCorrelationService, IPayLoadEntry, ITokenEntry} from '../../contracts';

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

    const elementHasNoToken: boolean = tokenHistoryEntries === undefined;
    if (elementHasNoToken) {
      this.showTokenEntries = false;

      return;
    }

    tokenHistoryEntries.forEach((historyEntry: TokenHistoryEntry, index: number) => {

      const tokenEntry: ITokenEntry = {
        entryNr: index,
        eventType: historyEntry.tokenEventType,
        createdAt: historyEntry.createdAt,
        payload: [],
      };

      const historyEntryHasPayload: boolean = historyEntry.payload !== undefined;
      if (historyEntryHasPayload) {
        const payload: any = historyEntry.payload;

        const payloadIsNotAnObjectOrArray: boolean = typeof payload !== 'object';
        if (payloadIsNotAnObjectOrArray) {
          const payloadIsString: boolean = typeof payload === 'string';

          const payloadValue: string = payloadIsString
                                        ? `"${payload}"`
                                        : payload;

          tokenEntry.payload.push({name: undefined, values: [{title: undefined, value: payloadValue}]});
        } else {
          for (const loadIndex in payload) {
            const currentPayload: any = payload[loadIndex];
            const payloadEntry: IPayLoadEntry = {
              name: loadIndex,
              values: [],
            };

            const entryIsNotAnObjectOrArray: boolean = typeof currentPayload !== 'object';
            if (entryIsNotAnObjectOrArray) {
              const payloadIsString: boolean = typeof currentPayload === 'string';

              const payloadValue: string = payloadIsString
                                            ? `"${currentPayload}"`
                                            : currentPayload;

              payloadEntry.values.push({
                title: undefined,
                value: payloadValue,
              });
            } else {
              for (const entryIndex in currentPayload) {
                // tslint:disable-next-line no-magic-numbers
                const payloadEntryValue: string = JSON.stringify(currentPayload[entryIndex], null, 2);

                payloadEntry.values.push({
                  title: entryIndex,
                  value:  payloadEntryValue,
                });
              }
            }

            tokenEntry.payload.push(payloadEntry);
          }
        }
      }

      this.tokenEntries.push(tokenEntry);
    });

    this.showTokenEntries = true;
    this.shouldShowFlowNodeId = true;
  }
}
