import { chromium } from "playwright";

const shots = process.argv[2] ?? "/tmp/ui-probe";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });

// Dark mode to match the video aesthetic
await page.getByRole("button", { name: /dark mode/i }).click();
await page.waitForTimeout(400);

await page.getByText("kam7f-eval-lab", { exact: true }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${shots}/agent.png` });
console.log("URL:", page.url());

const texts = await page.evaluate(() =>
  Array.from(
    document.querySelectorAll("a, button, [role=tab], th, td, h1, h2, h3"),
  )
    .map((el) => `${el.tagName}[${el.getAttribute("aria-label") ?? ""}]: ${el.textContent?.trim().slice(0, 70)}`)
    .slice(0, 80),
);
console.log(texts.join("\n"));

// Try opening the edit modal on the first control
const editBtns = page.locator("table button, table [role=button], table svg");
console.log("table buttons:", await editBtns.count());
await browser.close();
