// Episode 5: Evaluators. Scene lengths come from audio.json and every beat is
// anchored to a phrase in narration.md. Scenes 2 and 4 replay gactl-tutorial
// module 02 as captured in transcripts/module02/ (probes 1a to 3b from the demo
// cluster, the exercise 2 sql control against a local server).

import audio from "./audio.json";
import { said, type Clip } from "../anchors";
import type { ContractTimes } from "../../components/EvaluatorContract";
import type { ExecutionTimes } from "../../components/ExecutionDiagram";
import type { TermEntry } from "../../components/Terminal";

const FPS = 30;
export const CLIPS = audio.clips as (Clip & { file: string; title: string })[];
const PAD = 0.8;
export const LEAD = [1, 2, 2, 2, 2, 2];
const at = (i: number, phrase: string, fallback: number) => LEAD[i] + said(CLIPS[i], phrase, fallback);
const TAIL = [0.5, 1.0, 0.8, 1.5, 0.8, 1.2];
const MIN_SECONDS = 10;

const secondsFor = (i: number) => Math.max(LEAD[i] + CLIPS[i].seconds + PAD + TAIL[i], MIN_SECONDS);
type Beat = { from: number; duration: number; seconds: number };
const beats: Beat[] = [];
let cursor = 0;
for (let i = 0; i < CLIPS.length; i++) {
  const seconds = secondsFor(i);
  const duration = Math.round(seconds * FPS);
  beats.push({ from: cursor, duration, seconds });
  cursor += duration;
}
export const BEATS = { fps: FPS, scenes: beats, total: cursor };

// Terminal scheduling. The Terminal component builds its own timeline
// (0.5 s, then per entry prePause, command typing at 28 chars/s plus 0.6 s,
// then each line after its delay). This mirrors that arithmetic so a line can
// be asked to land at an absolute scene second, given when the terminal mounts.
const T0 = 0.5;
const CPS = 28;
const CMD_PAUSE = 0.6;
const GAP = 0.14;
type Target = { text: string; at?: number; min?: number };
type Spec = { command?: string; startAt?: number; lines: Target[] };
const schedule = (mountAt: number, specs: Spec[]): TermEntry[] => {
  let t = T0;
  return specs.map((e) => {
    const pre = e.startAt === undefined ? 0.2 : Math.max(0.2, e.startAt - mountAt - t);
    t += pre;
    if (e.command !== undefined) t += e.command.length / CPS + CMD_PAUSE;
    const lines = e.lines.map((l) => {
      const min = l.min ?? GAP;
      const delay = l.at === undefined ? min : Math.max(min, l.at - mountAt - t);
      t += delay;
      return { text: l.text, delay };
    });
    return { command: e.command, prePause: pre, lines };
  });
};

// Scene 1: one contract.
export const S1: ContractTimes & { contract: number; apart: number } = {
  piece: at(0, "It gets the piece", 0.1),
  matched: at(0, "Matched true or false", 0.25),
  confidence: at(0, "A confidence between", 0.32),
  message: at(0, "A message saying", 0.4),
  metadata: at(0, "And metadata", 0.46),
  contract: at(0, "That is the whole contract", 0.58),
  chips: [
    at(0, "Regex list", 0.62),
    at(0, "list JSON", 0.64),
    at(0, "JSON sequel", 0.66),
    at(0, "sequel Luna", 0.68),
    at(0, "Luna or", 0.7),
    at(0, "one you write yourself", 0.72),
  ],
  apart: at(0, "cannot tell them apart", 0.78),
  always: at(0, "confidence is always one", 0.88),
  meaning: at(0, "starts to mean something", 0.96),
};

