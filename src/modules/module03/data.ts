// Captured from real runs against the local Agent Control 8.4.0 server
// (see transcripts/module03/). Deterministic except the interactive 2FA
// prompt; the "123456" shown in the video is the code typed during the
// captured run (any six digits pass, per the tutorial).

import type { HistoryLine, TermEntry } from "../../components/Terminal";

export const setupEntry: TermEntry = {
  command: "python setup_controls.py",
  lines: [
    { text: "agent registered: kam7f-banking-agent", delay: 0.8 },
    { text: "created control: kam7f-audit-new-recipient (4)", delay: 0.5 },
    { text: "  attached to kam7f-banking-agent" },
    { text: "created control: kam7f-deny-sanctioned-countries (5)", delay: 0.5 },
    { text: "  attached to kam7f-banking-agent" },
    { text: "created control: kam7f-steer-large-transfer-2fa (6)", delay: 0.5 },
    { text: "  attached to kam7f-banking-agent" },
    { text: "" },
    { text: "Setup complete. Now run: python banking_agent.py", delay: 0.4 },
  ],
};

// One terminal beat per transfer (observe / deny / steer).

export const transfer1Entry: TermEntry = {
  command: "python banking_agent.py",
  lines: [
    { text: "" },
    {
      text: "--- transfer: $500.00 to Carlos Rivera in United States",
      delay: 0.9,
    },
    {
      text: "  COMPLETED: {'status': 'completed', 'amount': 500.0,",
      delay: 1.1,
    },
    { text: "    'recipient': 'Carlos Rivera', 'destination': 'United States'}" },
  ],
};

export const transfer2Entry: TermEntry = {
  lines: [
    { text: "" },
    { text: "--- transfer: $5,000.00 to Unknown in North Korea", delay: 0.6 },
    {
      text: "  DENIED by control: kam7f-deny-sanctioned-countries",
      delay: 1.1,
    },
    {
      text: "    reason: Control triggered. Logic: any, MatchOn: match. Matched: North Korea",
    },
  ],
};

export const transfer3Entry: TermEntry = {
  lines: [
    { text: "" },
    {
      text: "--- transfer: $15,000.00 to Jane Smith in United Kingdom",
      delay: 0.6,
    },
    {
      text: "  STEERED by control: kam7f-steer-large-transfer-2fa (attempt 1)",
      delay: 1.1,
    },
    {
      text: "    reason: Transfers of $10,000 or more require identity verification via 2FA",
    },
    { text: "    required actions: ['verify_2fa']" },
    {
      text: "    enter your 6-digit 2FA code (or 'cancel'): 123456",
      delay: 1.4,
    },
    { text: "    2FA verified, retrying with corrected request...", delay: 1.0 },
    {
      text: "  COMPLETED: {'status': 'completed', 'amount': 15000.0,",
      delay: 1.1,
    },
    { text: "    'recipient': 'Jane Smith', 'destination': 'United Kingdom'}" },
    { text: "" },
    {
      text: "Done. Three transfers, three different control outcomes.",
      delay: 1.4,
    },
  ],
};

const asHistory = (entry: TermEntry): HistoryLine[] => [
  ...(entry.command !== undefined
    ? [{ kind: "cmd" as const, text: entry.command }]
    : []),
  ...entry.lines.map((l) => ({ kind: "out" as const, text: l.text })),
];

export const transfer2History: HistoryLine[] = asHistory(transfer1Entry);
export const transfer3History: HistoryLine[] = [
  ...transfer2History,
  ...asHistory(transfer2Entry),
];

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

export const BEATS = {
  fps: FPS,
  title: { from: 0, duration: sec(7) },
  concept: { from: sec(7), duration: sec(14) },
  setup: { from: sec(21), duration: sec(16) },
  transfer1: { from: sec(37), duration: sec(13) },
  transfer2: { from: sec(50), duration: sec(13) },
  transfer3: { from: sec(63), duration: sec(19) },
  outro: { from: sec(82), duration: sec(14) },
  total: sec(96),
};
