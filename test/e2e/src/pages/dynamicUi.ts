import {by, element, ElementFinder} from 'protractor';

import {By} from 'selenium-webdriver';

export class DynamicUi {

  private _dynamicUiWrapperTag: string = 'dynamic-ui-wrapper';

  public async getVisibilityOfDynamicUiWrapper(): Promise<boolean> {

    return this._dynamicUuWrapper.isDisplayed();
  }

  private get _dynamicUuWrapper(): ElementFinder {
    const dynamicUiWrapperByTag: By = by.tagName(this._dynamicUiWrapperTag);

    return element(dynamicUiWrapperByTag);
  }
}
