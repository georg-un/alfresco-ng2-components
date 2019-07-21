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

import { FormControllersPage } from './form-controller.page';
import { browser, by, element, protractor } from 'protractor';
import { BrowserVisibility } from '../utils/browser-visibility';
import { LocalStorageUtil } from '../utils/local-storage.util';
import { BrowserActions } from '../utils/browser-actions';

export class LoginPage {

    loginURL: string = browser.baseUrl + '/login';

    formControllersPage = new FormControllersPage();
    txtUsername = element(by.css('input[id="username"]'));
    txtPassword = element(by.css('input[id="password"]'));
    logoImg = element(by.css('img[id="adf-login-img-logo"]'));
    successRouteTxt = element(
        by.css('input[data-automation-id="adf-success-route"]')
    );
    logoTxt = element(by.css('input[data-automation-id="adf-url-logo"]'));
    usernameTooltip = element(
        by.css('span[data-automation-id="username-error"]')
    );
    passwordTooltip = element(
        by.css('span[data-automation-id="password-required"]')
    );
    loginTooltip = element(by.css('span[class="adf-login-error-message"]'));
    usernameInactive = element(
        by.css('input[id="username"][aria-invalid="false"]')
    );
    passwordInactive = element(
        by.css('input[id="password"][aria-invalid="false"]')
    );
    adfLogo = element(by.css('img[class="adf-img-logo ng-star-inserted"]'));
    usernameHighlighted = element(
        by.css('input[id="username"][aria-invalid="true"]')
    );
    passwordHighlighted = element(
        by.css('input[id="password"][aria-invalid="true"]')
    );
    signInButton = element(by.id('login-button'));
    showPasswordElement = element(
        by.css('mat-icon[data-automation-id="show_password"]')
    );
    hidePasswordElement = element(
        by.css('mat-icon[data-automation-id="hide_password"]')
    );
    rememberMe = element(by.css('mat-checkbox[id="adf-login-remember"]'));
    needHelp = element(by.css('div[id="adf-login-action-left"]'));
    register = element(by.css('div[id="adf-login-action-right"]'));
    footerSwitch = element(by.id('switch4'));
    rememberMeSwitch = element(by.id('adf-toggle-show-rememberme'));
    successRouteSwitch = element(by.id('adf-toggle-show-successRoute'));
    logoSwitch = element(by.id('adf-toggle-logo'));
    header = element(by.id('adf-header'));
    settingsIcon = element(
        by.cssContainingText(
            'a[data-automation-id="settings"] mat-icon',
            'settings'
        )
    );
    sidenavLayout = element(by.css(`[data-automation-id="sidenav-layout"]`));

    async goToLoginPage() {
        browser.waitForAngularEnabled(true);
        await browser.driver.get(this.loginURL);
        return this.waitForElements();
    }

    async waitForElements() {
        await BrowserVisibility.waitUntilElementIsVisible(this.txtUsername);
        await BrowserVisibility.waitUntilElementIsVisible(this.txtPassword);
    }

    async enterUsername(username) {
        await BrowserActions.clearSendKeys(this.txtUsername, username);
    }

    async enterPassword(password) {
        await BrowserActions.clearSendKeys(this.txtPassword, password);
    }

    async clearUsername() {
        await BrowserActions.click(this.txtUsername);
        this.txtUsername.getAttribute('value').then((value) => {
            for (let i = value.length; i >= 0; i--) {
                this.txtUsername.sendKeys(protractor.Key.BACK_SPACE);
            }
        });
        return this;
    }

    async clearPassword() {
        await BrowserVisibility.waitUntilElementIsVisible(this.txtPassword);
        this.txtPassword.getAttribute('value').then((value) => {
            for (let i = value.length; i >= 0; i--) {
                this.txtPassword.sendKeys(protractor.Key.BACK_SPACE);
            }
        });
    }

    async getUsernameTooltip(): Promise<string> {
        return BrowserActions.getText(this.usernameTooltip);
    }

    async getPasswordTooltip(): Promise<string> {
        return BrowserActions.getText(this.passwordTooltip);
    }

    async getLoginError(): Promise<string> {
        return BrowserActions.getText(this.loginTooltip);
    }

    async checkLoginImgURL() {
        await BrowserVisibility.waitUntilElementIsVisible(this.logoImg);
        return this.logoImg.getAttribute('src');
    }