// Scene 2: regex and list, then the competitor control for real.
export const S2 = {
  regex: at(1, "Regex takes a pattern", 0.05),
  found: at(1, "found anywhere", 0.12),
  linear: at(1, "linear time engine", 0.18),
  flag: at(1, "ignore case", 0.28),
  list: at(1, "List takes values", 0.32),
  mode: at(1, "a match mode", 0.35),
  exact: at(1, "Exact the whole string", 0.38),
  contains: at(1, "Contains the value", 0.42),
  wholeWord: at(1, "whole word", 0.45),
  starts: at(1, "Starts with", 0.52),
  ends: at(1, "and ends with", 0.55),
  logic: at(1, "Logic any or all", 0.6),
  caseToggle: at(1, "a case toggle", 0.65),
  run: at(1, "Here is the tutorial's", 0.7),
  input: at(1, "Is AcmeCorp better", 0.82),
  found2: at(1, "The value is found", 0.87),
  holds: at(1, "the condition holds", 0.9),
  denied: at(1, "the request is denied", 0.94),
};
export const CODE_REGEX = [
  '"evaluator": {',
  '  "name": "regex",',
  '  "config": {',
  '    "pattern": "\\\\bACCT-\\\\d{6}\\\\b",',
  '    "flags": ["IGNORECASE"]',
  "  }",
  "}",
];
export const CODE_LIST = [
  '"evaluator": {',
  '  "name": "list",',
  '  "config": {',
  '    "values": ["acmecorp", "competitorx"],',
  '    "match_mode": "contains",',
  '    "logic": "any",',
  '    "case_sensitive": false',
  "  }",
  "}",
];
export const competitorCard = {
  title: "kam7f-block-competitor-talk",
  meta: "llm step · pre · deny · execution server",
  operator: "",
  branches: [{ label: "input", detail: 'contains "acmecorp" | "competitorx"' }],
  firedText: "value found, deny fires",
};
export const competitorRun: TermEntry[] = schedule(S2.run, [
  {
    command: "python probe_agent.py",
    lines: [
      { text: "" },
      { text: "--- 1a. neutral question", min: 0.4 },
      { text: '  » input: "How do I reset my password?"', min: 0.3 },
      { text: "  ALLOWED: Happy to help with that.", min: 0.5 },
      { text: "" },
      { text: "--- 1b. competitor mention", at: S2.input - 0.7 },
      { text: '  » input: "Is AcmeCorp better than you?"', at: S2.input },
      { text: "  BLOCKED by control: kam7f-block-competitor-talk", at: S2.denied },
    ],
  },
]);

// Scene 3: match_on, the same evaluator turned around.
export const S3 = {
  switch: at(2, "Match on", 0.05),
  byDefault: at(2, "By default", 0.1),
  foundBadge: at(2, "fires when a value is found", 0.15),
  noMatch: at(2, "Set match on to no match", 0.25),
  none: at(2, "none of the values", 0.35),
  allowlist: at(2, "turns a blocklist", 0.45),
  approved: at(2, "Require the word approved", 0.55),
  tools: at(2, "handful of tool names", 0.65),
  same: at(2, "Same evaluator inverted", 0.72),
  empty: at(2, "When the selected value is empty", 0.82),
  ignored: at(2, "empty input control ignored", 0.92),
};
export const CODE_BLOCKLIST = [
  '"config": {',
  '  "values": ["acmecorp", "competitorx"],',
  '  "match_mode": "contains",',
  '  "match_on": "match"',
  "}",
];
export const CODE_ALLOWLIST = [
  '"config": {',
  '  "values": ["approved"],',
  '  "match_mode": "contains",',
  '  "match_on": "no_match"',
  "}",
];
export const CODE_TOOLS = [
  '"selector": {"path": "input.tool"},',
  '"config": {',
  '  "values": ["lookup_account", "issue_refund"],',
  '  "match_on": "no_match"',
  "}",
];

