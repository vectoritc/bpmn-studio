import * as path from 'path';
import { browser, by, element, ElementFinder, protractor, ProtractorExpectedConditions } from 'protractor';

describe('status-bar', () => {
    const aureliaUrl: string = browser.params.aureliaUrl;
    const defaultTimeoutMS: number = browser.params.defaultTimeoutMS;

    const expectedConditions: ProtractorExpectedConditions = protractor.ExpectedConditions;
    const statusBar: ElementFinder = element(by.tagName('status-bar'));

    browser.driver.manage().deleteAllCookies();

    beforeEach(() => {
        browser.get(aureliaUrl);
        browser.driver.wait(() => {
            browser.wait(expectedConditions.visibilityOf(statusBar), defaultTimeoutMS);
            return statusBar;
        });
    });

    it('should display', () => {
        expect(statusBar).not.toBeUndefined();
    });

    it('should contain root and 3 elements (left-bar, center-bar, right bar)', () => {
        expect(statusBar.element(by.className('status-bar')).element.length).toBe(1);
        expect(statusBar.element(by.className('status-bar__left-bar')).element.length).toBe(1);
        expect(statusBar.element(by.className('status-bar__center-bar')).element.length).toBe(1);
        expect(statusBar.element(by.className('status-bar__right-bar')).element.length).toBe(1);
    });

    it('should contain settings button', () => {
        const settingsButton: ElementFinder = statusBar.element(by.className('status-bar__element')).element(by.tagName('a'));
        expect(settingsButton.element.length).toBe(1);
    });

    it('should be possible to click settings button and get redirected', () => {
        const settingsButton: ElementFinder = statusBar.element(by.className('status-bar__element'));
        settingsButton.click();
        browser.getCurrentUrl().then((url: string) => {
            expect(url).toMatch('configuration');
        });
    });
});
