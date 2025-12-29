# Contributing to Puppeteer POM Framework

First off, thank you for considering contributing to Puppeteer POM Framework! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues. When creating a bug report, include:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed**
- **Explain which behavior you expected**
- **Include screenshots if relevant**
- **Include your environment details**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the coding standards
- Include appropriate test coverage
- Update documentation as needed
- Ensure all tests pass

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/puppeteer-pom-framework.git
cd puppeteer-pom-framework
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bugfix-name
```

### 4. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 5. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test
npx jest tests/your-test.test.js

# Run with coverage
npm test -- --coverage
```

### 6. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
# or
git commit -m "fix: resolve issue with login"
```

#### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Create Pull Request

- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Fill in the PR template
- Submit the pull request

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the documentation** for any new features
3. **Add tests** for new functionality
4. **Ensure all tests pass** before submitting
5. **Update the CHANGELOG.md** if applicable
6. The PR will be merged once you have approval from maintainers

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No console.log statements
- [ ] Screenshots captured on failure
- [ ] Allure report generation works

## Coding Standards

### JavaScript

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use template literals for string interpolation
- Use async/await over promises where possible

### Page Objects

```javascript
class YourPage extends BasePage {
  constructor(page) {
    super(page);
    
    this.selectors = {
      element: '#element-id'
    };
  }

  async yourMethod() {
    // Implementation
  }
}
```

### Tests

```javascript
test('TC-XXX: Clear description of what is being tested', async () => {
  // Arrange
  await loginPage.navigateToLoginPage();
  
  // Act
  await loginPage.login(username, password);
  
  // Assert
  expect(result).toBe(expected);
});
```

### Logging

```javascript
logger.testStart('Test name');
logger.step('Step description');
logger.action('Action description');
logger.verify('Verification description');
logger.testEnd('Test name', 'PASSED');
```

## Testing Guidelines

### Test Structure

- Each test file should test a specific feature
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent
- Use proper wait strategies

### Test Data

- Use configuration file for test data
- Don't hardcode credentials
- Use meaningful variable names

### Assertions

```javascript
// Good
expect(actualValue).toBe(expectedValue);
expect(element).toBeVisible();
expect(message).toContain('Expected text');

// Avoid
expect(true).toBe(true); // Not descriptive
```

### Screenshots

- Screenshots are automatically captured on failure
- Don't add unnecessary screenshot calls
- Screenshots should be meaningful

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## Thank You! 🙏

Your contributions make this project better. Thank you for your time and effort!
