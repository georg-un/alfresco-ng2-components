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
import { LoginPage, UploadActions, DataTableComponentPage } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { ViewerPage } from '../../pages/adf/viewerPage';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import resources = require('../../util/resources');
import { FileModel } from '../../models/ACS/fileModel';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';

describe('Viewer - properties',  () => {

    const acsUser = new AcsUserModel();
    const viewerPage = new ViewerPage();
    const contentServicesPage = new ContentServicesPage();
    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    const dataTable = new DataTableComponentPage();

    const pngFile = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });

    const fileForOverlay = new FileModel({
        'name': 'fileForOverlay.png',
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });
    this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: browser.params.testConfig.adf.url
        });
    const uploadActions = new UploadActions(this.alfrescoJsApi);

    beforeAll(async (done) => {
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        let pngFileUploaded = await uploadActions.uploadFile(pngFile.location, pngFile.name, '-my-');
        Object.assign(pngFile, pngFileUploaded.entry);

        pngFileUploaded = await uploadActions.uploadFile(fileForOverlay.location, fileForOverlay.name, '-my-');
        Object.assign(fileForOverlay, pngFileUploaded.entry);

        await loginPage.loginToContentServicesUsingUserModel(acsUser);

        contentServicesPage.goToDocumentList();

        contentServicesPage.checkAcsContainer();

        viewerPage.viewFile(pngFile.name);

        viewerPage.clickLeftSidebarButton();
        viewerPage.checkLeftSideBarIsDisplayed();

        done();
    });

    afterAll(async (done) => {
        await uploadActions.deleteFileOrFolder(pngFile.getId());

        done();
    });

    it('[C260066] Should Show/Hide viewer toolbar when showToolbar is true/false', async () => {
        viewerPage.checkToolbarIsDisplayed();
        viewerPage.disableToolbar();
        viewerPage.checkToolbarIsNotDisplayed();
        viewerPage.enableToolbar();
    });

    it('[C260076] Should Show/Hide back button when allowGoBack is true/false', async () => {
        viewerPage.checkGoBackIsDisplayed();
        viewerPage.disableGoBack();
        viewerPage.checkGoBackIsNotDisplayed();
        viewerPage.enableGoBack();
    });

    it('[C260077] Should Show toolbar options dropdown when adf-viewer-open-with directive is used', async () => {
        viewerPage.checkToolbarOptionsIsNotDisplayed();
        viewerPage.enableToolbarOptions();
        viewerPage.checkToolbarOptionsIsDisplayed();
        viewerPage.disableToolbarOptions();
    });

    it('[C260079] Should Show/Hide download button when allowDownload is true/false', async () => {
        viewerPage.checkDownloadButtonDisplayed();
        viewerPage.disableDownload();
        viewerPage.checkDownloadButtonIsNotDisplayed();
        viewerPage.enableDownload();
    });

    it('[C260082] Should Show/Hide print button when allowPrint is true/false', async () => {
        viewerPage.checkPrintButtonIsDisplayed();
        viewerPage.disablePrint();
        viewerPage.checkPrintButtonIsNotDisplayed();
        viewerPage.enablePrint();
    });

    it('[C260092] Should show adf-viewer-toolbar-actions directive buttons when adf-viewer-toolbar-actions is used', async () => {
        viewerPage.checkMoreActionsDisplayed();

        viewerPage.disableMoreActions();

        viewerPage.checkMoreActionsIsNotDisplayed();

        viewerPage.enableMoreActions();
    });

    it('[C260074] Should show a custom file name when displayName property is used', async () => {
        viewerPage.checkFileNameIsDisplayed(pngFile.name);

        viewerPage.enableCustomName();

        viewerPage.enterCustomName('test custom title');
        viewerPage.checkFileNameIsDisplayed('test custom title');

        viewerPage.disableCustomName();
    });

    it('[C260090] Should showSidebar allow right info-drawer to be shown', async () => {
        viewerPage.clickToggleRightSidebar();
        viewerPage.checkInfoSideBarIsDisplayed();

        viewerPage.clickToggleRightSidebar();
        viewerPage.checkInfoSideBarIsNotDisplayed();
    });

    it('[C286442] Should showLeftSidebar allow left info-drawer to be shown', async () => {
        viewerPage.clickToggleLeftSidebar();
        viewerPage.checkLeftSideBarIsNotDisplayed();
        viewerPage.clickLeftSidebarButton();
        viewerPage.checkLeftSideBarIsDisplayed();
    });

    it('[C260089] Should Show/Hide info-drawer if allowSidebar true/false', async () => {
        viewerPage.clickInfoButton();

        viewerPage.checkInfoSideBarIsDisplayed();
        viewerPage.checkInfoButtonIsDisplayed();

        viewerPage.disableAllowSidebar();

        viewerPage.checkInfoButtonIsNotDisplayed();
        viewerPage.checkInfoSideBarIsNotDisplayed();
    });

    it('[C286596] Should Show/Hide left info-drawer if allowLeftSidebar true/false', async () => {
        viewerPage.checkLeftSideBarIsDisplayed();
        viewerPage.checkLeftSideBarButtonIsDisplayed();

        viewerPage.disableAllowLeftSidebar();

        viewerPage.checkLeftSideBarButtonIsNotDisplayed();
        viewerPage.checkLeftSideBarIsNotDisplayed();
    });

    it('[C260100] Should be possible to disable Overlay viewer', async () => {
        viewerPage.clickCloseButton();
        navigationBarPage.scrollTo(navigationBarPage.overlayViewerButton);
        navigationBarPage.clickOverlayViewerButton();

        dataTable.doubleClickRow('Name', fileForOverlay.name);
        viewerPage.checkOverlayViewerIsDisplayed();
        viewerPage.clickCloseButton();
        dataTable.doubleClickRow('Name', pngFile.name);
        viewerPage.checkOverlayViewerIsDisplayed();
        viewerPage.clickCloseButton();

        viewerPage.disableOverlay();
        dataTable.doubleClickRow('Name', fileForOverlay.name);
        viewerPage.checkImgContainerIsDisplayed();
        viewerPage.checkInlineViewerIsDisplayed();
        dataTable.doubleClickRow('Name', pngFile.name);
        viewerPage.checkImgContainerIsDisplayed();
        viewerPage.checkInlineViewerIsDisplayed();
    });
});
