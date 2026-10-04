// Run npm run dev first. Browser tools are temporary, not runtime dependencies.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
await mkdir("test-results", { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const base = process.env.LINKUP_TEST_BASE || "http://127.0.0.1:5173";
try {
  await page.goto(base);
  await page.waitForFunction(
    () => document.querySelector("video")?.readyState >= 2,
  );
  await page.waitForTimeout(1000);
  assert.equal(await page.locator("canvas").count(), 0);
  assert.equal(await page.locator("video").count(), 1);
  await page.screenshot({ path: "test-results/portal-hero.png" });
  const portal = page.locator(".portal-media");
  const bounds = await portal.boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width * 0.85,
    bounds.y + bounds.height * 0.25,
  );
  await page.waitForTimeout(600);
  assert.notEqual(
    await portal.evaluate((n) => getComputedStyle(n).transform),
    "none",
    "Pointer tilt responds",
  );
  await page.mouse.move(0, 0);
  for (const [name, progress] of [
    ["middle", 0.4],
    ["exit", 0.85],
    ["reverse", 0.2],
  ]) {
    await page.evaluate((p) => scrollTo(0, innerHeight * 1.8 * p), progress);
    await page.waitForTimeout(1500);
    const time = await page.locator("video").evaluate((v) => v.currentTime);
    assert(
      Math.abs(time - progress * 8.041667) < 0.25,
      `Video seeks ${name}: ${time}`,
    );
    await page.screenshot({ path: `test-results/portal-${name}.png` });
  }
  await page.locator(".product-reveal").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/portal-product.png" });
  await page.getByRole("link", { name: "VIEW PROJECT", exact: true }).click();
  await page.getByRole("heading", { level: 1, name: "Sprout Map" }).waitFor();
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base);
    await page.locator(".portal-poster").waitFor();
    assert.equal(
      await page.locator("video").count(),
      0,
      "Compact layout uses poster",
    );
    assert.equal(await page.locator(".pin-spacer").count(), 0);
    await page.waitForTimeout(900);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `test-results/portal-${width}.png`,
    });
  }
  await page.locator(".product-introduction").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.locator(".featured-project").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/portal-mobile-product.png" });
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
  await page.locator(".portal-poster").waitFor();
  assert.equal(await page.locator(".pin-spacer").count(), 0);
  assert.deepEqual(errors, []);
  // Failure is intentionally blocked: expect that network error, but require a usable poster and CTA.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/linkup-portal-motion.mp4", (r) => r.abort());
  await page.goto(base);
  await page.locator(".portal-poster").waitFor();
  await page.getByRole("link", { name: "EXPLORE LINKUP", exact: true }).click();
  await page.getByRole("heading", { level: 1 }).waitFor();
  console.log(
    "PASS: Chrome hero/scroll/reverse/video seeking, pointer tilt, featured link, tablet/mobile, reduced motion, media failure fallback, no unexpected browser errors",
  );
} finally {
  await browser.close();
}
