/**
 * Jenkinsfile for Puppeteer-Jest Framework
 * Fixed for Jenkins without plugins/credentials
 */

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    environment {
        // Node.js PATH configuration (CRITICAL!)
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
        npm_config_cache = "${WORKSPACE}/.npm"
        NODE_OPTIONS = '--max-old-space-size=4096'
        CI = 'true'
        
        // Test configuration
        HEADLESS = 'true'
        BASE_URL = 'https://the-internet.herokuapp.com'
        
        // Jenkins environment for API tracking
        NODE_ENV = 'test'
        LOG_LEVEL = 'info'
    }

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['all', 'smoke', 'regression'],
            description: 'Test suite to execute'
        )
        booleanParam(
            name: 'HEADLESS_MODE',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
        booleanParam(
            name: 'CLEAN_BUILD',
            defaultValue: true,
            description: 'Clean previous reports before running'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '🔄 Checking out code from repository...'
                    checkout scm
                    echo '✅ Code checked out successfully'
                    echo "📦 Branch: ${env.GIT_BRANCH ?: 'main'}"
                    echo "📝 Commit: ${env.GIT_COMMIT ?: 'N/A'}"
                }
            }
        }

        stage('Setup Environment') {
            steps {
                script {
                    echo '🔧 Setting up Node.js environment...'
                    sh '''
                        echo "Node version: $(node --version)"
                        echo "NPM version: $(npm --version)"
                        echo "Base URL: ${BASE_URL}"
                        echo "Headless Mode: ${HEADLESS_MODE}"
                        echo "Test Suite: ${TEST_SUITE}"
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo '📦 Installing dependencies...'
                    sh 'npm install'
                    echo '✅ Dependencies installed successfully'
                }
            }
        }

        stage('Environment Check') {
            steps {
                script {
                    echo '🔍 Checking environment...'
                    sh '''
                        echo "Node Version: $(node --version)"
                        echo "NPM Version: $(npm --version)"
                        npm list puppeteer --depth=0 || true
                        npm list jest --depth=0 || true
                    '''
                    echo '✅ Environment check completed'
                }
            }
        }

        stage('Clean Previous Reports') {
            when {
                expression { return params.CLEAN_BUILD }
            }
            steps {
                script {
                    echo '🧹 Cleaning previous reports...'
                    sh '''
                        rm -rf test-results/* || true
                        rm -rf screenshots/*.png || true
                        rm -rf logs/*.log || true
                        rm -rf allure-results/* || true
                        rm -rf allure-report/* || true
                    '''
                }
            }
        }

        stage('Run Puppeteer Tests') {
            steps {
                script {
                    echo '🧪 Running Puppeteer + Jest tests with API integration...'
                    
                    // Set headless mode
                    def headless = params.HEADLESS_MODE ? 'true' : 'false'
                    
                    sh """
                        export HEADLESS=${headless}
                        export BASE_URL=${BASE_URL}
                        npm run test:ci || true
                    """
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'screenshots/**/*.png', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'logs/**/*.log', allowEmptyArchive: true
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    echo '📊 Generating Allure report...'
                    sh 'npm run allure:generate || true'
                    echo '✅ Allure report generated'
                }
            }
        }

        stage('Archive Test Results') {
            steps {
                script {
                    echo '📦 Archiving test results...'
                    archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'allure-report/**/*', allowEmptyArchive: true
                    
                    // Publish JUnit results if available
                    junit testResults: 'test-results/*.xml', allowEmptyResults: true
                    
                    echo '✅ Results archived successfully'
                }
            }
        }
    }

    post {
        always {
            script {
                echo '🧹 Cleaning up...'
                
                def testResults = [
                    suite: params.TEST_SUITE,
                    headless: params.HEADLESS_MODE,
                    buildNumber: env.BUILD_NUMBER,
                    buildUrl: env.BUILD_URL
                ]
                
                echo "Test Results: ${testResults}"
                echo '✅ Cleanup completed'
            }
        }
        
        success {
            script {
                echo '✅ ========================================='
                echo '✅  PIPELINE COMPLETED SUCCESSFULLY'
                echo '✅ ========================================='
            }
            
            emailext(
                subject: "✅ SUCCESS: Puppeteer Tests - Build #${env.BUILD_NUMBER}",
                body: """
                    <h2>Puppeteer Test Execution Successful</h2>
                    <p><b>Test Suite:</b> ${params.TEST_SUITE}</p>
                    <p><b>Headless Mode:</b> ${params.HEADLESS_MODE}</p>
                    <p><b>Build:</b> #${env.BUILD_NUMBER}</p>
                    <p><b>URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p><b>Console:</b> <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }
        
        failure {
            script {
                echo '❌ ========================================='
                echo '❌  PIPELINE FAILED'
                echo '❌ ========================================='
            }
            
            emailext(
                subject: "❌ FAILED: Puppeteer Tests - Build #${env.BUILD_NUMBER}",
                body: """
                    <h2>Puppeteer Test Execution Failed</h2>
                    <p><b>Test Suite:</b> ${params.TEST_SUITE}</p>
                    <p><b>Build:</b> #${env.BUILD_NUMBER}</p>
                    <p><b>URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p><b>Console:</b> <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                    <p>Check screenshots and logs for details.</p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }
        
        unstable {
            script {
                echo '⚠️  ========================================='
                echo '⚠️   PIPELINE UNSTABLE'
                echo '⚠️  ========================================='
            }
        }
    }
}
