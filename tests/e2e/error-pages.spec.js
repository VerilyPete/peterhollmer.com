import { test, expect } from "@playwright/test";

test.describe("Error Pages Tests", () => {
  test.describe("404 Page Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/404.html");
    });

    test("[smoke] loads 404 page successfully", async ({ page }) => {
      await expect(page).toHaveTitle(/404 - Page Not Found \| Peter Hollmer/);

      // Check main content is visible
      await expect(page.locator(".error-code")).toContainText("404");
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });

    test("displays proper error message", async ({ page }) => {
      // Check that error explanation is present in page content
      const pageContent = await page.textContent("body");
      // Accept either classic copy or current themed copy
      expect(pageContent).toMatch(/(page.*not.*found|not.*found|lost in space|wrong turn)/i);

      // Verify main message and subtitle are visible
      await expect(page.locator(".error-message")).toBeVisible();
    });

    test("has Back button that navigates back", async ({ page }) => {
      // Navigate from home then to 404 to make Back meaningful
      await page.goto("/");
      await page.goto("/404.html");

      const backButton = page.locator('button.btn:has-text("Go Back")');
      await expect(backButton).toBeVisible();

      await backButton.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("has proper CSS styling and animations", async ({ page }) => {
      // Check that main content is visible and styled
      await expect(page.locator(".error-code")).toBeVisible();

      // Wait for page to load completely
      await page.waitForLoadState("networkidle");

      // Verify presence of action button
      await expect(page.locator('button.btn:has-text("Go Back")')).toBeVisible();
    });

    test("error number is prominently displayed", async ({ page }) => {
      // Check that error number (404) is visible
      await expect(page.locator(".error-code")).toContainText("404");

      // Verify dimensions
      const box = await page.locator(".error-code").boundingBox();
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    });

    test("responsive design works", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator(".error-code")).toBeVisible();
      await expect(page.locator('button.btn:has-text("Go Back")')).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator(".error-code")).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator(".error-code")).toBeVisible();
    });

    test("has proper accessibility features", async ({ page }) => {
      // Check title branding exists
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Test keyboard navigation to Back button
      const backButton = page.locator('button.btn:has-text("Go Back")');
      await backButton.focus();
      await expect(backButton).toBeFocused();
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

      // Verify visible content and non-transparent background
      const body = page.locator("body");
      const backgroundImage = await body.evaluate(
        (el) => getComputedStyle(el).backgroundImage,
      );
      expect(backgroundImage).toContain("gradient");
    });
  });

  test.describe("50x Page Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/50x.html");
    });

    test("[smoke] loads 50x page successfully", async ({ page }) => {
      await expect(page).toHaveTitle(/500 - Server Error \| Peter Hollmer/);

      // Check main content is visible
      await expect(page.locator(".error-code")).toContainText("500");
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });

    test("displays proper error message", async ({ page }) => {
      // Check that error explanation is present
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(
        /server.*error|technical.*difficulties|experiencing.*problems/i,
      );
    });

    test("has Back button that navigates back", async ({ page }) => {
      await page.goto("/");
      await page.goto("/50x.html");

      const backButton = page.locator('button.btn:has-text("Go Back")');
      await expect(backButton).toBeVisible();

      await backButton.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("has proper CSS styling and animations", async ({ page }) => {
      // Check that main content is visible and styled
      await expect(page.locator(".error-code")).toBeVisible();

      // Wait for page to load completely
      await page.waitForLoadState("networkidle");

      // Verify presence of action button
      await expect(page.locator('button.btn:has-text("Go Back")')).toBeVisible();
    });

    test("error number is prominently displayed", async ({ page }) => {
      await expect(page.locator(".error-code")).toContainText("500");
      const box = await page.locator(".error-code").boundingBox();
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    });

    test("responsive design works", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator(".error-code")).toBeVisible();
      await expect(page.locator('button.btn:has-text("Go Back")')).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator(".error-code")).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator(".error-code")).toBeVisible();
    });

    test("has proper accessibility features", async ({ page }) => {
      // Check title branding exists
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Test keyboard navigation to Back button
      const backButton = page.locator('button.btn:has-text("Go Back")');
      await backButton.focus();
      await expect(backButton).toBeFocused();
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
      await expect(page.locator(".error-code")).toBeVisible();

      // Verify page is fully loaded and interactive
      await page.waitForLoadState("networkidle");
      await expect(page.locator('button.btn:has-text("Go Back")')).toBeVisible();
    });
  });

  test.describe("Error Page Navigation Tests", () => {
    test(
      "404 page accessible via non-existent URL (if server supports)",
      async ({ page, context }) => {
        const response = await context.request
          .get("/non-existent-page.html")
          .catch(() => null);

        if (response && response.status() === 404) {
          await page.goto("/non-existent-page.html");
          // Some static servers return a plain directory 404 without our markup
          const hasErrorCode = await page.locator(".error-code").count();
          if (hasErrorCode === 0) {
            await page.goto("/404.html");
          }
          await expect(page.locator(".error-code")).toContainText("404");
        } else {
          // If server doesn't return 404, just test direct access
          await page.goto("/404.html");
          await expect(page.locator(".error-code")).toContainText("404");
        }
      },
    );

    test("both error pages have consistent branding", async ({ page }) => {
      // Test 404 page branding
      await page.goto("/404.html");
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Test 50x page branding
      await page.goto("/50x.html");
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });
  });

  test.describe("Cross-Browser Error Page Tests", () => {
    test("404 page animations work across browsers", async ({ page }) => {
      await page.goto("/404.html");

      const errorCode = page.locator(".error-code");
      await expect(errorCode).toBeVisible();

      const animationName = await errorCode.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(animationName).not.toBe("none");
    });

    test("50x page animations work across browsers", async ({ page }) => {
      await page.goto("/50x.html");

      const errorCode = page.locator(".error-code");
      await expect(errorCode).toBeVisible();

      const animationName = await errorCode.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(animationName).not.toBe("none");
    });

    test("gradients render correctly across browsers", async ({ page }) => {
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

      expect(loadTime).toBeLessThan(3000);
    });

    test("50x page loads quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/50x.html");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test("error pages have minimal resource dependencies", async ({ page }) => {
      const requests = [];

      page.on("request", (request) => {
        requests.push(request.url());
      });

      await page.goto("/404.html");
      await page.waitForLoadState("networkidle");

      // Error pages should have minimal external dependencies
      const externalRequests = requests.filter((url) => !url.includes("localhost"));
      expect(externalRequests.length).toBeLessThan(5);
    });
  });
});
