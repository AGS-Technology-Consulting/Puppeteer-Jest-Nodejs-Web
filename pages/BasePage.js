/**
 * Base Page Object
 * Common methods for all page objects
 */

const logger = require('../config/logger');
const config = require('../config/config');
const path = require('path');
const fs = require('fs-extra');

class BasePage {
  constructor(page) {
    this.page = page;
    this.config = config;
  }

  /**
   * Navigate to URL
   * @param {string} url - URL to navigate to
   */
  async navigateTo(url) {
    logger.action(`Navigating to: ${url}`);
    await this.page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: this.config.timeouts.navigation
    });
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = this.config.timeouts.element) {
    logger.action(`Waiting for element: ${selector}`);
    await this.page.waitForSelector(selector, {
      visible: true,
      timeout: timeout
    });
  }

  /**
   * Click on element
   * @param {string} selector - CSS selector
   */
  async click(selector) {
    await this.waitForElement(selector);
    logger.action(`Clicking on: ${selector}`);
    await this.page.click(selector);
  }

  /**
   * Type text into input field
   * @param {string} selector - CSS selector
   * @param {string} text - Text to type
   * @param {boolean} clear - Clear field before typing
   */
  async type(selector, text, clear = true) {
    await this.waitForElement(selector);
    if (clear) {
      await this.page.click(selector, { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
    }
    logger.action(`Typing "${text}" into: ${selector}`);
    await this.page.type(selector, text, { delay: 50 });
  }

  /**
   * Get text content of element
   * @param {string} selector - CSS selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    await this.waitForElement(selector);
    logger.action(`Getting text from: ${selector}`);
    return await this.page.$eval(selector, el => el.textContent.trim());
  }

  /**
   * Check if element is visible
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} True if visible
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, {
        visible: true,
        timeout: 3000
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element exists
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} True if exists
   */
  async exists(selector) {
    const element = await this.page.$(selector);
    return element !== null;
  }

  /**
   * Get attribute value
   * @param {string} selector - CSS selector
   * @param {string} attribute - Attribute name
   * @returns {Promise<string>} Attribute value
   */
  async getAttribute(selector, attribute) {
    await this.waitForElement(selector);
    logger.action(`Getting attribute "${attribute}" from: ${selector}`);
    return await this.page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation() {
    logger.action('Waiting for navigation');
    await this.page.waitForNavigation({
      waitUntil: 'networkidle0',
      timeout: this.config.timeouts.navigation
    });
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Take screenshot
   * @param {string} filename - Screenshot filename
   */
  async takeScreenshot(filename) {
    const screenshotPath = path.join(
      process.cwd(),
      this.config.screenshots.path,
      `${filename}.png`
    );

    logger.action(`Taking screenshot: ${filename}`);

    // Ensure screenshots directory exists
    fs.ensureDirSync(path.dirname(screenshotPath));

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: this.config.screenshots.fullPage
    });

    logger.info(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Wait for specified time
   * @param {number} milliseconds - Time to wait in milliseconds
   */
  async wait(milliseconds) {
    logger.action(`Waiting for ${milliseconds}ms`);
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Reload page
   */
  async reload() {
    logger.action('Reloading page');
    await this.page.reload({
      waitUntil: 'networkidle0',
      timeout: this.config.timeouts.navigation
    });
  }

  /**
   * Execute JavaScript
   * @param {Function} func - Function to execute
   * @param {...any} args - Arguments to pass to function
   * @returns {Promise<any>} Result of execution
   */
  async executeScript(func, ...args) {
    logger.action('Executing JavaScript');
    return await this.page.evaluate(func, ...args);
  }

  /**
   * Scroll to element
   * @param {string} selector - CSS selector
   */
  async scrollToElement(selector) {
    await this.waitForElement(selector);
    logger.action(`Scrolling to element: ${selector}`);
    await this.page.$eval(selector, el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await this.wait(500); // Wait for smooth scroll
  }

  /**
   * Get all elements matching selector
   * @param {string} selector - CSS selector
   * @returns {Promise<Array>} Array of elements
   */
  async getAllElements(selector) {
    return await this.page.$$(selector);
  }

  /**
   * Count elements matching selector
   * @param {string} selector - CSS selector
   * @returns {Promise<number>} Number of elements
   */
  async getElementCount(selector) {
    const elements = await this.getAllElements(selector);
    return elements.length;
  }

  /**
   * Press keyboard key
   * @param {string} key - Key to press
   */
  async pressKey(key) {
    logger.action(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  /**
   * Clear input field
   * @param {string} selector - CSS selector
   */
  async clearField(selector) {
    await this.waitForElement(selector);
    logger.action(`Clearing field: ${selector}`);
    await this.page.click(selector, { clickCount: 3 });
    await this.page.keyboard.press('Backspace');
  }

  /**
   * Check if page contains text
   * @param {string} text - Text to search for
   * @returns {Promise<boolean>} True if text is found
   */
  async pageContainsText(text) {
    const bodyText = await this.page.evaluate(() => document.body.textContent);
    return bodyText.includes(text);
  }
}

module.exports = BasePage;
