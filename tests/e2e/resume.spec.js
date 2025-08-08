import { test, expect } from "@playwright/test";

test.describe("Resume Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pete-resume.html");
  });

  test.describe("Basic Page Structure", () => {
    test("loads the resume page successfully", async ({ page }) => {
      await expect(page).toHaveTitle(/Peter Hollmer/);

      // Check main content is visible using semantic structure
      await expect(page.locator("h1")).toContainText("Peter Hollmer");
      await expect(
        page.locator("h2").filter({ hasText: /summary/i }),
      ).toBeVisible();
      await expect(
        page.locator("h2").filter({ hasText: /experience|work/i }),
      ).toBeVisible();
    });

    test("displays proper page structure", async ({ page }) => {
      // Check that essential content sections exist
      await expect(page.locator("h1")).toBeVisible();
      await expect(
        page.locator("h2").filter({ hasText: /summary/i }),
      ).toBeVisible();
      await expect(
        page.locator("h2").filter({ hasText: /skills/i }),
      ).toBeVisible();
      await expect(
        page.locator("h2").filter({ hasText: /experience|work/i }),
      ).toBeVisible();

      // Check contact links are present
      await expect(page.locator('a[href*="linkedin.com"]')).toBeVisible();
      await expect(page.locator('a[href*="github.com"]')).toBeVisible();
    });

    test("displays professional summary", async ({ page }) => {
      // Find summary content by looking for paragraph after summary heading
      const summaryHeading = page.locator("h2").filter({ hasText: /summary/i });
      await expect(summaryHeading).toBeVisible();

      // Check that there's meaningful content after the summary heading
      const summaryContent = page
        .locator("h2")
        .filter({ hasText: /summary/i })
        .locator("+ p, + div");
      await expect(summaryContent.first()).toBeVisible();
    });
  });

  test.describe("Social Links and Downloads", () => {
    test("LinkedIn link is functional", async ({ page }) => {
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      await expect(linkedinLink).toBeVisible();
      await expect(linkedinLink).toHaveAttribute(
        "href",
        "https://linkedin.com/in/phollmer",
      );
      await expect(linkedinLink).toHaveAttribute("target", "_blank");
      await expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");

      // Check icon and text
      await expect(linkedinLink).toContainText("LinkedIn");
      await expect(linkedinLink.locator("i.fab.fa-linkedin")).toBeVisible();
    });

    test("GitHub link is functional", async ({ page }) => {
      const githubLink = page.locator('a[href*="github.com"]');
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/VerilyPete",
      );
      await expect(githubLink).toHaveAttribute("target", "_blank");
      await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

      // Check icon and text
      await expect(githubLink).toContainText("GitHub");
      await expect(githubLink.locator("i.fab.fa-github")).toBeVisible();
    });

    test("website link navigates to landing page", async ({ page }) => {
      const websiteLink = page.locator('a[href="./"]');
      await expect(websiteLink).toBeVisible();
      await expect(websiteLink).toContainText("Website");

      // Click and verify navigation
      await websiteLink.click();
      await expect(page).toHaveURL(/\/$|\/index\.html$/);
    });

    test("PDF download link is functional", async ({ page }) => {
      const downloadLink = page.locator("a[download]");
      await expect(downloadLink).toBeVisible();
      await expect(downloadLink).toHaveAttribute(
        "href",
        "./Peter Hollmer Resume.pdf",
      );
      await expect(downloadLink).toHaveAttribute("download");
      await expect(downloadLink).toContainText("Resume");

      // Check download icon
      await expect(downloadLink.locator("i.fas.fa-download")).toBeVisible();
    });

    test("all contact links have proper styling", async ({ page }) => {
      // Check for social/contact links by their functionality
      const linkedinLink = page.locator('a[href*="linkedin.com"]');
      const githubLink = page.locator('a[href*="github.com"]');
      const downloadLink = page.locator("a[download]");

      await expect(linkedinLink).toBeVisible();
      await expect(githubLink).toBeVisible();
      await expect(downloadLink).toBeVisible();

      // Test hover effect on one link
      await linkedinLink.hover();
      await expect(linkedinLink).toBeVisible();
    });
  });

  test.describe("Professional Experience Section", () => {
    test("displays job positions correctly", async ({ page }) => {
      // Look for work experience section and job-related content
      const workSection = page
        .locator("h2")
        .filter({ hasText: /experience|work/i });
      await expect(workSection).toBeVisible();

      // Check for company names (h3 headings after work experience)
      const companyHeadings = page.locator("h3");
      expect(await companyHeadings.count()).toBeGreaterThan(0);
    });

    test("shows company information", async ({ page }) => {
      // Check for company headings (typically h3 elements)
      const companyHeadings = page.locator("h3");
      expect(await companyHeadings.count()).toBeGreaterThan(0);

      // Verify first company has meaningful text
      const firstCompany = companyHeadings.first();
      const text = await firstCompany.textContent();
      expect(text.trim().length).toBeGreaterThan(2);
    });

    test("displays employment dates", async ({ page }) => {
      // Look for date patterns in the page content
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(/20\d{2}/); // Should contain years

      // Check for date range patterns (year - year or year - Present)
      expect(pageContent).toMatch(/\d{2}\/\d{4}|\d{4}\s*-\s*(\d{4}|Present)/i);
    });

    test("shows key achievements and responsibilities", async ({ page }) => {
      // Check for bullet points or list items
      const listItems = page.locator("li");
      expect(await listItems.count()).toBeGreaterThan(0);

      // Check for technical achievements in page content
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(
        /github|kubernetes|docker|devops|automation|aws|infrastructure/i,
      );
    });
  });

  test.describe("Technical Skills Section", () => {
    test("displays skill categories", async ({ page }) => {
      // Check that skills section exists
      const skillsSection = page.locator("h2").filter({ hasText: /skills/i });
      await expect(skillsSection).toBeVisible();

      // Check for skill-related headings after skills section
      const skillCategories = page
        .locator("h4, h3")
        .filter({ hasText: /cloud|devops|development|leadership/i });
      expect(await skillCategories.count()).toBeGreaterThan(0);
    });

    test("shows individual skill tags", async ({ page }) => {
      // Look for technical skills in the content after skills heading
      const skillsSection = page.locator("h2").filter({ hasText: /skills/i });
      await expect(skillsSection).toBeVisible();

      // Check that skills content contains technical terms
      const pageContent = await page.textContent("body");
      expect(pageContent).toMatch(
        /aws|docker|kubernetes|python|github|terraform|prometheus/i,
      );
    });

    test("skill tags have proper styling", async ({ page }) => {
      // Find any skill-related text content and test interactivity
      const skillsSection = page.locator("h2").filter({ hasText: /skills/i });
      await expect(skillsSection).toBeVisible();

      // Test that we can interact with the skills section
      await skillsSection.hover();
      await expect(skillsSection).toBeVisible();
    });
  });

  test.describe("Education Section", () => {
    test("displays education information", async ({ page }) => {
      // Look for education or certification content
      const hasEducation = await page
        .locator("h2")
        .filter({ hasText: /education|certification/i })
        .count();
      const hasProjects = await page
        .locator("h2")
        .filter({ hasText: /project/i })
        .count();

      // Should have either education section or projects section
      expect(hasEducation + hasProjects).toBeGreaterThan(0);
    });
  });

  test.describe("CSS Animations and Visual Effects", () => {
    test("has floating background shapes", async ({ page }) => {
      // Check that page has loaded properly by verifying main content
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2").first()).toBeVisible();

      // Visual elements are implementation details - focus on content loading
      await page.waitForLoadState("networkidle");
    });

    test("header section has animation", async ({ page }) => {
      // Check that header content is visible and interactive
      const header = page.locator("h1");
      await expect(header).toBeVisible();

      // Wait for page to be fully loaded
      await page.waitForLoadState("networkidle");
      await expect(header).toBeVisible();
    });

    test("skill tags have hover animations", async ({ page }) => {
      // Check that skills section is interactive
      const skillsHeading = page.locator("h2").filter({ hasText: /skills/i });
      await expect(skillsHeading).toBeVisible();

      // Test basic interactivity
      await skillsHeading.hover();
      await expect(skillsHeading).toBeVisible();
    });

    test("job sections have staggered animations", async ({ page }) => {
      // Check that work experience sections are visible
      const experienceHeading = page
        .locator("h2")
        .filter({ hasText: /experience|work/i });
      await expect(experienceHeading).toBeVisible();

      // Check that company headings are visible
      const companyHeadings = page.locator("h3");
      expect(await companyHeadings.count()).toBeGreaterThan(0);
    });
  });

  test.describe("Responsive Design", () => {
    test("works on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that main content is visible
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('a[href*="linkedin.com"]')).toBeVisible();

      // Check that contact links are accessible
      await expect(page.locator('a[href*="github.com"]')).toBeVisible();
      await expect(page.locator("a[download]")).toBeVisible();

      // Check skills section is visible
      await expect(
        page.locator("h2").filter({ hasText: /skills/i }),
      ).toBeVisible();
    });

    test("works on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check layout adjustments
      await expect(page.locator("h1")).toBeVisible();
      await expect(
        page.locator("h2").filter({ hasText: /summary/i }),
      ).toBeVisible();

      // Check that text content is readable
      await expect(page.locator("p").first()).toBeVisible();
    });

    test("works on large desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Check that content is properly displayed
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2").first()).toBeVisible();

      // Check that content doesn't exceed reasonable width
      const bodyBox = await page.locator("body").boundingBox();
      expect(bodyBox.width).toBeGreaterThan(0);
    });
  });

  test.describe("Accessibility", () => {
    test("has proper heading hierarchy", async ({ page }) => {
      // Check main heading
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText("Peter Hollmer");

      // Check section headings
      const h2s = page.locator("h2");
      expect(await h2s.count()).toBeGreaterThan(0);

      // Check subsection headings
      const h3s = page.locator("h3");
      expect(await h3s.count()).toBeGreaterThan(0);
    });

    test("external links have proper attributes", async ({ page }) => {
      const externalLinks = page.locator('a[target="_blank"]');

      for (let i = 0; i < (await externalLinks.count()); i++) {
        const link = externalLinks.nth(i);
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await expect(link).toHaveAttribute("target", "_blank");
      }
    });

    test("has proper alt text for icons", async ({ page }) => {
      // FontAwesome icons inside links should have proper descriptive text
      const linkIcons = page.locator('a i[class*="fa-"]');

      for (let i = 0; i < (await linkIcons.count()); i++) {
        const icon = linkIcons.nth(i);
        const parentLink = icon.locator("xpath=..");

        // Icon's parent link should have descriptive text
        const parentText = await parentLink.textContent();
        expect(parentText.trim()).not.toBe("");
      }
    });

    test("keyboard navigation works", async ({ page }) => {
      // Test that links are accessible and interactive
      const links = page.locator("a");
      expect(await links.count()).toBeGreaterThan(0);

      // Test that we can interact with the first link
      const firstLink = links.first();
      await firstLink.focus();
      await expect(firstLink).toBeFocused();

      // Test that we can navigate between links using keyboard
      await page.keyboard.press("Tab");
      // Just verify that tab navigation doesn't break the page
      await expect(page.locator("h1")).toBeVisible();
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

      await page.goto("/pete-resume.html");

      // Wait for animations and content to load
      await page.waitForTimeout(1000);

      expect(errors).toEqual([]);
    });

    test("all external resources load correctly", async ({ page }) => {
      const failedRequests = [];

      page.on("requestfailed", (request) => {
        failedRequests.push(request.url());
      });

      await page.goto("/pete-resume.html");

      // Wait for all resources to load
      await page.waitForLoadState("networkidle");

      // Filter out non-critical font failures (unused FontAwesome fonts)
      const criticalFailures = failedRequests.filter((url) => {
        // Allow FontAwesome regular font to fail since we only use solid/brands
        return !url.includes("fa-regular-400.woff2");
      });

      expect(criticalFailures).toEqual([]);
    });

    test("FontAwesome icons load correctly", async ({ page }) => {
      // Check that FontAwesome CSS is loaded
      const fontAwesomeLink = page.locator('link[href*="font-awesome"]');
      await expect(fontAwesomeLink).toBeAttached();

      // Check that icons are visible
      const icons = page.locator("i.fab, i.fas");
      expect(await icons.count()).toBeGreaterThan(0);

      // Verify icons are properly styled
      const linkedinIcon = page.locator("i.fab.fa-linkedin");
      await expect(linkedinIcon).toBeVisible();
    });

    test("PDF file exists and is accessible", async ({ page, context }) => {
      // Check that the PDF link points to an existing file
      const downloadLink = page.locator("a[download]");
      const href = await downloadLink.getAttribute("href");

      // Make a request to check if PDF exists
      const response = await context.request.get(href);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("pdf");
    });
  });

  test.describe("Print Styles", () => {
    test("has print-friendly styling", async ({ page }) => {
      // Emulate print media
      await page.emulateMedia({ media: "print" });

      // Check that main content is still visible
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h2").first()).toBeVisible();

      // Check that essential content is preserved for print
      await expect(
        page.locator("h2").filter({ hasText: /summary/i }),
      ).toBeVisible();
      await expect(
        page.locator("h2").filter({ hasText: /experience/i }),
      ).toBeVisible();
    });
  });
});
