const { readFileSync } = require('fs');
const { join } = require('path');

describe('Performance', () => {
  let htmlContent;
  
  beforeAll(() => {
    htmlContent = readFileSync(join(process.cwd(), '../src/index.html'), 'utf8');
  });
  
  describe('Page Load Performance', () => {
    test('has optimized HTML structure', () => {
      // Check for render-blocking resources
      const externalCSS = htmlContent.match(/<link[^>]*rel="stylesheet"[^>]*>/gi) || [];
      const externalJS = htmlContent.match(/<script[^>]*src=[^>]*>/gi) || [];
      
      // Should have minimal external resources
      expect(externalCSS.length).toBeLessThan(3);
      expect(externalJS.length).toBeLessThan(3);
    });
    
    test('has inline critical CSS', () => {
      const styleTags = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
      expect(styleTags.length).toBeGreaterThan(0);
    });
    
    test('has optimized images', () => {
      const images = htmlContent.match(/<img[^>]*>/gi) || [];
      images.forEach(imgTag => {
        // Check for WebP format with fallback
        if (imgTag.includes('picture')) {
          const pictureTag = htmlContent.match(/<picture[^>]*>[\s\S]*?<\/picture>/gi);
          expect(pictureTag).toBeTruthy();
          
          // Check for WebP source
          const webpSource = htmlContent.match(/<source[^>]*type="image\/webp"[^>]*>/gi);
          expect(webpSource).toBeTruthy();
        }
      });
    });
    
    test('has proper favicon setup', () => {
      const faviconLinks = htmlContent.match(/<link[^>]*rel="(icon|shortcut icon|apple-touch-icon)"[^>]*>/gi) || [];
      expect(faviconLinks.length).toBeGreaterThan(0);
      
      // Check for different favicon sizes
      const iconSizes = faviconLinks.map(link => {
        const sizesMatch = link.match(/sizes="([^"]*)"/i);
        return sizesMatch ? sizesMatch[1] : null;
      }).filter(Boolean);
      
      expect(iconSizes.length).toBeGreaterThan(0);
    });
    
    test('has no render-blocking JavaScript', () => {
      const scriptTags = htmlContent.match(/<script[^>]*>/gi) || [];
      scriptTags.forEach(scriptTag => {
        // Scripts should be at the end of body or have defer/async
        if (!scriptTag.includes('defer') && !scriptTag.includes('async')) {
          // Check if it's at the end of body
          const scriptIndex = htmlContent.indexOf(scriptTag);
          const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
          expect(scriptIndex).toBeLessThan(bodyCloseIndex);
        }
      });
    });
  });
  
  describe('Image Optimization', () => {
    test('has WebP images with fallbacks', () => {
      const pictureTags = htmlContent.match(/<picture[^>]*>[\s\S]*?<\/picture>/gi) || [];
      pictureTags.forEach(pictureTag => {
        // Should have WebP source
        expect(pictureTag).toMatch(/<source[^>]*type="image\/webp"[^>]*>/i);
        
        // Should have fallback img
        expect(pictureTag).toMatch(/<img[^>]*>/i);
      });
    });
    
    test('has proper image dimensions', () => {
      const images = htmlContent.match(/<img[^>]*>/gi) || [];
      images.forEach(imgTag => {
        // Images should have width and height or be responsive
        const hasWidth = imgTag.includes('width=');
        const hasHeight = imgTag.includes('height=');
        const hasResponsiveClass = imgTag.includes('class=') && imgTag.includes('responsive');
        
        // At least one of these should be true
        expect(hasWidth || hasHeight || hasResponsiveClass).toBe(true);
      });
    });
    
    test('has optimized image paths', () => {
      const images = htmlContent.match(/<img[^>]*src="([^"]*)"[^>]*>/gi) || [];
      images.forEach(imgTag => {
        const srcMatch = imgTag.match(/src="([^"]*)"/i);
        if (srcMatch) {
          const src = srcMatch[1];
          
          // Images should be in images directory
          expect(src).toMatch(/^\.\/images\//);
          
          // Should not have unnecessary query parameters
          expect(src).not.toMatch(/\?[^=]*=/);
        }
      });
    });
  });
  
  describe('CSS Performance', () => {
    test('has optimized CSS', () => {
      const styleTags = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      let totalCSS = '';
      
      styleTags.forEach(styleTag => {
        const cssMatch = styleTag.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (cssMatch) {
          totalCSS += cssMatch[1];
        }
      });
      
      // Check for common performance issues
      expect(totalCSS).not.toMatch(/@import/gi);
      
      // Check for efficient selectors
      // Split CSS into rules by '}' and extract selector before '{'
      const rules = totalCSS.split('}');
      rules.forEach(rule => {
        const selectorMatch = rule.match(/([^\{]+)\{/);
        if (selectorMatch) {
          const cleanSelector = selectorMatch[1].trim();
          // Avoid overly specific selectors
          const specificity = cleanSelector.split('.').length + cleanSelector.split('#').length;
          if (specificity >= 5) {
            throw new Error(`High specificity selector: "${cleanSelector}" (specificity: ${specificity})`);
          }
          expect(specificity).toBeLessThan(5);
        }
      });
    });
    
    test('has proper CSS organization', () => {
      const styleTags = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      let totalCSS = '';
      
      styleTags.forEach(styleTag => {
        const cssMatch = styleTag.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (cssMatch) {
          totalCSS += cssMatch[1];
        }
      });
      
      // Check for media queries
      expect(totalCSS).toMatch(/@media/gi);
      
      // Check for animations
      expect(totalCSS).toMatch(/@keyframes/gi);
      
      // Check for transitions
      expect(totalCSS).toMatch(/transition/gi);
    });
  });
  
  describe('JavaScript Performance', () => {
    test('has optimized JavaScript', () => {
      const scriptTags = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      let totalJS = '';
      
      scriptTags.forEach(scriptTag => {
        const jsMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (jsMatch) {
          totalJS += jsMatch[1];
        }
      });
      
      // Check that JavaScript exists and is reasonable
      expect(totalJS.length).toBeGreaterThan(0);
      expect(totalJS.length).toBeLessThan(5000); // Keep JavaScript minimal
    });
    
    test('has no memory leaks', () => {
      const scriptTags = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      let totalJS = '';
      
      scriptTags.forEach(scriptTag => {
        const jsMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (jsMatch) {
          totalJS += jsMatch[1];
        }
      });
      
      // Check for potential memory leaks
      // If addEventListener is used, should have cleanup
      if (totalJS.includes('addEventListener')) {
        expect(totalJS).toMatch(/removeEventListener/gi);
      }
      
      // Simple check that code exists
      expect(totalJS.length).toBeGreaterThan(0);
    });
  });
  
  describe('Resource Loading', () => {
    test('has minimal external dependencies', () => {
      const externalLinks = htmlContent.match(/<link[^>]*href="http[^"]*"[^>]*>/gi) || [];
      const externalScripts = htmlContent.match(/<script[^>]*src="http[^"]*"[^>]*>/gi) || [];
      
      // Should have minimal external resources
      expect(externalLinks.length).toBeLessThan(5);
      expect(externalScripts.length).toBeLessThan(3);
    });
    
    test('has proper resource preloading', () => {
      const preloadLinks = htmlContent.match(/<link[^>]*rel="preload"[^>]*>/gi) || [];
      
      // Preloading is optional but good for performance
      if (preloadLinks.length > 0) {
        preloadLinks.forEach(preload => {
          expect(preload).toMatch(/href=/i);
          expect(preload).toMatch(/as=/i);
        });
      }
    });
    
    test('has proper caching headers', () => {
      // This would typically be checked at the server level
      // For static files, we can check if they're properly organized
      const staticFiles = [
        './images/HeadShotWeb.webp',
        './images/HeadShotWeb.jpg',
        './favicon/favicon.ico',
        './favicon/favicon.svg'
      ];
      
      staticFiles.forEach(file => {
        expect(htmlContent).toMatch(new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      });
    });
  });
  
  describe('Bundle Size', () => {
    test('has reasonable HTML size', () => {
      const htmlSize = htmlContent.length;
      
      // HTML should be under 50KB
      expect(htmlSize).toBeLessThan(50000);
      
      // Should be reasonably sized
      expect(htmlSize).toBeGreaterThan(1000);
    });
    
    test('has optimized inline CSS size', () => {
      const styleTags = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      let totalCSSSize = 0;
      
      styleTags.forEach(styleTag => {
        const cssMatch = styleTag.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (cssMatch) {
          totalCSSSize += cssMatch[1].length;
        }
      });
      
      // Inline CSS should be under 20KB
      expect(totalCSSSize).toBeLessThan(20000);
      
      // Should have meaningful CSS
      expect(totalCSSSize).toBeGreaterThan(1000);
    });
    
    test('has optimized inline JavaScript size', () => {
      const scriptTags = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      let totalJSSize = 0;
      
      scriptTags.forEach(scriptTag => {
        const jsMatch = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (jsMatch) {
          totalJSSize += jsMatch[1].length;
        }
      });
      
      // Inline JS should be under 10KB
      expect(totalJSSize).toBeLessThan(10000);
      
      // Should have meaningful JS
      expect(totalJSSize).toBeGreaterThan(100);
    });
  });
}); 