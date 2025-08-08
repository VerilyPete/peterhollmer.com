import { test, expect } from "@playwright/test";

test.describe("Basic Functionality (Legacy Tests)", () => {
  test("loads the main page successfully", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(
      /Peter Hollmer - Transforming Teams & Delivering Results/,
    );

    // Check main content is visible - be specific about the home page
    await expect(page.locator("#home-page h1")).toContainText("Peter Hollmer");
    await expect(page.locator("#home-page .subtitle")).toBeVisible();
    await expect(page.locator("#home-page .description")).toBeVisible();
  });

  test("new navigation features work", async ({ page }) => {
    await page.goto("/");

    // Test resume button navigation
    const resumeButton = page
      .locator("button.nav-link")
      .filter({ hasText: "Resume" });
    await expect(resumeButton).toBeVisible();
    await resumeButton.click();
    await expect(page).toHaveURL(/pete-resume\.html/);
  });

  test("new social links are functional", async ({ page }) => {
    await page.goto("/");

    // Check GitHub link (new addition)
    const githubLink = page.locator('a[href*="github.com"]');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/VerilyPete",
    );
    await expect(githubLink).toHaveAttribute("target", "_blank");

    // Check LinkedIn link
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/phollmer/",
    );
    await expect(linkedinLink).toHaveAttribute("target", "_blank");
  });

  test("floating shapes animations are present", async ({ page }) => {
    await page.goto("/");

    // Check for new floating shapes animation
    const floatingShapes = page.locator(".floating-shapes");
    await expect(floatingShapes).toBeVisible();

    const shapes = page.locator(".shape");
    await expect(shapes).toHaveCount(4);

    // Verify shapes have float animation
    for (let i = 0; i < 4; i++) {
      const shape = shapes.nth(i);
      const animationName = await shape.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(animationName).toContain("float-shape");
    }
  });

  test("contact modal with updated styling works", async ({ page }) => {
    await page.goto("/");

    // Click contact button (updated selector for new layout)
    const contactButton = page
      .locator("button.social-link")
      .filter({ hasText: /email/i });
    await contactButton.click();

    // Check modal is visible
    const modal = page.locator("#contactModal");
    await expect(modal).toHaveClass(/active/);

    // Close modal with Escape key
    await page.keyboard.press("Escape");
    await expect(modal).not.toHaveClass(/active/);
  });

  test("cross-page navigation integration", async ({ page }) => {
    await page.goto("/");

    // Navigate to resume and back
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

  test("error pages are accessible", async ({ page }) => {
    // Test 404 page
    await page.goto("/404.html");
    await expect(page.locator("h1")).toContainText("404");

    const homeLink404 = page.locator('a[href="./"]');
    await homeLink404.click();
    await expect(page).toHaveURL(/\/$|\/index\.html$/);

    // Test 50x page
    await page.goto("/50x.html");
    await expect(page.locator("h1")).toContainText("50x");

    const homeLink50x = page.locator('a[href="./"]');
    await homeLink50x.click();
    await expect(page).toHaveURL(/\/$|\/index\.html$/);
  });

  test("comprehensive animation system works", async ({ page }) => {
    await page.goto("/");

    // Test container slide-up animation
    const container = page.locator("#home-page .container");
    await expect(container).toBeVisible();
    const containerAnimation = await container.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(containerAnimation).toContain("slide-up");

    // Test profile image pulse animation
    const profileImage = page.locator(".profile-image");
    const profileAnimation = await profileImage.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(profileAnimation).toContain("pulse");

    // Test status dot blink animation
    const statusDot = page.locator(".status-dot");
    await expect(statusDot).toBeVisible();
    const statusAnimation = await statusDot.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(statusAnimation).toContain("blink");
  });

  test("all pages load without errors", async ({ page }) => {
    const errors = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Test all pages
    const pages = ["/", "/pete-resume.html", "/404.html", "/50x.html"];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForTimeout(500);
    }

    expect(errors).toEqual([]);
  });
});
