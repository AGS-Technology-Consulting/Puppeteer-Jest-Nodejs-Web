/**
 * Jenkinsfile for Puppeteer POM Framework
 * CI/CD Pipeline Configuration
 */

pipeline {
    agent any

    environment {
        // Node.js configuration
        NODEJS_HOME = tool name: 'NodeJS-18', type: 'NodeJS'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        
        // Test configuration
        HEADLESS = 'true'
        BASE_URL = 'https://the-internet.herokuapp.com'
        
        // API Configuration (for test tracking)
        API_BASE_URL = credentials('api-base-url')
        API_TOKEN = credentials('api-token')
        ORG_ID = credentials('org-id')
        CREATED_BY = credentials('created-by')
        
        // Environment
        NODE_ENV = 'test'
        LOG_LEVEL = 'info'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '🔄 Checking out code...'
                }
                checkout scm
                script {
                    echo '✅ Code checked out successfully'
                    echo "📦 Branch: ${env.GIT_BRANCH}"
                    echo "📝 Commit: ${env.GIT_COMMIT}"
                }
            }
        }

        stage('Setup') {
            steps {
                script {
                    echo '📦 Installing dependencies...'
                }
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
                script {
                    echo '✅ Dependencies installed successfully'
                }
            }
        }

        stage('Environment Check') {
            steps {
                script {
                    echo '🔍 Checking environment...'
                }
                sh '''
                    echo "Node Version: $(node --version)"
                    echo "NPM Version: $(npm --version)"
                    echo "Puppeteer Version: $(npm list puppeteer --depth=0 | grep puppeteer)"
                    echo "Base URL: ${BASE_URL}"
                    echo "Headless Mode: ${HEADLESS}"
                '''
                script {
                    echo '✅ Environment check completed'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo '🧪 Running Puppeteer tests...'
                }
                sh '''
                    npm run test:ci
                '''
                script {
                    echo '✅ Tests executed'
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    echo '📊 Generating Allure report...'
                }
                sh '''
                    npm run allure:generate || true
                '''
                script {
                    echo '✅ Allure report generated'
                }
            }
        }

        stage('Archive Results') {
            steps {
                script {
                    echo '📦 Archiving test results...'
                }
                
                // Archive test results
                archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                
                // Archive screenshots
                archiveArtifacts artifacts: 'screenshots/**/*.png', allowEmptyArchive: true
                
                // Archive logs
                archiveArtifacts artifacts: 'logs/**/*.log', allowEmptyArchive: true
                
                // Archive Allure results
                archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
                
                script {
                    echo '✅ Results archived successfully'
                }
            }
        }

        stage('Publish Allure Report') {
            steps {
                script {
                    echo '📈 Publishing Allure report...'
                }
                allure([
                    includeProperties: false,
                    jdk: '',
                    properties: [],
                    reportBuildPolicy: 'ALWAYS',
                    results: [[path: 'allure-results']]
                ])
                script {
                    echo '✅ Allure report published'
                }
            }
        }

        stage('Publish Test Results') {
            steps {
                script {
                    echo '📋 Publishing test results...'
                }
                junit testResults: 'test-results/*.xml', allowEmptyResults: true
                script {
                    echo '✅ Test results published'
                }
            }
        }
    }

    post {
        always {
            script {
                echo '🧹 Cleaning up...'
            }
            
            // Clean workspace
            cleanWs(
                deleteDirs: true,
                patterns: [
                    [pattern: 'node_modules', type: 'INCLUDE']
                ]
            )
            
            script {
                echo '✅ Cleanup completed'
            }
        }
        
        success {
            script {
                echo '✅ ========================================='
                echo '✅  PIPELINE COMPLETED SUCCESSFULLY'
                echo '✅ ========================================='
            }
            
            // Send success notification (optional)
            emailext (
                subject: "✅ SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <p>✅ Build Status: SUCCESS</p>
                    <p>Job: ${env.JOB_NAME}</p>
                    <p>Build Number: ${env.BUILD_NUMBER}</p>
                    <p>Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p>Allure Report: <a href="${env.BUILD_URL}allure">View Report</a></p>
                """,
                recipientProviders: [developers()],
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
            
            // Send failure notification (optional)
            emailext (
                subject: "❌ FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <p>❌ Build Status: FAILED</p>
                    <p>Job: ${env.JOB_NAME}</p>
                    <p>Build Number: ${env.BUILD_NUMBER}</p>
                    <p>Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p>Console Output: <a href="${env.BUILD_URL}console">View Console</a></p>
                    <p>Screenshots: Check archived artifacts</p>
                """,
                recipientProviders: [developers(), culprits()],
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
