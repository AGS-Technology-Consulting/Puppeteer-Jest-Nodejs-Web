/**
 * Login Tests
 * Comprehensive test suite for login functionality
 */

const puppeteer = require('puppeteer');
const LoginPage = require('../pages/LoginPage');
const logger = require('../config/logger');
const config = require('../config/config');
const apiHelper = require('../helpers/APIHelper');

describe('Login Functionality Tests', () => {
  let browser;
  let page;
  let loginPage;

  // Setup before all tests
  beforeAll(async () => {
    logger.separator();
    logger.info('🚀 Starting Test Suite: Login Functionality Tests');
    logger.separator();
    logger.info(`📅 Date: ${new Date().toLocaleString()}`);
    logger.info(`🌐 Environment: ${config.environment}`);
    logger.info(`🔗 Base URL: ${config.baseUrl}`);
    logger.separator();

    // Initialize API Helper
    await apiHelper.beforeAllTests();

    // Launch browser
    logger.info('🌐 Launching browser...');
    browser = await puppeteer.launch(config.browser);
    logger.info('✅ Browser launched successfully');
  });

  // Setup before each test
  beforeEach(async () => {
    apiHelper.markTestStart();
    
    page = await browser.newPage();
    await page.setViewport(config.browser.defaultViewport);
    loginPage = new LoginPage(page);
  });

  // Cleanup after each test
  afterEach(async () => {
    const testName = expect.getState().currentTestName;
    const testState = expect.getState();
    
    // Determine test status
    let testStatus = 'passed';
    let errorMessage = null;

    if (testState.assertionCalls === 0) {
      testStatus = 'skipped';
    } else if (testState.suppressedErrors && testState.suppressedErrors.length > 0) {
      testStatus = 'failed';
      errorMessage = testState.suppressedErrors[0].message;
    }

    // Take screenshot on failure
    if (testStatus === 'failed' && config.screenshots.onFailure) {
      try {
        const timestamp = new Date().getTime();
        const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
        const screenshotName = `FAILED_${sanitizedTestName}_${timestamp}`;
        await loginPage.takeScreenshot(screenshotName);
      } catch (error) {
        logger.error(`Failed to capture screenshot: ${error.message}`);
      }
    }

    // Report to API
    await apiHelper.afterEachTest(testName, testStatus, errorMessage);

    if (page) {
      await page.close();
    }
  });

  // Cleanup after all tests
  afterAll(async () => {
    if (browser) {
      logger.info('🔚 Closing browser...');
      await browser.close();
      logger.info('✅ Browser closed successfully');
    }

    // Update pipeline run
    await apiHelper.afterAllTests();

    logger.separator();
    logger.info('🏁 Test Suite Completed: Login Functionality Tests');
    logger.separator();
  });

  // ==================== TEST CASES ====================

  test('TC-001: Verify successful login with valid credentials', async () => {
    logger.testStart('TC-001: Successful login with valid credentials');

    const { username, password } = config.testData.validCredentials;

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Verify login page is displayed
    const isLoginFormDisplayed = await loginPage.isLoginFormDisplayed();
    expect(isLoginFormDisplayed).toBe(true);
    logger.verify('Login form is displayed');

    // Perform login
    await loginPage.login(username, password);

    // Verify successful login
    const isLoginSuccessful = await loginPage.verifySuccessfulLogin();
    expect(isLoginSuccessful).toBe(true);

    // Verify flash message
    const flashMessage = await loginPage.getFlashMessage();
    expect(flashMessage).toContain('You logged into a secure area!');
    logger.verify(`Flash message displayed: ${flashMessage}`);

    // Verify page header
    const pageHeader = await loginPage.getPageHeader();
    expect(pageHeader).toBe('Secure Area');
    logger.verify(`Page header: ${pageHeader}`);

    logger.testEnd('TC-001: Successful login with valid credentials', 'PASSED');
  });

  test('TC-002: Verify login fails with invalid username', async () => {
    logger.testStart('TC-002: Login fails with invalid username');

    const { username, password } = config.testData.invalidCredentials;

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Perform login with invalid username
    await loginPage.login(username, config.testData.validCredentials.password);

    // Verify failed login
    const isLoginFailed = await loginPage.verifyFailedLogin();
    expect(isLoginFailed).toBe(true);

    // Verify error message
    const flashMessage = await loginPage.getFlashMessage();
    expect(flashMessage).toContain('Your username is invalid!');
    logger.verify(`Error message displayed: ${flashMessage}`);

    logger.testEnd('TC-002: Login fails with invalid username', 'PASSED');
  });

  test('TC-003: Verify login fails with invalid password', async () => {
    logger.testStart('TC-003: Login fails with invalid password');

    const { password } = config.testData.invalidCredentials;

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Perform login with invalid password
    await loginPage.login(config.testData.validCredentials.username, password);

    // Verify failed login
    const isLoginFailed = await loginPage.verifyFailedLogin();
    expect(isLoginFailed).toBe(true);

    // Verify error message
    const flashMessage = await loginPage.getFlashMessage();
    expect(flashMessage).toContain('Your password is invalid!');
    logger.verify(`Error message displayed: ${flashMessage}`);

    logger.testEnd('TC-003: Login fails with invalid password', 'PASSED');
  });

  test('TC-004: Verify login fails with empty credentials', async () => {
    logger.testStart('TC-004: Login fails with empty credentials');

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Click login button without entering credentials
    await loginPage.clickLoginButton();

    // Verify failed login
    const isLoginFailed = await loginPage.verifyFailedLogin();
    expect(isLoginFailed).toBe(true);

    // Verify error message
    const flashMessage = await loginPage.getFlashMessage();
    expect(flashMessage).toContain('Your username is invalid!');
    logger.verify(`Error message displayed: ${flashMessage}`);

    logger.testEnd('TC-004: Login fails with empty credentials', 'PASSED');
  });

  test('TC-005: Verify successful logout after login', async () => {
    logger.testStart('TC-005: Successful logout after login');

    const { username, password } = config.testData.validCredentials;

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Perform login
    await loginPage.login(username, password);

    // Verify successful login
    const isLoginSuccessful = await loginPage.verifySuccessfulLogin();
    expect(isLoginSuccessful).toBe(true);

    // Perform logout
    await loginPage.logout();

    // Verify redirected to login page
    const isLoginFormDisplayed = await loginPage.isLoginFormDisplayed();
    expect(isLoginFormDisplayed).toBe(true);
    logger.verify('Redirected to login page after logout');

    // Verify logout message
    const flashMessage = await loginPage.getFlashMessage();
    expect(flashMessage).toContain('You logged out of the secure area!');
    logger.verify(`Logout message displayed: ${flashMessage}`);

    logger.testEnd('TC-005: Successful logout after login', 'PASSED');
  });

  test('TC-006: Verify login page elements are displayed', async () => {
    logger.testStart('TC-006: Login page elements validation');

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Verify page header
    const pageHeader = await loginPage.getPageHeader();
    expect(pageHeader).toBe('Login Page');
    logger.verify(`Page header: ${pageHeader}`);

    // Verify username field
    const isUsernameFieldEnabled = await loginPage.isUsernameFieldEnabled();
    expect(isUsernameFieldEnabled).toBe(true);
    logger.verify('Username field is enabled');

    // Verify password field
    const isPasswordFieldEnabled = await loginPage.isPasswordFieldEnabled();
    expect(isPasswordFieldEnabled).toBe(true);
    logger.verify('Password field is enabled');

    // Verify password field type
    const passwordFieldType = await loginPage.getPasswordFieldType();
    expect(passwordFieldType).toBe('password');
    logger.verify('Password field type is "password"');

    // Verify login button
    const isLoginButtonEnabled = await loginPage.isLoginButtonEnabled();
    expect(isLoginButtonEnabled).toBe(true);
    logger.verify('Login button is enabled');

    logger.testEnd('TC-006: Login page elements validation', 'PASSED');
  });

  test('TC-007: Verify login with username containing special characters', async () => {
    logger.testStart('TC-007: Login with special characters in username');

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Attempt login with special characters
    await loginPage.login('user@#$%', config.testData.validCredentials.password);

    // Verify failed login
    const isLoginFailed = await loginPage.verifyFailedLogin();
    expect(isLoginFailed).toBe(true);

    // Verify error message
    const flashMessage = await loginPage.getFlashMessage();
    expect(flashMessage).toContain('Your username is invalid!');
    logger.verify(`Error message displayed: ${flashMessage}`);

    logger.testEnd('TC-007: Login with special characters in username', 'PASSED');
  });

  test('TC-008: Verify case sensitivity of credentials', async () => {
    logger.testStart('TC-008: Case sensitivity of credentials');

    const { username, password } = config.testData.validCredentials;

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Attempt login with uppercase username
    await loginPage.login(username.toUpperCase(), password);

    // Verify failed login
    const isLoginFailed = await loginPage.verifyFailedLogin();
    expect(isLoginFailed).toBe(true);

    logger.verify('Login failed with uppercase username (case-sensitive)');

    logger.testEnd('TC-008: Case sensitivity of credentials', 'PASSED');
  });

  test('TC-009: Verify login form can be cleared', async () => {
    logger.testStart('TC-009: Clear login form fields');

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Enter credentials
    await loginPage.enterUsername('testuser');
    await loginPage.enterPassword('testpass');

    // Clear form
    await loginPage.clearLoginForm();

    // Verify fields are cleared (by entering new values)
    await loginPage.enterUsername('newuser');
    const usernameValue = await page.$eval('#username', el => el.value);
    expect(usernameValue).toBe('newuser');
    logger.verify('Form fields cleared successfully');

    logger.testEnd('TC-009: Clear login form fields', 'PASSED');
  });

  test('TC-010: Verify page title of login page', async () => {
    logger.testStart('TC-010: Login page title verification');

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Verify page title
    const pageTitle = await loginPage.getTitle();
    expect(pageTitle).toContain('The Internet');
    logger.verify(`Page title: ${pageTitle}`);

    logger.testEnd('TC-010: Login page title verification', 'PASSED');
  });
});
