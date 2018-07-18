import {
  IConfirmWidgetConfig,
  IUserTaskConfig,
  UserTaskProceedAction,
  WidgetType,
} from '@process-engine/bpmn-studio_client';
import {bindable, inject} from 'aurelia-framework';
import {IDynamicUiService} from '../../contracts';

@inject('DynamicUiService')
export class DynamicUiWrapper {

  public declineButtonText: string = 'Cancel';
  public confirmButtonText: string = 'Continue';
  public onButtonClick: (action: string) => void;

  private _dynamicUiService: IDynamicUiService;
  @bindable() private _currentConfig: IUserTaskConfig;

  constructor(dynamicUiService: IDynamicUiService) {
    this._dynamicUiService = dynamicUiService;
  }

  public handleButtonClick(action: string): void {
    if (!this._currentConfig) {
      return;
    }
    if (this.onButtonClick) {
      this.onButtonClick(action);
    }
    this._dynamicUiService.sendProceedAction(action, this._currentConfig);
    this._currentConfig = null;
  }

  public set currentConfig(userTaskConfig: IUserTaskConfig) {
    this._currentConfig = userTaskConfig;
    if (this._currentConfig.widgetType === WidgetType.confirm) {
      this.handleConfirmLayout();
    } else {
      this.confirmButtonText = 'Continue';
      this.declineButtonText = 'Cancel';
    }
  }

  public get currentConfig(): IUserTaskConfig {
    return this._currentConfig;
  }

  public handleConfirmLayout(): void {
    const confirmWidget: IConfirmWidgetConfig = this.currentConfig.widgetConfig as IConfirmWidgetConfig;
    this.confirmButtonText = null;
    this.declineButtonText = null;
    for (const action of confirmWidget.actions) {
      if (action.action === UserTaskProceedAction.cancel) {
        this.declineButtonText = action.label;
      } else if (action.action === UserTaskProceedAction.proceed) {
        this.confirmButtonText = action.label;
      }
    }
  }
}
