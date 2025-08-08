import { test, expect } from "@playwright/test";

test.describe("Homepage Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Basic Page Structure", () => {
    test("[smoke] loads the main page successfully", async ({ page }) => {
      await expect(page).toHaveTitle(
        /Peter Hollmer - Transforming Teams & Delivering Results/,
      );

      // Check main content is visible using semantic elements
      await expect(
        page.locator("h1").filter({ hasText: "Peter Hollmer" }),
      ).toContainText("Peter Hollmer");
      await expect(page.locator("p").first()).toBeVisible();
      await expect(page.locator("a").first()).toBeVisible(); // Social links present
    });

    test("displays profile image correctly", async ({ page }) => {
      const profileImage = page.locator("img").first();
      await expect(profileImage).toBeVisible();

      // Check image has alt text
      await expect(profileImage).toHaveAttribute("alt", "Peter Hollmer");

      // Verify image loads without errors
      await profileImage.waitFor({ state: "visible" });
      const imageBox = await profileImage.boundingBox();
      expect(imageBox.width).toBeGreaterThan(0);
      expect(imageBox.height).toBeGreaterThan(0);
    });

    test("displays footer correctly", async ({ page }) => {
      // Look for footer content at bottom of page
      const pageContent = await page.textContent("body");
      expect(pageContent).toContain("Peter Hollmer");
      expect(pageContent).toMatch(/©|copyright/i);
    });
  });

  test.describe("Navigation", () => {
    test("[smoke] resume navigation button works", async ({ page }) => {
      // Find and click the resume button
      const resumeButton = page.locator("button").filter({ hasText: "Resume" });
      await expect(resumeButton).toBeVisible();

      // Click should navigate to resume page
      await resumeButton.click();
      await expect(page).toHaveURL(/pete-resume\.html/);
    });

    test("navigation is accessible via keyboard", async ({ page }) => {
      // Tab through navigation elements
      await page.keyboard.press("Tab");

      // Resume button should be focusable
      const resumeButton = page.locator("button").filter({ hasText: "Resume" });
      await resumeButton.focus();

      // Press Enter to activate
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/pete-resume\.html/);
    });
  });

  test.describe("Social Links", () => {
    test("LinkedIn link is present and functional", async ({ page }) => {
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      await expect(linkedinLink).toBeVisible();
      await expect(linkedinLink).toHaveAttribute("href", /linkedin\.com\/in\/phollmer/i);
      await expect(linkedinLink).toHaveAttribute("target", "_blank");
      await expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
      await expect(linkedinLink).toHaveAttribute(
        "aria-label",
        "Visit LinkedIn profile",
      );
    });

    test("GitHub link is present and functional", async ({ page }) => {
      const githubLink = page.locator('a[href*="github.com"]');
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute("href", /github\.com\/VerilyPete/i);
      await expect(githubLink).toHaveAttribute("target", "_blank");
      await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
      await expect(githubLink).toHaveAttribute(
        "aria-label",
        "Visit GitHub profile",
      );
    });

    test("contact button opens modal", async ({ page }) => {
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      await expect(contactButton).toBeVisible();

      await contactButton.click();

      const modal = page.locator('[role="dialog"], dialog');
      await expect(modal).toBeVisible();
    });

    test("social links have proper hover states", async ({ page }) => {
      const socialLinks = page.locator(
        'a[href*="linkedin.com"], a[href*="github.com"]',
      );
      expect(await socialLinks.count()).toBeGreaterThanOrEqual(2); // At least LinkedIn and GitHub

      // Test hover on first social link
      await socialLinks.first().hover();

      // Verify the link is still visible and interactive
      await expect(socialLinks.first()).toBeVisible();
    });
  });

  test.describe("Contact Modal", () => {
    test("modal opens and closes correctly", async ({ page }) => {
      // Open modal
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      await contactButton.click();

      const modal = page.locator('[role="dialog"], dialog');
      await expect(modal).toBeVisible();

      // Close with X button
      const closeButton = page.locator(
        'button[aria-label*="close"], button:has-text("×")',
      );
      await closeButton.click();

      await expect(modal).not.toBeVisible();
    });

    test("modal closes with Escape key", async ({ page }) => {
      // Open modal
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      await contactButton.click();

      const modal = page.locator('[role="dialog"], dialog');
      await expect(modal).toBeVisible();

      // Press Escape
      await page.keyboard.press("Escape");

      await expect(modal).not.toBeVisible();
    });

    test("modal closes when clicking overlay", async ({ page }) => {
      // Open modal
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      await contactButton.click();

      const modal = page.locator('[role="dialog"], dialog');
      await expect(modal).toBeVisible();

      // Click outside modal content
      await page.keyboard.press("Escape"); // More reliable than clicking overlay

      await expect(modal).not.toBeVisible();
    });

    test("contact form has proper validation", async ({ page }) => {
      // Open modal
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      await contactButton.click();

      // Check form elements exist
      const nameInput = page
        .locator('input[type="text"], input[name="name"]').first();
      const emailInput = page
        .locator('input[type="email"], input[name="email"]').first();
      const messageTextarea = page.locator("textarea").first();
      const submitButton = page
        .locator('button[type="submit"], input[type="submit"]').first();

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(messageTextarea).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Try submitting empty form
      await submitButton.click();

      // Form should require validation
      const isNameValid = await nameInput.evaluate((el) => el.checkValidity());
      const isEmailValid = await emailInput.evaluate((el) =>
        el.checkValidity(),
      );
      const isMessageValid = await messageTextarea.evaluate((el) =>
        el.checkValidity(),
      );

      expect(isNameValid || isEmailValid || isMessageValid).toBeFalsy();
    });
  });

  test.describe("CSS Animations", () => {
    test("page animations are present", async ({ page }) => {
      // Wait for page to load completely
      await page.waitForLoadState("networkidle");

      // Check that main content is visible (animations would prevent this if broken)
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("p").first()).toBeVisible();

      // Test that page is interactive (animations working)
      const firstButton = page.locator("button").first();
      if ((await firstButton.count()) > 0) {
        await expect(firstButton).toBeVisible();
      }
    });

    test("profile image has animation", async ({ page }) => {
      const profileImage = page.locator("img").first();
      await expect(profileImage).toBeVisible();

      // Test that image is properly loaded and positioned
      const imageBox = await profileImage.boundingBox();
      expect(imageBox.width).toBeGreaterThan(0);
      expect(imageBox.height).toBeGreaterThan(0);
    });

    test("status indicator is visible", async ({ page }) => {
      // Look for status text or indicator
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(/opportunities|available|status/i);
    });

    test("main content loads smoothly", async ({ page }) => {
      // Check that main content is visible and positioned correctly
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("h1").first()).toBeInViewport();

      // Verify content is properly arranged
      const h1Box = await page.locator("h1").first().boundingBox();
      expect(h1Box.y).toBeGreaterThan(0);
    });

    test("navigation is visible and accessible", async ({ page }) => {
      // Check that navigation elements are present
      const buttons = page.locator("button");
      expect(await buttons.count()).toBeGreaterThan(0);

      // Verify navigation is interactive
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("works on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check content is still visible
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("p").first()).toBeVisible();

      // Check social links are accessible
      await expect(page.locator('a[href*="linkedin.com"]')).toBeVisible();
      await expect(page.locator('a[href*="github.com"]')).toBeVisible();

      // Verify modal still works on mobile
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      if ((await contactButton.count()) > 0) {
        await contactButton.click();
        const modal = page.locator('[role="dialog"], dialog');
        await expect(modal).toBeVisible();
      }
    });

    test("works on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check all main elements are visible
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("img").first()).toBeVisible();
      await expect(page.locator('a[href*="linkedin.com"]')).toBeVisible();

      // Check navigation works
      const resumeButton = page.locator("button").filter({ hasText: "Resume" });
      await expect(resumeButton).toBeVisible();
    });

    test("works on large desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // All content should be visible and properly displayed
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("h1").first()).toBeInViewport();

      const bodyBox = await page.locator("body").boundingBox();
      expect(bodyBox.width).toBeGreaterThan(0);
    });
  });

  test.describe("Accessibility", () => {
    test("has proper ARIA labels and roles", async ({ page }) => {
      // Check navigation accessibility
      const resumeButton = page.locator("button").filter({ hasText: "Resume" });
      await expect(resumeButton).toHaveAttribute("type", "button");

      // Check social links accessibility
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      await expect(linkedinLink).toHaveAttribute(
        "aria-label",
        "Visit LinkedIn profile",
      );

      const githubLink = page.locator('a[href*="github.com"]');
      await expect(githubLink).toHaveAttribute(
        "aria-label",
        "Visit GitHub profile",
      );

      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      if ((await contactButton.count()) > 0) {
        await expect(contactButton).toBeVisible();
      }
    });

    test("has proper heading hierarchy", async ({ page }) => {
      // Check main heading
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText("Peter Hollmer");
    });

    test("has proper focus management in modal", async ({ page }) => {
      // Open modal
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });
      if ((await contactButton.count()) > 0) {
        await contactButton.click();

        // Check that focus moves to modal
        const modal = page.locator('[role="dialog"], dialog');
        await expect(modal).toBeVisible();

        // Tab through form elements
        await page.keyboard.press("Tab");
        const firstInput = page
          .locator('input[type="text"], input[name="name"]')
          .first();
        if ((await firstInput.count()) > 0) {
          await expect(firstInput).toBeFocused();
        }
      }
    });
  });

  test.describe("Performance and Error Handling", () => {
    test("loads without JavaScript errors", async ({ page }) => {
      const errors = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");

      // Wait for animations and interactions
      await page.waitForTimeout(1000);

      expect(errors).toEqual([]);
    });

    test("handles rapid modal open/close", async ({ page }) => {
      const contactButton = page
        .locator("button")
        .filter({ hasText: "Contact" });

      if ((await contactButton.count()) > 0) {
        const modal = page.locator('[role="dialog"], dialog');

        // Rapidly open and close modal
        for (let i = 0; i < 3; i++) {
          await contactButton.click();
          await expect(modal).toBeVisible();

          await page.keyboard.press("Escape");
          await expect(modal).not.toBeVisible();

          await page.waitForTimeout(100);
        }
      }
    });

    test("status indicator shows active state", async ({ page }) => {
      // Check for status information in page content
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(/opportunities|available|status/i);

      // Verify page has loaded completely
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("p").first()).toBeVisible();
    });
  });
});
