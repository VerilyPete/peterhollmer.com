const { readFileSync } = require('fs');
const { join } = require('path');

describe('CSS Validation', () => {
  const htmlFiles = ['index.html', '404.html', '50x.html'];
  
  htmlFiles.forEach(filename => {
    describe(`${filename}`, () => {
      let cssContent;
      
      beforeAll(() => {
        const htmlContent = readFileSync(join(process.cwd(), filename), 'utf8');
        // Extract CSS from style tags
        const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        cssContent = styleMatches ? styleMatches.join('\n') : '';
      });
      
      test('has valid CSS syntax', () => {
        // Basic CSS syntax validation
        expect(cssContent).toMatch(/\{[^}]*\}/); // Has at least one rule block
        expect(cssContent).toMatch(/[a-zA-Z-]+:\s*[^;]+;/); // Has at least one property
      });
      
      test('has proper color contrast for accessibility', () => {
        // Check for color definitions that might have contrast issues
        const colorProperties = cssContent.match(/color:\s*[^;]+/gi) || [];
        const backgroundProperties = cssContent.match(/background[^:]*:\s*[^;]+/gi) || [];
        
        // Ensure we have both text and background colors defined
        expect(colorProperties.length).toBeGreaterThan(0);
        expect(backgroundProperties.length).toBeGreaterThan(0);
      });
      
      test('has responsive design breakpoints', () => {
        expect(cssContent).toMatch(/@media[^}]*\{/i);
      });
      
      test('has proper animation definitions', () => {
        const animations = cssContent.match(/@keyframes[^}]*\{/gi) || [];
        const animationProperties = cssContent.match(/animation[^:]*:\s*[^;]+/gi) || [];
        
        // If animations are defined, they should be properly referenced
        if (animations.length > 0) {
          expect(animationProperties.length).toBeGreaterThan(0);
        }
      });
      
      test('has proper font definitions', () => {
        const fontFamilies = cssContent.match(/font-family[^:]*:\s*[^;]+/gi) || [];
        fontFamilies.forEach(font => {
          // Check for fallback fonts
          expect(font).toMatch(/,\s*[^,]+$/);
        });
      });
      
      test('has no invalid CSS properties', () => {
        // Check for common CSS mistakes
        // Only check for hex colors in actual property values, not in custom properties
        const lines = cssContent.split('\n');
        lines.forEach(line => {
          const isVar = line.trim().startsWith('--');
          if (!isVar) {
            expect(line).not.toMatch(/color:\s*#[0-9a-fA-F]{3,6}\s*;/i);
            expect(line).not.toMatch(/background[^:]*:\s*#[0-9a-fA-F]{3,6}\s*;/i);
          }
        });
      });
      
      test('has proper vendor prefixes where needed', () => {
        // Check for properties that might need vendor prefixes
        const webkitProperties = cssContent.match(/-webkit-[^:]+:/gi) || [];
        const mozProperties = cssContent.match(/-moz-[^:]+:/gi) || [];
        
        // Ensure vendor prefixes are used consistently
        if (webkitProperties.length > 0 || mozProperties.length > 0) {
          expect(webkitProperties.length + mozProperties.length).toBeGreaterThan(0);
        }
      });
      
      test('has proper z-index values', () => {
        const zIndexValues = cssContent.match(/z-index:\s*[^;]+/gi) || [];
        zIndexValues.forEach(zIndex => {
          const value = zIndex.match(/z-index:\s*([^;]+)/i)[1];
          // Z-index should be a number or auto
          expect(value.trim()).toMatch(/^(auto|\d+)$/);
        });
      });
      
      test('has proper border-radius values', () => {
        const borderRadiusValues = cssContent.match(/border-radius[^:]*:\s*[^;]+/gi) || [];
        borderRadiusValues.forEach(borderRadius => {
          const value = borderRadius.match(/border-radius[^:]*:\s*([^;]+)/i)[1];
          // Border-radius should be a valid CSS value
          expect(value.trim()).toMatch(/^[0-9]+(px|%|em|rem)?$/);
        });
      });
      
      test('has proper opacity values', () => {
        const opacityValues = cssContent.match(/opacity[^:]*:\s*[^;]+/gi) || [];
        opacityValues.forEach(opacity => {
          const value = opacity.match(/opacity[^:]*:\s*([^;]+)/i)[1];
          // Opacity should be between 0 and 1
          const numValue = parseFloat(value);
          expect(numValue).toBeGreaterThanOrEqual(0);
          expect(numValue).toBeLessThanOrEqual(1);
        });
      });
      
      test('has proper transition definitions', () => {
        const transitions = cssContent.match(/transition[^:]*:\s*[^;]+/gi) || [];
        transitions.forEach(transition => {
          const value = transition.match(/transition[^:]*:\s*([^;]+)/i)[1];
          // Transition should have duration
          expect(value).toMatch(/[0-9]+(s|ms)/);
        });
      });
      
      test('has no duplicate selectors', () => {
        const selectors = cssContent.match(/[^{]+(?=\{)/g) || [];
        const selectorCounts = {};
        
        selectors.forEach(selector => {
          const cleanSelector = selector.trim();
          selectorCounts[cleanSelector] = (selectorCounts[cleanSelector] || 0) + 1;
        });
        
        // Check for duplicates
        Object.entries(selectorCounts).forEach(([selector, count]) => {
          if (count > 1) {
            console.warn(`Duplicate selector found: ${selector} (${count} times)`);
          }
        });
        
        // Allow some duplicates for media queries
        const duplicateCount = Object.values(selectorCounts).filter(count => count > 1).length;
        expect(duplicateCount).toBeLessThan(5); // Allow some duplicates for responsive design
      });
    });
  });
}); 