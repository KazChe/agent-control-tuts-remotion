// Scripted recordings of the Galileo console for the Agent Control teaser.
// Reuses the saved session (recordings/galileo-state.json), injects the
// redaction sanitizer and the visible cursor dot, and drives each clip
// with slow glides so the footage reads as human navigation.
//
// Session order (the leak run must precede control creation):
//   CLI run 1 (leak) -> trace-leak -> create-control -> bind-control
//   -> CLI run 2 (blocked) -> trace-blocked
//
// Usage: node scripts/record-galileo.mjs <clip>
import { mkdirSync, renameSync } from "node:fs";
import { chromium } from "playwright";

const CONSOLE = "https://console.demo.sao.splunkcloud.com";
const ORG = "demo-v2-poc";
const PROJECT = "kamc-acp-teaser-demo";
const PROJECT_ID = "2e160e1b-b93c-4c68-bab8-0276d024b939";
const STREAM_ID = "384e994e-12c6-4950-9de7-8134aebf590c";
const STREAM_URL = `${CONSOLE}/${ORG}/project/${PROJECT_ID}/agent-streams/${STREAM_ID}`;

const CONTROL = {
  name: "kamc-acp-block-ssn",
  description: "Deny SSN-shaped output from support replies",
  pattern: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
  path: "output",
};

const clip = process.argv[2];
const CLIPS = ["trace-leak", "create-control", "bind-control", "trace-blocked"];
if (!CLIPS.includes(clip)) {
  console.error(`usage: node scripts/record-galileo.mjs <${CLIPS.join("|")}>`);
  process.exit(1);
}

const OUT_DIR = new URL("../recordings/", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });

const REDACT_PATTERNS = [
  "[\\w.+-]+@[\\w-]+\\.[\\w.]{2,}",
  "demo-v2-poc",
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
  "block-prompt-injection",
  "patient-summary",
  "oob-",
  "dispute",
  "card-services",
  "ccb-",
  "promo-",
];
const REDACT_SELECTORS = ['[class*="splunk-user-menu"]'];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } },
  storageState: `${OUT_DIR}galileo-state.json`,
});

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

await context.addInitScript(() => {
  const attach = () => {
    if (!document.body || document.getElementById("__rec_cursor")) return;
    const dot = document.createElement("div");
    dot.id = "__rec_cursor";
    dot.style.cssText =
      "position:fixed;z-index:2147483647;width:26px;height:26px;border-radius:50%;" +
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
  };
  addEventListener("DOMContentLoaded", attach);
  attach();
});

const page = await context.newPage();

const pause = (ms) => page.waitForTimeout(ms);
const glide = async (locator) => {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 38,
  });
  await pause(350);
};
const glideClick = async (locator) => {
  await glide(locator);
  await locator.click();
};
const typeSlow = async (locator, text) => {
  await glideClick(locator);
  await locator.pressSequentially(text, { delay: 38 });
  await pause(300);
};

// Home -> project -> support-bot stream, showing the real navigation.
const navigateToStream = async () => {
  await page.goto(`${CONSOLE}/${ORG}`, { waitUntil: "networkidle" });
  await pause(1800);
  await glideClick(page.getByTestId(`project-link-${PROJECT}`));
  await pause(2200);
  await glideClick(page.getByText("support-bot", { exact: true }).first());
  await pause(2200);
};

const openNewestTrace = async (label) => {
  await glideClick(page.getByTestId("table-level-tab-traces"));
  await pause(1800);
  await glideClick(page.getByText(label).first());
  await pause(5000); // linger in the trace drawer
};

const clips = {
  "trace-leak": async () => {
    await navigateToStream();
    await openNewestTrace("pii leak");
  },

  "create-control": async () => {
    await page.goto(`${CONSOLE}/${ORG}/controls`, { waitUntil: "networkidle" });
    await pause(1800);
    await glideClick(page.getByRole("button", { name: "Create new control" }));
    await page.getByTestId("create-control-evaluator-name-input").waitFor();
    await pause(900);

    await typeSlow(
      page.getByTestId("create-control-evaluator-name-input"),
      CONTROL.name,
    );
    await typeSlow(
      page.getByTestId("create-control-evaluator-description-input"),
      CONTROL.description,
    );

    // Stages: remove default PRE chip, add POST
    await glideClick(page.getByPlaceholder("Add stages"));
    await page.keyboard.press("Backspace");
    await pause(500);
    await glideClick(page.getByRole("option", { name: "POST (after execution)" }));
    await page.keyboard.press("Escape");
    await pause(400);

    // Action: Observe -> Deny
    await glideClick(page.locator('input[value="Observe"]'));
    await pause(400);
    await glideClick(page.getByRole("option", { name: "Deny" }));
    await pause(400);

    // Step types: remove default tool chip, add llm
    await glideClick(page.getByPlaceholder("Add step types"));
    await page.keyboard.press("Backspace");
    await pause(500);
    await glideClick(page.getByRole("option", { name: "llm" }));
    await page.keyboard.press("Escape");
    await pause(500);

    // Evaluator: Regex, path output, SSN pattern
    await glideClick(page.getByTestId("open-add-evaluator-modal"));
    await page.getByTestId("create-control-use-evaluator-regex").waitFor();
    await pause(900);
    await glideClick(page.getByTestId("create-control-use-evaluator-regex"));
    await page.getByTestId("evaluator-path-regex-0").waitFor();
    await pause(600);

    const path = page.getByTestId("evaluator-path-regex-0");
    await glideClick(path);
    await path.fill("");
    await path.pressSequentially(CONTROL.path, { delay: 45 });
    await pause(400);
    await typeSlow(
      page.getByTestId("evaluator-field-regex-0-pattern"),
      CONTROL.pattern,
    );

    await pause(1600); // let the viewer read the finished form
    await glideClick(page.getByTestId("create-control-evaluator-save-button"));
    await pause(2500);

    // End on the controls list filtered to our control
    await typeSlow(page.getByPlaceholder("Search controls"), "kamc-acp").catch(
      () => {},
    );
    await pause(2200);
  },

  "bind-control": async () => {
    await page.goto(STREAM_URL, { waitUntil: "networkidle" });
    await pause(1800);
    await glideClick(page.getByTestId("controls-tab"));
    await pause(1500);
    await glideClick(
      page.getByTestId("logstream-controls-empty-state-add-button"),
    );
    await page.getByTestId("logstream-add-controls-search-input").waitFor();
    await pause(900);
    await typeSlow(
      page.getByTestId("logstream-add-controls-search-input"),
      "kamc-acp",
    );
    await pause(900);
    await glideClick(
      page.locator('[data-testid^="logstream-add-controls-add-"]').first(),
    );
    await pause(2800); // attached row visible
  },

  "trace-blocked": async () => {
    await page.goto(STREAM_URL, { waitUntil: "networkidle" });
    await pause(2000);
    await openNewestTrace("pii leak");
  },
};

try {
  await clips[clip]();
} finally {
  const video = page.video();
  await context.close();
  const raw = await video.path();
  renameSync(raw, `${OUT_DIR}galileo-${clip}.webm`);
  await browser.close();
  console.log(`saved: ${OUT_DIR}galileo-${clip}.webm`);
}
