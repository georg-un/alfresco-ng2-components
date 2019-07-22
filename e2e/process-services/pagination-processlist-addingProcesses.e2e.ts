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

import { LoginPage } from '@alfresco/adf-testing';
import { PaginationPage } from '@alfresco/adf-testing';
import { ProcessFiltersPage } from '../pages/adf/process-services/processFiltersPage';
import { ProcessDetailsPage } from '../pages/adf/process-services/processDetailsPage';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';

import resources = require('../util/resources');

import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { AppsActions } from '../actions/APS/apps.actions';
import { UsersActions } from '../actions/users.actions';
import { browser } from 'protractor';

describe('Process List - Pagination when adding processes',  () => {

    const itemsPerPage = {
        fifteen: '15',
        fifteenValue: 15
    };

    const loginPage = new LoginPage();
    const paginationPage = new PaginationPage();
    const processFiltersPage = new ProcessFiltersPage();
    const processDetailsPage = new ProcessDetailsPage();

    let processUserModel;
    const app = resources.Files.SIMPLE_APP_WITH_USER_FORM;
    const nrOfProcesses = 25;
    let page, totalPages;
    let i;
    const apps = new AppsActions();
    let resultApp;

    beforeAll(async (done) => {
        const users = new UsersActions();

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: browser.params.testConfig.adf.url
        });

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);

        processUserModel = await users.createTenantAndUser(this.alfrescoJsApi);

        await this.alfrescoJsApi.login(processUserModel.email, processUserModel.password);

        resultApp = await apps.importPublishDeployApp(this.alfrescoJsApi, app.file_location);

        for (i = 0; i < (nrOfProcesses - 5); i++) {
            await apps.startProcess(this.alfrescoJsApi, resultApp);
        }

        await loginPage.loginToProcessServicesUsingUserModel(processUserModel);

        await new NavigationBarPage().navigateToProcessServicesPage().goToTaskApp().clickProcessButton();

        done();
    });

    it('[C261046] Should keep Items per page after adding processes', async () => {
        await processDetailsPage.checkProcessTitleIsDisplayed();
        await processFiltersPage.waitForTableBody();
        totalPages = 2;
        page = 1;

        paginationPage.selectItemsPerPage(itemsPerPage.fifteen);
        processDetailsPage.checkProcessTitleIsDisplayed();
        processFiltersPage.waitForTableBody();

        expect(paginationPage.getCurrentPage()).toEqual('Page ' + page);
        expect(paginationPage.getTotalPages()).toEqual('of ' + totalPages);
        expect(paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.fifteenValue * page + ' of ' + (nrOfProcesses - 5));
        expect(processFiltersPage.numberOfProcessRows()).toBe(itemsPerPage.fifteenValue);
        paginationPage.checkNextPageButtonIsEnabled();
        paginationPage.checkPreviousPageButtonIsDisabled();

        browser.controlFlow().execute(async () => {
            for (i; i < nrOfProcesses; i++) {
                await apps.startProcess(this.alfrescoJsApi, resultApp);
            }
        });

        page++;
        paginationPage.clickOnNextPage();
        processDetailsPage.checkProcessTitleIsDisplayed();
        processFiltersPage.waitForTableBody();
        expect(paginationPage.getCurrentPage()).toEqual('Page ' + page);
        expect(paginationPage.getTotalPages()).toEqual('of ' + totalPages);
        expect(paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(paginationPage.getPaginationRange()).toEqual('Showing 16-' + nrOfProcesses + ' of ' + nrOfProcesses);
        expect(processFiltersPage.numberOfProcessRows()).toBe(nrOfProcesses - itemsPerPage.fifteenValue);
        paginationPage.checkNextPageButtonIsDisabled();
        paginationPage.checkPreviousPageButtonIsEnabled();
    });
});
