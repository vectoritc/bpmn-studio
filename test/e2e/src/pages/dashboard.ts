import {General} from './general';
import {ProcessModel} from './processModel';

import {by, element, ElementArrayFinder, ElementFinder} from 'protractor';

export class Dashboard {

  // Define Instances
  private _general: General = new General();
  private _process: ProcessModel = new ProcessModel();

  // Define Links, Urls, Classes
  public dashboardLink: string = '/dashboard';

  // Define Class method call forwarding
  public routerViewContainer: ElementFinder = this._general.routerViewContainer;
  public postProcessModelWithMessageIntermediateThrowEvent: void = this._process.postProcessModelWithMessageIntermediateThrowEvent();
  public startProcess: void = this._process.startProcess();

  // Define Elements

  // Define Functions
}
