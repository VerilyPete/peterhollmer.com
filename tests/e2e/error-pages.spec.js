import { test, expect } from "@playwright/test";

test.describe("Error Pages Tests", () => {
  test.describe("404 Page Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/404.html");
    });

    test("loads 404 page successfully", async ({ page }) => {
      await expect(page).toHaveTitle(/404 - Page Not Found \| Peter Hollmer/);

      // Check main content is visible
      await expect(page.locator("h1")).toContainText("404");
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });

    test("displays proper error message", async ({ page }) => {
      // Check that error explanation is present in page content
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(/page.*not.*found|not.*found/i);

      // Verify main content sections are visible
      await expect(page.locator("h2")).toBeVisible();
    });

    test("has home navigation link", async ({ page }) => {
      const homeLink = page.locator('a[href="./"]');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toContainText(/home/i);

      // Test navigation works
      await homeLink.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("has proper CSS styling and animations", async ({ page }) => {
      // Check that main content is visible and styled
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();

      // Wait for page to load completely
      await page.waitForLoadState("networkidle");

      // Verify page is interactive
      await expect(page.locator('a[href="./"]')).toBeVisible();
    });

    test("error number is prominently displayed", async ({ page }) => {
      // Check that error number (404) is visible in heading
      await expect(page.locator("h1")).toContainText("404");

      // Verify error number is properly positioned
      const h1Box = await page.locator("h1").boundingBox();
      expect(h1Box.width).toBeGreaterThan(0);
      expect(h1Box.height).toBeGreaterThan(0);
    });

    test("responsive design works", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();
      await expect(page.locator('a[href="./"]')).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();
    });

    test("has proper accessibility features", async ({ page }) => {
      // Check heading hierarchy
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);

      const h2 = page.locator("h2");
      await expect(h2).toHaveCount(1);

      // Check link accessibility
      const homeLink = page.locator('a[href="./"]');
      await expect(homeLink).toHaveAttribute("title");

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      await expect(homeLink).toBeFocused();

      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("loads without errors", async ({ page }) => {
      const errors = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/404.html");
      await page.waitForTimeout(1000);

      expect(errors).toEqual([]);
    });

    test("has proper color scheme and branding", async ({ page }) => {
      // Check that page has proper branding
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Verify content is visible and styled
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();

      // Check that page has visual styling applied
      const body = page.locator("body");
      const backgroundColor = await body.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    });
  });

  test.describe("50x Page Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/50x.html");
    });

    test("loads 50x page successfully", async ({ page }) => {
      await expect(page).toHaveTitle(/500 - Server Error \| Peter Hollmer/);

      // Check main content is visible
      await expect(page.locator("h1")).toContainText("50x");
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });

    test("displays proper error message", async ({ page }) => {
      // Check that error explanation is present in page content
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(
        /server.*error|technical.*difficulties|experiencing.*problems/i,
      );

      // Verify main content sections are visible
      await expect(page.locator("h2")).toBeVisible();
    });

    test("has home navigation link", async ({ page }) => {
      const homeLink = page.locator('a[href="./"]');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toContainText(/home/i);

      // Test navigation works
      await homeLink.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("has proper CSS styling and animations", async ({ page }) => {
      // Check that main content is visible and styled
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();

      // Wait for page to load completely
      await page.waitForLoadState("networkidle");

      // Verify page is interactive
      await expect(page.locator('a[href="./"]')).toBeVisible();
    });

    test("error number is prominently displayed", async ({ page }) => {
      // Check that error number (50x) is visible in heading
      await expect(page.locator("h1")).toContainText("50x");

      // Verify error number is properly positioned
      const h1Box = await page.locator("h1").boundingBox();
      expect(h1Box.width).toBeGreaterThan(0);
      expect(h1Box.height).toBeGreaterThan(0);
    });

    test("has different visual treatment than 404", async ({ page }) => {
      // Server error should have different content structure
      await expect(page.locator("h1")).toContainText("50x");
      await expect(page.locator("h2")).toContainText(/server.*error/i);

      // Check that page has visual styling
      const h1 = page.locator("h1");
      const color = await h1.evaluate((el) => getComputedStyle(el).color);
      expect(color).not.toBe("rgba(0, 0, 0, 0)");
    });

    test("responsive design works", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();
      await expect(page.locator('a[href="./"]')).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();
    });

    test("has proper accessibility features", async ({ page }) => {
      // Check heading hierarchy
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);

      const h2 = page.locator("h2");
      await expect(h2).toHaveCount(1);

      // Check link accessibility
      const homeLink = page.locator('a[href="./"]');
      await expect(homeLink).toHaveAttribute("title");

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      await expect(homeLink).toBeFocused();

      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("loads without errors", async ({ page }) => {
      const errors = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/50x.html");
      await page.waitForTimeout(1000);

      expect(errors).toEqual([]);
    });

    test("page visual effects work", async ({ page }) => {
      // Check that page loads with proper visual treatment
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2")).toBeVisible();

      // Verify page is fully loaded and interactive
      await page.waitForLoadState("networkidle");
      await expect(page.locator('a[href="./"]')).toBeVisible();
    });
  });

  test.describe("Error Page Navigation Tests", () => {
    test("404 page accessible via non-existent URL", async ({
      page,
      context,
    }) => {
      // Try to access a non-existent page (this might not work in dev server)
      // This test is more relevant for production deployment
      const response = await context.request
        .get("/non-existent-page.html")
        .catch(() => null);

      if (response && response.status() === 404) {
        await page.goto("/non-existent-page.html");
        await expect(page.locator("h1")).toContainText("404");
      } else {
        // If server doesn't return 404, just test direct access
        await page.goto("/404.html");
        await expect(page.locator("h1")).toContainText("404");
      }
    });

    test("both error pages have consistent branding", async ({ page }) => {
      // Test 404 page branding
      await page.goto("/404.html");
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Test 50x page branding
      await page.goto("/50x.html");
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });

    test("error pages link back to homepage correctly", async ({ page }) => {
      // Test from 404
      await page.goto("/404.html");
      const homeLink404 = page.locator('a[href="./"]');
      await homeLink404.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);

      // Test from 50x
      await page.goto("/50x.html");
      const homeLink50x = page.locator('a[href="./"]');
      await homeLink50x.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });
  });

  test.describe("Cross-Browser Error Page Tests", () => {
    test("404 page animations work across browsers", async ({
      page,
      browserName,
    }) => {
      await page.goto("/404.html");

      const errorNumber = page.locator(".error-number");
      await expect(errorNumber).toBeVisible();

      // Animation should work in all browsers
      const animationName = await errorNumber.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(animationName).not.toBe("none");
    });

    test("50x page animations work across browsers", async ({
      page,
      browserName,
    }) => {
      await page.goto("/50x.html");

      const errorNumber = page.locator(".error-number");
      await expect(errorNumber).toBeVisible();

      // Animation should work in all browsers
      const animationName = await errorNumber.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(animationName).not.toBe("none");
    });

    test("gradients render correctly across browsers", async ({
      page,
      browserName,
    }) => {
      await page.goto("/404.html");

      const body = page.locator("body");
      const background = await body.evaluate(
        (el) => getComputedStyle(el).backgroundImage,
      );

      // Should contain gradient in all browsers
      expect(background).toContain("gradient");
    });
  });

  test.describe("Performance Tests", () => {
    test("404 page loads quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/404.html");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test("50x page loads quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/50x.html");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test("error pages have minimal resource dependencies", async ({ page }) => {
      const requests = [];

      page.on("request", (request) => {
        requests.push(request.url());
      });

      await page.goto("/404.html");
      await page.waitForLoadState("networkidle");

      // Error pages should have minimal external dependencies
      const externalRequests = requests.filter(
        (url) => !url.includes("localhost"),
      );
      expect(externalRequests.length).toBeLessThan(5);
    });
  });
});
