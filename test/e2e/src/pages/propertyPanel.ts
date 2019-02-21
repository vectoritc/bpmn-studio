import {browser, by, element, ElementFinder, ExpectedConditions} from 'protractor';

import {By} from 'selenium-webdriver';

export class PropertyPanel {

  private _propertyPanelContainerId: string = 'js-properties-panel';
  private _generalBasicsSectionId: string = 'js-general-basics-section';
  private _generalCallActivitySectionId: string = 'js-general-callActivity-section';
  private _generalConditionalEventSectionId: string = 'js-general-conditionalEvent-section';
  private _generalErrorEventSectionId: string = 'js-general-errorEvent-section';
  private _generalEscalationEventSectionId: string = 'js-general-escalationEvent-section';
  private _generalFlowSectionId: string = 'js-general-flow-section';
  private _generalMessageEventSectionId: string = 'js-general-messageEvent-section';
  private _generalMessageTaskSectionId: string = 'js-general-messageTask-section';
  private _generalPoolSectionId: string = 'js-general-pool-section';
  private _generalProcessSectionId: string = 'js-general-process-section';
  private _generalScriptTaskSectionId: string = 'js-general-scriptTask-section';

  public async show(): Promise<void> {
    await browser.wait(ExpectedConditions.visibilityOf(this._propertyPanelContainer), browser.params.defaultTimeoutMS);
  }

  private get _propertyPanelContainer(): ElementFinder {
    const propertyPanelContainerById: By = by.id(this._propertyPanelContainerId);

    return element(propertyPanelContainerById);
  }
}
