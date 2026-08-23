// Human-driven console recording: opens a headed Chromium with video
// capture on, YOU navigate (log in, create the control, open traces),
// and the session is saved when you close the browser window.
//
// Usage:
//   node scripts/record-manual.mjs <clip-name> [start-url]
//   node scripts/record-manual.mjs galileo-create-control https://console.galileo.ai
//
// Output: recordings/<clip-name>.webm  (then transcode for Remotion:)
//   ffmpeg -y -i recordings/<clip-name>.webm -c:v libx264 -pix_fmt yuv420p \
//     -crf 18 -an public/<clip-name>.mp4
//
// The login session is also saved to recordings/galileo-state.json
// (gitignored) so scripted re-records can reuse it later.
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { chromium } from "playwright";

const [name, startUrl = "about:blank"] = process.argv.slice(2);
if (!name) {
  console.error("usage: node scripts/record-manual.mjs <clip-name> [start-url]");
  process.exit(1);
}

const OUT_DIR = new URL("../recordings/", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });
const statePath = `${OUT_DIR}galileo-state.json`;

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } },
  ...(existsSync(statePath) ? { storageState: statePath } : {}),
});

// Live redaction: blur any element whose text matches these patterns.
// Reapplied on every DOM mutation, so React re-renders stay covered.
// Add project names or other strings here before recording.
const REDACT_PATTERNS = [
  "[\\w.+-]+@[\\w-]+\\.[\\w.]{2,}", // any email address
  "demo-v2-poc", // organization label
  // Other tenants' project names (blur wherever they appear):
  "michael-test",
  "Tokenomics",
  "denisd-project",
  "diramasa_demo",
  "J_Multi Agent",
  "GalileoEval_",
  "scholarconnect",
  "atc-demo",
  "complaints_logging",
  "telco-mock-agent",
  "Promo-test",
  "Model Bakeoff",
  "pii-masking-demo",
  // Other tenants' control-name stems (Controls page + log stream tabs):
  "scholarconnect",
  "block-prompt-injection",
  "patient-summary",
  "oob-",
  "dispute",
  "card-services",
  "ccb-",
  "promo-",
];

// Entire components blurred by CSS selector (name + avatar, not just email)
const REDACT_SELECTORS = ['[class*="splunk-user-menu"]'];

await context.addInitScript(({ patterns, selectors }) => {
  const regexes = patterns.map((p) => new RegExp(p, "i"));
  const isMatch = (s) => s && regexes.some((r) => r.test(s));
  const blur = (el) => {
    el.style.filter = "blur(9px)";
    el.dataset.__redacted = "1";
  };
  const sweep = (root) => {
    if (root.querySelectorAll) {
      for (const sel of selectors) root.querySelectorAll(sel).forEach(blur);
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const el = node.parentElement;
      if (!el || el.dataset.__redacted) continue;
      if (isMatch(node.textContent)) blur(el);
    }
  };
  const start = () => {
    if (!document.body) return;
    sweep(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1) sweep(n);
          else if (n.nodeType === 3 && n.parentElement && isMatch(n.textContent))
            blur(n.parentElement);
        }
        if (m.type === "characterData" && m.target.parentElement) {
          if (isMatch(m.target.textContent)) blur(m.target.parentElement);
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };
  if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}, { patterns: REDACT_PATTERNS, selectors: REDACT_SELECTORS });

// Recordings are composed from page frames, so the OS cursor is not
// captured. Draw a dot that follows the real mouse instead.
await context.addInitScript(() => {
  const attach = () => {
    if (!document.body || document.getElementById("__rec_cursor")) return;
    const dot = document.createElement("div");
    dot.id = "__rec_cursor";
    dot.style.cssText =
      "position:fixed;z-index:2147483647;width:26px;height:26px;border-radius:50%;" +
      "background:rgba(76,141,255,0.45);border:2.5px solid #4c8dff;" +
      "pointer-events:none;transform:translate(-50%,-50%);left:-50px;top:-50px";
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
  };
  addEventListener("DOMContentLoaded", attach);
  attach();
});

const page = await context.newPage();
await page.goto(startUrl);

console.log(`
Recording "${name}" at 1920x1080.
  1. Navigate in the Chromium window (log in if needed).
  2. Do the walkthrough at a calm pace; pauses are fine, we trim later.
  3. CLOSE THE BROWSER WINDOW when done to save the video.
`);

await page.waitForEvent("close", { timeout: 0 });

try {
  await context.storageState({ path: statePath });
  console.log(`session saved: ${statePath}`);
} catch {
  console.log("could not save session state (already closed); continuing");
}

const video = page.video();
await context.close();
const raw = await video.path();
renameSync(raw, `${OUT_DIR}${name}.webm`);
await browser.close();
console.log(`saved: ${OUT_DIR}${name}.webm`);
console.log(
  `transcode: ffmpeg -y -i recordings/${name}.webm -c:v libx264 -pix_fmt yuv420p -crf 18 -an public/${name}.mp4`,
);
