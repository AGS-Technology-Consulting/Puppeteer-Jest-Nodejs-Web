# 🚀 Quick Start Guide

Get up and running with the Puppeteer POM Framework in 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/puppeteer-pom-framework.git
cd puppeteer-pom-framework
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run your first test

```bash
# Run all tests (headless mode)
npm test
```

That's it! You should see tests running and results displayed in the console.

## View Test Results

### Console Output
Test results are displayed in real-time in the console with color-coded output:
- ✅ Green: Passed tests
- ❌ Red: Failed tests
- ⏭️ Yellow: Skipped tests

### HTML Report
After test execution, view the HTML report:
```bash
open test-results/test-report.html
```

### Allure Report
Generate and view beautiful Allure reports:
```bash
npm run allure:serve
```

## Run Tests in Different Modes

### Headless Mode (Default)
```bash
npm test
```

### Headed Mode (See Browser)
```bash
npm run test:headed
```

### CI Mode
```bash
npm run test:ci
```

## Run Specific Tests

### Single Test File
```bash
npx jest tests/login.test.js
```

### Single Test Case
```bash
npx jest -t "successful login"
```

### With Verbose Output
```bash
npm test -- --verbose
```

## View Screenshots

Failed tests automatically capture screenshots in the `screenshots/` directory:
```bash
ls -la screenshots/
```

## View Logs

Check detailed logs:
```bash
# All logs
cat logs/test-execution.log

# Errors only
cat logs/errors.log
```

## What's Next?

- ✅ **Explore the Framework**: Check out the code in `pages/`, `tests/`, and `config/`
- 📖 **Read the Docs**: See [README.md](README.md) for comprehensive documentation
- 🎯 **Write Tests**: Add your own test cases following the examples
- 🔧 **Configure**: Customize settings in `config/config.js`
- 🚀 **Deploy**: Set up CI/CD with Jenkins or GitHub Actions

## Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run with visible browser |
| `npm run allure:serve` | View Allure report |
| `npm run clean` | Clean generated files |

## Troubleshooting

### Tests fail to start
```bash
# Verify Node version
node --version  # Should be >= 18.0.0

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Chrome/Chromium not found
```bash
# Install Chrome (Ubuntu/Debian)
sudo apt-get install chromium-browser
```

### Need Help?
- Check [README.md](README.md) for detailed docs
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guide
- Open an issue on GitHub

## Docker Quick Start

Run tests in Docker:
```bash
# Build and run
docker-compose up tests

# View Allure report
docker-compose up allure
# Open http://localhost:5050
```

---

Happy Testing! 🎉
