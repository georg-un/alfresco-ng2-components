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

import { browser, by, element, Locator, protractor, ElementFinder, ElementArrayFinder } from 'protractor';
import { BrowserVisibility } from '../utils/browser-visibility';
import { BrowserActions } from '../utils/browser-actions';

export class DataTableComponentPage {

    rootElement: ElementFinder;
    list: ElementArrayFinder;
    contents: ElementArrayFinder;
    tableBody: ElementFinder;
    rows: Locator = by.css(`adf-datatable div[class*='adf-datatable-body'] div[class*='adf-datatable-row']`);
    allColumns: ElementArrayFinder;
    selectedRowNumber: ElementFinder;
    allSelectedRows: ElementArrayFinder;
    selectAll: ElementFinder;
    copyColumnTooltip: ElementFinder;

    constructor(rootElement: ElementFinder = element.all(by.css('adf-datatable')).first()) {
        this.rootElement = rootElement;
        this.list = this.rootElement.all(by.css(`div[class*='adf-datatable-body'] div[class*='adf-datatable-row']`));
        this.contents = this.rootElement.all(by.css('div[class="adf-datatable-body"] span'));
        this.tableBody = this.rootElement.all(by.css(`div[class='adf-datatable-body']`)).first();
        this.allColumns = this.rootElement.all(by.css('div[data-automation-id*="auto_id_entry."]'));
        this.selectedRowNumber = this.rootElement.element(by.css(`div[class*='is-selected'] div[data-automation-id*='text_']`));
        this.allSelectedRows = this.rootElement.all(by.css(`div[class*='is-selected']`));
        this.selectAll = this.rootElement.element(by.css(`div[class*='adf-datatable-header'] mat-checkbox`));
        this.copyColumnTooltip = this.rootElement.element(by.css(`adf-copy-content-tooltip span`));
    }

    async checkAllRowsButtonIsDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.selectAll);
    }

    async checkAllRows(): Promise<void> {
        await BrowserActions.click(this.selectAll);
        await BrowserVisibility.waitUntilElementIsVisible(this.selectAll.element(by.css('input[aria-checked="true"]')));
    }

    async uncheckAllRows(): Promise<void> {
        await BrowserActions.click(this.selectAll);
        await BrowserVisibility.waitUntilElementIsNotVisible(this.selectAll.element(by.css('input[aria-checked="true"]')));
    }

    async clickCheckbox(columnName, columnValue): Promise<void> {
        const checkbox = this.getRowCheckbox(columnName, columnValue);
        await BrowserActions.click(checkbox);
    }

    async checkRowIsNotChecked(columnName, columnValue): Promise<void> {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.getRowCheckbox(columnName, columnValue).element(by.css('input[aria-checked="true"]')));
    }

    async checkRowIsChecked(columnName, columnValue): Promise<void> {
        const rowCheckbox = this.getRowCheckbox(columnName, columnValue);
        await BrowserVisibility.waitUntilElementIsVisible(rowCheckbox.element(by.css('input[aria-checked="true"]')));
    }

    getRowCheckbox(columnName, columnValue): ElementFinder {
        return this.getRow(columnName, columnValue).element(by.css('mat-checkbox'));
    }

    async checkNoRowIsSelected(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.selectedRowNumber);
    }

    async getNumberOfSelectedRows(): Promise<number> {
        return await this.allSelectedRows.count();
    }

    async selectRow(columnName, columnValue): Promise<void> {
        await BrowserActions.closeMenuAndDialogs();
        const row = this.getRow(columnName, columnValue);
        await BrowserActions.click(row);
    }

    async selectRowWithKeyboard(columnName, columnValue): Promise<void> {
        await browser.actions().sendKeys(protractor.Key.COMMAND).perform();
        await this.selectRow(columnName, columnValue);
        await browser.actions().sendKeys(protractor.Key.NULL).perform();
    }

    async checkRowIsSelected(columnName, columnValue): Promise<void> {
        const selectedRow = this.getCellElementByValue(columnName, columnValue).element(by.xpath(`ancestor::div[contains(@class, 'is-selected')]`));
        await BrowserVisibility.waitUntilElementIsVisible(selectedRow);
    }

    async checkRowIsNotSelected(columnName, columnValue): Promise<void> {
        const selectedRow = this.getCellElementByValue(columnName, columnValue).element(by.xpath(`ancestor::div[contains(@class, 'is-selected')]`));
        await BrowserVisibility.waitUntilElementIsNotVisible(selectedRow);
    }

    async getColumnValueForRow(identifyingColumn, identifyingValue, columnName): Promise<string> {
        const row = this.getRow(identifyingColumn, identifyingValue);
        await BrowserVisibility.waitUntilElementIsVisible(row);
        const rowColumn = row.element(by.css(`div[title="${columnName}"] span`));
        return await BrowserActions.getText(rowColumn);
    }

    /**
     * Check the list is sorted.
     *
     * @param sortOrder: 'ASC' if the list is await expected to be sorted ascending and 'DESC' for descending
     * @param columnTitle: titleColumn column
     * @return 'true' if the list is sorted as await expected and 'false' if it isn't
     */
    async checkListIsSorted(sortOrder: string, columnTitle: string): Promise<any> {
        const column = element.all(by.css(`div.adf-datatable-cell[title='${columnTitle}'] span`));
        // await BrowserVisibility.waitUntilElementIsVisible(column.first());
        const initialList = [];
        await column.each(async (currentElement) => {
            const text = await BrowserActions.getText(currentElement);
            if (text.length !== 0) {
                initialList.push(text.toLowerCase());
            }
        });
        let sortedList = initialList;
        sortedList = sortedList.sort();
        if (sortOrder.toLocaleLowerCase() === 'desc') {
            sortedList = sortedList.reverse();
        }
        return initialList.toString() === sortedList.toString();
    }

    async rightClickOnRow(columnName, columnValue): Promise<void> {
        const row = this.getRow(columnName, columnValue);
        await browser.actions().mouseMove(row).perform();
        await browser.actions().click(row, protractor.Button.RIGHT).perform();
        await BrowserVisibility.waitUntilElementIsVisible(element(by.id('adf-context-menu-content')));
    }

    async getTooltip(columnName, columnValue): Promise<string> {
        return await this.getCellElementByValue(columnName, columnValue).getAttribute('title');
    }

    async rightClickOnRowByIndex(index: number): Promise<void> {
        const row = this.getRowByIndex(index);
        await BrowserActions.rightClick(row);
        await BrowserVisibility.waitUntilElementIsVisible(element(by.id('adf-context-menu-content')));
    }

    getFileHyperlink(filename): ElementFinder {
        return element(by.cssContainingText('adf-name-column[class*="adf-datatable-link"] span', filename));
    }

    async numberOfRows(): Promise<number> {
        return await this.rootElement.all(this.rows).count();
    }

    async getAllRowsColumnValues(column) {
        const columnLocator = by.css("adf-datatable div[class*='adf-datatable-body'] div[class*='adf-datatable-row'] div[title='" + column + "'] span");
        await BrowserVisibility.waitUntilElementIsPresent(element.all(columnLocator).first());
        return await element.all(columnLocator)
            .filter(async (el) => await el.isPresent())
            .map(async (el) => await el.getText());
    }

    async getRowsWithSameColumnValues(columnName, columnValue) {
        const columnLocator = by.css(`div[title='${columnName}'] div[data-automation-id="text_${columnValue}"] span`);
        await BrowserVisibility.waitUntilElementIsVisible(this.rootElement.all(columnLocator).first());
        return this.rootElement.all(columnLocator).getText();
    }

    async doubleClickRow(columnName: string, columnValue: string): Promise<void> {
        const row = this.getRow(columnName, columnValue);
        await BrowserActions.click(row);
        await browser.actions().sendKeys(protractor.Key.ENTER).perform();
    }

    async waitForTableBody(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.tableBody);
    }

    async getFirstElementDetail(detail): Promise<string> {
        const firstNode = element.all(by.css(`adf-datatable div[title="${detail}"] span`)).first();
        return await BrowserActions.getText(firstNode);
    }

    geCellElementDetail(detail): ElementArrayFinder {
        return element.all(by.css(`adf-datatable div[title="${detail}"] span`));
    }

    /**
     *  Sort the list by name column.
     *
     * @param sortOrder : 'ASC' to sort the list ascendant and 'DESC' for descendant
     */
    async sortByColumn(sortOrder: string, titleColumn: string): Promise<void> {
        const locator = by.css(`div[data-automation-id="auto_id_${titleColumn}"]`);
        await BrowserVisibility.waitUntilElementIsVisible(element(locator));
        const result = await element(locator).getAttribute('class');
        if (sortOrder.toLocaleLowerCase() === 'asc') {
            if (!result.includes('sorted-asc')) {
                if (result.includes('sorted-desc') || result.includes('sortable')) {
                    await BrowserActions.click(element(locator));
                }
            }
        } else {
            if (result.includes('sorted-asc')) {
                await BrowserActions.click(element(locator));
            } else if (result.includes('sortable')) {
                await BrowserActions.click(element(locator));
                await BrowserActions.click(element(locator));
            }
        }
    }

    async checkContentIsDisplayed(columnName, columnValue): Promise<void> {
        const row = this.getCellElementByValue(columnName, columnValue);
        await BrowserVisibility.waitUntilElementIsVisible(row);
    }

    async checkContentIsNotDisplayed(columnName, columnValue): Promise<void> {
        const row = this.getCellElementByValue(columnName, columnValue);
        await BrowserVisibility.waitUntilElementIsNotVisible(row);
    }

    getRow(columnName, columnValue): ElementFinder {
        return this.rootElement.all(by.css(`div[title="${columnName}"] div[data-automation-id="text_${columnValue}"]`)).first()
            .element(by.xpath(`ancestor::div[contains(@class, 'adf-datatable-row')]`));
    }

    getRowByIndex(index: number): ElementFinder {
        return this.rootElement.element(by.xpath(`//div[contains(@class,'adf-datatable-body')]//div[contains(@class,'adf-datatable-row')][${index}]`));
    }

    async contentInPosition(position): Promise<string> {
        await BrowserVisibility.waitUntilElementIsVisible(this.contents.first());
        return await BrowserActions.getText(this.contents.get(position - 1));
    }

    getCellElementByValue(columnName, columnValue): ElementFinder {
        return this.rootElement.all(by.css(`div[title="${columnName}"] div[data-automation-id="text_${columnValue}"] span`)).first();
    }

    async tableIsLoaded(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.rootElement);
    }

    async waitTillContentLoaded(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(this.contents.first());
    }

    async checkColumnIsDisplayed(column): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(element(by.css(`div[data-automation-id="auto_id_entry.${column}"]`)));
    }

    async getNumberOfColumns(): Promise<number> {
        return await this.allColumns.count();
    }

    async getNumberOfRows(): Promise<number> {
        return await this.list.count();
    }

    getCellByRowNumberAndColumnName(rowNumber, columnName): ElementFinder {
        return this.list.get(rowNumber).all(by.css(`div[title="${columnName}"] span`)).first();
    }

    getCellByRowContentAndColumn(rowColumn, rowContent, columnName): ElementFinder {
        return this.getRow(rowColumn, rowContent).element(by.css(`div[title='${columnName}']`));
    }

    async selectRowByContent(content): Promise<void> {
        const row = this.getCellByContent(content);
        await BrowserActions.click(row);
    }

    async checkRowByContentIsSelected(folderName): Promise<void> {
        const selectedRow = this.getCellByContent(folderName).element(by.xpath(`ancestor::div[contains(@class, 'is-selected')]`));
        await BrowserVisibility.waitUntilElementIsVisible(selectedRow);
    }

    async checkRowByContentIsNotSelected(folderName): Promise<void> {
        const selectedRow = this.getCellByContent(folderName).element(by.xpath(`ancestor::div[contains(@class, 'is-selected')]`));
        await BrowserVisibility.waitUntilElementIsNotVisible(selectedRow);
    }

    getCellByContent(content) {
        return this.rootElement.all(by.cssContainingText(`div[class*='adf-datatable-row'] div[class*='adf-datatable-cell']`, content)).first();
    }

    async checkCellByHighlightContent(content) {
        const cell = this.rootElement.element(by.cssContainingText(`div[class*='adf-datatable-row'] div[class*='adf-name-location-cell-name'] span.adf-highlight`, content));
        await BrowserVisibility.waitUntilElementIsVisible(cell);
    }

    async clickRowByContent(name): Promise<void> {
        const resultElement = this.rootElement.all(by.css(`div[data-automation-id='${name}']`)).first();
        await BrowserActions.click(resultElement);
    }

    async clickRowByContentCheckbox(name): Promise<void> {
        const resultElement = this.rootElement.all(by.css(`div[data-automation-id='${name}']`)).first().element(by.xpath(`ancestor::div/div/mat-checkbox`));
        await browser.actions().mouseMove(resultElement);
        await BrowserActions.click(resultElement);
    }

    async checkRowContentIsDisplayed(content): Promise<void> {
        const resultElement = this.rootElement.all(by.css(`div[data-automation-id='${content}']`)).first();
        await BrowserVisibility.waitUntilElementIsVisible(resultElement);
    }

    async checkRowContentIsNotDisplayed(content): Promise<void> {
        const resultElement = this.rootElement.all(by.css(`div[data-automation-id='${content}']`)).first();
        await BrowserVisibility.waitUntilElementIsNotVisible(resultElement);
    }

    async checkRowContentIsDisabled(content): Promise<void> {
        const resultElement = this.rootElement.all(by.css(`div[data-automation-id='${content}'] div.adf-cell-value img[aria-label='disable']`)).first();
        await BrowserVisibility.waitUntilElementIsVisible(resultElement);
    }

    async doubleClickRowByContent(name): Promise<void> {
        const resultElement = this.rootElement.all(by.css(`div[data-automation-id='${name}']`)).first();
        await BrowserActions.click(resultElement);
        await browser.actions().sendKeys(protractor.Key.ENTER).perform();
    }

    async getCopyContentTooltip(): Promise<string> {
        return await BrowserActions.getText(this.copyColumnTooltip);
    }

    async copyContentTooltipIsNotDisplayed(): Promise<void> {
        await BrowserVisibility.waitUntilElementIsStale(this.copyColumnTooltip);
    }

    async mouseOverColumn(columnName, columnValue): Promise<void> {
        const column = this.getCellElementByValue(columnName, columnValue);
        await this.mouseOverElement(column);
    }

    async mouseOverElement(elem): Promise<void> {
        await BrowserVisibility.waitUntilElementIsVisible(elem);
        await browser.actions().mouseMove(elem).perform();
    }

    async clickColumn(columnName, columnValue): Promise<void> {
        await BrowserActions.clickExecuteScript(`div[title="${columnName}"] div[data-automation-id="text_${columnValue}"] span`);
    }
}
