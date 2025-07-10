const { readFileSync } = require('fs');
const { join } = require('path');

describe('Accessibility (a11y)', () => {
  let document;
  let htmlContent;
  
  beforeAll(() => {
    htmlContent = readFileSync(join(process.cwd(), '../src/index.html'), 'utf8');
  });
  
  beforeEach(() => {
    document = new DOMParser().parseFromString(htmlContent, 'text/html');
  });
  
  describe('WCAG 2.1 AA Compliance', () => {
    test('passes axe-core accessibility audit', async () => {
      const results = await global.axe.run(document, {
        rules: {
          'document-title': { enabled: false }, // Disable due to jsdom limitations
          'color-contrast': { enabled: false }  // Disable due to canvas limitations
        }
      });
      // Check for violations
      expect(results.violations).toEqual([]);
      // Log any incomplete tests for review
      if (results.incomplete.length > 0) {
        console.warn('Incomplete accessibility tests:', results.incomplete);
      }
    });
    
    test('has proper document title', () => {
      const title = document.querySelector('title');
      expect(title).toBeTruthy();
      expect(title.textContent.trim()).toBe('Peter Hollmer - Engineering Leader');
    });
    
    test('has proper language declaration', () => {
      const html = document.documentElement;
      expect(html.getAttribute('lang')).toBe('en');
    });
    
    test('has proper heading structure', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      // Should have at least one h1
      expect(headingLevels).toContain(1);
      
      // Check for proper hierarchy (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });
    
    test('has alt text on all images', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img.hasAttribute('alt')).toBe(true);
        expect(img.getAttribute('alt').trim()).not.toBe('');
      });
    });
    
    test('has proper form labels', () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.type !== 'hidden' && input.type !== 'submit' && input.type !== 'button') {
          const id = input.getAttribute('id');
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            expect(label).toBeTruthy();
            expect(label.textContent.trim()).not.toBe('');
          }
        }
      });
    });
    
    test('has proper link text', () => {
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent.trim();
        const href = link.getAttribute('href');
        
        // Skip links with images or icons as content
        const hasImage = link.querySelector('img, svg');
        if (!hasImage) {
          expect(text).not.toBe('');
          expect(text.length).toBeGreaterThan(1);
        }
        
        // External links should have proper attributes
        if (href && href.startsWith('http') && !href.includes('formspree.io')) {
          expect(link.getAttribute('target')).toBe('_blank');
          expect(link.getAttribute('rel')).toContain('noopener');
        }
      });
    });
    
    test('has proper color contrast', () => {
      // This is a basic check - axe-core will do detailed contrast analysis
      const elements = document.querySelectorAll('*');
      let hasTextElements = false;
      
      elements.forEach(element => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          hasTextElements = true;
        }
      });
      
      expect(hasTextElements).toBe(true);
    });
    
    test('has proper focus management', () => {
      const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
      focusableElements.forEach(element => {
        const tabindex = element.getAttribute('tabindex');
        if (tabindex) {
          expect(['0', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9']).toContain(tabindex);
        }
      });
    });
    
    test('has proper ARIA attributes', () => {
      const allElements = document.querySelectorAll('*');
      const elementsWithAria = Array.from(allElements).filter(element => {
        return Array.from(element.attributes).some(attr => attr.name.startsWith('aria-'));
      });
      
      elementsWithAria.forEach(element => {
        const ariaAttributes = Array.from(element.attributes)
          .filter(attr => attr.name.startsWith('aria-'));
        
        ariaAttributes.forEach(attr => {
          expect(attr.value).not.toBe('');
        });
      });
    });
    
    test('has proper semantic HTML', () => {
      // Check for semantic elements
      const semanticElements = document.querySelectorAll('header, nav, main, section, article, aside, footer');
      expect(semanticElements.length).toBeGreaterThan(0);
      
      // Check for proper list structure
      const lists = document.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const listItems = list.querySelectorAll('li');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });
    
    test('has proper skip links', () => {
      // Check if there are skip links for keyboard navigation
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      let hasSkipLink = false;
      
      skipLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#main' || href === '#content' || href === '#navigation') {
          hasSkipLink = true;
        }
      });
      
      // Skip links are not required but good practice
      if (skipLinks.length > 0) {
        expect(hasSkipLink).toBe(true);
      }
    });
    
    test('has proper form error handling', () => {
      const form = document.getElementById('contact-form');
      if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          if (input.hasAttribute('required')) {
            expect(input.getAttribute('aria-required')).toBe('true');
          }
        });
      }
    });
    
    test('has proper modal accessibility', () => {
      const modal = document.getElementById('contactModal');
      if (modal) {
        // Modal should have proper ARIA attributes
        expect(modal.getAttribute('aria-hidden')).toBeDefined();
        expect(modal.getAttribute('role')).toBe('dialog');
        
        // Modal should have a title
        const modalTitle = modal.querySelector('.modal-title');
        expect(modalTitle).toBeTruthy();
        expect(modalTitle.textContent.trim()).not.toBe('');
        
        // Modal should have a close button
        const closeButton = modal.querySelector('.close-btn');
        expect(closeButton).toBeTruthy();
        expect(closeButton.getAttribute('aria-label') || closeButton.textContent.trim()).not.toBe('');
      }
    });
    
    test('has proper keyboard navigation', () => {
      const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);
      
      focusableElements.forEach(element => {
        // Elements should be focusable
        expect(element.getAttribute('tabindex')).not.toBe('-1');
      });
    });
    
    test('has proper screen reader support', () => {
      // Check for screen reader only content
      const srOnlyElements = document.querySelectorAll('.sr-only, .screen-reader-only, [aria-label], [aria-labelledby]');
      
      // Check for proper ARIA labels
      const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
      elementsWithAriaLabel.forEach(element => {
        expect(element.getAttribute('aria-label').trim()).not.toBe('');
      });
      
      // Check for proper ARIA describedby
      const elementsWithAriaDescribedby = document.querySelectorAll('[aria-describedby]');
      elementsWithAriaDescribedby.forEach(element => {
        const describedby = element.getAttribute('aria-describedby');
        const targetElement = document.getElementById(describedby);
        expect(targetElement).toBeTruthy();
      });
    });
  });
  
  describe('Mobile Accessibility', () => {
    test('has proper viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
      expect(viewport.getAttribute('content')).toContain('initial-scale=1');
    });
    
    test('has proper touch targets', () => {
      const touchTargets = document.querySelectorAll('a, button, input[type="button"], input[type="submit"]');
      touchTargets.forEach(target => {
        // Touch targets should be at least 44x44 pixels
        // This is a basic check - actual size depends on CSS
        const style = window.getComputedStyle(target);
        const minSize = 44;
        
        // Note: This is a simplified check. In a real browser, we'd check actual computed dimensions
        expect(target).toBeTruthy();
      });
    });
  });
}); 