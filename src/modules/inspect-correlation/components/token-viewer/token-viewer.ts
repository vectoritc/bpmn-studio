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

  public correlationChanged(newCorrelation: Correlation): void {
    const correlationWasNotInitialOpened: boolean = this.flowNode !== undefined;
    if (correlationWasNotInitialOpened) {
      this.updateFlowNode();
    }
  }

  public async flowNodeChanged(): Promise<void> {
    this.updateFlowNode();
  }

  public async updateFlowNode(): Promise<void> {
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
      /**
       * Currently, the backend does not offer a method to obtain all
       * flow nodes of a correlation.
       *
       * Because of this, this method will throw a 404 error when the user
       * views the ProcessToken of a flow node and then switch to a
       * Correlations, where this flow node does not exists.
       *
       * TODO: As soon as the backend supports this feature, we should
       * check if the flow node that we want to access exists, to avoid 404
       * errors.
       */
      const tokenHistoryEntries: Array<TokenHistoryEntry> = await this._inspectCorrelationService
        .getTokenForFlowNodeInstance(this.processModelId, this.correlation.id, this.flowNode.id);

      tokenHistoryEntries.forEach((historyEntry: TokenHistoryEntry, index: number) => {

        const tokenEntry: ITokenEntry = {
          entryNr: index,
          eventType: historyEntry.tokenEventType,
          createdAt: historyEntry.createdAt,
          payload: [],
        };

        const historyEntryHasPayload: boolean = historyEntry.payload !== undefined;
        if (historyEntryHasPayload) {
          for (const load in historyEntry.payload) {
            const payloadEntry: IPayLoadEntry = {
              name: load,
              values: [],
            };

            for (const entry in historyEntry.payload[load]) {
              payloadEntry.values.push({
                title: entry,
                value: JSON.stringify(historyEntry.payload[load][entry]),
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
