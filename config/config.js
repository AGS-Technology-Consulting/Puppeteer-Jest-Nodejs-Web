/**
 * Framework Configuration
 * Central configuration for the Puppeteer automation framework
 * Updated with API Integration for Jenkins
 */

require('dotenv').config();

module.exports = {
  // Base URL for the application under test
  baseUrl: process.env.BASE_URL || 'https://the-internet.herokuapp.com',

  // Browser Configuration
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO) || 0,
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  },

  // Timeouts (in milliseconds)
  timeouts: {
    default: 30000,
    navigation: 30000,
    element: 10000,
    screenshot: 5000
  },

  // Screenshot Configuration
  screenshots: {
    enabled: true,
    onFailure: true,
    path: './screenshots',
    fullPage: true
  },

  // Test Data
  testData: {
    validCredentials: {
      username: 'tomsmith',
      password: 'SuperSecretPassword!'
    },
    invalidCredentials: {
      username: 'invaliduser',
      password: 'wrongpassword'
    }
  },

  // API Configuration (for Jenkins integration - Direct values, no credentials needed)
  api: {
    enabled: process.env.JENKINS_URL !== undefined || process.env.BUILD_NUMBER !== undefined,
    baseURL: process.env.API_BASE_URL || 'https://unsobering-maribeth-hokey.ngrok-free.dev',
    token: process.env.API_TOKEN || 'D_YIqZ4D0tYVgFTWKEaRVImEpiq3vzZkOB40lKDDSRk',
    orgId: process.env.ORG_ID || '374060a8-925c-49aa-8495-8a823949f3e0',
    createdBy: process.env.CREATED_BY || 'c9279b2d-701c-48eb-9122-fbeae465771c',
    timeout: 10000
  },

  // Jenkins Configuration
  jenkins: {
    buildNumber: process.env.BUILD_NUMBER || '',
    buildUrl: process.env.BUILD_URL || '',
    jobName: process.env.JOB_NAME || 'Puppeteer-Jest-Framework',
    gitBranch: process.env.GIT_BRANCH || process.env.BRANCH_NAME || 'main',
    gitCommit: process.env.GIT_COMMIT || '',
    triggeredBy: process.env.BUILD_USER || process.env.BUILD_USER_ID || 'jenkins',
    workspace: process.env.WORKSPACE || ''
  },

  // Environment
  environment: process.env.NODE_ENV || 'test'
};