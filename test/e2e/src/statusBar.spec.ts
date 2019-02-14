import {
  browser,
  ElementFinder,
  protractor,
  ProtractorExpectedConditions,
} from 'protractor';

import {Settings} from './pages/settings';
import {StatusBar} from './pages/statusBar';

describe('Status bar', () => {
  let settings: Settings;
  let statusBar: StatusBar;

  const aureliaUrl: string = browser.params.aureliaUrl;
  const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

  const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;

  beforeAll(() => {

    settings = new Settings();
    statusBar = new StatusBar();
  });

  beforeEach(async() => {
    const statusBarTag: ElementFinder = statusBar.statusBarTag;
    const visibilityOfStatusBarTag: Function = expectedConditions.visibilityOf(statusBarTag);

    await browser.get(aureliaUrl);
    await browser.driver
      .wait(() => {
        browser.wait(visibilityOfStatusBarTag, defaultTimeoutMS);

        return statusBar.statusBarTag;
    });
  });

  it('should display.', async() => {
    const statusBarTag: ElementFinder = statusBar.statusBarTag;
    const statusBarTagIsDisplayed: boolean = await statusBarTag.isDisplayed();

    expect(statusBarTagIsDisplayed).toBeTruthy();
  });

  it('should contain root and 3 elements (left-bar, center-bar, right bar).', async() => {
    const statusBarContainer: ElementFinder = statusBar.statusBarContainer;
    const statusBarContainerIsDisplayed: boolean = await statusBarContainer.isDisplayed();

    expect(statusBarContainerIsDisplayed).toBeTruthy();

    const statusBarContainerLeft: ElementFinder = statusBar.statusBarContainerLeft;
    const statusBarContainerLeftIsDisplayed: boolean = await statusBarContainerLeft.isDisplayed();

    expect(statusBarContainerLeftIsDisplayed).toBeTruthy();

    const statusBarContainerCenter: ElementFinder = statusBar.statusBarContainerCenter;
    const statusBarContainerCenterIsDisplayed: boolean = await statusBarContainerCenter.isDisplayed();

    expect(statusBarContainerCenterIsDisplayed).toBeTruthy();

    const statusBarContainerRight: ElementFinder = statusBar.statusBarContainerRight;
    const statusBarContainerRightIsDisplayed: boolean = await statusBarContainerRight.isDisplayed();

    expect(statusBarContainerRightIsDisplayed).toBeTruthy();
  });
});
