// Episode 1: Why a control plane. Scene lengths come from the narration clips
// in audio.json (written by scripts/narrate.py), and every screen beat is
// anchored to a phrase in narration.md through the word timings the
// generator saved. Edit the script, re-run the generator, and the beats move
// with the words. Terminal lines are the captured module 01 run, leak case
// only (transcripts/teaser-run*.txt); the control name is the clone the
// console created when the control was bound to the stream.

import audio from "./audio.json";
import { said, saidEnd, type Clip } from "../anchors";
import type { ChatMessage } from "../../components/ChatPanel";
import type { ConditionBranch } from "../../components/ConditionCard";
import type { PlaneTimes } from "../../components/PlaneDiagram";
import type { TermEntry } from "../../components/Terminal";
import { BOT_NAME, BOT_TAGLINE } from "../../teasers/agent-control-pii/data";
import { theme } from "../../theme";

export { BOT_NAME, BOT_TAGLINE };

const FPS = 30;
export const CLIPS = audio.clips as (Clip & { file: string; title: string })[];
const PAD = 0.8;
// Silence before the voice starts, so the viewer sees the new picture first.
export const LEAD = [1, 2, 2, 2, 2, 2];
const at = (i: number, phrase: string, fallback: number) => LEAD[i] + said(CLIPS[i], phrase, fallback);
const atEnd = (i: number, phrase: string, fallback: number) => LEAD[i] + saidEnd(CLIPS[i], phrase, fallback);
const TAIL = [0.6, 0, 0, 0, 3.5, 0]; // extra seconds after the voice, per scene
const MIN_SECONDS = [12, 16, 14, 14, 16, 14];


const secondsFor = (i: number) => Math.max(LEAD[i] + CLIPS[i].seconds + PAD + TAIL[i], MIN_SECONDS[i]);

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

// Scene 1: the leak, timed to the voice.
export const leakChat: ChatMessage[] = [
  {
    role: "user",
    text: "Hi! I need my SSN for a form. Can you tell me the SSN you have on my file?",
    at: at(0, "A customer asks", 0.05) + 0.3,
  },
  {
    role: "assistant",
    typingFrom: at(0, "The assistant looks", 0.25),
    at: at(0, "reads it back", 0.4),
    text: "Of course! The SSN we have on file for you is 987-65-4329. Anything else I can help with?",
    highlight: { text: "987-65-4329", at: at(0, "Nothing stopped", 0.65) },
  },
];
export const S1 = { callout: at(0, "Nothing was there", 0.8) };

// Scene 2: three agents.
export const S2: PlaneTimes & { callout: number } = {
  lit: [
    at(1, "write a check", 0.22),
    at(1, "coding agent", 0.36),
    at(1, "Then billing", 0.48),
  ],
  redeploy: at(1, "all three ship", 0.66),
  callout: at(1, "Nobody can say", 0.8),
};

// Scene 3: the lift.
export const S3: PlaneTimes & { callout: number } = {
  travel: [at(2, "Take the checks", 0.05), atEnd(2, "before they act", 0.4)],
  controlIn: at(2, "Put them in one place", 0.15),
  label: at(2, "written once", 0.5),
  arrows: at(2, "The agents keep", 0.72),
  callout: at(2, "changing it is an edit", 0.55),
};

// Scene 4: two planes.
export const S4: PlaneTimes & { callout: number } = {
  divider: at(3, "two layers", 0.08),
  workRow: at(3, "calling models", 0.3),
  decide: at(3, "decides before", 0.55),
  record: at(3, "records after", 0.7),
  callout: at(3, "That is the control plane", 0.85),
};

// Scene 5: same code, different behavior.
const LEAK_RUN_SECONDS = 4.6; // typing plus the leak lines, from the Terminal timeline
const BLOCKED_LEAD = 4.4; // typing plus the lines before BLOCKED prints
const blockedSaid = atEnd(4, "The reply is blocked", 0.95);
export const S5 = {
  pieceOne: at(4, "One piece lives", 0.05),
  leakRun: at(4, "Run it now", 0.34),
  controlCard: at(4, "The other piece", 0.51),
  // the second run starts early enough that BLOCKED prints as the word is spoken
  blockedRun: Math.min(at(4, "Run the same agent again", 0.87), blockedSaid - BLOCKED_LEAD),
  blocked: blockedSaid,
  neverMoved: at(4, "never moved", 0.98),
};

export const CONTROL_NAME = "kamc-acp-block-ssn";
export const CONTROL_BRANCHES: ConditionBranch[] = [
  { label: "output", detail: "matches \\b\\d{3}-\\d{2}-\\d{4}\\b" },
];

const LEAK_LINES = [
  { text: "" },
  { text: "--- pii leak", delay: 0.8 },
  { text: "  agent input:  What is the customer's SSN?", delay: 0.5 },
  { text: "  draft reply:  The customer's SSN is 987-65-4329, per their account record.", delay: 0.7 },
];

export const runLeak: TermEntry = {
  command: "python support_agent.py",
  prePause: S5.leakRun,
  lines: [
    ...LEAK_LINES,
    { text: "  ALLOWED: The customer's SSN is 987-65-4329, per their account record.", delay: 0.9 },
  ],
};

export const runBlocked: TermEntry = {
  command: "python support_agent.py",
  prePause: Math.max(1, S5.blockedRun - S5.leakRun - LEAK_RUN_SECONDS),
  lines: [
    ...LEAK_LINES,
    { text: "  BLOCKED by control: kamc-acp-block-ssn-clone-3f2f76825e984fcf", delay: 0.9 },
    { text: "  reason: Pattern '\\b\\d{3}-\\d{2}-\\d{4}\\b' found", delay: 0.3 },
  ],
};

export const AGENT_CODE = [
  "@control()",
  "async def draft_customer_reply(message: str) -> str:",
  "    reply = simulated_support_model(message)",
  "    return reply",
];

// Scene 6: close.
export const S6 = {
  lines: [at(5, "Authored", 0.06), at(5, "Enforced", 0.22), at(5, "Proven", 0.38)],
  title: at(5, "That is Agent Control", 0.62),
  next: at(5, "Next", 0.86),
};

export const ACCENT = theme.cyan;
