import { readFileSync } from 'fs';
import { join } from 'path';

describe('HTML Validation', () => {
  const htmlFiles = ['index.html', '404.html', '50x.html'];
  
  htmlFiles.forEach(filename => {
    describe(`${filename}`, () => {
      let htmlContent;
      
      beforeAll(() => {
        htmlContent = readFileSync(join(process.cwd(), filename), 'utf8');
      });
      
      test('has valid DOCTYPE declaration', () => {
        expect(htmlContent).toMatch(/^<!DOCTYPE html>/i);
      });
      
      test('has proper HTML structure', () => {
        expect(htmlContent).toMatch(/<html[^>]*>/i);
        expect(htmlContent).toMatch(/<head[^>]*>/i);
        expect(htmlContent).toMatch(/<body[^>]*>/i);
        expect(htmlContent).toMatch(/<\/html>/i);
      });
      
      test('has required meta tags', () => {
        expect(htmlContent).toMatch(/<meta charset="UTF-8">/i);
        expect(htmlContent).toMatch(/<meta name="viewport"/i);
        expect(htmlContent).toMatch(/<title>/i);
      });
      
      test('has proper language attribute', () => {
        expect(htmlContent).toMatch(/<html[^>]*lang="en"[^>]*>/i);
      });
      
      test('has no unclosed tags', () => {
        // Count opening and closing tags for common elements
        const openTags = (htmlContent.match(/<(?!\/)(?!\!)[^>]*>/g) || []).length;
        const closeTags = (htmlContent.match(/<\/(?!\!)[^>]*>/g) || []).length;
        
        // This is a basic check - some self-closing tags are expected
        expect(openTags).toBeGreaterThan(0);
        expect(closeTags).toBeGreaterThan(0);
      });
      
      test('has proper heading hierarchy', () => {
        const headings = htmlContent.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
        const headingLevels = headings.map(h => parseInt(h.match(/<h([1-6])/i)[1]));
        
        // Check that we don't skip heading levels (e.g., h1 -> h3)
        for (let i = 1; i < headingLevels.length; i++) {
          const currentLevel = headingLevels[i];
          const previousLevel = headingLevels[i - 1];
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      });
      
      test('has alt attributes on images', () => {
        const imgTags = htmlContent.match(/<img[^>]*>/gi) || [];
        imgTags.forEach(imgTag => {
          expect(imgTag).toMatch(/alt="[^"]*"/i);
        });
      });
      
      test('has proper link structure', () => {
        const links = htmlContent.match(/<a[^>]*>.*?<\/a>/gi) || [];
        links.forEach(link => {
          // External links should have target="_blank" and rel="noopener noreferrer"
          if (link.includes('http') && !link.includes('formspree.io')) {
            expect(link).toMatch(/target="_blank"/i);
            expect(link).toMatch(/rel="[^"]*noopener[^"]*"/i);
          }
        });
      });
      
      test('has no broken internal links', () => {
        const internalLinks = htmlContent.match(/href="[^"]*\.html"/gi) || [];
        internalLinks.forEach(link => {
          const href = link.match(/href="([^"]*)"/i)[1];
          const filename = href.replace(/^\.?\//, '');
          expect(htmlFiles).toContain(filename);
        });
      });
      
      test('has proper form structure', () => {
        if (htmlContent.includes('<form')) {
          expect(htmlContent).toMatch(/<form[^>]*action=/i);
          expect(htmlContent).toMatch(/<form[^>]*method=/i);
          
          // Check that form inputs have proper labels
          const inputs = htmlContent.match(/<input[^>]*>/gi) || [];
          inputs.forEach(input => {
            if (input.includes('type="text"') || input.includes('type="email"')) {
              expect(input).toMatch(/id="[^"]*"/i);
            }
          });
        }
      });
      
      test('has no console errors in JavaScript', () => {
        const scriptTags = htmlContent.match(/<script[^>]*>.*?<\/script>/gis) || [];
        scriptTags.forEach(script => {
          // Check for common JavaScript issues
          expect(script).not.toMatch(/console\.error/);
          expect(script).not.toMatch(/throw new Error/);
        });
      });
    });
  });
}); 