import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Functionality', () => {
  test('loads the main page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Peter Hollmer/);
    
    // Check main content is visible - be specific about the home page
    await expect(page.locator('#home-page h1')).toContainText('Peter Hollmer');
    await expect(page.locator('#home-page .subtitle')).toBeVisible();
    await expect(page.locator('#home-page .description')).toBeVisible();
  });

  test('displays profile image correctly', async ({ page }) => {
    await page.goto('/');
    
    const profileImage = page.locator('.profile-image img');
    await expect(profileImage).toBeVisible();
    
    // Check image has alt text
    await expect(profileImage).toHaveAttribute('alt', 'Peter Hollmer');
  });

  test('contact modal opens and closes', async ({ page }) => {
    await page.goto('/');
    
    // Prefer robust locator: try the Contact nav button first, then fallback to email button
    const contactNavButton = page.locator('button.nav-link').filter({ hasText: 'Contact' });
    const emailButton = page.locator('button[aria-label="Send email"]');
    const opener = (await contactNavButton.count()) > 0 ? contactNavButton : emailButton;
    await opener.click();
    
    // Check modal is visible via visibility, not class
    const modal = page.locator('#contactModal');
    await expect(modal).toBeVisible();
    
    // Close modal
    const closeButton = page.locator('.close-btn');
    await closeButton.click();
    
    // Check modal is hidden via visibility
    await expect(modal).not.toBeVisible();
  });

  test('social links are accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check LinkedIn link (allow slight URL changes)
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('href', /linkedin\.com\/in\/phollmer/i);
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check content is still visible - be specific about the home page
    await expect(page.locator('#home-page h1')).toBeVisible();
    await expect(page.locator('#home-page .subtitle')).toBeVisible();
    await expect(page.locator('#home-page .description')).toBeVisible();
    
    // Check social links are accessible
    const socialLinks = page.locator('.social-links');
    await expect(socialLinks).toBeVisible();
  });

  test('animations are present', async ({ page }) => {
    await page.goto('/');
    
    // Check for animated elements
    const floatingShapes = page.locator('.floating-shapes');
    await expect(floatingShapes).toBeVisible();
    
    const statusDot = page.locator('.status-dot');
    await expect(statusDot).toBeVisible();
  });

  test('footer is displayed', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/©\s+\d{4}\s+Peter Hollmer/);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Open modal via robust locator
    const contactNavButton = page.locator('button.nav-link').filter({ hasText: 'Contact' });
    const emailButton = page.locator('button[aria-label="Send email"]');
    const opener = (await contactNavButton.count()) > 0 ? contactNavButton : emailButton;
    await opener.click();
    
    // Press Escape to close modal
    await page.keyboard.press('Escape');
    
    const modal = page.locator('#contactModal');
    await expect(modal).not.toBeVisible();
  });

  test('page loads without JavaScript errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(1000);
    
    expect(errors).toEqual([]);
  });

  test('images load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check profile image loads
    const profileImage = page.locator('.profile-image img');
    await expect(profileImage).toBeVisible();
    
    // Wait for image to load
    await profileImage.waitFor({ state: 'visible' });
    
    // Check image dimensions are reasonable
    const imageBox = await profileImage.boundingBox();
    expect(imageBox.width).toBeGreaterThan(0);
    expect(imageBox.height).toBeGreaterThan(0);
  });

  test('CSS animations are working', async ({ page }) => {
    await page.goto('/');
    
    // Check for animated elements - be specific about the home page container
    const container = page.locator('#home-page .container');
    await expect(container).toBeVisible();
    
    // Wait for animations to start
    await page.waitForTimeout(100);
    
    // Check that container has reasonable dimensions (better than coordinate checks)
    const containerBox = await container.boundingBox();
    expect(containerBox.width).toBeGreaterThan(0);
    expect(containerBox.height).toBeGreaterThan(0);
    
    // Check for animated elements that should be present
    const statusDot = page.locator('.status-dot');
    await expect(statusDot).toBeVisible();
    
    // Verify some animation is applied (more flexible than checking specific names)
    const animation = await container.evaluate(el => getComputedStyle(el).animationName);
    expect(animation).not.toBe('none');
  });
});
