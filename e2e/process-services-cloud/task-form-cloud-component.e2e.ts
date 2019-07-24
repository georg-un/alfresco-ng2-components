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
    AppListCloudPage,
    StringUtil,
    ApiService,
    LoginSSOPage,
    TasksService,
    QueryService,
    ProcessDefinitionsService,
    ProcessInstancesService,
    SettingsPage,
    TaskHeaderCloudPage,
    TaskFormCloudComponent,
    Widget
} from '@alfresco/adf-testing';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';
import { TasksCloudDemoPage } from '../pages/adf/demo-shell/process-services/tasksCloudDemoPage';

import resources = require('../util/resources');

describe('Task form cloud component',  () => {

    const loginSSOPage = new LoginSSOPage();
    const navigationBarPage = new NavigationBarPage();
    const appListCloudComponent = new AppListCloudPage();
    const tasksCloudDemoPage = new TasksCloudDemoPage();
    const taskHeaderCloudPage = new TaskHeaderCloudPage();
    const taskFormCloudComponent = new TaskFormCloudComponent();
    const settingsPage = new SettingsPage();
    const widget = new Widget();
    const formToTestValidationsKey = 'form-49904910-603c-48e9-8c8c-1d442c0fa524';

    let tasksService: TasksService;
    let processDefinitionService: ProcessDefinitionsService;
    let processInstancesService: ProcessInstancesService;
    let queryService: QueryService;

    let completedTask, createdTask, assigneeTask, toBeCompletedTask, completedProcess, claimedTask, formValidationsTask;
    const candidateBaseApp = resources.ACTIVITI7_APPS.CANDIDATE_BASE_APP.name;
    const completedTaskName = StringUtil.generateRandomString(), assignedTaskName = StringUtil.generateRandomString();

    beforeAll(async (done) => {
        const apiService = new ApiService(browser.params.config.oauth2.clientId, browser.params.config.bpmHost, browser.params.config.oauth2.host, browser.params.config.providers);
        await apiService.login(browser.params.identityUser.email, browser.params.identityUser.password);

        tasksService = new TasksService(apiService);
        queryService = new QueryService(apiService);
        createdTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), candidateBaseApp);

        assigneeTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), candidateBaseApp);
        await tasksService.claimTask(assigneeTask.entry.id, candidateBaseApp);

        formValidationsTask = await tasksService.createStandaloneTaskWithForm(StringUtil.generateRandomString(), candidateBaseApp, formToTestValidationsKey);
        await tasksService.claimTask(formValidationsTask.entry.id, candidateBaseApp);

        toBeCompletedTask = await tasksService.createStandaloneTask(StringUtil.generateRandomString(), candidateBaseApp);
        await tasksService.claimTask(toBeCompletedTask.entry.id, candidateBaseApp);

        completedTask = await tasksService.createStandaloneTask(assignedTaskName, candidateBaseApp);
        await tasksService.claimTask(completedTask.entry.id, candidateBaseApp);
        await tasksService.createAndCompleteTask(completedTaskName, candidateBaseApp);

        processDefinitionService = new ProcessDefinitionsService(apiService);
        const processDefinition = await processDefinitionService
            .getProcessDefinitionByName(resources.ACTIVITI7_APPS.CANDIDATE_BASE_APP.processes.candidateUserProcess, candidateBaseApp);

        processInstancesService = new ProcessInstancesService(apiService);
        completedProcess = await processInstancesService.createProcessInstance(processDefinition.entry.key, candidateBaseApp);

        await browser.sleep(4000); // eventual consistency query
        const task = await queryService.getProcessInstanceTasks(completedProcess.entry.id, candidateBaseApp);
        claimedTask = await tasksService.claimTask(task.list.entries[0].entry.id, candidateBaseApp);

        await settingsPage.setProviderBpmSso(
            browser.params.config.bpmHost,
            browser.params.config.oauth2.host,
            browser.params.config.identityHost);
        await loginSSOPage.loginSSOIdentityService(browser.params.identityUser.email, browser.params.identityUser.password);
        done();
    }, 5 * 60 * 1000);

    it('[C307032] Should display the appropriate title for the unclaim option of a Task', async () => {
        await navigationBarPage.navigateToProcessServicesCloudPage();
        await appListCloudComponent.checkApsContainer();
        await appListCloudComponent.goToApp(candidateBaseApp);
        await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
        await tasksCloudDemoPage.taskListCloudComponent().selectRow(assigneeTask.entry.name);
        expect(await taskFormCloudComponent.getReleaseButtonText()).toBe('RELEASE');
    });

    it('[C310142] Empty content is displayed when having a task without form', async () => {
        await navigationBarPage.navigateToProcessServicesCloudPage();
        await appListCloudComponent.checkApsContainer();
        await appListCloudComponent.goToApp(candidateBaseApp);
        await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
        await tasksCloudDemoPage.taskListCloudComponent().selectRow(assigneeTask.entry.name);
        await taskFormCloudComponent.checkFormIsNotDisplayed();
        expect(await taskFormCloudComponent.getFormTitle()).toBe(assigneeTask.entry.name);
        await taskFormCloudComponent.checkFormContentIsEmpty();
        expect(await taskFormCloudComponent.getEmptyFormContentTitle()).toBe(`No form available`);
        expect(await taskFormCloudComponent.getEmptyFormContentSubtitle()).toBe(`Attach a form that can be viewed later`);
    });

    it('[C310199] Should not be able to complete a task when required field is empty or invalid data is added to a field', async () => {
        await navigationBarPage.navigateToProcessServicesCloudPage();
        await appListCloudComponent.checkApsContainer();
        await appListCloudComponent.goToApp(candidateBaseApp);
        await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(formValidationsTask.entry.name);
        await tasksCloudDemoPage.taskListCloudComponent().selectRow(formValidationsTask.entry.name);
        await taskFormCloudComponent.checkFormIsDisplayed();
        await taskFormCloudComponent.formFields().checkFormIsDisplayed();
        await taskFormCloudComponent.formFields().checkWidgetIsVisible('Text0tma8h');
        await taskFormCloudComponent.formFields().checkWidgetIsVisible('Date0m1moq');
        await taskFormCloudComponent.formFields().checkWidgetIsVisible('Number0klykr');
        await taskFormCloudComponent.formFields().checkWidgetIsVisible('Amount0mtp1h');

        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(false);
        await widget.textWidget().setValue('Text0tma8h', 'Some random text');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(true);

        await widget.dateWidget().setDateInput('Date0m1moq', 'invalid date');
        await widget.dateWidget().clickOutsideWidget('Date0m1moq');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(false);

        await widget.dateWidget().setDateInput('Date0m1moq', '20-10-2018');
        await widget.dateWidget().clickOutsideWidget('Date0m1moq');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(true);

        await widget.numberWidget().setFieldValue('Number0klykr', 'invalid number');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(false);

        await widget.numberWidget().setFieldValue('Number0klykr', '26');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(true);

        await widget.amountWidget().setFieldValue('Amount0mtp1h', 'invalid amount');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(false);

        await widget.amountWidget().setFieldValue('Amount0mtp1h', '660');
        expect(await(await taskFormCloudComponent.getCompleteButton()).isEnabled()).toBe(true);

    });

    describe('Complete task - cloud directive',  () => {

        beforeEach(async (done) => {
            await navigationBarPage.navigateToProcessServicesCloudPage();
            await appListCloudComponent.checkApsContainer();
            await appListCloudComponent.goToApp(candidateBaseApp);
            done();
        });

        it('[C307093] Complete button is not displayed when the task is already completed', async () => {
            await tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
            expect(await tasksCloudDemoPage.getActiveFilterName()).toBe('Completed Tasks');
            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(completedTaskName);
            await tasksCloudDemoPage.taskListCloudComponent().selectRow(completedTaskName);
            await taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            await taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });

        it('[C307095] Task can not be completed by owner user', async () => {
            await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(await tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');
            await tasksCloudDemoPage.editTaskFilterCloudComponent().clickCustomiseFilterHeader();
            await tasksCloudDemoPage.editTaskFilterCloudComponent().clearAssignee();
            await tasksCloudDemoPage.editTaskFilterCloudComponent().setStatusFilterDropDown('CREATED');

            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);
            await tasksCloudDemoPage.taskListCloudComponent().selectRow(createdTask.entry.name);
            await taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            await taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });

        it('[C307110] Task list is displayed after clicking on Cancel button', async () => {
            await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(await tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
            await tasksCloudDemoPage.taskListCloudComponent().selectRow(assigneeTask.entry.name);
            await taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            await taskFormCloudComponent.clickCancelButton();

            expect(await tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');
            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
        });

        it('[C307094] Standalone Task can be completed by a user that is owner and assignee', async () => {
            await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(await tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(toBeCompletedTask.entry.name);
            await tasksCloudDemoPage.taskListCloudComponent().selectRow(toBeCompletedTask.entry.name);
            await taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            await taskFormCloudComponent.checkCompleteButtonIsDisplayed();
            await taskFormCloudComponent.clickCompleteButton();
            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(toBeCompletedTask.entry.name);

            await tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(toBeCompletedTask.entry.name);
            await taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });

        it('[C307111] Task of a process can be completed by a user that is owner and assignee', async () => {
            await tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(await tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(claimedTask.entry.name);
            await tasksCloudDemoPage.taskListCloudComponent().selectRow(claimedTask.entry.name);
            await taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            await taskFormCloudComponent.checkCompleteButtonIsDisplayed();
            await taskFormCloudComponent.clickCompleteButton();
            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(claimedTask.entry.name);

            await tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
            await tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(claimedTask.entry.name);
            await taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });
    });

});
