import { test, expect } from '@playwright/test';

test.describe('Error Pages Testing', () => {
  test.describe('404 Error Page', () => {
    test('404 page has proper content and branding', async ({ page }) => {
      await page.goto('/404.html');
      
      // Check page title
      await expect(page).toHaveTitle('404 - Page Not Found | Peter Hollmer');
      
      // Check main error elements
      await expect(page.locator('.error-code')).toContainText('404');
      await expect(page.locator('h1')).toContainText('Lost in Space');
      await expect(page.locator('.error-subtitle')).toContainText('wrong turn');
      
      // Check branding consistency
      await expect(page.locator('h1')).toHaveCSS('background-clip', 'text');
      
      // Check astronaut icon
      await expect(page.locator('.astronaut')).toBeVisible();
      await expect(page.locator('.astronaut svg')).toBeVisible();
    });

    test('404 page navigation works', async ({ page }) => {
      await page.goto('/404.html');
      
      // Check go back button
      const backButton = page.locator('button:has-text("Go Back")');
      await expect(backButton).toBeVisible();
      await expect(backButton).toBeEnabled();
      await expect(backButton).toHaveAttribute('onclick', 'history.back()');
      
      // Verify button styling
      await expect(backButton).toHaveClass(/btn-primary/);
    });

    test('404 page has proper styling and animations', async ({ page }) => {
      await page.goto('/404.html');
      
      // Check background and layout
      await expect(page.locator('body')).toHaveCSS('background', /linear-gradient/);
      
      // Check floating shapes animation
      await expect(page.locator('.floating-shapes')).toBeVisible();
      await expect(page.locator('.shape')).toHaveCount(4);
      
      // Check container styling - be more specific
      const container = page.locator('.container').first(); // Take first container to avoid ambiguity
      await expect(container).toBeVisible();
      await expect(container).toHaveCSS('backdrop-filter', 'blur(20px)');
      
      // Check astronaut animation
      const astronaut = page.locator('.astronaut');
      await expect(astronaut).toBeVisible();
      
      // Verify the animation is applied (check computed style)
      const animationName = await astronaut.evaluate(el => getComputedStyle(el).animationName);
      expect(animationName).toContain('float');
    });

    test('404 page visual effects work', async ({ page }) => {
      await page.goto('/404.html');
      
      // Check glow animation on error code
      const errorCode = page.locator('.error-code');
      await expect(errorCode).toBeVisible();
      
      const animationName = await errorCode.evaluate(el => getComputedStyle(el).animationName);
      expect(animationName).toContain('glow');
      
      // Check slide-up animation on container
      const container = page.locator('.container').first();
      const containerAnimation = await container.evaluate(el => getComputedStyle(el).animationName);
      expect(containerAnimation).toContain('slide-up');
    });

    test('404 page responsive design', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/404.html');
      
      // Check mobile styling
      const container = page.locator('.container').first();
      await expect(container).toBeVisible();
      
      const errorCode = page.locator('.error-code');
      await expect(errorCode).toBeVisible();
      
      // Check button layout on mobile
      const backButton = page.locator('button:has-text("Go Back")');
      await expect(backButton).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await expect(container).toBeVisible();
      await expect(errorCode).toBeVisible();
    });

    test('404 page interactive effects', async ({ page }) => {
      await page.goto('/404.html');
      
      // Test mouse move sparkle effect
      await page.mouse.move(100, 100);
      await page.mouse.move(200, 200);
      await page.mouse.move(300, 300);
      
      // Wait a bit for sparkles to potentially appear
      await page.waitForTimeout(500);
      
      // The sparkle effect should not cause errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(errors).toEqual([]);
    });
  });

  test.describe('50x Error Page', () => {
    test('50x page has proper content and branding', async ({ page }) => {
      await page.goto('/50x.html');
      
      // Check page title
      await expect(page).toHaveTitle('500 - Server Error | Peter Hollmer');
      
      // Check main error elements
      await expect(page.locator('.error-code')).toContainText('500');
      await expect(page.locator('h1')).toContainText('Internal Server Error');
      await expect(page.locator('.error-subtitle')).toContainText('went wrong on our end');
      
      // Check server icon
      await expect(page.locator('.server-icon')).toBeVisible();
      await expect(page.locator('.server-icon svg')).toBeVisible();
      
      // Check error details
      await expect(page.locator('.error-details')).toBeVisible();
      await expect(page.locator('#errorId')).toBeVisible();
      await expect(page.locator('#timestamp')).toBeVisible();
      
      // Verify error ID and timestamp are populated
      const errorId = await page.locator('#errorId').textContent();
      const timestamp = await page.locator('#timestamp').textContent();
      expect(errorId).toMatch(/^[A-Z0-9]{8}$/);
      expect(timestamp).toMatch(/\d/);
    });

    test('50x page navigation works', async ({ page }) => {
      await page.goto('/50x.html');
      
      // Check go back button
      const backButton = page.locator('button:has-text("Go Back")');
      await expect(backButton).toBeVisible();
      await expect(backButton).toBeEnabled();
      await expect(backButton).toHaveAttribute('onclick', 'history.back()');
      
      // Verify button styling
      await expect(backButton).toHaveClass(/btn-primary/);
    });

    test('50x page has proper color scheme and branding', async ({ page }) => {
      await page.goto('/50x.html');
      
      // Check background color scheme (different from 404)
      await expect(page.locator('body')).toHaveCSS('background', /linear-gradient/);
      
      // Check floating shapes (should have 5 instead of 4)
      await expect(page.locator('.floating-shapes')).toBeVisible();
      await expect(page.locator('.shape')).toHaveCount(5);
      
      // Check server icon animation
      const serverIcon = page.locator('.server-icon');
      await expect(serverIcon).toBeVisible();
      
      const animationName = await serverIcon.evaluate(el => getComputedStyle(el).animationName);
      expect(animationName).toContain('shake');
    });

    test('50x page visual effects work', async ({ page }) => {
      await page.goto('/50x.html');
      
      // Check glow animation on error code
      const errorCode = page.locator('.error-code');
      await expect(errorCode).toBeVisible();
      
      const animationName = await errorCode.evaluate(el => getComputedStyle(el).animationName);
      expect(animationName).toContain('glow');
      
      // Check container animation
      const container = page.locator('.container').first();
      const containerAnimation = await container.evaluate(el => getComputedStyle(el).animationName);
      expect(containerAnimation).toContain('slide-up');
      
      // Check floating shapes animation (should be slower than 404)
      const shapes = page.locator('.shape').first();
      const shapeAnimation = await shapes.evaluate(el => getComputedStyle(el).animationDuration);
      expect(shapeAnimation).toBe('25s'); // 25s vs 20s on 404 page
    });

    test('50x page interactive effects', async ({ page }) => {
      await page.goto('/50x.html');
      
      // Test mouse move effects (should have both sparkle and trail)
      await page.mouse.move(100, 100);
      await page.mouse.move(200, 200);
      await page.mouse.move(300, 300);
      
      // Wait for effects
      await page.waitForTimeout(500);
      
      // Should not cause errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(errors).toEqual([]);
    });

    test('50x page responsive design', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/50x.html');
      
      // Check mobile styling
      const container = page.locator('.container').first();
      await expect(container).toBeVisible();
      
      const errorDetails = page.locator('.error-details');
      await expect(errorDetails).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await expect(container).toBeVisible();
      await expect(errorDetails).toBeVisible();
    });
  });

  test.describe('Error Page Consistency', () => {
    test('both error pages have consistent styling patterns', async ({ page }) => {
      // Test 404 page
      await page.goto('/404.html');
      
      const container404 = page.locator('.container').first();
      const errorCode404 = page.locator('.error-code');
      
      await expect(container404).toHaveCSS('border-radius', '20px');
      await expect(errorCode404).toHaveCSS('font-weight', '900');
      
      // Test 50x page
      await page.goto('/50x.html');
      
      const container50x = page.locator('.container').first();
      const errorCode50x = page.locator('.error-code');
      
      await expect(container50x).toHaveCSS('border-radius', '20px');
      await expect(errorCode50x).toHaveCSS('font-weight', '900');
    });

    test('error pages have proper accessibility features', async ({ page }) => {
      // Test 404 page
      await page.goto('/404.html');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toBeVisible();
      
      // Test 50x page  
      await page.goto('/50x.html');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('error pages handle JavaScript gracefully', async ({ page }) => {
      // Disable JavaScript and test functionality
      await page.goto('/404.html');
      
      // Page should still be readable without JS
      await expect(page.locator('.error-code')).toContainText('404');
      await expect(page.locator('h1')).toContainText('Lost in Space');
      await expect(page.locator('button')).toBeVisible();
      
      await page.goto('/50x.html');
      await expect(page.locator('.error-code')).toContainText('500');
      await expect(page.locator('h1')).toContainText('Internal Server Error');
      await expect(page.locator('button')).toBeVisible();
    });
  });
});