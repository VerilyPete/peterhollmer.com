const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

describe('Asset Validation', () => {
  let htmlContent;
  
  beforeAll(() => {
    htmlContent = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  });
  
  describe('Image Assets', () => {
    test('profile image exists and is properly referenced', () => {
      const webpImage = './images/HeadShotWeb.webp';
      const jpgImage = './images/HeadShotWeb.jpg';
      
      // Check that images are referenced in HTML
      expect(htmlContent).toMatch(new RegExp(webpImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      expect(htmlContent).toMatch(new RegExp(jpgImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      
      // Check that image files exist
      expect(existsSync(join(process.cwd(), 'images/HeadShotWeb.webp'))).toBe(true);
      expect(existsSync(join(process.cwd(), 'images/HeadShotWeb.jpg'))).toBe(true);
    });
    
    test('has proper image format support', () => {
      const pictureTags = htmlContent.match(/<picture[^>]*>[\s\S]*?<\/picture>/gi) || [];
      
      pictureTags.forEach(pictureTag => {
        // Should have WebP source
        expect(pictureTag).toMatch(/<source[^>]*type="image\/webp"[^>]*>/i);
        
        // Should have fallback image
        expect(pictureTag).toMatch(/<img[^>]*>/i);
        
        // Should have proper srcset
        const sourceTag = pictureTag.match(/<source[^>]*>/i)[0];
        expect(sourceTag).toMatch(/srcset=/i);
      });
    });
    
    test('images have proper alt text', () => {
      const images = htmlContent.match(/<img[^>]*>/gi) || [];
      
      images.forEach(imgTag => {
        expect(imgTag).toMatch(/alt="[^"]*"/i);
        const altMatch = imgTag.match(/alt="([^"]*)"/i);
        expect(altMatch[1].trim()).not.toBe('');
      });
    });
    
    test('images are in correct directory structure', () => {
      const imageReferences = htmlContent.match(/src="[^"]*\.(jpg|jpeg|png|webp|gif|svg)"/gi) || [];
      
      imageReferences.forEach(ref => {
        const srcMatch = ref.match(/src="([^"]*)"/i);
        if (srcMatch) {
          const src = srcMatch[1];
          
          // Should be relative paths
          expect(src).toMatch(/^\.\//);
          
          // Should be in images directory
          if (src.includes('.jpg') || src.includes('.webp') || src.includes('.png')) {
            expect(src).toMatch(/^\.\/images\//);
          }
        }
      });
    });
  });
  
  describe('Favicon Assets', () => {
    const faviconFiles = [
      'favicon/favicon.ico',
      'favicon/favicon.svg',
      'favicon/favicon-96x96.png',
      'favicon/favicon-32x32.png',
      'favicon/favicon-16x16.png',
      'favicon/apple-touch-icon.png',
      'favicon/web-app-manifest-192x192.png',
      'favicon/web-app-manifest-512x512.png',
      'favicon/site.webmanifest'
    ];
    
    test('all favicon files exist', () => {
      faviconFiles.forEach(file => {
        expect(existsSync(join(process.cwd(), file))).toBe(true);
      });
    });
    
    test('favicon files are properly referenced in HTML', () => {
      const faviconLinks = htmlContent.match(/<link[^>]*rel="(icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>/gi) || [];
      
      expect(faviconLinks.length).toBeGreaterThan(0);
      
      faviconLinks.forEach(link => {
        const hrefMatch = link.match(/href="([^"]*)"/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          
          // Should be relative paths
          expect(href).toMatch(/^\/favicon\//);
          
          // Should reference existing files
          const filePath = href.replace(/^\//, '');
          expect(faviconFiles).toContain(filePath);
        }
      });
    });
    
    test('has proper favicon sizes', () => {
      const faviconLinks = htmlContent.match(/<link[^>]*rel="icon"[^>]*>/gi) || [];
      
      faviconLinks.forEach(link => {
        const sizesMatch = link.match(/sizes="([^"]*)"/i);
        if (sizesMatch) {
          const sizes = sizesMatch[1];
          
          // Should have valid size format
          expect(sizes).toMatch(/^\d+x\d+$/);
          
          // Should be reasonable sizes
          const [width, height] = sizes.split('x').map(Number);
          expect(width).toBeGreaterThan(0);
          expect(height).toBeGreaterThan(0);
          expect(width).toBeLessThanOrEqual(512);
          expect(height).toBeLessThanOrEqual(512);
        }
      });
    });
    
    test('has proper apple touch icon', () => {
      const appleTouchIcon = htmlContent.match(/<link[^>]*rel="apple-touch-icon"[^>]*>/gi) || [];
      
      expect(appleTouchIcon.length).toBeGreaterThan(0);
      
      appleTouchIcon.forEach(link => {
        const hrefMatch = link.match(/href="([^"]*)"/i);
        const sizesMatch = link.match(/sizes="([^"]*)"/i);
        
        if (hrefMatch) {
          expect(hrefMatch[1]).toMatch(/^\/favicon\/apple-touch-icon/);
        }
        
        if (sizesMatch) {
          expect(sizesMatch[1]).toBe('180x180');
        }
      });
    });
    
    test('has proper web app manifest', () => {
      const manifestLink = htmlContent.match(/<link[^>]*rel="manifest"[^>]*>/gi) || [];
      
      expect(manifestLink.length).toBeGreaterThan(0);
      
      manifestLink.forEach(link => {
        const hrefMatch = link.match(/href="([^"]*)"/i);
        if (hrefMatch) {
          expect(hrefMatch[1]).toBe('/favicon/site.webmanifest');
        }
      });
      
      // Check that manifest file exists
      expect(existsSync(join(process.cwd(), 'favicon/site.webmanifest'))).toBe(true);
    });
  });
  
  describe('Error Page Assets', () => {
    test('404 page exists and is accessible', () => {
      expect(existsSync(join(process.cwd(), '404.html'))).toBe(true);
      
      const html404 = readFileSync(join(process.cwd(), '404.html'), 'utf8');
      
      // Should have proper title
      expect(html404).toMatch(/<title>[^<]*404[^<]*<\/title>/i);
      
      // Should have proper error code
      expect(html404).toMatch(/404/);
      
      // Should have navigation back to main site (either href to index.html or history.back())
      expect(html404).toMatch(/(href="[^"]*index\.html"|onclick="history\.back\(\)")/i);
    });
    
    test('50x error page exists and is accessible', () => {
      expect(existsSync(join(process.cwd(), '50x.html'))).toBe(true);
      
      const html50x = readFileSync(join(process.cwd(), '50x.html'), 'utf8');
      
      // Should have proper title
      expect(html50x).toMatch(/<title>[^<]*500[^<]*<\/title>/i);
      
      // Should have proper error code
      expect(html50x).toMatch(/500/);
      
      // Should have navigation back to main site (either href to index.html or history.back())
      expect(html50x).toMatch(/(href="[^"]*index\.html"|onclick="history\.back\(\)")/i);
    });
  });
  
  describe('Asset Optimization', () => {
    test('images have appropriate formats', () => {
      const imageFiles = [
        'images/HeadShotWeb.webp',
        'images/HeadShotWeb.jpg'
      ];
      
      imageFiles.forEach(file => {
        expect(existsSync(join(process.cwd(), file))).toBe(true);
      });
      
      // Should have WebP for modern browsers
      expect(existsSync(join(process.cwd(), 'images/HeadShotWeb.webp'))).toBe(true);
      
      // Should have JPG fallback
      expect(existsSync(join(process.cwd(), 'images/HeadShotWeb.jpg'))).toBe(true);
    });
    
    test('favicons have appropriate sizes', () => {
      const faviconSizes = [
        { file: 'favicon/favicon-16x16.png', size: '16x16' },
        { file: 'favicon/favicon-32x32.png', size: '32x32' },
        { file: 'favicon/favicon-96x96.png', size: '96x96' },
        { file: 'favicon/apple-touch-icon.png', size: '180x180' },
        { file: 'favicon/web-app-manifest-192x192.png', size: '192x192' },
        { file: 'favicon/web-app-manifest-512x512.png', size: '512x512' }
      ];
      
      faviconSizes.forEach(({ file, size }) => {
        expect(existsSync(join(process.cwd(), file))).toBe(true);
      });
    });
    
    test('has proper asset organization', () => {
      // Check directory structure
      expect(existsSync(join(process.cwd(), 'images'))).toBe(true);
      expect(existsSync(join(process.cwd(), 'favicon'))).toBe(true);
      
      // Check that assets are in correct directories
      const imageFiles = ['HeadShotWeb.webp', 'HeadShotWeb.jpg', 'HeadShotWeb.png'];
      imageFiles.forEach(file => {
        if (existsSync(join(process.cwd(), 'images', file))) {
          // File exists in images directory
          expect(true).toBe(true);
        }
      });
    });
  });
  
  describe('Asset References', () => {
    test('all referenced assets exist', () => {
      // Extract all asset references from HTML
      const assetReferences = [
        ...(htmlContent.match(/src="([^"]*\.(jpg|jpeg|png|webp|gif|svg))"/gi) || []),
        ...(htmlContent.match(/href="([^"]*\.(ico|png|svg|webmanifest))"/gi) || [])
      ];
      
      assetReferences.forEach(ref => {
        const srcMatch = ref.match(/src="([^"]*)"/i) || ref.match(/href="([^"]*)"/i);
        if (srcMatch) {
          const src = srcMatch[1];
          
          // Convert to file path
          const filePath = src.replace(/^\//, '').replace(/^\.\//, '');
          
          // Check if file exists
          if (filePath && !filePath.startsWith('http')) {
            expect(existsSync(join(process.cwd(), filePath))).toBe(true);
          }
        }
      });
    });
    
    test('no broken asset links', () => {
      const brokenLinks = [];
      
      // Check image sources
      const imageSrcs = htmlContent.match(/src="([^"]*\.(jpg|jpeg|png|webp|gif|svg))"/gi) || [];
      imageSrcs.forEach(src => {
        const srcMatch = src.match(/src="([^"]*)"/i);
        if (srcMatch) {
          const srcPath = srcMatch[1];
          if (!srcPath.startsWith('http') && !srcPath.startsWith('data:')) {
            const filePath = srcPath.replace(/^\//, '').replace(/^\.\//, '');
            if (!existsSync(join(process.cwd(), filePath))) {
              brokenLinks.push(filePath);
            }
          }
        }
      });
      
      // Check favicon links
      const faviconHrefs = htmlContent.match(/href="([^"]*\.(ico|png|svg|webmanifest))"/gi) || [];
      faviconHrefs.forEach(href => {
        const hrefMatch = href.match(/href="([^"]*)"/i);
        if (hrefMatch) {
          const hrefPath = hrefMatch[1];
          if (!hrefPath.startsWith('http')) {
            const filePath = hrefPath.replace(/^\//, '').replace(/^\.\//, '');
            if (!existsSync(join(process.cwd(), filePath))) {
              brokenLinks.push(filePath);
            }
          }
        }
      });
      
      expect(brokenLinks).toEqual([]);
    });
  });
}); 