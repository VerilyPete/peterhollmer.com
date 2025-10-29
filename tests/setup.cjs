// Jest setup file for website tests
const axeCore = require('axe-core');
const { readFileSync } = require('fs');
const { join } = require('path');

global.axe = axeCore;

// Set up DOM with HTML content
const htmlContent = readFileSync(join(process.cwd(), '../src/index.html'), 'utf8');
document.documentElement.innerHTML = htmlContent;

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
  
  // Helper to create a mock element
  createMockElement: (tagName = 'div', attributes = {}) => {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }
}; 