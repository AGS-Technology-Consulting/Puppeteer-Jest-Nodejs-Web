# 🎭 Puppeteer POM Framework

[![CI/CD](https://github.com/yourusername/puppeteer-pom-framework/workflows/Puppeteer%20POM%20Framework%20-%20CI%2FCD/badge.svg)](https://github.com/yourusername/puppeteer-pom-framework/actions)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Puppeteer](https://img.shields.io/badge/puppeteer-22.0.0-blue)](https://pptr.dev/)

> Professional Test Automation Framework using Puppeteer with Page Object Model (POM) architecture

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Running Tests](#-running-tests)
- [Test Reports](#-test-reports)
- [CI/CD Integration](#-cicd-integration)
- [Writing Tests](#-writing-tests)
- [API Integration](#-api-integration)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🎯 **Page Object Model (POM)** - Clean, maintainable test architecture
- 🚀 **Puppeteer** - Fast, reliable browser automation
- 📊 **Allure Reports** - Beautiful, comprehensive test reports
- 📝 **Winston Logger** - Professional logging with multiple transports
- 🔄 **CI/CD Ready** - Jenkins & GitHub Actions integration
- 📸 **Auto Screenshots** - Automatic screenshot capture on test failures
- 🔗 **API Integration** - Jenkins test execution tracking
- ✅ **Comprehensive Tests** - Multiple test scenarios included
- 🎨 **Clean Architecture** - Well-organized, scalable structure
- 🛡️ **TypeScript Support** - Type definitions included

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 18.0.0)
- **npm** (>= 9.0.0)
- **Git**
- **Chrome/Chromium** browser (for headed mode)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/puppeteer-pom-framework.git
cd puppeteer-pom-framework
```

### 2. Install dependencies

```bash
npm install
```

### 3. Verify installation

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

## 📁 Project Structure

```
puppeteer-pom-framework/
├── .github/
│   └── workflows/
│       └── test.yml              # GitHub Actions workflow
├── config/
│   ├── config.js                 # Framework configuration
│   └── logger.js                 # Winston logger setup
├── helpers/
│   └── APIHelper.js              # Jenkins API integration
├── pages/
│   ├── BasePage.js               # Base page object
│   └── LoginPage.js              # Login page object
├── tests/
│   └── login.test.js             # Login test suite
├── screenshots/                  # Auto-generated screenshots
├── allure-results/               # Allure test results
├── test-results/                 # Jest test results
├── logs/                         # Test execution logs
├── .gitignore                    # Git ignore file
├── package.json                  # Project dependencies
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup file
├── Jenkinsfile                   # Jenkins pipeline
└── README.md                     # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application URL
BASE_URL=https://the-internet.herokuapp.com

# Browser Configuration
HEADLESS=true
SLOW_MO=0

# API Configuration (for Jenkins integration)
API_BASE_URL=https://your-api-endpoint.com
API_TOKEN=your_api_token
ORG_ID=your_org_id
CREATED_BY=your_created_by_id

# Environment
NODE_ENV=test
LOG_LEVEL=info
```

### Framework Configuration

Edit `config/config.js` to customize:

- Browser settings
- Timeouts
- Screenshot options
- Test data
- API settings

## 🧪 Running Tests

### Local Execution

```bash
# Run all tests (headless mode)
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific test file
npx jest tests/login.test.js

# Run tests with specific pattern
npx jest -t "successful login"
```

### CI/CD Execution

```bash
# Run tests in CI mode
npm run test:ci
```

### Test Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests in headless mode |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:ci` | Run tests in CI environment |
| `npm run allure:generate` | Generate Allure report |
| `npm run allure:open` | Open Allure report |
| `npm run allure:serve` | Generate and serve Allure report |
| `npm run clean` | Clean all generated files |

## 📊 Test Reports

### Allure Reports

Generate and view beautiful Allure reports:

```bash
# Generate report
npm run allure:generate

# Open report in browser
npm run allure:open

# Generate and serve in one command
npm run allure:serve
```

### HTML Reports

Jest HTML reports are automatically generated in `test-results/test-report.html`

### Logs

Detailed logs are available in:
- `logs/test-execution.log` - All logs
- `logs/errors.log` - Error logs only

## 🔄 CI/CD Integration

### Jenkins

1. Create a new Pipeline job
2. Point to your repository
3. Use `Jenkinsfile` from the repository
4. Configure credentials for API integration:
   - `api-base-url`
   - `api-token`
   - `org-id`
   - `created-by`

### GitHub Actions

The workflow automatically runs on:
- Push to `main`, `develop`, or `feature/*` branches
- Pull requests to `main` or `develop`
- Daily at 2 AM UTC
- Manual trigger via workflow dispatch

View workflow runs: `Actions` tab in GitHub repository

## 📝 Writing Tests

### Test Structure

```javascript
const puppeteer = require('puppeteer');
const YourPage = require('../pages/YourPage');
const logger = require('../config/logger');
const config = require('../config/config');

describe('Your Test Suite', () => {
  let browser, page, yourPage;

  beforeAll(async () => {
    browser = await puppeteer.launch(config.browser);
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport(config.browser.defaultViewport);
    yourPage = new YourPage(page);
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test('Your test case', async () => {
    logger.testStart('Your test case');
    
    // Test steps
    await yourPage.navigateTo('url');
    
    // Assertions
    expect(result).toBe(expected);
    
    logger.testEnd('Your test case', 'PASSED');
  });
});
```

### Creating Page Objects

```javascript
const BasePage = require('./BasePage');

class YourPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      element: '#element-id'
    };
  }

  async yourMethod() {
    await this.click(this.selectors.element);
  }
}

module.exports = YourPage;
```

## 🔌 API Integration

The framework includes Jenkins API integration for test tracking:

- **API-1**: Initialize pipeline run before tests
- **API-3**: Create test case record after each test
- **API-4**: Update pipeline run with final results

To enable API integration, set the following environment variables:

```env
API_BASE_URL=https://your-api-endpoint.com
API_TOKEN=your_api_token
ORG_ID=your_org_id
CREATED_BY=your_created_by_id
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: Tests fail with "Chrome not found" error
```bash
# Install Chrome dependencies (Linux)
sudo apt-get install -y chromium-browser
```

**Issue**: Tests timeout
```javascript
// Increase timeout in config/config.js
timeouts: {
  default: 60000,  // Increase to 60 seconds
}
```

**Issue**: Screenshots not captured
```javascript
// Ensure screenshots are enabled in config
screenshots: {
  enabled: true,
  onFailure: true
}
```

### Debug Mode

Run tests with additional logging:

```bash
LOG_LEVEL=debug npm test
```

## 📚 Best Practices

### Page Objects
- Keep page objects focused and cohesive
- Use meaningful selector names
- Document complex methods
- Extend BasePage for common functionality

### Tests
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Keep tests independent
- Use proper wait strategies

### Logging
- Log important actions and verifications
- Use appropriate log levels
- Don't log sensitive information

### Screenshots
- Captured automatically on failures
- Named with timestamp and test name
- Stored in `screenshots/` directory

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**Pravin Gamit**
- Senior QA Automation Engineer
- Specializing in test automation frameworks
- [GitHub](https://github.com/yourusername)
- [LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [Puppeteer](https://pptr.dev/) - Browser automation
- [Jest](https://jestjs.io/) - Testing framework
- [Allure](https://docs.qameta.io/allure/) - Test reporting
- [Winston](https://github.com/winstonjs/winston) - Logging

---

⭐ Star this repository if you find it helpful!

📫 For questions or support, please open an issue.
