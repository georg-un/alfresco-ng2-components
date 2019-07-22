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

import { browser } from 'protractor';
import {
    LoginPage,
    UploadActions,
    StringUtil,
    ContentNodeSelectorDialogPage,
    NotificationHistoryPage, BrowserActions
} from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import resources = require('../../util/resources');
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { FileModel } from '../../models/ACS/fileModel';

describe('Document List Component',  () => {

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const navigationBarPage = new NavigationBarPage();
    const contentNodeSelector = new ContentNodeSelectorDialogPage();
    const notificationHistoryPage = new NotificationHistoryPage();

    this.alfrescoJsApi = new AlfrescoApi({
        provider: 'ECM',
        hostEcm: browser.params.testConfig.adf.url
    });
    const uploadActions = new UploadActions(this.alfrescoJsApi);

    let uploadedFolder, uploadedFile, sourceFolder, destinationFolder, subFolder, subFolder2, copyFolder, subFile, duplicateFolderName;
    let acsUser = null, anotherAcsUser: AcsUserModel;
    let folderName, sameNameFolder;

    const pdfFileModel = new FileModel({
        name: resources.Files.ADF_DOCUMENTS.PDF.file_name,
        location: resources.Files.ADF_DOCUMENTS.PDF.file_location
    });

    const testFileModel = new FileModel({
        name: resources.Files.ADF_DOCUMENTS.TEST.file_name,
        location: resources.Files.ADF_DOCUMENTS.TEST.file_location
    });

    beforeAll(async (done) => {
        acsUser = new AcsUserModel();
        anotherAcsUser = new AcsUserModel();
        folderName = StringUtil.generateRandomString(5);
        sameNameFolder = StringUtil.generateRandomString(5);
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(anotherAcsUser);
        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);
        uploadedFolder = await uploadActions.createFolder(folderName, '-my-');
        destinationFolder = await uploadActions.createFolder(StringUtil.generateRandomString(5), '-my-');
        sourceFolder = await uploadActions.createFolder(StringUtil.generateRandomString(5), '-my-');
        subFolder = await uploadActions.createFolder(sameNameFolder, sourceFolder.entry.id);
        subFolder2 = await uploadActions.createFolder(StringUtil.generateRandomString(5), subFolder.entry.id);
        copyFolder = await uploadActions.createFolder(StringUtil.generateRandomString(5), sourceFolder.entry.id);
        duplicateFolderName = await uploadActions.createFolder(sameNameFolder, '-my-');
        subFile = await uploadActions.uploadFile(testFileModel.location, testFileModel.name, subFolder.entry.id);
        await uploadActions.uploadFile(pdfFileModel.location, pdfFileModel.name, uploadedFolder.entry.id);
        uploadedFile = await uploadActions.uploadFile(pdfFileModel.location, pdfFileModel.name, '-my-');
        await this.alfrescoJsApi.core.nodesApi.updateNode(sourceFolder.entry.id,

            {
                permissions: {
                    locallySet: [{
                        authorityId: anotherAcsUser.getId(),
                        name: 'Consumer',
                        accessStatus: 'ALLOWED'
                    }]
                }
            });

        browser.driver.sleep(10000);
        done();
    });

    afterAll(async (done) => {
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        uploadActions.deleteFileOrFolder(uploadedFolder.entry.id);
        uploadActions.deleteFileOrFolder(uploadedFile.entry.id);
        uploadActions.deleteFileOrFolder(sourceFolder.entry.id);
        uploadActions.deleteFileOrFolder(destinationFolder.entry.id);
        done();
    });

    describe('Document List Component - Actions Move and Copy',  () => {

        beforeEach(async (done) => {
            await loginPage.loginToContentServicesUsingUserModel(acsUser);
            navigationBarPage.clickContentServicesButton();
            done();
        });

        it('[C260128] Move - Same name file', async () => {
            contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            contentServicesPage.getDocumentList().rightClickOnRow(pdfFileModel.name);
            contentServicesPage.pressContextMenuActionNamed('Move');
            contentNodeSelector.checkDialogIsDisplayed();
            contentNodeSelector.typeIntoNodeSelectorSearchField(folderName);
            contentNodeSelector.clickContentNodeSelectorResult(folderName);
            contentNodeSelector.clickMoveCopyButton();
            notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260134] Move - folder with subfolder and file within it', async () => {
            contentServicesPage.checkContentIsDisplayed(destinationFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(sourceFolder.entry.name);
            contentServicesPage.getDocumentList().rightClickOnRow(sourceFolder.entry.name);
            contentServicesPage.pressContextMenuActionNamed('Move');
            contentNodeSelector.checkDialogIsDisplayed();
            contentNodeSelector.typeIntoNodeSelectorSearchField(destinationFolder.entry.name);
            contentNodeSelector.clickContentNodeSelectorResult(destinationFolder.entry.name);
            contentNodeSelector.clickMoveCopyButton();
            contentServicesPage.checkContentIsNotDisplayed(sourceFolder.entry.name);
            contentServicesPage.doubleClickRow(destinationFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(sourceFolder.entry.name);
            contentServicesPage.doubleClickRow(sourceFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(subFolder.entry.name);
            contentServicesPage.doubleClickRow(subFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(subFile.entry.name);
        });

        it('[C260135] Move - Same name folder', async () => {
            contentServicesPage.checkContentIsDisplayed(duplicateFolderName.entry.name);
            contentServicesPage.getDocumentList().rightClickOnRow(duplicateFolderName.entry.name);
            contentServicesPage.pressContextMenuActionNamed('Move');
            contentNodeSelector.checkDialogIsDisplayed();
            contentNodeSelector.typeIntoNodeSelectorSearchField(sourceFolder.entry.name);
            contentNodeSelector.clickContentNodeSelectorResult(sourceFolder.entry.name);
            contentNodeSelector.clickMoveCopyButton();
            notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260129] Copy - Same name file', async () => {
            contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
            contentServicesPage.getDocumentList().rightClickOnRow(pdfFileModel.name);
            contentServicesPage.pressContextMenuActionNamed('Copy');
            contentNodeSelector.checkDialogIsDisplayed();
            contentNodeSelector.typeIntoNodeSelectorSearchField(folderName);
            contentNodeSelector.clickContentNodeSelectorResult(folderName);
            contentNodeSelector.clickMoveCopyButton();
            notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

        it('[C260136] Copy - Same name folder', async () => {
            contentServicesPage.checkContentIsDisplayed(duplicateFolderName.entry.name);
            contentServicesPage.getDocumentList().rightClickOnRow(duplicateFolderName.entry.name);
            contentServicesPage.pressContextMenuActionNamed('Copy');
            contentNodeSelector.checkDialogIsDisplayed();
            contentNodeSelector.typeIntoNodeSelectorSearchField(sourceFolder.entry.name);
            contentNodeSelector.clickContentNodeSelectorResult(sourceFolder.entry.name);
            contentNodeSelector.clickMoveCopyButton();
            notificationHistoryPage.checkNotifyContains('This name is already in use, try a different name.');
        });

    });

    describe('Document List actionns - Move, Copy on no permission folder',  () => {

        beforeAll((done) => {
            loginPage.loginToContentServicesUsingUserModel(anotherAcsUser);
            BrowserActions.getUrl(browser.params.testConfig.adf.url + '/files/' + sourceFolder.entry.id);
            contentServicesPage.getDocumentList().dataTablePage().waitTillContentLoaded();
            done();
        });

        it('[C260133] Move - no permission folder', async () => {
            contentServicesPage.checkContentIsDisplayed(subFolder.entry.name);
            contentServicesPage.getDocumentList().rightClickOnRow(subFolder.entry.name);
            contentServicesPage.checkContextActionIsVisible('Move');
            expect(contentServicesPage.checkContentActionIsEnabled('Move')).toBe(false);
            contentServicesPage.closeActionContext();
        });

        it('[C260140] Copy - No permission folder', async () => {
            contentServicesPage.checkContentIsDisplayed(subFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(copyFolder.entry.name);
            contentServicesPage.getDocumentList().rightClickOnRow(copyFolder.entry.name);
            contentServicesPage.checkContextActionIsVisible('Copy');
            expect(contentServicesPage.checkContentActionIsEnabled('Copy')).toBe(true);
            contentServicesPage.pressContextMenuActionNamed('Copy');
            contentNodeSelector.checkDialogIsDisplayed();
            contentNodeSelector.contentListPage().dataTablePage().checkRowContentIsDisplayed(subFolder.entry.name);
            contentNodeSelector.contentListPage().dataTablePage().checkRowContentIsDisabled(subFolder.entry.name);
            contentNodeSelector.clickContentNodeSelectorResult(subFolder.entry.name);
            contentNodeSelector.contentListPage().dataTablePage().checkRowByContentIsSelected(subFolder.entry.name);
            expect(contentNodeSelector.checkCopyMoveButtonIsEnabled()).toBe(false);
            contentNodeSelector.contentListPage().dataTablePage().doubleClickRowByContent(subFolder.entry.name);
            contentNodeSelector.contentListPage().dataTablePage().waitTillContentLoaded();
            contentNodeSelector.contentListPage().dataTablePage().checkRowContentIsDisplayed(subFolder2.entry.name);
        });

    });

});
