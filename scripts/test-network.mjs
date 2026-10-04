import { chromium } from "playwright";
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
await mkdir("test-results", { recursive: true });
const base = "http://127.0.0.1:5173";
try {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto(base);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.locator('.network-canvas canvas[data-nodes="84"]').waitFor();
  await page.waitForTimeout(500);
  console.log(
    "Renderer:",
    (await page.locator(".network-canvas canvas").count())
      ? "WebGL"
      : "SVG fallback",
  );
  await page.screenshot({ path: "test-results/network-entry.png" });
  await page.mouse.move(1320, 300);
  await page.waitForTimeout(800);
  const rightRotation = Number(
    await page.locator("canvas").getAttribute("data-rotation"),
  );
  await page.screenshot({ path: "test-results/network-pointer-right.png" });
  await page.mouse.move(350, 750);
  await page.waitForTimeout(800);
  const leftRotation = Number(
    await page.locator("canvas").getAttribute("data-rotation"),
  );
  assert(
    rightRotation > leftRotation + 0.05,
    "Pointer changes real 3D rotation",
  );
  await page.screenshot({ path: "test-results/network-pointer-left.png" });
  const stageTop = await page
    .locator(".network-experience")
    .evaluate((node) => node.getBoundingClientRect().top + scrollY);
  for (const progress of [0.25, 0.5, 0.75, 0.94]) {
    await page.evaluate((y) => scrollTo(0, y), stageTop + progress * 950 * 2.6);
    await page.waitForTimeout(900);
    const actual = Number(
      await page.locator(".network-stage").getAttribute("data-progress"),
    );
    assert(
      Math.abs(actual - progress) < 0.06,
      "Scroll drives timeline: " + actual,
    );
    if (progress === 0.5)
      assert(
        Number(await page.locator("canvas").getAttribute("data-connections")) >
          50,
        "Network lines increase",
      );
    await page.screenshot({
      path: `test-results/network-stage-${progress}.png`,
    });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No desktop overflow",
    );
  }
  await page.evaluate((y) => scrollTo(0, y), stageTop + 0.3 * 950 * 2.6);
  await page.waitForTimeout(800);
  assert(
    Number(await page.locator(".network-stage").getAttribute("data-progress")) <
      0.4,
    "Scroll reverses",
  );
  await page.evaluate((y) => scrollTo(0, y), stageTop + 0.99 * 950 * 2.6);
  await page.waitForTimeout(700);
  await page.locator('.bridge-card').first().click();
  await page.getByRole('heading', { level: 1, name: 'Sprout Map' }).waitFor();
  assert.equal(await page.locator('.pin-spacer').count(), 0, 'Pinned scene cleans up on route change');
  assert.equal(await page.locator('.network-canvas canvas').count(), 0, 'Graphics scene unmounts in app');
  await page.getByRole('link', { name: 'LinkUp home' }).click();
  await page.locator('.network-canvas canvas[data-nodes="84"]').waitFor();
  for (const selector of [
    ".possibility-section",
    ".project-wall-section",
    ".connection-story",
    ".network-final",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: "test-results/network-" + selector.slice(1) + ".png",
    });
  }
  const pausedFrame = await page.locator('canvas').getAttribute('data-frame-time');
  await page.waitForTimeout(700);
  assert.equal(await page.locator('canvas').getAttribute('data-frame-time'), pausedFrame, 'Offscreen scene stops rendering');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.waitForTimeout(1800);
  assert(await page.locator(".simple-experience").count(), "Mobile simplified");
  await page.screenshot({ path: "test-results/network-mobile-entry.png" });
  for (const selector of [
    ".product-bridge",
    ".possibility-section",
    ".project-wall-section",
    ".connection-story",
    ".network-final",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No mobile overflow " + selector,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  await page.locator(".network-fallback").waitFor();
  assert.equal(
    await page.locator(".network-canvas canvas").count(),
    0,
    "Reduced motion avoids WebGL loop",
  );
  await page.screenshot({ path: "test-results/network-reduced-motion.png" });
  // Force an unavailable WebGL context before the app starts.
  const fallback = await context.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  await fallback.goto(base);
  await fallback.locator(".network-fallback").waitFor();
  await fallback
    .getByRole("link", { name: "Explore LinkUp", exact: false })
    .click();
  await fallback
    .getByRole("heading", { name: "Find your people. Build your thing." })
    .waitFor();
  await fallback.close();
  assert.deepEqual(errors, [], "No browser errors");
  console.log(
    "PASS: pinned scroll stages, reverse, pointer screenshots, mobile, reduced motion, WebGL fallback, navigation, no console errors",
  );
} finally {
  await browser.close();
}