    async checkUsernameInactive() {
        await BrowserVisibility.waitUntilElementIsVisible(this.usernameInactive);
    }

    async checkPasswordInactive() {
        await BrowserVisibility.waitUntilElementIsVisible(this.passwordInactive);
    }

    async checkUsernameHighlighted() {
        await BrowserActions.click(this.adfLogo);
        await BrowserVisibility.waitUntilElementIsVisible(this.usernameHighlighted);
    }

    async checkPasswordHighlighted() {
        await BrowserActions.click(this.adfLogo);
        await BrowserVisibility.waitUntilElementIsVisible(this.passwordHighlighted);
    }

    async checkUsernameTooltipIsNotVisible() {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.usernameTooltip);
    }

    async checkPasswordTooltipIsNotVisible() {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.passwordTooltip);
    }

    async getSignInButtonIsEnabled() {
        await BrowserVisibility.waitUntilElementIsVisible(this.signInButton);
        return this.signInButton.isEnabled();
    }

    async loginToAllUsingUserModel(userModel) {
        await this.goToLoginPage();
        await LocalStorageUtil.clearStorage();
        await LocalStorageUtil.setStorageItem('providers', 'ALL');
        await LocalStorageUtil.apiReset();
        return this.login(userModel.email, userModel.password);
    }

    async loginToProcessServicesUsingUserModel(userModel) {
        await this.goToLoginPage();
        await LocalStorageUtil.clearStorage();
        await LocalStorageUtil.setStorageItem('providers', 'BPM');
        await LocalStorageUtil.apiReset();
        return this.login(userModel.email, userModel.password);
    }

    async loginToContentServicesUsingUserModel(userModel) {
        this.goToLoginPage();
        await LocalStorageUtil.clearStorage();
        await LocalStorageUtil.setStorageItem('providers', 'ECM');
        await LocalStorageUtil.apiReset();
        return this.login(userModel.getId(), userModel.getPassword());
    }

    async loginToContentServices(username, password) {
        this.goToLoginPage();
        await LocalStorageUtil.clearStorage();
        await LocalStorageUtil.setStorageItem('providers', 'ECM');
        await LocalStorageUtil.apiReset();
        return this.login(username, password);
    }

    async clickSignInButton() {
        await BrowserActions.click(this.signInButton);
    }

    async clickSettingsIcon() {
        await BrowserActions.click(this.settingsIcon);
    }

    async showPassword() {
        await BrowserActions.click(this.showPasswordElement);
    }

    async hidePassword() {
        await BrowserActions.click(this.hidePasswordElement);
    }

    getShownPassword() {
        return this.txtPassword.getAttribute('value');
    }

    async checkPasswordIsHidden() {
        await BrowserVisibility.waitUntilElementIsVisible(this.txtPassword);
    }

    async checkRememberIsDisplayed() {
        await BrowserVisibility.waitUntilElementIsVisible(this.rememberMe);
    }

    async checkRememberIsNotDisplayed() {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.rememberMe);
    }

    async checkNeedHelpIsDisplayed() {
        await BrowserVisibility.waitUntilElementIsVisible(this.needHelp);
    }

    async checkNeedHelpIsNotDisplayed() {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.needHelp);
    }

    async checkRegisterDisplayed() {
        await BrowserVisibility.waitUntilElementIsVisible(this.register);
    }

    async checkRegisterIsNotDisplayed() {
        await BrowserVisibility.waitUntilElementIsNotVisible(this.register);
    }

    enableFooter() {
        this.formControllersPage.enableToggle(this.footerSwitch);
    }

    disableFooter() {
        this.formControllersPage.disableToggle(this.footerSwitch);
    }

    disableRememberMe() {
        this.formControllersPage.disableToggle(this.rememberMeSwitch);
    }

    enableSuccessRouteSwitch() {
        this.formControllersPage.enableToggle(this.successRouteSwitch);
    }

    enableLogoSwitch() {
        this.formControllersPage.enableToggle(this.logoSwitch);
    }

    async enterSuccessRoute(route) {
        return BrowserActions.clearSendKeys(this.successRouteTxt, route);
    }

    async enterLogo(logo) {
        await BrowserActions.clearSendKeys(this.logoTxt, logo);
    }

    async login(username, password) {
        this.enterUsername(username);
        this.enterPassword(password);
        this.clickSignInButton();
        await BrowserVisibility.waitUntilElementIsVisible(this.sidenavLayout);
    }
}
