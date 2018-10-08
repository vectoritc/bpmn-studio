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

  private _inspectCorrelationService: IInspectCorrelationService;

  constructor(inspectCorrelationService: IInspectCorrelationService) {
    this._inspectCorrelationService = inspectCorrelationService;
  }

  public async flowNodeChanged(): Promise<void> {

    this.firstElementSelected = true;
    this.tokenEntries = [];

    // Check if the selected Element can have a token.
    const elementHasNoToken: boolean = this.flowNode.type.includes('Lane')
                                    || this.flowNode.type.includes('Collaboration')
                                    || this.flowNode.type.includes('Participant');

    if (elementHasNoToken) {
      this.showTokenEntries = false;

      return;
    }

    try {
      const tokenHistoryEntries: Array<TokenHistoryEntry> = await this._inspectCorrelationService
        .getTokenForFlowNodeInstance(this.processModelId, this.correlation.id, this.flowNode.id);

      tokenHistoryEntries.forEach((historyEntry: TokenHistoryEntry, index: number) => {

        const tokenEntry: ITokenEntry = {
          entryNr: index,
          eventType: historyEntry.tokenEventType,
          createdAt: historyEntry.createdAt,
          payload: [],
        };

        if (historyEntry.payload !== undefined) {
          for (const load in historyEntry.payload) {
            const payloadEntry: IPayLoadEntry = {
              name: load,
              values: [],
            };

            for (const entry in historyEntry.payload[load]) {
              payloadEntry.values.push({
                title: entry,
                value: historyEntry.payload[load][entry],
              });
            }

            tokenEntry.payload.push(payloadEntry);
          }
        }

        this.tokenEntries.push(tokenEntry);
      });

      this.showTokenEntries = true;
    } catch (error) {
      this.showTokenEntries = false;
    }

  }
}
