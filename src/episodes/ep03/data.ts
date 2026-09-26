// Episode 3: The request flow. Scene lengths come from audio.json and every
// beat is anchored to a phrase in narration.md. All seven scenes run on the
// two-lane diagram in a different mode.

import audio from "./audio.json";
import { said, type Clip } from "../anchors";
import type { LaneTimes } from "../../components/LaneDiagram";

const FPS = 30;
export const CLIPS = audio.clips as (Clip & { file: string; title: string })[];
const PAD = 0.8;
export const LEAD = [1, 2, 2, 2, 2, 2, 2];
const at = (i: number, phrase: string, fallback: number) => LEAD[i] + said(CLIPS[i], phrase, fallback);
const TAIL = [0.5, 0.8, 0.5, 0.8, 0.5, 0.5, 1.5];
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

export const S1: LaneTimes & { callout: number } = {
  fn: at(0, "The function", 0.12),
  decorator: at(0, "the decorator", 0.16),
  sdk: at(0, "the SDK", 0.2),
  controls: at(0, "The controls", 0.3),
  engine: at(0, "the engine", 0.34),
  record: at(0, "the record", 0.4),
  register: at(0, "Once at startup", 0.55),
  perCall: at(0, "at every decorated call", 0.78),
  callout: at(0, "before it runs and after", 0.9),
};

export const S2: LaneTimes & { callout: number } = {
  preUp: at(1, "sends the pre controls", 0.12),
  evaluate: at(1, "the engine evaluates", 0.22),
  preBack: at(1, "an answer comes back", 0.3),
  preDeny: at(1, "If any deny", 0.38),
  runs: at(1, "Otherwise the function runs", 0.55),
  postUp: at(1, "Then the post controls", 0.62),
  postBack: at(1, "the same thing happens", 0.72),
  postDeny: at(1, "A deny here", 0.8),
  callout: at(1, "Two round trips", 0.9),
};

export const S3: LaneTimes & { callout: number } = {
  serverExec: at(2, "Server execution is the default", 0.1),
  sdkExec: at(2, "SDK execution moves", 0.45),
  callout: at(2, "Only the judging moves", 0.92),
};

export const S4: LaneTimes = {
  dark: at(3, "the line goes dark", 0.05),
  blocked: at(3, "the call is blocked", 0.2),
  evalError: at(3, "If an evaluator", 0.4),
  blocks: at(3, "It blocks", 0.62),
};

export const S5: LaneTimes & { callout: number } = {
  t1: at(4, "First, on the control", 0.15),
  t2: at(4, "Second, on the server", 0.42),
  t3: at(4, "Third, in the agent", 0.65),
  callout: at(4, "keep all three", 0.92),
};

export const S6: LaneTimes & { callout: number } = {
  tick: at(5, "refreshes them", 0.2),
  change: at(5, "Change a control", 0.42),
  pickup: at(5, "picks it up", 0.58),
  callout: at(5, "No restart", 0.72),
};

export const S7: LaneTimes & { lines: number[]; next: number } = {
  lines: [at(6, "Register once", 0.02), at(6, "Ask before", 0.1), at(6, "Block when", 0.2), at(6, "Refresh on", 0.3)],
  third: at(6, "in a third place", 0.55),
  galileo: at(6, "that is Galileo", 0.68),
  next: at(6, "Next", 0.9),
};
