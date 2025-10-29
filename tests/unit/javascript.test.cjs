const { readFileSync } = require('fs');
const { join } = require('path');

describe('JavaScript Functionality', () => {
  let htmlContent;
  
  beforeAll(() => {
    htmlContent = readFileSync(join(process.cwd(), '../src/index.html'), 'utf8');
    
    // Execute the script content to make showPage available
    const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      eval(scriptMatch[1]);
    }
  });

  describe('Page Navigation', () => {
    test('showPage function is available', () => {
      expect(typeof window.showPage).toBe('function');
    });
  });
}); 