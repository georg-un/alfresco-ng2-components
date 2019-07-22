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

import { LoginPage, UploadActions, PaginationPage } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { FolderModel } from '../../models/ACS/folderModel';
import { Util } from '../../util/util';
import { browser } from 'protractor';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';

describe('Document List - Pagination',  () => {
    const pagination = {
        base: 'newFile',
        secondSetBase: 'secondSet',
        extension: '.txt'
    };

    const itemsPerPage = {
        five: '5',
        fiveValue: 5,
        ten: '10',
        tenValue: 10,
        fifteen: '15',
        fifteenValue: 15,
        twenty: '20',
        twentyValue: 20,
        default: '25'
    };

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const paginationPage = new PaginationPage();
    const navigationBarPage = new NavigationBarPage();

    const acsUser = new AcsUserModel();
    const newFolderModel = new FolderModel({ name: 'newFolder' });
    let fileNames = [];
    const nrOfFiles = 20;
    let currentPage = 1;
    let secondSetOfFiles = [];
    const secondSetNumber = 25;
    const folderTwoModel = new FolderModel({ name: 'folderTwo' });
    const folderThreeModel = new FolderModel({ name: 'folderThree' });
    this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: browser.params.testConfig.adf.url
        });
    const uploadActions = new UploadActions(this.alfrescoJsApi);

    beforeAll(async (done) => {
        fileNames = Util.generateSequenceFiles(10, nrOfFiles + 9, pagination.base, pagination.extension);
        secondSetOfFiles = Util.generateSequenceFiles(10, secondSetNumber + 9, pagination.secondSetBase, pagination.extension);

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        const folderThreeUploadedModel = await uploadActions.createFolder(folderThreeModel.name, '-my-');
        const newFolderUploadedModel = await uploadActions.createFolder(newFolderModel.name, '-my-');

        await uploadActions.createEmptyFiles(fileNames, newFolderUploadedModel.entry.id);

        await uploadActions.createEmptyFiles(secondSetOfFiles, folderThreeUploadedModel.entry.id);

        await loginPage.loginToContentServicesUsingUserModel(acsUser);

        done();
    });

    beforeEach(async(done) => {
        contentServicesPage.goToDocumentList();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        done();
    });

    it('[C260062] Should use default pagination settings', async () => {
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.twenty);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + nrOfFiles + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(nrOfFiles);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames)).toEqual(true);
        });
        await paginationPage.checkNextPageButtonIsDisabled();
        await paginationPage.checkPreviousPageButtonIsDisabled();
    });

    it('[C274713] Should be able to set Items per page to 20', async () => {
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        await paginationPage.selectItemsPerPage(itemsPerPage.twenty);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.twenty);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + nrOfFiles + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(nrOfFiles);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames)).toEqual(true);
        });
        await paginationPage.checkNextPageButtonIsDisabled();
        await paginationPage.checkPreviousPageButtonIsDisabled();

        await navigationBarPage.clickLogoutButton();
        await loginPage.loginToContentServicesUsingUserModel(acsUser);
        contentServicesPage.goToDocumentList();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.twenty);
        await navigationBarPage.clickLogoutButton();
        await loginPage.loginToContentServicesUsingUserModel(acsUser);
    });

    it('[C260069] Should be able to set Items per page to 5', async () => {
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        await paginationPage.selectItemsPerPage(itemsPerPage.five);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.fiveValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fiveValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(0, 5))).toEqual(true);
        });
        await paginationPage.clickOnNextPage();
        currentPage++;
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 6-' + itemsPerPage.fiveValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fiveValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(5, 10))).toEqual(true);
        });
        await paginationPage.clickOnNextPage();
        currentPage++;
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 11-' + itemsPerPage.fiveValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fiveValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(10, 15))).toEqual(true);
        });
        await paginationPage.clickOnNextPage();
        currentPage++;
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 16-' + itemsPerPage.fiveValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fiveValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(15, 20))).toEqual(true);
        });

        browser.refresh();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        await navigationBarPage.clickLogoutButton();
        await loginPage.loginToContentServicesUsingUserModel(acsUser);
    });

    it('[C260067] Should be able to set Items per page to 10', async () => {
        currentPage = 1;
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        await paginationPage.selectItemsPerPage(itemsPerPage.ten);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.ten);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.tenValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.tenValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(0, 10))).toEqual(true);
        });
        await paginationPage.clickOnNextPage();
        currentPage++;
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.ten);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 11-' + itemsPerPage.tenValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.tenValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(10, 20))).toEqual(true);
        });

        browser.refresh();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.ten);
        await navigationBarPage.clickLogoutButton();
        await loginPage.loginToContentServicesUsingUserModel(acsUser);
        currentPage = 1;
    });

    it('[C260065] Should be able to set Items per page to 15', async () => {
        currentPage = 1;
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getActiveBreadcrumb()).toEqual(newFolderModel.name);
        await paginationPage.selectItemsPerPage(itemsPerPage.fifteen);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.fifteenValue * currentPage + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fifteenValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(0, 15))).toEqual(true);
        });
        currentPage++;
        await paginationPage.clickOnNextPage();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 16-' + nrOfFiles + ' of ' + nrOfFiles);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(nrOfFiles - itemsPerPage.fifteenValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, fileNames.slice(15, 20))).toEqual(true);
        });

        browser.refresh();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
    });

    it('[C91320] Pagination should preserve sorting', async () => {
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getActiveBreadcrumb()).toEqual(newFolderModel.name);
        await paginationPage.selectItemsPerPage(itemsPerPage.twenty);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();

        expect(contentServicesPage.getDocumentList().dataTablePage().checkListIsSorted('ASC', 'Display name'));

        contentServicesPage.sortByName('DESC');
        expect(contentServicesPage.getDocumentList().dataTablePage().checkListIsSorted('DESC', 'Display name'));

        await paginationPage.selectItemsPerPage(itemsPerPage.five);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getDocumentList().dataTablePage().checkListIsSorted('DESC', 'Display name'));

        await paginationPage.clickOnNextPage();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getDocumentList().dataTablePage().checkListIsSorted('DESC', 'Display name'));

        await paginationPage.selectItemsPerPage(itemsPerPage.ten);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getDocumentList().dataTablePage().checkListIsSorted('DESC', 'Display name'));
    });

    it('[C260107] Should not display pagination bar when a folder is empty', async () => {
        await paginationPage.selectItemsPerPage(itemsPerPage.five);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        contentServicesPage.doubleClickRow(newFolderModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getActiveBreadcrumb()).toEqual(newFolderModel.name);
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        contentServicesPage.createNewFolder(folderTwoModel.name).checkContentIsDisplayed(folderTwoModel.name);
        contentServicesPage.doubleClickRow(folderTwoModel.name);
        contentServicesPage.checkPaginationIsNotDisplayed();
    });

    it('[C260071] Should be able to change pagination when having 25 files', async () => {
        currentPage = 1;
        contentServicesPage.doubleClickRow(folderThreeModel.name);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(contentServicesPage.getActiveBreadcrumb()).toEqual(folderThreeModel.name);
        await paginationPage.selectItemsPerPage(itemsPerPage.fifteen);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.fifteenValue * currentPage + ' of ' + secondSetNumber);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fifteenValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, secondSetOfFiles.slice(0, 15))).toEqual(true);
        });

        currentPage++;
        await paginationPage.clickOnNextPage();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 16-' + secondSetNumber + ' of ' + secondSetNumber);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(secondSetNumber - itemsPerPage.fifteenValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, secondSetOfFiles.slice(15, 25))).toEqual(true);
        });

        currentPage = 1;
        await paginationPage.selectItemsPerPage(itemsPerPage.twenty);
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.twenty);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.twentyValue * currentPage + ' of ' + secondSetNumber);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(itemsPerPage.twentyValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, secondSetOfFiles.slice(0, 20))).toEqual(true);
        });

        currentPage++;
        await paginationPage.clickOnNextPage();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.waitForTableBody();
        expect(await paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.twenty);
        expect(await paginationPage.getPaginationRange()).toEqual('Showing 21-' + secondSetNumber + ' of ' + secondSetNumber);
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(secondSetNumber - itemsPerPage.twentyValue);
        contentServicesPage.getAllRowsNameColumn().then(function(list) {
            expect(Util.arrayContainsArray(list, secondSetOfFiles.slice(20, 25))).toEqual(true);
        });
    });
});
