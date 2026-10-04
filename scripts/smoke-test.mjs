// Run npm run dev first. Optional tools: npm install --no-save --package-lock=false playwright @axe-core/playwright
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const base = process.env.LINKUP_TEST_BASE || "http://127.0.0.1:5173";
await mkdir("test-results", { recursive: true });
async function cards(count) {
  await page.waitForFunction(
    (expected) =>
      document.querySelectorAll(".opportunity-card").length === expected,
    count,
  );
}
async function nav(label) {
  if (["Saved", "Your Projects"].includes(label)) {
    await page.getByRole("link", { name: "Profile", exact: true }).click();
    await page
      .getByRole("link", {
        name: label === "Saved" ? "Saved opportunities" : "Your projects",
        exact: true,
      })
      .click();
    return;
  }
  if (label === "Profile") {
    await page.getByRole("link", { name: "Profile", exact: true }).click();
    return;
  }
  if (
    await page
      .getByRole("button", { name: "Open menu", exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .locator("nav:visible")
    .getByRole("link", { name: label, exact: true })
    .click();
}
async function noOverflow() {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Horizontal overflow at " + page.url(),
  );
}
async function audit(name) {
  // Wait for the short entrance fade before measuring contrast.
  await page.waitForTimeout(650);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    name + " accessibility",
  );
}
try {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(base);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.waitForTimeout(1200);
    await audit("Landing " + width);
    await noOverflow();
    // Visit each section: jumping to the bottom skips the scroll reveals.
    for (const selector of [".product-reveal"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(650);
      await audit("Landing section " + selector + " " + width);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: "test-results/landing-" + width + ".png",
      fullPage: true,
    });
    if (width < 1200) {
      const menu = page.getByRole("button", { name: "Open menu", exact: true });
      await menu.focus();
      await page.keyboard.press("Enter");
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .waitFor();
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .waitFor();
      assert(
        await menu.evaluate((node) => node === document.activeElement),
        "Escape returns menu focus",
      );
    }
    for (const [label, heading] of [
      ["Discover", "Find your people. Build your thing."],
      ["Saved", "Your next possibilities"],
      ["Create", "Make room for your idea"],
      ["Your Projects", "Your ideas, taking shape"],
      ["Profile", "Your profile"],
      ["Mentor Match", "Mentor Match"],
      ["LinkedIn Export", "LinkedIn Export"],
    ]) {
      await nav(label);
      await page
        .getByRole("heading", { level: 1, name: heading, exact: true })
        .waitFor();
      await noOverflow();
      await audit(label + " " + width);
      if (["Create", "Profile"].includes(label))
        await page.screenshot({
          path: "test-results/" + label.toLowerCase() + "-" + width + ".png",
          fullPage: true,
        });
    }
    await nav("Discover");
    await cards(5);
    await page.getByLabel("Search opportunities").fill("React");
    await cards(1);
    await page.getByLabel("Field", { exact: true }).selectOption("Education");
    await cards(0);
    await page.getByText("No matches yet.").waitFor();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await cards(5);
    await page.getByLabel("Type", { exact: true }).selectOption("Company");
    await cards(1);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByLabel("Skill", { exact: true }).selectOption("Writing");
    await cards(2);
    await page.getByLabel("Field", { exact: true }).selectOption("Education");
    await cards(1);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await cards(5);
    await page
      .getByRole("button", { name: "Save Sprout Map", exact: true })
      .click();
    await nav("Saved");
    await cards(1);
    await page.getByRole("link", { name: "Learn more" }).click();
    await page.getByRole("heading", { level: 1, name: "Sprout Map" }).waitFor();
    await page.getByRole("button", { name: "Apply to join" }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "nothing has been submitted" })
      .waitFor();
    await audit("Details " + width);
    await noOverflow();
    await page.screenshot({
      path: "test-results/details-" + width + ".png",
      fullPage: true,
    });
    await page.getByRole("button", { name: /^Saved/ }).click();
    await nav("Saved");
    await page.getByText("Nothing saved yet.").waitFor();
    await nav("Create");
    await page.getByRole("button", { name: "Create demo opportunity" }).click();
    assert(
      await page.locator("#name").evaluate((node) => !node.validity.valid),
      "Required validation",
    );
    await page.getByLabel("Opportunity name").fill("Test student idea");
    await page.getByLabel("Field", { exact: false }).fill("Science");
    await page
      .getByLabel("Short description")
      .fill("A browser-tested student opportunity.");
    await page
      .getByLabel("Full description")
      .fill("A team idea created during automated browser checks.");
    await page.getByLabel("Skills needed").fill("Research, Writing");
    await page.getByLabel("Roles needed").fill("Researcher, Editor");
    await page.getByLabel("Location").fill("Anywhere");
    await page
      .getByRole("button", { name: "Add question", exact: true })
      .click();
    await page
      .getByLabel("Application question 1")
      .fill("What would you like to learn?");
    await page
      .getByRole("button", { name: "Add question", exact: true })
      .click();
    await page.getByRole("button", { name: "Remove question 2" }).click();
    await page.getByRole("button", { name: "Create demo opportunity" }).click();
    await page
      .getByRole("heading", { level: 1, name: "Test student idea" })
      .waitFor();
    await page
      .getByText("What would you like to learn?", { exact: true })
      .waitFor();
    await nav("Your Projects");
    await page
      .getByRole("link", { name: "Test student idea", exact: true })
      .waitFor();
    await nav("Profile");
    await page
      .getByRole("link", { name: "Test student idea", exact: true })
      .waitFor();
    await nav("Discover");
    await cards(6);
    await page.reload();
    await cards(6); // Main preserves created ideas across refreshes.
    await page.evaluate(() => localStorage.removeItem("linkup-created-opportunities-v1"));
    await page.reload();
    await cards(5);
    await page.waitForTimeout(300);
    await page.screenshot({
      path: "test-results/discover-" + width + ".png",
      fullPage: true,
    });
    await page.goto(base + "/projects/missing");
    await page
      .getByRole("heading", { name: "Opportunity not found" })
      .waitFor();
    await page.goto(base + "/unknown");
    await page
      .getByRole("heading", { name: "This page hasn't been built" })
      .waitFor();
    console.log(
      "PASS: routes, filters, save, create/questions, apply notice, keyboard menu, overflow, accessibility at " +
        width,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  await page.locator(".portal-poster").waitFor();
  assert.equal(
    await page.locator(".portal-media video").count(),
    0,
    "Reduced motion uses static portal",
  );
  assert.equal(
    await page.locator(".pin-spacer").count(),
    0,
    "Reduced motion has no pinned scroll sequence",
  );
  await page.goto(base + "/discover");
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.textContent),
    "Skip to content",
  );
  assert(
    await page.evaluate(
      () => getComputedStyle(document.activeElement).outlineStyle !== "none",
    ),
    "Visible keyboard focus",
  );
  assert.deepEqual(errors, [], "Browser errors");
  console.log(
    "PASS: reduced motion, visible keyboard focus, no runtime or console errors",
  );
} finally {
  await browser.close();
}
