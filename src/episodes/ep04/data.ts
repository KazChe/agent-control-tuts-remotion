// Episode 4: What a control can see. Scene lengths come from audio.json and
// every beat is anchored to a phrase in narration.md. Scene 4 replays
// gactl-tutorial module 07 as captured in transcripts/module07/ against a
// local Agent Control server.

import audio from "./audio.json";
import { said, type Clip } from "../anchors";
import type { StepLine } from "../../components/StepCard";
import type { TermEntry } from "../../components/Terminal";

const FPS = 30;
export const CLIPS = audio.clips as (Clip & { file: string; title: string })[];
const PAD = 0.8;
export const LEAD = [1, 2, 2, 2, 2, 2];
const at = (i: number, phrase: string, fallback: number) => LEAD[i] + said(CLIPS[i], phrase, fallback);
const TAIL = [0.5, 0.8, 0.8, 9.5, 0.8, 1.2];
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

// Scene 1: the step, two examples side by side, fields arriving on their words.
const s1 = {
  type: at(0, "a model call or a tool call", 0.15),
  name: at(0, "A name", 0.3),
  input: at(0, "An input", 0.38),
  output: at(0, "an output", 0.45),
  context: at(0, "an optional context", 0.55),
};
export const S1 = { ...s1, callout: at(0, "A selector can only reach", 0.72) };
export const llmStep: StepLine[] = [
  { text: "{" },
  { text: '  "type": "llm",', at: s1.type },
  { text: '  "name": "draft_reply",', at: s1.name },
  { text: '  "input": "I want a refund",', at: s1.input },
  { text: '  "output": "Here is what I can do ...",', at: s1.output },
  { text: '  "context": null', at: s1.context },
  { text: "}" },
];
export const toolStep: StepLine[] = [
  { text: "{" },
  { text: '  "type": "tool",', at: s1.type },
  { text: '  "name": "issue_refund",', at: s1.name },
  { text: '  "input": {"amount": 5000.0, "user_id": "agent-42"},', at: s1.input },
  { text: '  "output": "Refunded $5,000.00 ...",', at: s1.output },
  { text: '  "context": null', at: s1.context },
  { text: "}" },
];

// Scene 2: how a function becomes a step.
export const S2 = {
  plain: at(1, "A plain decorated function", 0.05),
  llmBadge: at(1, "becomes a model step", 0.1),
  attr: at(1, "the function carries a name attribute", 0.2),
  toolBadge: at(1, "the decorator sees it", 0.3),
  framework: at(1, "framework decorators", 0.35),
  frameworks: at(1, "LangChain's tool decorator", 0.4),
  order: at(1, "you apply them first", 0.55),
  frameworkBadge: at(1, "under the framework's name", 0.68),
  reversed: at(1, "The other way round", 0.75),
  reversedBadge: at(1, "you get a model step", 0.85),
  latest: at(1, "The latest SDK", 0.9),
};
export const CODE_PLAIN = ["@control()", "async def draft_reply(message: str) -> str:", "    ..."];
export const CODE_ATTR = [
  "async def _issue_refund(amount: float, user_id: str) -> str:",
  "    ...",
  "",
  '_issue_refund.tool_name = "issue_refund"',
  'issue_refund = control(step_name="issue_refund")(_issue_refund)',
];
export const CODE_FRAMEWORK = ["@control()", '@tool("issue_refund")        # the framework sets .name', "async def issue_refund(amount: float, user_id: str) -> str:", "    ..."];
export const CODE_REVERSED = ['@tool("issue_refund")', "@control()", "async def issue_refund(amount: float, user_id: str) -> str:", "    ..."];
export const CODE_LATEST = ['@control(step_type="tool")   # SDK 8.8.0 and later', "async def issue_refund(amount: float, user_id: str) -> str:", "    ..."];

// Scene 3: what input looks like.
export const S3 = {
  llm: at(2, "For a model step", 0.08),
  names: at(2, "It looks for a parameter named", 0.2),
  picks: at(2, "takes the first one it finds", 0.4),
  dropped: at(2, "Everything else is dropped", 0.5),
  tool: at(2, "For a tool step", 0.62),
  dict: at(2, "the whole argument dictionary", 0.7),
  path: at(2, "reach any field by path", 0.82),
  callout: at(2, "Same function shape", 0.92),
};
export const CODE_LLM_FN = ["@control()", "async def draft_reply(message: str, user_id: str) -> str:", "    ..."];
export const CODE_TOOL_FN = ['_issue_refund.tool_name = "issue_refund"', "", "async def _issue_refund(", "    amount: float, user_id: str, order_id: str = \"ORD-1\"", ") -> str:", "    ..."];
export const PARAM_NAMES = "input · message · query · text · prompt · content · user_input";
export const llmInput: StepLine[] = [
  { text: "{" },
  { text: '  "type": "llm",', at: S3.llm },
  { text: '  "name": "draft_reply",', at: S3.llm },
  { text: '  "input": "I want a refund"', at: S3.picks, highlight: "on" },
  { text: '  user_id: "agent-42"   (dropped)', at: S3.dropped, highlight: "missing" },
  { text: "}", at: S3.llm },
];
export const toolInput: StepLine[] = [
  { text: "{" },
  { text: '  "type": "tool",', at: S3.tool },
  { text: '  "name": "issue_refund",', at: S3.tool },
  { text: '  "input": {', at: S3.dict },
  { text: '    "amount": 5000.0,', at: S3.dict, highlight: "on" },
  { text: '    "user_id": "agent-42",', at: S3.dict, highlight: "on" },
  { text: '    "order_id": "ORD-1"', at: S3.dict, highlight: "on" },
  { text: "  }", at: S3.dict },
  { text: "}", at: S3.tool },
];

