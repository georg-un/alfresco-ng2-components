/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { by, element, Key, protractor, browser, ElementFinder } from 'protractor';
import { BrowserVisibility, BrowserActions, FormFields } from '@alfresco/adf-testing';

export class StartProcessPage {

    defaultProcessName: ElementFinder = element(by.css('input[id="processName"]'));
    processNameInput: ElementFinder = element(by.id('processName'));
    selectProcessDropdownArrow: ElementFinder = element(by.css('button[id="adf-select-process-dropdown"]'));
    cancelProcessButton: ElementFinder = element(by.id('cancel_process'));
    formStartProcessButton: ElementFinder = element(by.css('button[data-automation-id="adf-form-start process"]'));
    startProcessButton: ElementFinder = element(by.css('button[data-automation-id="btn-start"]'));
    noProcess: ElementFinder = element(by.id('no-process-message'));
    processDefinition: ElementFinder = element(by.css('input[id="processDefinitionName"]'));
    processDefinitionOptionsPanel: ElementFinder = element(by.css('div[class*="processDefinitionOptions"]'));

    async checkNoProcessMessage(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.noProcess);
    }

    async pressDownArrowAndEnter(): Promise<void> {
        this.processDefinition.sendKeys(protractor.Key.ARROW_DOWN);
        return browser.actions().sendKeys(protractor.Key.ENTER).perform();
    }

    async checkNoProcessDefinitionOptionIsDisplayed() {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.processDefinitionOptionsPanel);
    }

    async getDefaultName(): Promise<string> {
        await BrowserVisibility.waitUntilElementIsVisible(this.defaultProcessName);
        return this.defaultProcessName.getAttribute('value');
    }

    async deleteDefaultName(name): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.processNameInput);
        await BrowserActions.clearSendKeys(this.processNameInput, name);
    }

    async enterProcessName(name): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.processNameInput);
        await BrowserActions.clearSendKeys(this.processNameInput, name);
    }

    async selectFromProcessDropdown(name): Promise<void> {
        await this.clickProcessDropdownArrow();
        await this.selectOption(name);
    }

    async clickProcessDropdownArrow(): Promise<void> {
        await BrowserActions.click(this.selectProcessDropdownArrow);
    }

    async checkOptionIsDisplayed(name): Promise<void> {
        const selectProcessDropdown: ElementFinder = element(by.cssContainingText('.mat-option-text', name));
        await BrowserVisibility.waitUntilElementIsVisible(selectProcessDropdown);
        await BrowserVisibility.waitUntilElementIsClickable(selectProcessDropdown);
    }

    async checkOptionIsNotDisplayed(name): Promise<void> {
        const selectProcessDropdown: ElementFinder = element(by.cssContainingText('.mat-option-text', name));
        await BrowserVisibility.waitUntilElementIsNotVisible(selectProcessDropdown);
    }

    async selectOption(name): Promise<void> {
        const selectProcessDropdown: ElementFinder = element(by.cssContainingText('.mat-option-text', name));
        await BrowserActions.click(selectProcessDropdown);
    }

    async typeProcessDefinition(name): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.processDefinition);
        await BrowserVisibility.waitUntilElementIsClickable(this.processDefinition);
        await BrowserActions.clearSendKeys(this.processDefinition, name);
    }

    async getProcessDefinitionValue(): Promise<string> {
        await BrowserVisibility.waitUntilElementIsVisible(this.processDefinition);
        return this.processDefinition.getAttribute('value');
    }

    async clickCancelProcessButton(): Promise<void> {
        await BrowserActions.click(this.cancelProcessButton);
    }

    clickFormStartProcessButton(): Promise<void> {
        return BrowserActions.click(this.formStartProcessButton);
    }

    checkStartFormProcessButtonIsEnabled() {
        expect(this.formStartProcessButton.isEnabled()).toBe(true);
    }

    checkStartProcessButtonIsEnabled() {
        expect(this.startProcessButton.isEnabled()).toBe(true);
    }

    checkStartProcessButtonIsDisabled() {
        expect(this.startProcessButton.isEnabled()).toBe(false);
    }

    async clickStartProcessButton(): Promise<void> {
        await BrowserActions.click(this.startProcessButton);
    }

    async checkSelectProcessPlaceholderIsDisplayed(): Promise<string> {
        await BrowserVisibility.waitUntilElementIsVisible(this.processDefinition);
        const processPlaceholder = await this.processDefinition.getAttribute('value');
        return processPlaceholder;
    }

    async checkValidationErrorIsDisplayed(error, elementRef = 'mat-error'): Promise<void> {
        const errorElement: ElementFinder = element(by.cssContainingText(elementRef, error));
        await BrowserVisibility.waitUntilElementIsVisible(errorElement);
    }

    async blur(locator): Promise<void> {
        await BrowserActions.click(locator);
        await locator.sendKeys(Key.TAB);
    }

    async clearField(locator): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(locator);
        locator.getAttribute('value').then((result) => {
            for (let i = result.length; i >= 0; i--) {
                locator.sendKeys(protractor.Key.BACK_SPACE);
            }
        });
    }

    formFields(): FormFields {
        return new FormFields();
    }
}
