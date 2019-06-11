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

describe('Task form cloud component', () => {

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

    let completedTask, createdTask, assigneeTask, toBeCompletedTask, completedProcess, claimedTask, formValidationsTask, formTaskId;
    const candidateBaseApp = resources.ACTIVITI7_APPS.CANDIDATE_BASE_APP.name;
    const simpleApp = resources.ACTIVITI7_APPS.SIMPLE_APP.name;
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
        let processDefinition = await processDefinitionService
            .getProcessDefinitionByName(resources.ACTIVITI7_APPS.CANDIDATE_BASE_APP.processes.candidateUserProcess, candidateBaseApp);

        processInstancesService = new ProcessInstancesService(apiService);
        completedProcess = await processInstancesService.createProcessInstance(processDefinition.entry.key, candidateBaseApp);

        await browser.driver.sleep(4000); // eventual consistency query
        const task = await queryService.getProcessInstanceTasks(completedProcess.entry.id, candidateBaseApp);
        claimedTask = await tasksService.claimTask(task.list.entries[0].entry.id, candidateBaseApp);

        processDefinition = await processDefinitionService.getProcessDefinitionByName('dropdownrestprocess', simpleApp);
        const formProcess = await processInstancesService.createProcessInstance(processDefinition.entry.key, simpleApp);
        const formTasks = await queryService.getProcessInstanceTasks(formProcess.entry.id, simpleApp);
        formTaskId = formTasks.list.entries[0].entry.id;

        await settingsPage.setProviderBpmSso(
            browser.params.config.bpmHost,
            browser.params.config.oauth2.host,
            browser.params.config.identityHost);
        loginSSOPage.loginSSOIdentityService(browser.params.identityUser.email, browser.params.identityUser.password);
        done();
    }, 5 * 60 * 1000);

    beforeEach(() => {
        navigationBarPage.navigateToProcessServicesCloudPage();
        appListCloudComponent.checkApsContainer();
    });

    it('[C307032] Should display the appropriate title for the unclaim option of a Task', async () => {
        appListCloudComponent.goToApp(candidateBaseApp);
        tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
        tasksCloudDemoPage.taskListCloudComponent().selectRowByName(assigneeTask.entry.name);
        expect(taskFormCloudComponent.getReleaseButtonText()).toBe('RELEASE');
    });

    it('[C310366] Should refresh buttons and form after an action is complete', () => {
        appListCloudComponent.goToApp(simpleApp);
        tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');
        tasksCloudDemoPage.editTaskFilterCloudComponent().clickCustomiseFilterHeader().clearAssignee().setStatusFilterDropDown('CREATED');

        tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedById(formTaskId);
        tasksCloudDemoPage.taskListCloudComponent().selectRowByTaskId(formTaskId);

        taskFormCloudComponent.checkFormIsReadOnly();
        taskFormCloudComponent.checkClaimButtonIsDisplayed();
        taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        taskFormCloudComponent.checkReleaseButtonIsNotDisplayed();

        taskFormCloudComponent.clickClaimButton();
        taskFormCloudComponent.checkFormIsDisplayed();

        taskFormCloudComponent.checkFormIsNotReadOnly();
        taskFormCloudComponent.checkClaimButtonIsNotDisplayed();
        taskFormCloudComponent.checkCompleteButtonIsDisplayed();
        taskFormCloudComponent.checkReleaseButtonIsDisplayed();

        taskFormCloudComponent.clickCompleteButton();
        tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
        tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedById(formTaskId);
        tasksCloudDemoPage.taskListCloudComponent().selectRowByTaskId(formTaskId);

        taskFormCloudComponent.checkFormIsReadOnly();
        taskFormCloudComponent.checkClaimButtonIsNotDisplayed();
        taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        taskFormCloudComponent.checkReleaseButtonIsNotDisplayed();
        taskFormCloudComponent.checkCancelButtonIsDisplayed();
    });

    it('[C310142] Empty content is displayed when having a task without form', async () => {
        appListCloudComponent.goToApp(candidateBaseApp);
        tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
        tasksCloudDemoPage.taskListCloudComponent().selectRowByName(assigneeTask.entry.name);
        taskFormCloudComponent.checkFormIsNotDisplayed();
        expect(taskFormCloudComponent.getFormTitle()).toBe(assigneeTask.entry.name);
        taskFormCloudComponent.checkFormContentIsEmpty();
        expect(taskFormCloudComponent.getEmptyFormContentTitle()).toBe(`No form available`);
        expect(taskFormCloudComponent.getEmptyFormContentSubtitle()).toBe(`Attach a form that can be viewed later`);
    });

    it('[C310199] Should not be able to complete a task when required field is empty or invalid data is added to a field', async () => {
        appListCloudComponent.goToApp(candidateBaseApp);
        tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
        tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(formValidationsTask.entry.name);
        tasksCloudDemoPage.taskListCloudComponent().selectRowByName(formValidationsTask.entry.name);
        taskFormCloudComponent.checkFormIsDisplayed();
        taskFormCloudComponent.formFields().checkFormIsDisplayed();
        taskFormCloudComponent.formFields().checkWidgetIsVisible('Text0tma8h');
        taskFormCloudComponent.formFields().checkWidgetIsVisible('Date0m1moq');
        taskFormCloudComponent.formFields().checkWidgetIsVisible('Number0klykr');
        taskFormCloudComponent.formFields().checkWidgetIsVisible('Amount0mtp1h');

        expect(taskFormCloudComponent.isCompleteButtonDisabled()).toBe(true, 'Complete Button should be disabled');
        widget.textWidget().setValue('Text0tma8h', 'Some random text');
        expect(taskFormCloudComponent.isCompleteButtonEnabled()).toBe(true, 'Complete Button should be enabled');

        widget.dateWidget().setDateInput('Date0m1moq', 'invalid date');
        expect(taskFormCloudComponent.isCompleteButtonDisabled()).toBe(true, 'Complete Button should be disabled');

        widget.dateWidget().setDateInput('Date0m1moq', '20-10-2018');
        expect(taskFormCloudComponent.isCompleteButtonEnabled()).toBe(true, 'Complete Button should be enabled');

        widget.numberWidget().setFieldValue('Number0klykr', 'invalid number');
        expect(taskFormCloudComponent.isCompleteButtonDisabled()).toBe(true, 'Complete Button should be disabled');

        widget.numberWidget().setFieldValue('Number0klykr', '26');
        expect(taskFormCloudComponent.isCompleteButtonEnabled()).toBe(true, 'Complete Button should be enabled');

        widget.amountWidget().setFieldValue('Amount0mtp1h', 'invalid amount');
        expect(taskFormCloudComponent.isCompleteButtonDisabled()).toBe(true, 'Complete Button should be disabled');

        widget.amountWidget().setFieldValue('Amount0mtp1h', '660');
        expect(taskFormCloudComponent.isCompleteButtonEnabled()).toBe(true, 'Complete Button should be enabled');

    });

    describe('Complete task - cloud directive', () => {

        beforeEach((done) => {
            appListCloudComponent.goToApp(candidateBaseApp);
            done();
        });

        it('[C307093] Complete button is not displayed when the task is already completed', () => {
            tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('Completed Tasks');
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(completedTaskName);
            tasksCloudDemoPage.taskListCloudComponent().selectRowByName(completedTaskName);
            taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });

        it('[C307095] Task can not be completed by owner user', () => {
            tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');
            tasksCloudDemoPage.editTaskFilterCloudComponent().clickCustomiseFilterHeader().clearAssignee().setStatusFilterDropDown('CREATED');

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(createdTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().selectRowByName(createdTask.entry.name);
            taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });

        it('[C307110] Task list is displayed after clicking on Cancel button', () => {
            tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().selectRowByName(assigneeTask.entry.name);
            taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            taskFormCloudComponent.clickCancelButton();

            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(assigneeTask.entry.name);
        });

        it('[C307094] Standalone Task can be completed by a user that is owner and assignee', () => {
            tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(toBeCompletedTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().selectRowByName(toBeCompletedTask.entry.name);
            taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            taskFormCloudComponent.checkCompleteButtonIsDisplayed().clickCompleteButton();
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(toBeCompletedTask.entry.name);

            tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(toBeCompletedTask.entry.name);
            taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });

        it('[C307111] Task of a process can be completed by a user that is owner and assignee', () => {
            tasksCloudDemoPage.myTasksFilter().clickTaskFilter();
            expect(tasksCloudDemoPage.getActiveFilterName()).toBe('My Tasks');

            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(claimedTask.entry.name);
            tasksCloudDemoPage.taskListCloudComponent().selectRowByName(claimedTask.entry.name);
            taskHeaderCloudPage.checkTaskPropertyListIsDisplayed();
            taskFormCloudComponent.checkCompleteButtonIsDisplayed().clickCompleteButton();
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsNotDisplayedByName(claimedTask.entry.name);

            tasksCloudDemoPage.completedTasksFilter().clickTaskFilter();
            tasksCloudDemoPage.taskListCloudComponent().checkContentIsDisplayedByName(claimedTask.entry.name);
            taskFormCloudComponent.checkCompleteButtonIsNotDisplayed();
        });
    });

});
