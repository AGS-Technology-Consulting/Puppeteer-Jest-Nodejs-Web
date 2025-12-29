module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000,
  verbose: true,
  collectCoverage: false,
  maxWorkers: 1,
  bail: false,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Puppeteer Test Report',
        outputPath: 'test-results/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: 'yyyy-mm-dd HH:MM:ss'
      }
    ],
    [
      'jest-allure2-reporter',
      {
        resultsDir: 'allure-results',
        overwrite: false
      }
    ]
  ]
};
