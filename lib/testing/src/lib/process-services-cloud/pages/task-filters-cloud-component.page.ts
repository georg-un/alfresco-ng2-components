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

import { by } from 'protractor';
import { BrowserVisibility } from '../../core/utils/browser-visibility';

export class TaskFiltersCloudComponentPage {

    filter;
    taskIcon = by.xpath("ancestor::div[@class='mat-list-item-content']/mat-icon");

    constructor(filter) {
        this.filter = filter;
    }

    checkTaskFilterIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter);
        return this;
    }

    getTaskFilterIcon() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter);
        const icon = this.filter.element(this.taskIcon);
        BrowserVisibility.waitUntilElementIsVisible(icon);
        return icon.getText();
    }

    checkTaskFilterHasNoIcon() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter);
        BrowserVisibility.waitUntilElementIsNotOnPage(this.filter.element(this.taskIcon));
    }

    clickTaskFilter() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter);
        return this.filter.click();
    }

    checkTaskFilterNotDisplayed() {
        BrowserVisibility.waitUntilElementIsNotVisible(this.filter);
        return this.filter;
    }

}
