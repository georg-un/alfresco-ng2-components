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

import { element, by, ElementFinder } from 'protractor';
import { BrowserActions } from '../../../core/utils/browser-actions';
import { BrowserVisibility } from '../../../core/utils/browser-visibility';

export class SearchCheckListPage {

    filter: ElementFinder;
    inputBy = by.css('div[class*="mat-expansion-panel-content"] input');
    showMoreBy = by.css('button[title="Show more"]');
    showLessBy = by.css('button[title="Show less"]');
    clearAllButton = by.css('button');

    constructor(filter: ElementFinder) {
        this.filter = filter;
    }

    async clickCheckListOption(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const result = this.filter.all(by.css(`mat-checkbox[data-automation-id*='${option}'] .mat-checkbox-inner-container`)).first();
        await BrowserActions.click(result);
    }

    async checkChipIsDisplayed(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(element(by.cssContainingText('mat-chip', option)).element(by.css('mat-icon')));
    }

    async checkChipIsNotDisplayed(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsNotOnPage(element(by.cssContainingText('mat-chip', option)).element(by.css('mat-icon')));
    }

    async removeFilterOption(option: string): Promise<void> {
        const cancelChipButton = element(by.cssContainingText('mat-chip', option)).element(by.css('mat-icon'));
        await BrowserActions.click(cancelChipButton);
    }

    async filterBy(option: string): Promise<void> {
        await this.checkSearchFilterInputIsDisplayed();
        await this.searchInFilter(option);
        await this.clickCheckListOption(option);
    }

    async checkSearchFilterInputIsDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter.all(this.inputBy).first());
    }

    async searchInFilter(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsClickable(this.filter);
        const inputElement = this.filter.all(this.inputBy).first();
        await BrowserVisibility.waitUntilElementIsClickable(inputElement);

        inputElement.clear();
        this.filter.all(this.inputBy).first().sendKeys(option);
    }

    async checkShowLessButtonIsNotDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.filter.element(this.showLessBy));
    }

    async checkShowLessButtonIsDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.showLessBy));
    }

    async checkShowMoreButtonIsDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.showMoreBy));
    }

    async checkShowMoreButtonIsNotDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.filter.element(this.showMoreBy));
    }

    clickShowMoreButtonUntilIsNotDisplayed() {
        this.filter.element(this.showMoreBy).isDisplayed().then(async (visible) => {
            if (visible) {
                await BrowserActions.click(this.filter.element(this.showMoreBy));
                this.clickShowMoreButtonUntilIsNotDisplayed();
            }
        }, () => {
        });
        return this;
    }

    clickShowLessButtonUntilIsNotDisplayed() {
        this.filter.element(this.showLessBy).isDisplayed().then(async (visible) => {
            if (visible) {
                await BrowserActions.click(this.filter.element(this.showLessBy));
                this.clickShowLessButtonUntilIsNotDisplayed();
            }
        }, () => {
        });
        return this;
    }

    async getBucketNumberOfFilterType(option: string): Promise<any> {
        const fileTypeFilter = this.filter.all(by.css('mat-checkbox[data-automation-id*=".' + option + '"] span')).first();
        await BrowserVisibility.waitUntilElementIsVisible(fileTypeFilter);
        return fileTypeFilter.getText().then((valueOfBucket) => {
            const numberOfBucket = valueOfBucket.split('(')[1];
            const totalNumberOfBucket = numberOfBucket.split(')')[0];
            return totalNumberOfBucket.trim();
        });

    }

    async checkCheckListOptionIsDisplayed(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const result = this.filter.element(by.css(`mat-checkbox[data-automation-id*='-${option}']`));
        await BrowserVisibility.waitUntilElementIsVisible(result);
    }

    async checkCheckListOptionIsNotSelected(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const result = this.filter.element(by.css(`mat-checkbox[data-automation-id*='-${option}'][class*='checked']`));
        await BrowserVisibility.waitUntilElementIsNotVisible(result);
    }

    async checkCheckListOptionIsSelected(option: string): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const result = this.filter.element(by.css(`mat-checkbox[data-automation-id*='-${option}'][class*='checked']`));
        await BrowserVisibility.waitUntilElementIsVisible(result);
    }

    async checkClearAllButtonIsDisplayed() {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const result = this.filter.element(this.clearAllButton);
        await BrowserVisibility.waitUntilElementIsVisible(result);
    }

    async clickClearAllButton(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const result = this.filter.element(this.clearAllButton);
        await BrowserVisibility.waitUntilElementIsVisible(result);
        await BrowserActions.click(result);

    }

    async getCheckListOptionsNumberOnPage(): Promise<number> {
        await BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const checkListOptions = this.filter.all(by.css('div[class="checklist"] mat-checkbox'));
        return checkListOptions.count();
    }

    async clickShowMoreButton(): Promise<void> {
        await BrowserActions.click(this.filter.element(this.showMoreBy));
    }

    async clickShowLessButton(): Promise<void> {
        await BrowserActions.click(this.filter.element(this.showLessBy));
    }

}
