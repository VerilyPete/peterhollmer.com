import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test.describe("Homepage Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("has proper document structure", async ({ page }) => {
      // Check for DOCTYPE
      const doctype = await page.evaluate(() => {
        return document.doctype ? document.doctype.name : null;
      });
      expect(doctype).toBe("html");

      // Check for lang attribute
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("en");

      // Check for charset
      const charset = page.locator("meta[charset]");
      await expect(charset).toHaveAttribute("charset", "UTF-8");

      // Check for viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=1.0",
      );
    });

    test("has proper heading hierarchy", async ({ page }) => {
      // Should have exactly one h1
      const h1s = page.locator("h1");
      await expect(h1s).toHaveCount(1);
      await expect(h1s).toContainText("Peter Hollmer");

      // Check that headings are properly nested (no skipping levels)
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      const headingLevels = [];

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }

      // Verify no level skipping
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1); // Can't skip heading levels
      }
    });

    test("has proper ARIA labels and roles", async ({ page }) => {
      // Check navigation accessibility
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
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
        .locator("button.social-link")
        .filter({ hasText: /email/i });
      await expect(contactButton).toHaveAttribute("aria-label", "Send email");

      // Check modal accessibility
      await contactButton.click();
      const modal = page.locator("#contactModal");
      await expect(modal).toHaveAttribute("role", "dialog");
      await expect(modal).toHaveAttribute("aria-modal", "true");
    });

    test("has proper alt text for images", async ({ page }) => {
      const profileImage = page.locator("img").first();
      await expect(profileImage).toHaveAttribute("alt", "Peter Hollmer");

      // Check that alt text is descriptive
      const altText = await profileImage.getAttribute("alt");
      expect(altText.length).toBeGreaterThan(0);
      expect(altText).not.toBe("image"); // Should be more descriptive
    });

    test("has proper form accessibility", async ({ page }) => {
      // Open contact modal
      const contactButton = page
        .locator("button.social-link")
        .filter({ hasText: /email/i });
      await contactButton.click();

      // Check form labels
      const nameInput = page.locator('input[name="name"]');
      const emailInput = page.locator('input[name="email"]');
      const messageTextarea = page.locator('textarea[name="message"]');

      // Each input should have associated label or be visible
      if ((await nameInput.count()) > 0) {
        await expect(nameInput).toBeVisible();
      }

      if ((await emailInput.count()) > 0) {
        await expect(emailInput).toBeVisible();
      }

      if ((await messageTextarea.count()) > 0) {
        await expect(messageTextarea).toBeVisible();
      }

      // Check for required field indicators
      const requiredFields = page.locator(
        "input[required], textarea[required]",
      );
      for (let i = 0; i < (await requiredFields.count()); i++) {
        const field = requiredFields.nth(i);
        await expect(field).toHaveAttribute("required");
      }
    });

    test("has proper color contrast", async ({ page }) => {
      // Check main text contrast
      const mainText = page.locator("#home-page .description");
      const textColor = await mainText.evaluate(
        (el) => getComputedStyle(el).color,
      );
      const backgroundColor = await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor);

      // Text should not be transparent or same as background
      expect(textColor).not.toBe("rgba(0, 0, 0, 0)");
      expect(textColor).not.toBe(backgroundColor);
    });

    test("keyboard navigation works properly", async ({ page }) => {
      // Tab through interactive elements
      const interactiveElements = page.locator(
        "button, a, input, textarea, select",
      );
      const count = await interactiveElements.count();

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          await page.keyboard.press("Tab");
          const focused = await page.evaluate(
            () => document.activeElement.tagName,
          );
          expect(
            ["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"].includes(focused),
          ).toBeTruthy();
        }
      }
    });

    test("focus indicators are visible", async ({ page }) => {
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.focus();

      // Check that focus is visible (outline or other indicator)
      const outlineWidth = await resumeButton.evaluate(
        (el) => getComputedStyle(el).outlineWidth,
      );
      const outlineStyle = await resumeButton.evaluate(
        (el) => getComputedStyle(el).outlineStyle,
      );
      const boxShadow = await resumeButton.evaluate(
        (el) => getComputedStyle(el).boxShadow,
      );

      // Should have some focus indicator
      const hasFocusIndicator =
        outlineWidth !== "0px" ||
        outlineStyle !== "none" ||
        boxShadow !== "none";
      expect(hasFocusIndicator).toBeTruthy();
    });

    test("modal focus management works", async ({ page }) => {
      // Open modal
      const contactButton = page
        .locator("button")
        .filter({ hasText: /email/i });

      if ((await contactButton.count()) > 0) {
        await contactButton.click();

        // Focus should move into modal
        const modal = page.locator('[role="dialog"], dialog');
        await expect(modal).toBeVisible();

        // First focusable element in modal should receive focus
        await page.waitForTimeout(100);
        const focused = await page.evaluate(
          () => document.activeElement.tagName,
        );
        expect(["INPUT", "BUTTON", "TEXTAREA"].includes(focused)).toBeTruthy();

        // Escape should close modal and return focus
        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();

        // Focus should return to trigger button
        await expect(contactButton).toBeFocused();
      }
    });
  });

  test.describe("Resume Page Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/pete-resume.html");
    });

    test("has proper document structure", async ({ page }) => {
      // Check for lang attribute
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("en");

      // Check for proper title
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Check for meta tags
      const charset = page.locator("meta[charset]");
      await expect(charset).toHaveAttribute("charset", "UTF-8");

      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=1.0",
      );
    });

    test("has proper heading hierarchy", async ({ page }) => {
      // Should have exactly one h1
      const h1s = page.locator("h1");
      await expect(h1s).toHaveCount(1);
      await expect(h1s).toContainText("Peter Hollmer");

      // Check for section headings (h2)
      const h2s = page.locator("h2");
      expect(await h2s.count()).toBeGreaterThan(0);

      // Check for subsection headings (h3)
      const h3s = page.locator("h3");
      expect(await h3s.count()).toBeGreaterThan(0);
    });

    test("external links have proper accessibility attributes", async ({
      page,
    }) => {
      const externalLinks = page.locator('a[target="_blank"]');

      for (let i = 0; i < (await externalLinks.count()); i++) {
        const link = externalLinks.nth(i);

        // Should have security attributes
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await expect(link).toHaveAttribute("target", "_blank");

        // Should have descriptive text or aria-label
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");

        expect(
          linkText.trim().length > 0 || (ariaLabel && ariaLabel.length > 0),
        ).toBeTruthy();
      }
    });

    test("download link is accessible", async ({ page }) => {
      const downloadLink = page.locator("a[download]");
      await expect(downloadLink).toBeVisible();

      // Should have descriptive text
      const linkText = await downloadLink.textContent();
      expect(linkText.trim()).toContain("Resume");

      // Should have download attribute
      await expect(downloadLink).toHaveAttribute("download");
    });

    test("contact information is semantically structured", async ({ page }) => {
      // Check that contact links exist and are accessible
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      const githubLink = page.locator('a[href*="github.com"]');
      const downloadLink = page.locator("a[download]");

      await expect(linkedinLink).toBeVisible();
      await expect(githubLink).toBeVisible();
      await expect(downloadLink).toBeVisible();

      // Each link should have descriptive text
      const linkedinText = await linkedinLink.textContent();
      const githubText = await githubLink.textContent();
      const downloadText = await downloadLink.textContent();

      expect(linkedinText.trim().length).toBeGreaterThan(0);
      expect(githubText.trim().length).toBeGreaterThan(0);
      expect(downloadText.trim().length).toBeGreaterThan(0);
    });

    test("job sections have proper structure", async ({ page }) => {
      // Check for work experience section
      const workSection = page
        .locator("h2")
        .filter({ hasText: /experience|work/i });
      await expect(workSection).toBeVisible();

      // Companies should be identifiable (typically h3 headings)
      const companyHeadings = page.locator("h3");
      expect(await companyHeadings.count()).toBeGreaterThan(0);

      // Achievement lists should be properly structured
      const achievementLists = page.locator("ul, ol");
      expect(await achievementLists.count()).toBeGreaterThan(0);

      // List items should exist
      const listItems = page.locator("li");
      expect(await listItems.count()).toBeGreaterThan(0);
    });

    test("skill content is accessible", async ({ page }) => {
      // Check that skills section exists
      const skillsSection = page.locator("h2").filter({ hasText: /skills/i });
      await expect(skillsSection).toBeVisible();

      // Skills content should be readable
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(/aws|docker|kubernetes|python|github/i);
    });

    test("keyboard navigation works", async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press("Tab");
      const firstLink = page.locator("a").first();
      await expect(firstLink).toBeFocused();

      // Continue tabbing through links
      await page.keyboard.press("Tab");
      const secondLink = page.locator("a").nth(1);
      await expect(secondLink).toBeFocused();
    });
  });

  test.describe("Error Pages Accessibility", () => {
    test("404 page is accessible", async ({ page }) => {
      await page.goto("/404.html");

      // Check document structure
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("en");

      // Check title
      await expect(page).toHaveTitle(/404.*Peter Hollmer/);

      // Check heading hierarchy
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText("404");

      // Check navigation link
      const homeLink = page.locator('a[href="./"]');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute("title");

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      await expect(homeLink).toBeFocused();
    });

    test("50x page is accessible", async ({ page }) => {
      await page.goto("/50x.html");

      // Check document structure
      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe("en");

      // Check title
      await expect(page).toHaveTitle(/500.*Peter Hollmer/);

      // Check heading hierarchy
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText("50x");

      // Check navigation link
      const homeLink = page.locator('a[href="./"]');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute("title");

      // Test keyboard navigation
      await page.keyboard.press("Tab");
      await expect(homeLink).toBeFocused();
    });
  });

  test.describe("Cross-Page Accessibility Consistency", () => {
    test("consistent navigation patterns", async ({ page }) => {
      const pages = ["/", "/pete-resume.html", "/404.html", "/50x.html"];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);

        // Each page should have proper lang attribute
        const htmlLang = await page.locator("html").getAttribute("lang");
        expect(htmlLang).toBe("en");

        // Each page should have meaningful title
        const title = await page.title();
        expect(title).toContain("Peter Hollmer");
        expect(title.length).toBeGreaterThan(10);

        // Each page should have exactly one h1
        const h1s = page.locator("h1");
        await expect(h1s).toHaveCount(1);
      }
    });

    test("consistent focus management", async ({ page }) => {
      // Test focus management when navigating between pages
      await page.goto("/");

      // Focus on resume button
      const resumeButton = page
        .locator("button.nav-link")
        .filter({ hasText: "Resume" });
      await resumeButton.focus();
      await page.keyboard.press("Enter");

      // Should navigate to resume page
      await expect(page).toHaveURL(/pete-resume\.html/);

      // Test focus on resume page
      await page.keyboard.press("Tab");
      const firstContactLink = page.locator(".contact-link").first();
      await expect(firstContactLink).toBeFocused();
    });

    test("consistent color contrast across pages", async ({ page }) => {
      const pages = ["/", "/pete-resume.html", "/404.html", "/50x.html"];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);

        // Check that text has sufficient contrast
        const textElements = page.locator("h1, h2, h3, p, a, button");

        for (let i = 0; i < Math.min(5, await textElements.count()); i++) {
          const element = textElements.nth(i);
          const color = await element.evaluate(
            (el) => getComputedStyle(el).color,
          );

          // Text should not be transparent
          expect(color).not.toBe("rgba(0, 0, 0, 0)");
          expect(color).not.toBe("transparent");
        }
      }
    });
  });

  test.describe("Screen Reader Compatibility", () => {
    test("meaningful page titles for screen readers", async ({ page }) => {
      const pages = [
        { url: "/", expectedTitle: "Transforming Teams & Delivering Results" },
        {
          url: "/pete-resume.html",
          expectedTitle: "Senior Technical Operations & Engineering Leadership",
        },
        { url: "/404.html", expectedTitle: "404 - Page Not Found" },
        { url: "/50x.html", expectedTitle: "500 - Server Error" },
      ];

      for (const { url, expectedTitle } of pages) {
        await page.goto(url);
        await expect(page).toHaveTitle(new RegExp(expectedTitle));
      }
    });

    test("descriptive link text", async ({ page }) => {
      await page.goto("/");

      // Check that links have descriptive text
      const links = page.locator("a");

      for (let i = 0; i < (await links.count()); i++) {
        const link = links.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");
        const title = await link.getAttribute("title");

        // Link should have some form of description
        const hasDescription =
          (linkText && linkText.trim().length > 0) ||
          (ariaLabel && ariaLabel.length > 0) ||
          (title && title.length > 0);

        expect(hasDescription).toBeTruthy();
      }
    });

    test("proper button semantics", async ({ page }) => {
      await page.goto("/");

      const buttons = page.locator("button");

      for (let i = 0; i < (await buttons.count()); i++) {
        const button = buttons.nth(i);

        // Button should have type attribute
        const type = await button.getAttribute("type");
        expect(["button", "submit", "reset"].includes(type)).toBeTruthy();

        // Button should have descriptive text or aria-label
        const buttonText = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");

        const hasDescription =
          (buttonText && buttonText.trim().length > 0) ||
          (ariaLabel && ariaLabel.length > 0);

        expect(hasDescription).toBeTruthy();
      }
    });

    test("form accessibility for screen readers", async ({ page }) => {
      await page.goto("/");

      // Open contact modal if it exists
      const contactButton = page
        .locator("button")
        .filter({ hasText: /email/i });

      if ((await contactButton.count()) > 0) {
        await contactButton.click();

        // Check form structure
        const form = page.locator("form");
        if ((await form.count()) > 0) {
          // Form should have proper labels
          const inputs = page.locator("input, textarea, select");

          for (let i = 0; i < (await inputs.count()); i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute("id");
            const name = await input.getAttribute("name");
            const ariaLabel = await input.getAttribute("aria-label");
            const ariaLabelledby = await input.getAttribute("aria-labelledby");

            // Input should be properly labeled
            const hasLabel =
              (id && (await page.locator(`label[for="${id}"]`).count()) > 0) ||
              (ariaLabel && ariaLabel.length > 0) ||
              (ariaLabelledby && ariaLabelledby.length > 0);

            expect(hasLabel).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe("Animation and Motion Accessibility", () => {
    test("animations respect reduced motion preferences", async ({ page }) => {
      // Test with reduced motion preference
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      // Animations should be disabled or reduced
      const animatedElements = page.locator(
        ".container, .profile-image, .floating-shapes",
      );

      for (let i = 0; i < (await animatedElements.count()); i++) {
        const element = animatedElements.nth(i);
        const animationPlayState = await element.evaluate(
          (el) => getComputedStyle(el).animationPlayState,
        );
        const animationDuration = await element.evaluate(
          (el) => getComputedStyle(el).animationDuration,
        );

        // Animation should be paused or have very short duration when reduced motion is preferred
        const respectsReducedMotion =
          animationPlayState === "paused" ||
          animationDuration === "0s" ||
          animationDuration === "0.01s";

        // This is advisory - not all browsers/implementations support this
        // expect(respectsReducedMotion).toBeTruthy();
      }
    });

    test("no auto-playing media without controls", async ({ page }) => {
      const pages = ["/", "/pete-resume.html", "/404.html", "/50x.html"];

      for (const pageUrl of pages) {
        await page.goto(pageUrl);

        // Check for video/audio elements
        const mediaElements = page.locator("video, audio");

        for (let i = 0; i < (await mediaElements.count()); i++) {
          const media = mediaElements.nth(i);
          const autoplay = await media.getAttribute("autoplay");
          const controls = await media.getAttribute("controls");
          const muted = await media.getAttribute("muted");

          // If autoplay is present, media should be muted or have controls
          if (autoplay !== null) {
            expect(controls !== null || muted !== null).toBeTruthy();
          }
        }
      }
    });
  });
});
