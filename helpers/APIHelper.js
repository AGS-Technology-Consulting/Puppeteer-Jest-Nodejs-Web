/**
 * API Helper for Puppeteer Framework
 * Professional API integration with Jenkins for test execution tracking
 * @framework Puppeteer + Jest
 * @version 1.0.0
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');
const config = require('../config/config');

class APIHelper {
  constructor() {
    // Environment detection
    this.isJenkins = config.api.enabled;

    // API Configuration
    this.apiBaseURL = config.api.baseURL;
    this.apiToken = config.api.token;
    this.orgId = config.api.orgId;
    this.createdBy = config.api.createdBy;

    // API Headers
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    };

    // Configuration
    this.timeout = config.api.timeout;
    this.pipelineRunId = null;
    this.startTime = null;
    this.testStartTime = null;

    // Test case tracking
    this.testCasesFile = path.join(process.cwd(), 'test-results', '.test-cases.json');
    this.resultsDir = path.join(process.cwd(), 'test-results');

    // Ensure results directory exists
    this.initializeResultsDirectory();
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize results directory
   */
  initializeResultsDirectory() {
    try {
      if (!fs.existsSync(this.resultsDir)) {
        fs.mkdirSync(this.resultsDir, { recursive: true });
        logger.info('📁 Created results directory');
      }
    } catch (error) {
      logger.error(`❌ Could not create results directory: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get Jenkins metadata from environment variables
   * @returns {object} Jenkins metadata
   */
  getJenkinsMetadata() {
    return {
      buildNumber: config.jenkins.buildNumber,
      buildUrl: config.jenkins.buildUrl,
      jobName: config.jenkins.jobName,
      gitBranch: config.jenkins.gitBranch,
      gitCommit: config.jenkins.gitCommit,
      triggeredBy: config.jenkins.triggeredBy,
      workspace: config.jenkins.workspace
    };
  }

  /**
   * Get browser information
   * @returns {object} Browser details
   */
  getBrowserInfo() {
    return {
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: process.platform,
      framework: 'puppeteer'
    };
  }

  /**
   * Get Pipeline Run ID
   * @returns {string|null} Pipeline Run ID
   */
  getPipelineRunId() {
    if (!this.pipelineRunId) {
      this.pipelineRunId = process.env.PIPELINE_RUN_ID || null;
    }
    return this.pipelineRunId;
  }

  /**
   * Clear test cases file
   */
  clearTestCasesFile() {
    try {
      fs.ensureDirSync(path.dirname(this.testCasesFile));
      fs.writeJsonSync(this.testCasesFile, [], { spaces: 2 });
      logger.info('🗑️  Test cases file cleared');
    } catch (error) {
      logger.error(`⚠️  Could not clear test cases file: ${error.message}`);
    }
  }

  /**
   * Save test case to file
   * @param {string} testId - Test case ID
   * @param {string} name - Test case name
   * @param {string} status - Test status
   * @param {number} duration - Test duration in seconds
   */
  saveTestCaseToFile(testId, name, status, duration) {
    try {
      let testCases = [];
      if (fs.existsSync(this.testCasesFile)) {
        testCases = fs.readJsonSync(this.testCasesFile);
      }

      testCases.push({
        test_id: testId,
        name: name,
        status: status,
        duration: duration,
        timestamp: this.getCurrentTimestamp()
      });

      fs.writeJsonSync(this.testCasesFile, testCases, { spaces: 2 });
      logger.info(`💾 Test case saved: ${name}`);
    } catch (error) {
      logger.error(`⚠️  Could not save test case: ${error.message}`);
    }
  }

  /**
   * Read test cases from file
   * @returns {Array} Test cases array
   */
  readTestCasesFromFile() {
    try {
      if (!fs.existsSync(this.testCasesFile)) {
        logger.info('⚠️  Test cases file not found');
        return [];
      }

      const testCases = fs.readJsonSync(this.testCasesFile);
      logger.info(`📖 Read ${testCases.length} test cases from file`);
      return testCases;
    } catch (error) {
      logger.error(`⚠️  Could not read test cases file: ${error.message}`);
      return [];
    }
  }

  // ==================== API METHODS ====================

  /**
   * API-1: Initialize Pipeline Run
   * @returns {Promise<object|null>} API response data
   */
  async beforeAllTests() {
    if (!this.isJenkins) {
      logger.info('⚠️  Local run - Skipping API calls');
      return null;
    }

    this.startTime = new Date();
    this.clearTestCasesFile();

    logger.separator();
    logger.info('📡 API-1: Initializing Pipeline Run');
    logger.separator();

    try {
      const jenkinsMetadata = this.getJenkinsMetadata();
      const browserInfo = this.getBrowserInfo();
      const buildNumber = jenkinsMetadata.buildNumber || 'local';

      const payload = {
        job_name: jenkinsMetadata.jobName,
        build_number: buildNumber,
        branch: jenkinsMetadata.gitBranch,
        commit_hash: jenkinsMetadata.gitCommit,
        triggered_by: jenkinsMetadata.triggeredBy,
        start_time: this.getCurrentTimestamp(),
        status: 'running',
        environment: config.environment,
        browser: browserInfo.browserName,
        browser_version: browserInfo.browserVersion,
        platform: browserInfo.platformName,
        framework: browserInfo.framework,
        organization: this.orgId,
        created_by: this.createdBy
      };

      logger.info(`📤 API Endpoint: ${this.apiBaseURL}/api/pipeline-runs/`);
      logger.info(`📦 Payload:\n${JSON.stringify(payload, null, 2)}`);

      const response = await axios.post(
        `${this.apiBaseURL}/api/pipeline-runs/`,
        payload,
        {
          headers: this.headers,
          timeout: this.timeout
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        this.pipelineRunId = data.run_id;

        // Store in environment for worker processes
        process.env.PIPELINE_RUN_ID = this.pipelineRunId;

        logger.info('');
        logger.info('✅ API-1 SUCCESS: Pipeline Run Initialized');
        logger.subSeparator();
        logger.info(`🆔 Pipeline Run ID: ${this.pipelineRunId}`);
        logger.info(`🏗️  Build Number: ${buildNumber}`);
        logger.info(`🌿 Branch: ${jenkinsMetadata.gitBranch}`);
        logger.info(`🌐 Browser: ${browserInfo.browserName}`);
        logger.info(`👤 Triggered By: ${jenkinsMetadata.triggeredBy}`);
        logger.separator();
        logger.info('');

        return data;
      } else {
        logger.error('❌ API-1 ERROR: Unexpected Response');
        logger.error(`   Status Code: ${response.status}`);
        logger.error(`   Response: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error) {
      logger.error(`❌ API-1 ERROR: ${error.message}`);
      if (error.response) {
        logger.error(`   Status Code: ${error.response.status}`);
        logger.error(`   Response: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  /**
   * Mark the start time of a test
   */
  markTestStart() {
    this.testStartTime = new Date();
  }

  /**
   * API-3: Create Test Case
   * @param {string} testTitle - Test title
   * @param {string} testStatus - Test status (passed/failed/skipped)
   * @param {string|null} errorMessage - Error message if test failed
   * @returns {Promise<object|null>} API response data
   */
  async afterEachTest(testTitle, testStatus, errorMessage = null) {
    if (!this.isJenkins) {
      return null;
    }

    const pipelineRunId = this.getPipelineRunId();

    if (!pipelineRunId) {
      logger.error('❌ API-3 Skipped: No Pipeline Run ID available');
      return null;
    }

    // Calculate duration
    const endTime = new Date();
    const durationMs = this.testStartTime
      ? (endTime - this.testStartTime)
      : 0;
    const durationSeconds = durationMs / 1000.0;

    const statusEmoji = {
      'passed': '✅',
      'failed': '❌',
      'skipped': '⏭️'
    };

    logger.info('');
    logger.subSeparator();
    logger.info(`📡 API-3: Creating Test Case - ${statusEmoji[testStatus]} ${testTitle}`);
    logger.info(`⏱️  Duration: ${durationSeconds.toFixed(2)}s | Status: ${testStatus.toUpperCase()}`);

    try {
      const payload = {
        name: testTitle,
        status: testStatus,
        run: pipelineRunId,
        duration: parseFloat(durationSeconds.toFixed(2)),
        created_at: this.getCurrentTimestamp(),
        start_time: this.testStartTime ? this.testStartTime.toISOString() : this.getCurrentTimestamp()
      };

      if (errorMessage && testStatus === 'failed') {
        payload.error_message = errorMessage.substring(0, 500);
      }

      const response = await axios.post(
        `${this.apiBaseURL}/api/test-cases/`,
        payload,
        {
          headers: this.headers,
          timeout: this.timeout
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        const testCaseId = data.test_id || 'N/A';

        logger.info(`✅ API-3 SUCCESS: Test Case Created`);
        logger.info(`🆔 Test Case ID: ${testCaseId}`);

        this.saveTestCaseToFile(testCaseId, testTitle, testStatus, durationSeconds);

        return data;
      } else {
        logger.error(`❌ API-3 ERROR: ${response.status}`);
        logger.error(`   Response: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error) {
      logger.error(`❌ API-3 ERROR: ${error.message}`);
      if (error.response) {
        logger.error(`   Status: ${error.response.status}`);
        logger.error(`   Response: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  /**
   * API-4: Update Pipeline Run
   * @returns {Promise<object|null>} API response data
   */
  async afterAllTests() {
    if (!this.isJenkins) {
      logger.info('⚠️  Local run - Skipping API calls');
      return null;
    }

    const pipelineRunId = this.getPipelineRunId();

    if (!pipelineRunId) {
      logger.error('❌ API-4 Skipped: No Pipeline Run ID available');
      return null;
    }

    logger.info('');
    logger.separator();
    logger.info('📡 API-4: Updating Pipeline Run with Final Results');
    logger.separator();

    try {
      const testCases = this.readTestCasesFromFile();

      let finalTotal, finalPassed, finalFailed, finalSkipped;

      if (testCases.length > 0) {
        finalTotal = testCases.length;
        finalPassed = testCases.filter(tc => tc.status === 'passed').length;
        finalFailed = testCases.filter(tc => tc.status === 'failed').length;
        finalSkipped = testCases.filter(tc => tc.status === 'skipped').length;
      } else {
        finalTotal = 0;
        finalPassed = 0;
        finalFailed = 0;
        finalSkipped = 0;
      }

      const finalStatus = finalFailed === 0 ? 'passed' : 'failed';
      const endTime = new Date();
      const durationSeconds = this.startTime
        ? Math.floor((endTime - this.startTime) / 1000)
        : 0;

      const payload = {
        status: finalStatus,
        end_time: this.getCurrentTimestamp(),
        duration: durationSeconds,
        total_tests: finalTotal,
        passed: finalPassed,
        failed: finalFailed,
        aborted: finalSkipped
      };

      logger.info(`📤 API Endpoint: ${this.apiBaseURL}/api/pipeline-runs/${pipelineRunId}/`);
      logger.info(`📦 Payload:\n${JSON.stringify(payload, null, 2)}`);

      const response = await axios.patch(
        `${this.apiBaseURL}/api/pipeline-runs/${pipelineRunId}/`,
        payload,
        {
          headers: this.headers,
          timeout: this.timeout
        }
      );

      if (response.status >= 200 && response.status < 300) {
        logger.info('');
        logger.info('✅ API-4 SUCCESS: Pipeline Run Updated');
        logger.subSeparator();
        logger.info(`📊 Final Status: ${finalStatus.toUpperCase()}`);
        logger.info(`⏱️  Total Duration: ${durationSeconds}s`);
        logger.info(`📈 Test Summary:`);
        logger.info(`   Total Tests: ${finalTotal}`);
        logger.info(`   ✅ Passed: ${finalPassed}`);
        logger.info(`   ❌ Failed: ${finalFailed}`);
        logger.info(`   ⏭️  Skipped: ${finalSkipped}`);
        logger.separator();
        logger.info('');

        return response.data;
      } else {
        logger.error(`❌ API-4 ERROR: ${response.status}`);
        logger.error(`   Response: ${JSON.stringify(response.data)}`);
        return null;
      }
    } catch (error) {
      logger.error(`❌ API-4 ERROR: ${error.message}`);
      if (error.response) {
        logger.error(`   Status: ${error.response.status}`);
        logger.error(`   Response: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }
}

module.exports = new APIHelper();
