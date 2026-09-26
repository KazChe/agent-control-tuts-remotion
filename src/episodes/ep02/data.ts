// Episode 2: The anatomy of a control. Scene lengths come from audio.json and
// every beat is anchored to a phrase in narration.md. Scene 4 replays the
// module 02 probes captured in transcripts/module02/.

import audio from "./audio.json";
import { said, type Clip } from "../anchors";
import type { ActionsTimes } from "../../components/ActionsList";
import type { ControlCardTimes } from "../../components/ControlCard";
import type { LeafTimes } from "../../components/LeafCondition";
import type { StageStripTimes } from "../../components/StageStrip";
import type { TermEntry } from "../../components/Terminal";
import { probes3aEntry, probes3bEntry } from "../../modules/module02/data";

const FPS = 30;
export const CLIPS = audio.clips as (Clip & { file: string; title: string })[];
const PAD = 0.8;
// Silence before the voice starts, so the viewer sees the new picture first.
export const LEAD = [1, 2, 2, 2, 2, 2];
const at = (i: number, phrase: string, fallback: number) => LEAD[i] + said(CLIPS[i], phrase, fallback);
const TAIL = [0.5, 0.5, 0.5, 1.5, 0.8, 1.2];
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

export const CONTROL_NAME = "kamc-acp-block-ssn";

// Scene 1: one control, three parts.
export const S1: ControlCardTimes & { callout: number } = {
  scope: at(0, "When do we check", 0.3),
  condition: at(0, "What do we check", 0.42),
  action: at(0, "what do we do", 0.55),
  callout: at(0, "Every control is", 0.85),
};

// Scene 2: scope.
export const S2: StageStripTimes & { callout: number } = {
  pre: at(1, "before the step runs", 0.2),
  post: at(1, "or after", 0.28),
  stageLabel: at(1, "called the stage", 0.33),
  preDeny: at(1, "the function never runs", 0.45),
  postDeny: at(1, "holds its output back", 0.62),
  stepType: at(1, "The step type", 0.72),
  stepName: at(1, "Optionally the step name", 0.8),
  stage: at(1, "And the stage", 0.86),
  blockedAtPost: at(1, "blocked at post", 0.92),
  callout: at(1, "So scope names", 0.7),
};

// Scene 3: a leaf condition.
export const S3: LeafTimes & { callout: number } = {
  selector: at(2, "A selector picks", 0.15),
  paths: at(2, "by path", 0.3),
  evaluator: at(2, "An evaluator judges", 0.38),
  evaluators: [
    at(2, "A regular expression", 0.45),
    at(2, "a list of values", 0.5),
    at(2, "a JSON schema", 0.55),
    at(2, "a sequel check", 0.6),
    at(2, "or one you write yourself", 0.65),
  ],
  result: at(2, "answers with matched", 0.75),
  holds: at(2, "Matched means", 0.88),
  callout: at(2, "It says nothing yet", 0.93),
};

// Scene 4: composing conditions, on the module 02 probes.
const firstProbe = at(3, "The first probe", 0.3);
const secondProbe = at(3, "The second probe", 0.55);
const blockedSaid = at(3, "the reply is blocked", 0.78);
const PROBE_COMMAND = "python probe_agent.py";
const TYPE_AND_PAUSE = PROBE_COMMAND.length / 28 + 0.6;
const preA = Math.max(0.2, firstProbe - 0.5 - TYPE_AND_PAUSE);
const endA = 0.5 + preA + TYPE_AND_PAUSE + probes3aEntry.lines.reduce((s, l) => s + (l.delay ?? 0.14), 0);
export const probeA: TermEntry = { command: PROBE_COMMAND, prePause: preA, lines: probes3aEntry.lines };
const preB = Math.max(0.2, secondProbe - endA - 0.14 - 0.6);
const headerB = endA + preB + 0.14 + 0.6;
const linesB = probes3bEntry.lines.slice(0, 5).map((l, i) =>
  // the BLOCKED line waits for the word "blocked"; the lines before it keep their pace
  i === 4 ? { ...l, delay: Math.max(0.9, blockedSaid - headerB - 0.6 - 0.14) } : l,
);
export const probeB: TermEntry = { prePause: preB, lines: linesB };
export const S4 = {
  card: at(3, "This control from the tutorials", 0.1),
  quiet: at(3, "the control stays quiet", 0.5),
  blocked: blockedSaid + 0.3,
  nodes: at(3, "Or and not", 0.85),
};
export const exfilCard = {
  title: "kam7f-account-id-exfiltration",
  meta: "post stage · deny · both branches must match",
  operator: "AND",
  branches: [
    { label: "input", detail: 'contains "forward this" | "external" | "share with"' },
    { label: "output", detail: "matches \\bACCT-\\d{6}\\b" },
  ],
  firedText: "both matched, deny fires",
};

// Scene 5: action.
export const S5: ActionsTimes = {
  observe: at(4, "Observe is the quiet one", 0.1),
  deny: at(4, "Deny stops the request", 0.6),
  steer: at(4, "Steer sends", 0.7),
  denyWins: at(4, "deny wins", 0.92),
};

// Scene 6: close.
export const S6: ControlCardTimes & { next: number } = {
  scope: at(5, "Scope", 0.05),
  condition: at(5, "Condition", 0.2),
  action: at(5, "Action", 0.4),
  next: at(5, "Next", 0.85),
};
