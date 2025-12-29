/**
 * Jest Setup File
 * Global configurations and setup for all tests
 */

const path = require('path');
const fs = require('fs-extra');

// Ensure required directories exist
const dirs = ['screenshots', 'allure-results', 'test-results'];
dirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Set default timeout
jest.setTimeout(60000);

// Clean screenshots directory before test run
beforeAll(() => {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (fs.existsSync(screenshotsDir)) {
    const files = fs.readdirSync(screenshotsDir);
    files.forEach(file => {
      if (file.endsWith('.png')) {
        fs.unlinkSync(path.join(screenshotsDir, file));
      }
    });
  }
});
