import {
  by,
  element,
  ElementFinder,
} from 'protractor';

import {By} from 'selenium-webdriver';

export class Minimap {

  // Define Classes
  private _openClassAttribute: string = 'open';

  // Define Elements
  private _byClassNameMinimap: By = by.className('djs-minimap');
  private _byClassNameToggle: By = by.className('toggle');

  public openButton: ElementFinder = element(this._byClassNameMinimap);
  public toggleButton: ElementFinder = this.openButton.element(this._byClassNameToggle);

  // Define Functions
  public async openButtonIncludesOpenAttribute(): Promise<boolean> {
    const openButtonClasses: string = await this.openButton.getAttribute('class');
    return openButtonClasses.includes(this._openClassAttribute);
  }

  public async clickOpenButton(): Promise<void> {
    return this.openButton.click();
  }

  public async clickToggleButton(): Promise<void> {
    return this.toggleButton.click();
  }

}
