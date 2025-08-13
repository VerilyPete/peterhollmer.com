# PeterHollmer.com

A static website with comprehensive testing and validation.

## Project Structure

```
/
├── src/           # The website
│   ├── index.html
│   ├── 404.html
│   ├── 50x.html
│   ├── images/
│   └── favicon/
├── tests/         # All testing related
│   ├── package.json
│   ├── playwright.config.js
│   ├── setup.cjs
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── reports/       # Generated reports (gitignored)
```

## Development


### Running Tests

All tests are located in the `tests/` directory. To run them:

```bash
cd tests
npm install
npm run test:all
```

#### Individual Test Suites

- **HTML Validation**: `npm run test:html`
- **CSS Validation**: `npm run test:css`
- **Unit Tests**: `npm test`
- **Accessibility Tests**: `npm run test:accessibility`
- **Performance Tests**: `npm run test:performance`
- **Cross-Browser Tests**: `npm run test:cross-browser`

#### Test Coverage

Tests generate coverage reports in the `reports/coverage/` directory.

View reports locally:

- Coverage (Jest): `open reports/coverage/index.html`
- Playwright report: `npx playwright show-report reports/playwright-report`

## CI/CD

The project uses GitHub Actions for continuous integration. The workflow runs:

1. HTML validation
2. CSS validation
3. Unit tests
4. Accessibility tests
5. Performance tests
6. Asset validation
7. Cross-browser tests

All test results and reports are uploaded as artifacts.

## Technologies

- **Static Site**: Pure HTML/CSS/JavaScript
- **Testing**: Jest, Playwright, axe-core
- **Validation**: html-validate, stylelint
- **CI/CD**: GitHub Actions