// Scene 4: json and sql, the rule breakers.
export const S4 = {
  polarityFound: at(3, "Regex and list match", 0.05),
  polarityBroken: at(3, "JSON and sequel match", 0.1),
  jsonCard: at(3, "The JSON evaluator takes", 0.15),
  required: at(3, "required fields", 0.18),
  types: at(3, "types", 0.2),
  ranges: at(3, "ranges", 0.21),
  patterns: at(3, "patterns", 0.22),
  allowed: at(3, "describes what is allowed", 0.25),
  violation: at(3, "matches on the violation", 0.28),
  limit: at(3, "amount below one thousand", 0.33),
  run: at(3, "Two hundred and fifty", 0.38),
  passes: at(3, "nothing matches", 0.42),
  toolRuns: at(3, "the tool runs", 0.44),
  five: at(3, "Five thousand breaks it", 0.47),
  matches: at(3, "the evaluator matches and", 0.5),
  never: at(3, "the tool never runs", 0.53),
  sql: at(3, "Sequel goes further", 0.57),
  parser: at(3, "a real sequel parser", 0.6),
  dialect: at(3, "in the dialect you name", 0.63),
  ops: at(3, "Blocked or allowed operations", 0.68),
  ddl: at(3, "Whole categories", 0.71),
  tables: at(3, "Table and schema lists", 0.74),
  limitCheck: at(3, "A required limit", 0.77),
  joins: at(3, "join and union counts", 0.8),
  fourth: at(3, "Here is a fourth control", 0.84),
  dropDelete: at(3, "Drop and delete are blocked", 0.88),
  select: at(3, "A select goes through", 0.93),
  del: at(3, "A delete does not", 0.97),
};
export const CODE_JSON = [
  '"evaluator": {',
  '  "name": "json",',
  '  "config": {',
  '    "json_schema": {',
  '      "type": "object",',
  '      "properties": {',
  '        "amount": {"type": "number", "exclusiveMaximum": 1000}',
  "      },",
  '      "required": ["amount"]',
  "    }",
  "  }",
  "}",
];
export const CODE_SQL = [
  '"evaluator": {',
  '  "name": "sql",',
  '  "config": {',
  '    "dialect": "postgres",',
  '    "blocked_operations": ["DROP", "DELETE"]',
  "  }",
  "}",
];
export const refundCard = {
  title: "kam7f-refund-amount-limit",
  meta: "tool step issue_refund · pre · deny",
  operator: "",
  branches: [{ label: "input", detail: "breaks the schema: amount must be below 1000" }],
  firedText: "schema broken, deny fires",
};
export const sqlCard = {
  title: "kam7f-dangerous-sql",
  meta: "tool step run_query · pre · deny · exercise 2",
  operator: "",
  branches: [{ label: "input.sql", detail: "blocked operation: DROP | DELETE" }],
  firedText: "blocked operation found, deny fires",
};
const TYPE_PROBE = "python probe_agent.py".length / CPS + CMD_PAUSE;
export const S4_mount = S4.run - T0 - 0.2 - TYPE_PROBE - 0.3;
export const ruleRuns: TermEntry[] = schedule(S4_mount, [
  {
    command: "python probe_agent.py",
    lines: [
      { text: "" },
      { text: "--- 2a. small refund", at: S4.run - 0.5 },
      { text: '  » input: {"amount": 250.0, "order_id": "ORD-1"}', at: S4.run },
      { text: "  ALLOWED: Refunded $250.00 for order ORD-1.", at: S4.toolRuns },
      { text: "" },
      { text: "--- 2b. oversized refund", at: S4.five - 0.5 },
      { text: '  » input: {"amount": 5000.0, "order_id": "ORD-2"}', at: S4.five },
      { text: "  BLOCKED by control: kam7f-refund-amount-limit", at: S4.never },
    ],
  },
  {
    command: "python sql_probe.py",
    startAt: S4.fourth,
    lines: [
      { text: "" },
      { text: "--- 4a. read query", at: S4.select - 0.4 },
      { text: '  » input.sql: "SELECT id, status FROM orders WHERE id = 9 LIMIT 1"', at: S4.select },
      { text: "  ALLOWED: query ran: SELECT id, status FROM orders WHERE id = 9 LIMIT 1", at: S4.select + 0.8 },
      { text: "" },
      { text: "--- 4b. destructive query", at: S4.del - 0.4 },
      { text: '  » input.sql: "DELETE FROM orders WHERE id = 9"', at: S4.del },
      { text: "  BLOCKED by control: kam7f-dangerous-sql", at: S4.del + 0.8 },
    ],
  },
]);

// Scene 5: where it runs.
export const S5: Required<ExecutionTimes> & { where: number; how: number } = {
  where: at(4, "First where", 0.05),
  server: at(4, "Server means", 0.15),
  builtins: at(4, "the built-ins live there", 0.22),
  sdk: at(4, "SDK means", 0.32),
  env: at(4, "lives only in the agent's environment", 0.42),
  how: at(4, "Second how", 0.55),
  cache: at(4, "keeps one instance", 0.58),
  stateless: at(4, "must not keep per request state", 0.72),
  timeout: at(4, "declares a timeout", 0.8),
  json15: at(4, "fifteen for JSON", 0.88),
  own: at(4, "config can carry its own", 0.94),
};

// Scene 6: beyond the box, and close.
export const S6 = {
  builtins: at(5, "The four built-ins are deterministic", 0.02),
  cannot: at(5, "They cannot judge", 0.1),
  model: at(5, "there are model backed", 0.25),
  addon: at(5, "add on packages", 0.32),
  luna: at(5, "Luna from Galileo", 0.45),
  contrib: at(5, "others in the contrib", 0.52),
  yours: at(5, "anything you write yourself", 0.6),
  lines: [at(5, "One contract", 0.72), at(5, "contract Four built-ins", 0.76), at(5, "Two polarities", 0.8)],
  next: at(5, "Next what happens", 0.9),
};
