/**
 * API Helper for Puppeteer Framework
 * Professional API integration with Jenkins for test execution tracking
 * @framework Puppeteer + Jest
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../config/logger');
const config = require('../config/config');

class APIHelper {
  constructor() {
    this.isJenkins = config.api.enabled;

    this.apiBaseURL = config.api.baseURL;
    this.apiToken = config.api.token;

    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`
    };

    this.timeout = config.api.timeout || 15000;

    this.pipelineRunId = null;
    this.startTime = null;
    this.testStartTime = null;

    this.resultsDir = path.join(process.cwd(), 'test-results');
    this.testCasesFile = path.join(this.resultsDir, '.test-cases.json');

    this.initializeResultsDirectory();
  }

  /* ────────────────────────────── */
  /* Initialization */
  /* ────────────────────────────── */

  initializeResultsDirectory() {
    try {
      fs.ensureDirSync(this.resultsDir);
    } catch (error) {
      logger.error(`❌ Failed to init results dir: ${error.message}`);
    }
  }

  /* ────────────────────────────── */
  /* Utils */
  /* ────────────────────────────── */

  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  getPipelineRunId() {
    if (!this.pipelineRunId) {
      this.pipelineRunId = process.env.PIPELINE_RUN_ID || null;
    }
    return this.pipelineRunId;
  }

  clearTestCasesFile() {
    fs.ensureDirSync(this.resultsDir);
    fs.writeJsonSync(this.testCasesFile, [], { spaces: 2 });
  }

  readTestCasesFromFile() {
    if (!fs.existsSync(this.testCasesFile)) return [];
    return fs.readJsonSync(this.testCasesFile);
  }

  saveTestCaseToFile(testCase) {
    const cases = this.readTestCasesFromFile();
    cases.push(testCase);
    fs.writeJsonSync(this.testCasesFile, cases, { spaces: 2 });
  }

  /* ────────────────────────────── */
  /* API-1 : Before All Tests */
  /* ────────────────────────────── */

  async beforeAllTests() {
    if (!this.isJenkins) return null;

    this.startTime = Date.now();
    this.clearTestCasesFile();

    logger.separator();
    logger.info('📡 API-1: Creating Pipeline Run');
    logger.separator();

    try {
      const payload = {
        name: `${config.jenkins.jobName} - Build #${config.jenkins.buildNumber}`,
        repo_name: 'Puppeteer-Jest-Web',
        environment: config.environment,
        org: config.api.orgId,
        created_by: config.api.createdBy,
        build_number: Number(config.jenkins.buildNumber) || 0,
        build_url: config.jenkins.buildUrl,
        branch: config.jenkins.gitBranch,
        git_commit: config.jenkins.gitCommit,
        status: 'running',
        start_time: this.getCurrentTimestamp()
      };

      const response = await axios.post(
        `${this.apiBaseURL}/api/pipeline-runs/`,
        payload,
        { headers: this.headers, timeout: this.timeout }
      );

      this.pipelineRunId = response.data?.pipeline_run?.run_id;

      if (!this.pipelineRunId) {
        throw new Error('pipeline_run.run_id missing');
      }

      process.env.PIPELINE_RUN_ID = this.pipelineRunId;

      logger.info(`🆔 Pipeline Run ID: ${this.pipelineRunId}`);
      logger.separator();

      return response.data;
    } catch (error) {
      logger.error(`❌ API-1 ERROR: ${error.message}`);
      return null;
    }
  }

  /* ────────────────────────────── */
  /* Test Timing */
  /* ────────────────────────────── */

  markTestStart() {
    this.testStartTime = Date.now();
  }

  /* ────────────────────────────── */
  /* API-3 : After Each Test */
  /* ────────────────────────────── */

  async afterEachTest(testTitle, testStatus, feature = 'General') {
    if (!this.isJenkins) return null;

    const pipelineRunId = this.getPipelineRunId();
    if (!pipelineRunId) return null;

    const endTime = Date.now();
    const durationMs = this.testStartTime ? endTime - this.testStartTime : 0;

    const payload = {
      run: pipelineRunId,
      name: testTitle,
      feature,
      status: testStatus,
      duration: this.formatDuration(durationMs),
      start_time: new Date(this.testStartTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      report_link: config.jenkins.buildUrl
    };

    logger.info(`📡 API-3 Payload:\n${JSON.stringify(payload, null, 2)}`);

    try {
      const response = await axios.post(
        `${this.apiBaseURL}/api/test-cases/`,
        payload,
        { headers: this.headers, timeout: this.timeout }
      );

      this.saveTestCaseToFile({
        name: testTitle,
        feature,
        status: testStatus,
        duration: payload.duration
      });

      logger.info(`✅ API-3 SUCCESS: ${testTitle}`);
      return response.data;
    } catch (error) {
      logger.error(`❌ API-3 ERROR: ${error.message}`);
      return null;
    }
  }

  /* ────────────────────────────── */
  /* API-4 : After All Tests */
  /* ────────────────────────────── */

  async afterAllTests() {
    if (!this.isJenkins) return null;

    const pipelineRunId = this.getPipelineRunId();
    if (!pipelineRunId) return null;

    logger.separator();
    logger.info('📡 API-4: Updating Pipeline Run');
    logger.separator();

    const tests = this.readTestCasesFromFile();

    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const skipped = tests.filter(t => t.status === 'skipped').length;

    const payload = {
      status: failed > 0 ? 'failed' : 'passed',
      end_time: this.getCurrentTimestamp(),
      total_tests: tests.length,
      passed,
      failed,
      aborted: skipped
    };

    try {
      const response = await axios.patch(
        `${this.apiBaseURL}/api/pipeline-runs/${pipelineRunId}/`,
        payload,
        { headers: this.headers, timeout: this.timeout }
      );

      logger.info('✅ API-4 SUCCESS: Pipeline Updated');
      logger.info(`📊 Total: ${tests.length} | ✅ ${passed} | ❌ ${failed} | ⏭️ ${skipped}`);
      logger.separator();

      return response.data;
    } catch (error) {
      logger.error(`❌ API-4 ERROR: ${error.message}`);
      return null;
    }
  }
}

module.exports = new APIHelper();
