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
import { ApiService, GroupIdentityService, IdentityService, LoginSSOPage, SettingsPage } from '@alfresco/adf-testing';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';
import { TasksCloudDemoPage } from '../pages/adf/demo-shell/process-services/tasksCloudDemoPage';
import { ProcessCloudDemoPage } from '../pages/adf/demo-shell/process-services/processCloudDemoPage';
import { AppListCloudPage } from '@alfresco/adf-testing';
import resources = require('../util/resources');

describe('Edit process filters cloud', () => {

    describe('Edit process Filters', () => {
        const loginSSOPage = new LoginSSOPage();
        const navigationBarPage = new NavigationBarPage();
        const appListCloudComponent = new AppListCloudPage();
        const tasksCloudDemoPage = new TasksCloudDemoPage();
        const processCloudDemoPage = new ProcessCloudDemoPage();
        const settingsPage = new SettingsPage();

        const simpleApp = resources.ACTIVITI7_APPS.SIMPLE_APP.name;
        let identityService: IdentityService;
        let groupIdentityService: GroupIdentityService;
        let testUser, groupInfo;
        const apiService = new ApiService(browser.params.config.oauth2.clientId, browser.params.config.bpmHost, browser.params.config.oauth2.host, 'BPM');

        beforeAll(async (done) => {
            await apiService.login(browser.params.identityAdmin.email, browser.params.identityAdmin.password);
            identityService = new IdentityService(apiService);
            groupIdentityService = new GroupIdentityService(apiService);
            testUser = await identityService.createIdentityUserWithRole(apiService, [await identityService.ROLES.APS_USER]);
            groupInfo = await groupIdentityService.getGroupInfoByGroupName('hr');
            await identityService.addUserToGroup(testUser.idIdentityService, groupInfo.id);

            await settingsPage.setProviderBpmSso(
                browser.params.config.bpmHost,
                browser.params.config.oauth2.host,
                browser.params.config.identityHost);
            loginSSOPage.loginSSOIdentityService(testUser.email, testUser.password);
            done();
        });

        afterAll(async (done) => {
            await apiService.login(browser.params.identityAdmin.email, browser.params.identityAdmin.password);
            await identityService.deleteIdentityUser(testUser.idIdentityService);
            done();
        });

        beforeEach(async () => {
            await navigationBarPage.navigateToProcessServicesCloudPage();
            await appListCloudComponent.checkApsContainer();
            await appListCloudComponent.goToApp(simpleApp);
            await tasksCloudDemoPage.taskListCloudComponent().checkTaskListIsLoaded();
            await processCloudDemoPage.clickOnProcessFilters();
            const editProcessFilterCloud = await processCloudDemoPage.editProcessFilterCloudComponent();
            await editProcessFilterCloud.clickCustomiseFilterHeader();
            await editProcessFilterCloud.checkCustomiseFilterHeaderIsExpanded();
        });

        afterEach(async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();
        });

        it('[C291804] Delete Save and Save as actions should be displayed when clicking on custom filter header', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();
            expect(await processCloudDemoPage.getActiveFilterName()).toBe('All Processes');
            await processCloudDemoPage.editProcessFilterCloudComponent().checkSaveButtonIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkSaveAsButtonIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkDeleteButtonIsDisplayed();
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().checkSaveButtonIsEnabled()).toEqual(false);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().checkSaveAsButtonIsEnabled()).toEqual(false);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().checkDeleteButtonIsEnabled()).toEqual(true);
            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
        });

        it('[C291805] New process filter is added when clicking Save As button', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Id');
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();

            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().setFilterName('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnSaveButton();

            expect(await processCloudDemoPage.getActiveFilterName()).toBe('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().checkSaveButtonIsEnabled()).toEqual(false);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Id');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().checkSaveAsButtonIsEnabled()).toEqual(false);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().checkDeleteButtonIsEnabled()).toEqual(true);
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('StartDate');
            await processCloudDemoPage.customProcessFilter('custom-new').clickProcessFilter();
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Id');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickDeleteButton();
        });

        it('[C291806] Two process filters with same name can be created when clicking the Save As button', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Id');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().setFilterName('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnSaveButton();

            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkCustomiseFilterHeaderIsExpanded();

            expect(await processCloudDemoPage.getActiveFilterName()).toBe('New');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Id');
            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Name');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Name');

            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().setFilterName('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnSaveButton();

            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkCustomiseFilterHeaderIsExpanded();

            expect(await processCloudDemoPage.getActiveFilterName()).toBe('New');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Name');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickDeleteButton();
            await processCloudDemoPage.customProcessFilter('custom-new').clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkCustomiseFilterHeaderIsExpanded();

            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Id');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickDeleteButton();
        });

        it('[C291807] A process filter is overrided when clicking on save button', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Id');
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();

            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().setFilterName('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnSaveButton();

            expect(await processCloudDemoPage.getActiveFilterName()).toBe('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkCustomiseFilterHeaderIsExpanded();

            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Id');
            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Name');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Name');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveButton();

            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkCustomiseFilterHeaderIsExpanded();

            expect(await processCloudDemoPage.getActiveFilterName()).toBe('New');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Name');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickDeleteButton();
        });

        it('[C291808] A process filter is deleted when clicking on delete button', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Id');
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().setFilterName('New');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnSaveButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            expect(await processCloudDemoPage.getActiveFilterName()).toBe('New');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('Id');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickDeleteButton();
            expect(await processCloudDemoPage.getActiveFilterName()).toBe('All Processes');
            await processCloudDemoPage.customProcessFilter('New').checkProcessFilterNotDisplayed();
        });

        it('[C291810] Process filter should not be created when process filter dialog is closed', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Id');
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().setFilterName('Cancel');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().getFilterName()).toEqual('Cancel');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnCancelButton();
            await processCloudDemoPage.customProcessFilter('Cancel').checkProcessFilterNotDisplayed();
            expect(await processCloudDemoPage.getActiveFilterName()).toEqual('All Processes');
            await processCloudDemoPage.runningProcessesFilter().clickProcessFilter();
            expect(await processCloudDemoPage.getActiveFilterName()).toEqual('Running Processes');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();
            expect(await processCloudDemoPage.getActiveFilterName()).toEqual('All Processes');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('StartDate');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
        });

        it('[C291811] Save button of process filter dialog should be disabled when process name is empty', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Id');
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog();
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clearFilterName();

            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().getFilterName()).toEqual('');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().checkSaveButtonIsEnabled()).toEqual(false);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().checkCancelButtonIsEnabled()).toEqual(true);
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnCancelButton();

            await processCloudDemoPage.editProcessFilterCloudComponent().clickCustomiseFilterHeader();
            await processCloudDemoPage.editProcessFilterCloudComponent().checkCustomiseFilterHeaderIsExpanded();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('StartDate');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().getSortFilterDropDownValue()).toEqual('StartDate');
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveButton();
        });

        it('[C291809] Process filter dialog is displayed when clicking on Save As button', async () => {
            await processCloudDemoPage.allProcessesFilter().clickProcessFilter();

            await processCloudDemoPage.editProcessFilterCloudComponent().setSortFilterDropDown('Name');
            await processCloudDemoPage.allProcessesFilter().checkProcessFilterIsDisplayed();
            await processCloudDemoPage.editProcessFilterCloudComponent().clickSaveAsButton();
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().checkCancelButtonIsEnabled()).toEqual(true);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().checkSaveButtonIsEnabled()).toEqual(true);
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().getTitle()).toEqual('Save filter as');
            expect(await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().getFilterName()).toEqual('All Processes');
            await processCloudDemoPage.editProcessFilterCloudComponent().editProcessFilterDialog().clickOnCancelButton();
        });

    });

});
