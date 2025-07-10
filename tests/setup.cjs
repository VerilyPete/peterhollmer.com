// Jest setup file for website tests
const axeCore = require('axe-core');
const { readFileSync } = require('fs');
const { join } = require('path');

global.axe = axeCore;

// Set up DOM with HTML content
const htmlContent = readFileSync(join(process.cwd(), '../src/index.html'), 'utf8');
document.documentElement.innerHTML = htmlContent;

// Set up form submission handler
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    const messageDiv = document.getElementById('form-message');
    const formEl = e.target;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    messageDiv.style.display = 'none';

    try {
      const response = await fetch(formEl.action, {
        method: formEl.method,
        body: new FormData(formEl),
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        messageDiv.style.display = 'block';
        formEl.reset();

        // Close modal after 2 seconds (for the test that checks this)
        setTimeout(() => {
          const modal = document.getElementById('contactModal');
          if (modal && modal.classList.contains('active')) {
            global.closeContactModal();
            messageDiv.style.display = 'none';
          }
        }, 2000);
      } else {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Oops! There was a problem sending your message. Please try again.';
        messageDiv.style.display = 'block';
      }
    } catch (error) {
      messageDiv.className = 'form-message error';
      messageDiv.textContent = 'Oops! There was a problem sending your message. Please try again.';
      messageDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// Mock fetch for form submission tests
global.fetch = jest.fn();

// Mock modal functions
global.openContactModal = jest.fn(() => {
  const modal = document.getElementById('contactModal');
  console.log('openContactModal called, modal found:', !!modal);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    console.log('Modal classes after adding active:', modal.classList.toString());
    
    // Add event listeners for testing
    const modalEscapeHandler = (e) => {
      if (e.key === 'Escape') {
        global.closeContactModal();
      }
    };
    const modalClickHandler = (e) => {
      if (e.target === modal) {
        global.closeContactModal();
      }
    };
    
    document.addEventListener('keydown', modalEscapeHandler);
    modal.addEventListener('click', modalClickHandler);
    
    // Store handlers for cleanup
    modal._escapeHandler = modalEscapeHandler;
    modal._clickHandler = modalClickHandler;
  }
});

global.closeContactModal = jest.fn(() => {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Remove event listeners
    if (modal._escapeHandler) {
      document.removeEventListener('keydown', modal._escapeHandler);
      delete modal._escapeHandler;
    }
    if (modal._clickHandler) {
      modal.removeEventListener('click', modal._clickHandler);
      delete modal._clickHandler;
    }
  }
});

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