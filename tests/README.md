# PeterHollmer.com Test Suite

A comprehensive test suite for the PeterHollmer.com website that ensures quality, accessibility, and performance across all browsers.

## 🚀 Features

- **HTML Validation** - Ensures valid HTML5 markup
- **CSS Validation** - Validates CSS syntax and best practices
- **JavaScript Testing** - Tests functionality with mocked API calls
- **Accessibility Testing** - WCAG 2.1 AA compliance using axe-core
- **Performance Testing** - Checks loading times and optimization
- **Asset Validation** - Verifies all images and favicons exist
- **Cross-Browser Testing** - Tests functionality across major browsers
- **Lighthouse Audits** - Performance, accessibility, and SEO scoring

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Python 3 (for local server)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd peterhollmer.com
```

2. Install dependencies:
```bash
npm install
```

**Note**: You may see some deprecation warnings during installation. These are normal and don't affect functionality - they're just warnings about older dependencies used by some packages.

3. Install Playwright browsers (for cross-browser testing):
```bash
npm run install-browsers
```

## 🧪 Running Tests

### All Tests
```bash
npm run test:all
```

### Individual Test Suites

#### HTML Validation
```bash
npm run test:html
```

#### CSS Validation
```bash
npm run test:css
```

#### JavaScript Unit Tests
```bash
npm test
```

#### Accessibility Tests
```bash
npm run test:accessibility
```

#### Performance Tests
```bash
npm run test:performance
```

#### Cross-Browser Tests
```bash
npm run test:cross-browser
```

### Watch Mode (for development)
```bash
npm run test:watch
```

## 📁 Test Structure

```
tests/
├── setup.js                    # Jest setup and global configuration
├── unit/                       # Unit tests
│   ├── html-validation.test.js # HTML structure and validation
│   ├── css-validation.test.js  # CSS syntax and best practices
│   └── javascript.test.js      # JavaScript functionality (mocked)
├── integration/                # Integration tests
│   ├── accessibility.test.js   # WCAG compliance and a11y
│   ├── performance.test.js     # Performance and optimization
│   └── asset-validation.test.js # Asset existence and optimization
└── cross-browser/              # Cross-browser tests
    └── basic-functionality.spec.js # Playwright browser tests
```

## 🔧 Configuration

### Jest Configuration
Located in `package.json`:
- Test environment: jsdom
- Coverage collection enabled
- Custom setup file for global mocks

### Playwright Configuration
Located in `playwright.config.js`:
- Tests Chrome, Firefox, Safari, and mobile browsers
- Screenshots and videos on failure
- Local server setup for testing

### Stylelint Configuration
Located in `package.json`:
- Standard CSS rules
- HTML support enabled
- Custom rule overrides

## 🚀 GitHub Actions

The test suite runs automatically on every commit and pull request via GitHub Actions. The workflow includes:

1. **HTML Validation** - Validates markup structure
2. **CSS Validation** - Checks CSS syntax and best practices
3. **Unit Tests** - JavaScript functionality tests
4. **Accessibility Tests** - WCAG compliance verification
5. **Performance Tests** - Loading and optimization checks
6. **Asset Validation** - Image and favicon verification
7. **Cross-Browser Tests** - Functionality across browsers
8. **Lighthouse Audit** - Performance and SEO scoring

### Test Results
- All test results are uploaded as artifacts
- Summary report is generated for each run
- Failed tests are clearly identified
- Coverage reports are included

## 🎯 Test Coverage

### HTML Tests
- ✅ Valid DOCTYPE declaration
- ✅ Proper HTML structure
- ✅ Required meta tags
- ✅ Language attributes
- ✅ Heading hierarchy
- ✅ Image alt attributes
- ✅ Link structure
- ✅ Form validation
- ✅ No broken internal links

### CSS Tests
- ✅ Valid CSS syntax
- ✅ Color contrast accessibility
- ✅ Responsive design breakpoints
- ✅ Animation definitions
- ✅ Font fallbacks
- ✅ Vendor prefixes
- ✅ Z-index values
- ✅ Border-radius values
- ✅ Opacity values
- ✅ Transition definitions

### JavaScript Tests
- ✅ Contact modal functionality
- ✅ Form validation (client-side)
- ✅ Mocked API submissions
- ✅ Loading states
- ✅ Error handling
- ✅ Form reset functionality
- ✅ Keyboard navigation
- ✅ Event handling

### Accessibility Tests
- ✅ WCAG 2.1 AA compliance
- ✅ Proper document title
- ✅ Language declaration
- ✅ Heading structure
- ✅ Alt text on images
- ✅ Form labels
- ✅ Link text
- ✅ Color contrast
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Semantic HTML
- ✅ Screen reader support

### Performance Tests
- ✅ HTML optimization
- ✅ CSS optimization
- ✅ JavaScript optimization
- ✅ Image optimization
- ✅ Resource loading
- ✅ Bundle size analysis
- ✅ Render-blocking resources
- ✅ Animation performance

### Asset Validation
- ✅ Image existence and formats
- ✅ Favicon completeness
- ✅ Error page accessibility
- ✅ Asset organization
- ✅ No broken links
- ✅ Proper file structure

### Cross-Browser Tests
- ✅ Page loading
- ✅ Content visibility
- ✅ Modal functionality
- ✅ Form interactions
- ✅ Responsive design
- ✅ Animations
- ✅ Keyboard navigation
- ✅ Error handling

## 🔍 Mocked API Testing

The test suite uses mocked Formspree API responses to test form functionality without consuming your monthly submission quota:

- **Success Response** - Tests successful form submission UI
- **Error Response** - Tests API error handling
- **Network Error** - Tests network failure scenarios

## 📊 Performance Benchmarks

The test suite includes performance benchmarks:

- **HTML Size**: < 50KB
- **CSS Size**: < 20KB
- **JavaScript Size**: < 10KB
- **Page Load Time**: < 3 seconds
- **Lighthouse Score**: > 90

## 🐛 Troubleshooting

### Common Issues

1. **Deprecation warnings during npm install**
   - These warnings are normal and don't affect functionality
   - They're from older dependencies used by some packages
   - The test suite will work perfectly despite these warnings
   - You can safely ignore them

2. **Playwright browsers not installed**
   ```bash
   npm run install-browsers
   ```

3. **Node.js version issues**
   - Ensure you're using Node.js 18 or higher
   - Use `nvm` to manage Node.js versions

4. **Python server not starting**
   - Ensure Python 3 is installed
   - Check if port 3000 is available

5. **Test failures**
   - Check the test output for specific error messages
   - Review the uploaded artifacts in GitHub Actions
   - Run tests locally to debug issues

### Debug Mode

Run tests with verbose output:
```bash
npm test -- --verbose
```

Run specific test file:
```bash
npm test -- tests/unit/javascript.test.js
```

## 🤝 Contributing

When adding new features or making changes:

1. Run the full test suite locally
2. Ensure all tests pass
3. Add new tests for new functionality
4. Update documentation if needed
5. Commit and push changes

## 📝 License

This test suite is part of the PeterHollmer.com project and follows the same license terms.

## 🆘 Support

For issues with the test suite:

1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Create an issue with detailed error information
4. Include test output and environment details

---

**Note**: This test suite is designed to run without consuming your Formspree API quota by using mocked responses for all form submission tests. 