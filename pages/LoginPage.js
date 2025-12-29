/**
 * Login Page Object
 * Page object for login functionality
 */

const BasePage = require('./BasePage');
const logger = require('../config/logger');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Selectors
    this.selectors = {
      usernameInput: '#username',
      passwordInput: '#password',
      loginButton: 'button[type="submit"]',
      flashMessage: '#flash',
      successMessage: '.flash.success',
      errorMessage: '.flash.error',
      logoutButton: 'a[href="/logout"]',
      pageHeader: 'h2',
      loginForm: '#login'
    };

    // URLs
    this.loginUrl = `${this.config.baseUrl}/login`;
    this.secureAreaUrl = `${this.config.baseUrl}/secure`;
  }

  /**
   * Navigate to login page
   */
  async navigateToLoginPage() {
    logger.step('Navigating to login page');
    await this.navigateTo(this.loginUrl);
    await this.waitForElement(this.selectors.loginForm);
    logger.verify('Login page loaded successfully');
  }

  /**
   * Enter username
   * @param {string} username - Username to enter
   */
  async enterUsername(username) {
    logger.step(`Entering username: ${username}`);
    await this.type(this.selectors.usernameInput, username);
  }

  /**
   * Enter password
   * @param {string} password - Password to enter
   */
  async enterPassword(password) {
    logger.step('Entering password');
    await this.type(this.selectors.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton() {
    logger.step('Clicking login button');
    await this.click(this.selectors.loginButton);
    await this.wait(1000); // Wait for page transition
  }

  /**
   * Perform login
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    logger.step(`Performing login with username: ${username}`);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Get flash message text
   * @returns {Promise<string>} Flash message text
   */
  async getFlashMessage() {
    logger.step('Getting flash message');
    await this.waitForElement(this.selectors.flashMessage);
    const message = await this.getText(this.selectors.flashMessage);
    
    // Remove the × character
    return message.replace('×', '').trim();
  }

  /**
   * Check if success message is displayed
   * @returns {Promise<boolean>} True if success message is visible
   */
  async isSuccessMessageDisplayed() {
    logger.step('Checking for success message');
    return await this.isVisible(this.selectors.successMessage);
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>} True if error message is visible
   */
  async isErrorMessageDisplayed() {
    logger.step('Checking for error message');
    return await this.isVisible(this.selectors.errorMessage);
  }

  /**
   * Check if logout button is displayed
   * @returns {Promise<boolean>} True if logout button is visible
   */
  async isLogoutButtonDisplayed() {
    logger.step('Checking for logout button');
    return await this.isVisible(this.selectors.logoutButton);
  }

  /**
   * Get page header text
   * @returns {Promise<string>} Page header text
   */
  async getPageHeader() {
    logger.step('Getting page header');
    return await this.getText(this.selectors.pageHeader);
  }

  /**
   * Click logout button
   */
  async logout() {
    logger.step('Clicking logout button');
    await this.click(this.selectors.logoutButton);
    await this.wait(1000);
  }

  /**
   * Verify successful login
   * @returns {Promise<boolean>} True if login was successful
   */
  async verifySuccessfulLogin() {
    logger.verify('Verifying successful login');
    
    // Check if we're on secure area
    const currentUrl = await this.getCurrentUrl();
    const isOnSecureArea = currentUrl.includes('/secure');
    
    // Check if success message is displayed
    const hasSuccessMessage = await this.isSuccessMessageDisplayed();
    
    // Check if logout button is displayed
    const hasLogoutButton = await this.isLogoutButtonDisplayed();
    
    const isSuccessful = isOnSecureArea && hasSuccessMessage && hasLogoutButton;
    
    if (isSuccessful) {
      logger.verify('Login successful - All conditions met');
    } else {
      logger.error('Login verification failed');
      logger.error(`On secure area: ${isOnSecureArea}`);
      logger.error(`Has success message: ${hasSuccessMessage}`);
      logger.error(`Has logout button: ${hasLogoutButton}`);
    }
    
    return isSuccessful;
  }

  /**
   * Verify failed login
   * @returns {Promise<boolean>} True if login failed as expected
   */
  async verifyFailedLogin() {
    logger.verify('Verifying failed login');
    
    // Check if we're still on login page
    const currentUrl = await this.getCurrentUrl();
    const isOnLoginPage = currentUrl.includes('/login');
    
    // Check if error message is displayed
    const hasErrorMessage = await this.isErrorMessageDisplayed();
    
    const isFailed = isOnLoginPage && hasErrorMessage;
    
    if (isFailed) {
      logger.verify('Login failed as expected');
    } else {
      logger.error('Login failure verification failed');
      logger.error(`On login page: ${isOnLoginPage}`);
      logger.error(`Has error message: ${hasErrorMessage}`);
    }
    
    return isFailed;
  }

  /**
   * Clear login form
   */
  async clearLoginForm() {
    logger.step('Clearing login form');
    await this.clearField(this.selectors.usernameInput);
    await this.clearField(this.selectors.passwordInput);
  }

  /**
   * Check if login form is displayed
   * @returns {Promise<boolean>} True if login form is visible
   */
  async isLoginFormDisplayed() {
    return await this.isVisible(this.selectors.loginForm);
  }

  /**
   * Get username field placeholder
   * @returns {Promise<string>} Placeholder text
   */
  async getUsernamePlaceholder() {
    return await this.getAttribute(this.selectors.usernameInput, 'placeholder');
  }

  /**
   * Get password field type
   * @returns {Promise<string>} Input type
   */
  async getPasswordFieldType() {
    return await this.getAttribute(this.selectors.passwordInput, 'type');
  }

  /**
   * Check if username field is enabled
   * @returns {Promise<boolean>} True if enabled
   */
  async isUsernameFieldEnabled() {
    const disabled = await this.getAttribute(this.selectors.usernameInput, 'disabled');
    return disabled === null;
  }

  /**
   * Check if password field is enabled
   * @returns {Promise<boolean>} True if enabled
   */
  async isPasswordFieldEnabled() {
    const disabled = await this.getAttribute(this.selectors.passwordInput, 'disabled');
    return disabled === null;
  }

  /**
   * Check if login button is enabled
   * @returns {Promise<boolean>} True if enabled
   */
  async isLoginButtonEnabled() {
    const disabled = await this.getAttribute(this.selectors.loginButton, 'disabled');
    return disabled === null;
  }
}

module.exports = LoginPage;
