// Records a scripted walkthrough of the local Agent Control UI with
// Playwright, for embedding in the Remotion compositions. Output:
// recordings/ui-walkthrough.webm (transcode to public/ with ffmpeg,
// see README "UI walkthrough recording").
//
// Requires the local server (http://localhost:8000) with the module-02
// controls installed (run the tutorial's setup_controls.py first).
import { mkdirSync, renameSync } from "node:fs";
import { chromium } from "playwright";

const OUT_DIR = new URL("../recordings/", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

// Playwright recordings do not include the OS cursor; draw one that
// follows the synthetic mouse events so navigation reads on video.
await page.addInitScript(() => {
  addEventListener("DOMContentLoaded", () => {
    const dot = document.createElement("div");
    dot.style.cssText =
      "position:fixed;z-index:99999;width:26px;height:26px;border-radius:50%;" +
      "background:rgba(76,141,255,0.45);border:2.5px solid #4c8dff;" +
      "pointer-events:none;transform:translate(-50%,-50%);left:-50px;top:-50px;" +
      "transition:left 0.05s linear, top 0.05s linear";
    document.body.appendChild(dot);
    addEventListener(
      "mousemove",
      (e) => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
      },
      true,
    );
    addEventListener(
      "mousedown",
      () => {
        dot.style.background = "rgba(76,141,255,0.85)";
        setTimeout(() => (dot.style.background = "rgba(76,141,255,0.45)"), 220);
      },
      true,
    );
  });
});

const glide = async (locator) => {
  const box = await locator.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: 40 });
};

await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });

// Dark mode to match the composition aesthetic (trim this in ffmpeg)
await page.getByRole("button", { name: /dark mode/i }).click();
await page.mouse.move(960, 300, { steps: 10 });
await page.waitForTimeout(1500);

// Beat 1: agents overview, glide to our agent
const agentRow = page.getByText("kam7f-eval-lab", { exact: true });
await glide(agentRow);
await page.waitForTimeout(900);
await agentRow.click();
await page.waitForURL(/agents/, { timeout: 15000 });
await page.waitForTimeout(1800);

// Beat 2: agent page opens on Monitor; switch to Controls
const controlsTab = page.locator("button", { hasText: "Controls" }).first();
await glide(controlsTab);
await page.waitForTimeout(600);
await controlsTab.click();
await page.waitForTimeout(2000);

// Beat 3: open the Edit Control modal on block-competitor-talk
const row = page.locator("tr", { hasText: "kam7f-block-competitor-talk" });
await glide(row);
await page.waitForTimeout(900);
const editBtn = row.locator('button[aria-label="Edit control"]');
await glide(editBtn);
await page.waitForTimeout(500);
await editBtn.click();
await page.waitForTimeout(2600);

// Beat 4: linger on the modal so the viewer can read the fields
await page.mouse.move(700, 500, { steps: 30 });
await page.waitForTimeout(2400);

const video = page.video();
await context.close();
const path = await video.path();
renameSync(path, `${OUT_DIR}ui-walkthrough.webm`);
await browser.close();
console.log(`saved: ${OUT_DIR}ui-walkthrough.webm`);
