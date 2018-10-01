import {bindable, inject} from 'aurelia-framework';

import {Correlation} from '@process-engine/management_api_contracts';

import {IInspectCorrelationService} from '../../contracts';

@inject('InspectCorrelationService')
export class TokenViewer {
  @bindable() public correlation: Correlation;
  @bindable() public token: string;
  public formattedToken: string;

  private _inspectCorrelationService: IInspectCorrelationService;

  constructor(inspectCorrelationService: IInspectCorrelationService) {
    this._inspectCorrelationService = inspectCorrelationService;
  }

  public async correlationChanged(): Promise<void> {
    this.token = await this._inspectCorrelationService.getTokenForCorrelation(this.correlation);
    this.formatToken();
  }

  public formatToken(): void {
    const unformattedToken: JSON = JSON.parse(this.token);

    // tslint:disable-next-line:no-magic-numbers
    this.formattedToken = JSON.stringify(unformattedToken, null, 2);
  }
}