// Scene 4: the trap, on the captured module 07 run.
export const S4 = {
  cardA: at(3, "Written on a tool step", 0.15),
  fireA: at(3, "everyone else is stopped", 0.35),
  cardB: at(3, "written on a model step", 0.45),
  empty: at(3, "empty input", 0.62),
  never: at(3, "The and never fires", 0.68),
  green: at(3, "enabled and green", 0.85),
  run: at(3, "Here are both", 0.95),
};
export const cardA = {
  title: "kam7f-refund-limit-exempt",
  meta: "tool step issue_refund · pre · deny",
  operator: "AND",
  branches: [
    { label: "input", detail: "amount >= 1000 (json schema)" },
    { label: "NOT input.user_id", detail: "in [supervisor-1, auditor-7]" },
  ],
  firedText: "over the limit and not exempt, deny fires",
};
export const cardB = {
  title: "kam7f-draft-limit-exempt-broken",
  meta: "llm step · pre · deny · same intent",
  operator: "AND",
  branches: [
    { label: "input", detail: 'contains "refund"' },
    { label: "input.user_id", detail: "not in the exempt list (match_on: no_match)" },
  ],
  firedText: "",
};
const RUN_LINES = [
  { text: "" },
  { text: "--- A1. normal user, small refund", delay: 0.5 },
  { text: "  ALLOWED: Refunded $250.00 for order ORD-1 (requested by agent-42).", delay: 0.4 },
  { text: "--- A2. normal user, large refund", delay: 0.6 },
  { text: "  BLOCKED by control: kam7f-refund-limit-exempt", delay: 0.4 },
  { text: "--- A3. EXEMPT user, large refund", delay: 0.6 },
  { text: "  ALLOWED: Refunded $5,000.00 for order ORD-1 (requested by supervisor-1).", delay: 0.4 },
  { text: "" },
  { text: "--- B1. normal user, mentions refund", delay: 0.8 },
  { text: "  ALLOWED: Here is what I can do about that: I want a refund", delay: 0.4 },
  { text: "--- B2. EXEMPT user, mentions refund", delay: 0.6 },
  { text: "  ALLOWED: Here is what I can do about that: I want a refund", delay: 0.4 },
  { text: "--- B3. normal user, unrelated", delay: 0.6 },
  { text: "  ALLOWED: Here is what I can do about that: what are your hours", delay: 0.4 },
];
export const runEntry: TermEntry = {
  command: "python exemption_agent.py",
  prePause: Math.max(0.2, S4.run - 0.5 - 1.5),
  lines: RUN_LINES,
};
export const S4_done = S4.run + 1.5 + RUN_LINES.reduce((s, l) => s + (l.delay ?? 0.14), 0) + 0.8;

// Scene 5: context.
export const S5 = {
  call: at(4, "call the evaluation yourself", 0.15),
  context: at(4, "pass a context object", 0.25),
  part: at(4, "becomes part of the step", 0.5),
  path: at(4, "context dot user id", 0.6),
  works: at(4, "The exemption works", 0.7),
  jev: at(4, "model-backed evaluator", 0.85),
};
export const CODE_CONTEXT = [
  "result = agent_control.evaluate_controls(",
  '    step_name="draft_reply",',
  "    input=message,",
  '    context={"user_id": user_id, "conversation": history},',
  '    step_type="llm", stage="pre",',
  '    agent_name="support-desk-agent",',
  ")",
];
export const contextStep: StepLine[] = [
  { text: "{" },
  { text: '  "type": "llm",' },
  { text: '  "name": "draft_reply",' },
  { text: '  "input": "I want a refund",' },
  { text: '  "context": {', at: S5.part },
  { text: '    "user_id": "supervisor-1",', at: S5.part, highlight: "on" },
  { text: '    "conversation": [ ... ]', at: S5.part, highlight: "on" },
  { text: "  }", at: S5.part },
  { text: "}" },
];

// Scene 6: close.
export const S6 = {
  lines: [at(5, "Choose the step type", 0.2), at(5, "Put identity", 0.4), at(5, "pass it as context", 0.65)],
  next: at(5, "Next", 0.88),
};
