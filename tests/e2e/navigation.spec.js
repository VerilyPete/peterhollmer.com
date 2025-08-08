import { test, expect } from "@playwright/test";

test.describe("Navigation and Cross-Page Tests", () => {
  test.describe("Homepage Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("navigates to resume page from homepage", async ({ page }) => {
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await expect(resumeButton).toBeVisible();

      await resumeButton.click();
      await expect(page).toHaveURL(/pete-resume\.html/);
      await expect(page).toHaveTitle(
        /Senior Technical Operations & Engineering Leadership/,
      );
    });

    test("external social links open in new tabs", async ({
      page,
      context,
    }) => {
      // Test LinkedIn link
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      await expect(linkedinLink).toHaveAttribute("target", "_blank");

      // Test GitHub link
      const githubLink = page.locator('a[href*="github.com"]');
      await expect(githubLink).toHaveAttribute("target", "_blank");

      // Verify security attributes
      await expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
      await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("contact modal navigation works", async ({ page }) => {
      // Open contact modal using robust locator
      const contactButton = page
        .locator('button[aria-label="Send email"], button.nav-link', {
          hasText: "Contact",
        })
        .first();
      await contactButton.click();

      // Use visibility not class
      const modal = page.locator("#contactModal");
      await expect(modal).toBeVisible();

      // Modal should not affect page navigation
      await expect(page).toHaveURL("/");

      // Close modal and verify we're still on homepage
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
      await expect(page).toHaveURL("/");
    });
  });

  test.describe("Resume Page Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/pete-resume.html");
    });

    test("navigates back to homepage from resume", async ({ page }) => {
      const websiteLink = page.locator('a[href="./"]');
      await expect(websiteLink).toBeVisible();
      await expect(websiteLink).toContainText(/website/i);

      await websiteLink.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
      await expect(page).toHaveTitle(/Peter Hollmer/);
    });

    test("external links work correctly from resume page", async ({ page }) => {
      // Test LinkedIn link
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      await expect(linkedinLink).toHaveAttribute("target", "_blank");
      await expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");

      // Test GitHub link
      const githubLink = page.locator('a[href*="github.com"]');
      await expect(githubLink).toHaveAttribute("target", "_blank");
      await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("PDF download link works", async ({ page }) => {
      const downloadLink = page.locator("a[download]");
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toHaveAttribute(
        "href",
        "./Peter Hollmer Resume.pdf",
      );
      await expect(downloadLink).toHaveAttribute("download");

      // Clicking should initiate download (we won't actually download in test)
      const downloadPromise = page.waitForEvent("download");
      await downloadLink.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain("Resume");
    });
  });

  test.describe("Error Page Navigation", () => {
    test("404 page shows a Back button and clicking navigates back", async ({ page }) => {
      // Navigate to homepage first, then to 404, so Back has somewhere to go
      await page.goto("/");
      await page.goto("/404.html");

      const backButton = page.locator('button.btn:has-text("Go Back")');
      await expect(backButton).toBeVisible();

      await backButton.click();
      // Should navigate back to previous page (home)
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("50x page shows a Back button and clicking navigates back", async ({ page }) => {
      await page.goto("/");
      await page.goto("/50x.html");

      const backButton = page.locator('button.btn:has-text("Go Back")');
      await expect(backButton).toBeVisible();

      await backButton.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });
  });

  test.describe("Full Navigation Flow", () => {
    test("complete user journey: home → resume → home", async ({ page }) => {
      // Start at homepage
      await page.goto("/");
      await expect(page.locator("#home-page h1")).toContainText(
        "Peter Hollmer",
      );

      // Navigate to resume
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.click();
      await expect(page).toHaveURL(/pete-resume\.html/);
      await expect(page.locator("h1")).toContainText("Peter Hollmer");

      // Navigate back to homepage
      const websiteLink = page.locator('a[href="./"]');
      await websiteLink.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
      await expect(page.locator("#home-page h1")).toContainText(
        "Peter Hollmer",
      );
    });

    test("complete user journey: home → contact modal → resume → home", async ({
      page,
    }) => {
      // Start at homepage
      await page.goto("/");

      // Open contact modal (try email button or Contact nav)
      const contactButton = page
        .locator('button[aria-label="Send email"], button.nav-link', {
          hasText: "Contact",
        })
        .first();
      await contactButton.click();

      const modal = page.locator("#contactModal");
      await expect(modal).toBeVisible();

      // Close modal
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();

      // Navigate to resume
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.click();
      await expect(page).toHaveURL(/pete-resume\.html/);

      // Navigate back to homepage
      const websiteLink = page.locator('a[href="./"]');
      await websiteLink.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });
  });

  test.describe("Browser Navigation", () => {
    test("back and forward buttons work correctly", async ({ page }) => {
      // Start at homepage
      await page.goto("/");
      await expect(page).toHaveURL("/");

      // Navigate to resume
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.click();
      await expect(page).toHaveURL(/pete-resume\.html/);

      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL("/");
      await expect(page.locator("#home-page h1")).toContainText(
        "Peter Hollmer",
      );

      // Use browser forward button
      await page.goForward();
      await expect(page).toHaveURL(/pete-resume\.html/);
      await expect(page.locator("h1")).toContainText("Peter Hollmer");
    });

    test("page refresh maintains content", async ({ page }) => {
      // Test homepage refresh
      await page.goto("/");
      await page.reload();
      await expect(page.locator("#home-page h1")).toContainText(
        "Peter Hollmer",
      );
      await expect(page.locator(".social-links")).toBeVisible();

      // Test resume page refresh
      await page.goto("/pete-resume.html");
      await page.reload();
      await expect(page.locator("h1")).toContainText("Peter Hollmer");
      // Contact info class not present; assert header and links instead
      await expect(page.locator(".contact-links")).toBeVisible();
    });

    test("direct URL access works for all pages", async ({ page }) => {
      // Direct access to homepage
      await page.goto("/index.html");
      await expect(page.locator("#home-page h1")).toContainText(
        "Peter Hollmer",
      );

      // Direct access to resume
      await page.goto("/pete-resume.html");
      await expect(page.locator("h1")).toContainText("Peter Hollmer");

      // Direct access to error pages
      await page.goto("/404.html");
      await expect(page.locator(".error-code")).toContainText("404");

      await page.goto("/50x.html");
      await expect(page.locator(".error-code")).toContainText("500");
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("tab navigation works across pages", async ({ page }) => {
      // Test homepage tab navigation
      await page.goto("/");

      // Tab to navigation elements
      await page.keyboard.press("Tab");
      let focusedElement = await page.evaluate(
        () => document.activeElement.tagName,
      );
      expect(["BUTTON", "A"].includes(focusedElement)).toBeTruthy();

      // Test resume page tab navigation
      await page.goto("/pete-resume.html");

      await page.keyboard.press("Tab");
      const firstContactLink = page.locator(".contact-links a").first();
      await expect(firstContactLink).toBeFocused();
    });

    test("Enter key activates navigation elements", async ({ page }) => {
      await page.goto("/");

      // Focus on resume button and activate with Enter
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.focus();
      await page.keyboard.press("Enter");

      await expect(page).toHaveURL(/pete-resume\.html/);
    });

    test("Space key activates buttons", async ({ page }) => {
      await page.goto("/");

      // Focus on contact/email button and activate with Space
      const contactButton = page
        .locator('button[aria-label="Send email"], button.nav-link', {
          hasText: "Contact",
        })
        .first();
      await contactButton.focus();
      await page.keyboard.press("Space");

      const modal = page.locator("#contactModal");
      await expect(modal).toBeVisible();
    });
  });

  test.describe("Page Transitions and Loading", () => {
    test("page transitions are smooth", async ({ page }) => {
      await page.goto("/");

      // Measure navigation time
      const startTime = Date.now();
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.click();

      await page.waitForLoadState("networkidle");
      const navigationTime = Date.now() - startTime;

      // Navigation should be reasonably fast
      expect(navigationTime).toBeLessThan(3000);
      await expect(page.locator("h1")).toContainText("Peter Hollmer");
    });

    test("pages load with proper animations", async ({ page }) => {
      // Test homepage animations
      await page.goto("/");
      const container = page.locator("#home-page .container");
      await expect(container).toBeVisible();

      const animationName = await container.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(animationName).not.toBe("none");

      // Test resume page visible content
      await page.goto("/pete-resume.html");
      const header = page.locator(".header");
      await expect(header).toBeVisible();

      // Wait briefly
      await page.waitForTimeout(100);
      const headerAnimation = await header.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(headerAnimation).not.toBe("none");
    });

    test("no content flash or layout shift during navigation", async ({
      page,
    }) => {
      await page.goto("/");

      // Get initial layout measurements
      const container = page.locator("#home-page .container");
      await expect(container).toBeVisible();
      const initialBox = await container.boundingBox();

      // Navigate and check for layout stability
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.click();

      await expect(page).toHaveURL(/pete-resume\.html/);
      const resumeHeader = page.locator(".header");
      await expect(resumeHeader).toBeVisible();

      // Content should load without major layout shifts
      const finalBox = await resumeHeader.boundingBox();
      expect(finalBox.width).toBeGreaterThan(0);
      expect(finalBox.height).toBeGreaterThan(0);
    });
  });

  test.describe("Cross-Page Consistency", () => {
    test("consistent styling across pages", async ({ page }) => {
      // Check homepage gradient
      await page.goto("/");
      const homeBody = page.locator("body");
      const homeBackground = await homeBody.evaluate(
        (el) => getComputedStyle(el).backgroundImage,
      );
      expect(homeBackground).toContain("gradient");

      // Check resume page gradient
      await page.goto("/pete-resume.html");
      const resumeBody = page.locator("body");
      const resumeBackground = await resumeBody.evaluate(
        (el) => getComputedStyle(el).backgroundImage,
      );
      expect(resumeBackground).toContain("gradient");

      // Check error page gradients
      await page.goto("/404.html");
      const errorBody = page.locator("body");
      const errorBackground = await errorBody.evaluate(
        (el) => getComputedStyle(el).backgroundImage,
      );
      expect(errorBackground).toContain("gradient");
    });

    test("consistent font families across pages", async ({ page }) => {
      const pages = ["/", "/pete-resume.html", "/404.html", "/50x.html"];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        const body = page.locator("body");
        const fontFamily = await body.evaluate(
          (el) => getComputedStyle(el).fontFamily,
        );

        // Should use expected font stack
        expect(fontFamily).toContain("SF Pro Display");
      }
    });

    test("consistent viewport meta tags", async ({ page }) => {
      const pages = ["/", "/pete-resume.html", "/404.html", "/50x.html"];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute(
          "content",
          "width=device-width, initial-scale=1.0",
        );
      }
    });

    test("consistent branding in titles", async ({ page }) => {
      const pages = [
        { url: "/", title: "Peter Hollmer" },
        { url: "/pete-resume.html", title: "Peter Hollmer" },
        { url: "/404.html", title: "Peter Hollmer" },
        { url: "/50x.html", title: "Peter Hollmer" },
      ];

      for (const { url, title } of pages) {
        await page.goto(url);
        await expect(page).toHaveTitle(new RegExp(title));
      }
    });
  });

  test.describe("Link Integrity", () => {
    test("all internal links are valid", async ({ page, context }) => {
      const brokenLinks = [];

      // Check homepage links
      await page.goto("/");
      const homeLinks = page.locator(
        'a[href^="./"], a[href^="/"], a[href^="pete-resume.html"]',
      );

      for (let i = 0; i < (await homeLinks.count()); i++) {
        const link = homeLinks.nth(i);
        const href = await link.getAttribute("href");

        if (href && !href.startsWith("http")) {
          try {
            const response = await context.request.get(href);
            if (response.status() >= 400) {
              brokenLinks.push(`${href} (${response.status()})`);
            }
          } catch (error) {
            brokenLinks.push(`${href} (error: ${error.message})`);
          }
        }
      }

      // Check resume page links
      await page.goto("/pete-resume.html");
      const resumeLinks = page.locator('a[href^="./"], a[href^="/"]');

      for (let i = 0; i < (await resumeLinks.count()); i++) {
        const link = resumeLinks.nth(i);
        const href = await link.getAttribute("href");

        if (href && !href.startsWith("http") && !href.endsWith(".pdf")) {
          try {
            const response = await context.request.get(href);
            if (response.status() >= 400) {
              brokenLinks.push(`${href} (${response.status()})`);
            }
          } catch (error) {
            brokenLinks.push(`${href} (error: ${error.message})`);
          }
        }
      }

      expect(brokenLinks).toEqual([]);
    });

    test("PDF file is accessible", async ({ page, context }) => {
      const response = await context.request.get("./Peter Hollmer Resume.pdf");
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/pdf/);
    });

    test("favicon resources are accessible", async ({ page, context }) => {
      await page.goto("/");

      const faviconLinks = page.locator('link[rel*="icon"]');
      const brokenFavicons = [];

      for (let i = 0; i < (await faviconLinks.count()); i++) {
        const link = faviconLinks.nth(i);
        const href = await link.getAttribute("href");

        if (href) {
          try {
            const response = await context.request.get(href);
            if (response.status() >= 400) {
              brokenFavicons.push(`${href} (${response.status()})`);
            }
          } catch (error) {
            brokenFavicons.push(`${href} (error: ${error.message})`);
          }
        }
      }

      expect(brokenFavicons).toEqual([]);
    });
  });
});
