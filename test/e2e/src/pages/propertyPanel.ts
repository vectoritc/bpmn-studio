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
  private _generalServiceTaskSectionId: string = 'js-general-serviceTask-section';
  private _generalSignalEventSectionId: string = 'js-general-signalEvent-section';
  private _generalTimerEventSectionId: string = 'js-general-timerEvent-section';
  private _extensionsBasicsSectionId: string = 'js-extensions-basics-section';
  private _extensionsProcessSectionId: string = 'js-extensions-process-section';
  private _formsBasicsSectionId: string = 'js-forms-basics-section';

  public async show(): Promise<void> {
    await browser.wait(ExpectedConditions.visibilityOf(this._propertyPanelContainer), browser.params.defaultTimeoutMS);
  }

  public async getVisbilityOfPropertyPanelContainer(): Promise<boolean> {
    return this._propertyPanelContainer.isDisplayed();
  }

  public async getVisibilityOfGeneralBasicsSection(): Promise<boolean> {
    return this._generalBasicsSection.isDisplayed();
  }

  public async getVisibilityOfCallActivitySection(): Promise<boolean> {
    return this._callActivitySection.isDisplayed();
  }

  public async getVisibilityOfConditionalEventSection(): Promise<boolean> {
    return this._conditionalEventSection.isDisplayed();
  }

  public async getVisibilityOfErrorEventSection(): Promise<boolean> {
    return this._errorEventSection.isDisplayed();
  }

  public async getVisibilityOfEscalationEventSection(): Promise<boolean> {
    return this._escalationEventSection.isDisplayed();
  }

  public async getVisibilityOfFlowSection(): Promise<boolean> {
    return this._flowSection.isDisplayed();
  }

  public async getVisibilityOfMessageEventSection(): Promise<boolean> {
    return this._messageEventSection.isDisplayed();
  }

  public async getVisibilityOfMessageTaskSection(): Promise<boolean> {
    return this._messageTaskSection.isDisplayed();
  }

  public async getVisibilityOfPoolSection(): Promise<boolean> {
    return this._poolSection.isDisplayed();
  }

  public async getVisibilityOfScriptTaskSection(): Promise<boolean> {
    return this._scriptTaskSection.isDisplayed();
  }

  public async getVisibilityOfGeneralProcessSection(): Promise<boolean> {
    return this._generalProcessSection.isDisplayed();
  }

  public async getVisbilityOfServiceTaskSection(): Promise<boolean> {
    return this._serviceTaskSection.isDisplayed();
  }

  public async getVisbilityOfSignalEventSection(): Promise<boolean> {
    return this._signalEventSection.isDisplayed();
  }

  public async getVisbilityOfTimerEventSection(): Promise<boolean> {
    return this._timerEventSection.isDisplayed();
  }
  private get _propertyPanelContainer(): ElementFinder {
    const propertyPanelContainerById: By = by.id(this._propertyPanelContainerId);

    return element(propertyPanelContainerById);
  }

  private get _generalBasicsSection(): ElementFinder {
    const generalBasicsSectionById: By = by.id(this._generalBasicsSectionId);

    return element(generalBasicsSectionById);
  }

  private get _callActivitySection(): ElementFinder {
    const callActivitySectionById: By = by.id(this._generalCallActivitySectionId);

    return element(callActivitySectionById);
  }

  private get _conditionalEventSection(): ElementFinder {
    const conditionalEventSectionById: By = by.id(this._generalConditionalEventSectionId);

    return element(conditionalEventSectionById);
  }

  private get _errorEventSection(): ElementFinder {
    const errorEventSectionById: By = by.id(this._generalErrorEventSectionId);

    return element(errorEventSectionById);
  }

  private get _escalationEventSection(): ElementFinder {
    const escalationEventSectionById: By = by.id(this._generalEscalationEventSectionId);

    return element(escalationEventSectionById);
  }

  private get _flowSection(): ElementFinder {
    const flowSectionById: By = by.id(this._generalFlowSectionId);

    return element(flowSectionById);
  }

  private get _messageEventSection(): ElementFinder {
    const messageEventSectionById: By = by.id(this._generalMessageEventSectionId);

    return element(messageEventSectionById);
  }

  private get _messageTaskSection(): ElementFinder {
    const messageTaskSectionById: By = by.id(this._generalMessageTaskSectionId);

    return element(messageTaskSectionById);
  }

  private get _poolSection(): ElementFinder {
    const poolSectionById: By = by.id(this._generalPoolSectionId);

    return element(poolSectionById);
  }

  private get _generalProcessSection(): ElementFinder {
    const processSectionById: By = by.id(this._generalProcessSectionId);

    return element(processSectionById);
  }

  private get _scriptTaskSection(): ElementFinder {
    const scriptTaskSectionById: By = by.id(this._generalScriptTaskSectionId);

    return element(scriptTaskSectionById);
  }

  private get _serviceTaskSection(): ElementFinder {
    const serviceTaskSectionById: By = by.id(this._generalServiceTaskSectionId);

    return element(serviceTaskSectionById);
  }

  private get _signalEventSection(): ElementFinder {
    const signalEventSectionById: By = by.id(this._generalSignalEventSectionId);

    return element(signalEventSectionById);
  }

  private get _timerEventSection(): ElementFinder {
    const timerEventSectionById: By = by.id(this._generalTimerEventSectionId);

    return element(timerEventSectionById);
  }

  private get _extensionsBasicsSection(): ElementFinder {
    const extensionsBasicsSectionById: By = by.id(this._extensionsBasicsSectionId);

    return element(extensionsBasicsSectionById);
  }

  private get _extensionsProcessSection(): ElementFinder {
    const extensionsProcessSectionById: By = by.id(this._extensionsProcessSectionId);

    return element(extensionsProcessSectionById);
  }

  private get _formBasicsSection(): ElementFinder {
    const formBasicsSection: By = by.id(this._formsBasicsSectionId);

    return element(formBasicsSection);
  }

}
