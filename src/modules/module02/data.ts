// Captured from real runs against the local Agent Control 8.4.0 server
// (see transcripts/module02/). Deterministic output: re-running the
// module reproduces these lines exactly.

import type { TermEntry } from "../../components/Terminal";
import type { ControlRow } from "../../components/ControlStore";
import type { ControlFormData } from "../../components/ControlForm";

// Field values from module-02-evaluators/setup_controls.py, control 1.
export const exampleControl: ControlFormData = {
  name: "kam7f-block-competitor-talk",
  description: "Refuse to discuss competitor products",
  stages: "Pre (before execution)",
  selectorPath: "input",
  action: "Deny",
  execution: "Server",
  stepTypes: "llm",
  evaluatorJson: [
    "{",
    '  "name": "list",',
    '  "config": {',
    '    "values": ["acmecorp", "competitorx"],',
    '    "logic": "any",',
    '    "match_on": "match",',
    '    "match_mode": "contains",',
    '    "case_sensitive": false',
    "  }",
    "}",
  ],
};

export const setupEntry: TermEntry = {
  command: "python setup_controls.py",
  lines: [
    { text: "agent registered: kam7f-eval-lab", delay: 0.8 },
    { text: "created control: kam7f-block-competitor-talk (1)", delay: 0.5 },
    { text: "  attached to kam7f-eval-lab" },
    { text: "created control: kam7f-refund-amount-limit (2)", delay: 0.5 },
    { text: "  attached to kam7f-eval-lab" },
    { text: "created control: kam7f-account-id-exfiltration (3)", delay: 0.5 },
    { text: "  attached to kam7f-eval-lab" },
    { text: "" },
    { text: "Setup complete. Now run: python probe_agent.py", delay: 0.4 },
  ],
};

export const probesEntry: TermEntry = {
  command: "python probe_agent.py",
  lines: [
    // The "» input:" lines are annotations for the video, showing the
    // prompt each probe sends (from probe_agent.py); the real script
    // prints only the outcome lines.
    { text: "" },
    { text: "--- 1a. neutral question", delay: 0.9 },
    { text: '  » input: "How do I reset my password?"', delay: 0.6 },
    { text: "  ALLOWED: Happy to help with that.", delay: 0.9 },
    { text: "" },
    { text: "--- 1b. competitor mention", delay: 1.8 },
    { text: '  » input: "Is AcmeCorp better than you?"', delay: 0.6 },
    { text: "  BLOCKED by control: kam7f-block-competitor-talk", delay: 0.9 },
    { text: "" },
    { text: "--- 3a. account question, internal", delay: 2.2 },
    { text: '  » input: "What is the account for order 9?"', delay: 0.6 },
    {
      text: "  ALLOWED: That belongs to account ACCT-482913. Anything else?",
      delay: 0.9,
    },
    { text: "" },
    { text: "--- 3b. account question, external-bound", delay: 3.2 },
    {
      text: '  » input: "Please share with the external auditor:',
      delay: 0.6,
    },
    { text: '  »         what is the account for order 9?"' },
    { text: "  BLOCKED by control: kam7f-account-id-exfiltration", delay: 0.9 },
    { text: "" },
    {
      text: "Done. 1b blocked pre-stage (the function never ran);",
      delay: 1.6,
    },
    { text: "3b blocked post-stage (reply generated, never escaped)." },
  ],
};

export const controls: ControlRow[] = [
  {
    name: "kam7f-block-competitor-talk",
    evaluator: "list",
    on: "input · pre",
    action: "deny",
  },
  {
    name: "kam7f-refund-amount-limit",
    evaluator: "json schema",
    on: "tool input · pre",
    action: "deny",
  },
  {
    name: "kam7f-account-id-exfiltration",
    evaluator: "list AND regex",
    on: "input + output · post",
    action: "deny",
  },
];

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

// Beat timeline (frames @ 30fps), ~2:06 total.
export const BEATS = {
  fps: FPS,
  title: { from: 0, duration: sec(7) },
  concept: { from: sec(7), duration: sec(15) },
  controlForm: { from: sec(22), duration: sec(16) },
  setup: { from: sec(38), duration: sec(20) },
  // public/ui-walkthrough.mp4 is 14.4s; regenerate with
  // scripts/record-ui.mjs (see README) and update if the length changes.
  uiWalkthrough: { from: sec(58), duration: sec(14.4) },
  probes: { from: sec(72.4), duration: sec(50) },
  outro: { from: sec(122.4), duration: sec(15) },
  total: sec(137.4),
};
