// Jest setup file for website tests
const { configureAxe } = require('jest-axe');

// Configure axe for accessibility testing
const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'document-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true }
  }
});

// Make axe available globally
global.axe = axe;

// Mock fetch for form submission tests
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for animation tests
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver for responsive tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Test utilities
global.testUtils = {
  // Wait for animations to complete
  waitForAnimation: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock Formspree API responses
  mockFormspreeResponses: {
    success: {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true })
    },
    error: {
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' })
    },
    networkError: {
      ok: false,
      status: 0,
      json: () => Promise.reject(new Error('Network error'))
    }
  },
  
  // Helper to create a mock element
  createMockElement: (tagName = 'div', attributes = {}) => {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }
}; 