// Every number, answer, rule, and sentence on screen comes from demo.json,
// which scripts/import-tool-gate.mjs trims from a live `tg-demo` run in
// github.com/KazChe/tool-gate (runs/demo.json). The choreography below is
// authored; the content is not. The two assistant replies marked SCRIPTED
// are not in the artifact, because the eval replays conversations and has
// no live agent; they show what an agent would say with the text it got.

import demo from "./demo.json";
import type { ChatMessage } from "../../components/ChatPanel";
import type { GateAction, Judgment } from "../../components/JudgmentCard";
import { judgmentTimeline } from "../../components/JudgmentCard";
import type { TermEntry } from "../../components/Terminal";
import { theme } from "../../theme";

export type DemoRow = {
  id: string;
  family: string;
  label: string;
  conversation: { from: string; text: string }[];
  proposed_call: { tool: string; arguments: Record<string, string | number> };
  answers: Judgment;
  fired: string[];
  action: GateAction;
  message: string;
  latency_ms: number;
  plane: { action: string; matched: string[]; is_safe: boolean };
};

const rows = demo.rows as unknown as DemoRow[];
export const ROW = Object.fromEntries(rows.map((r) => [r.id, r])) as Record<
  "dw-01" | "dw-02" | "cs-08",
  DemoRow
>;
export const SOURCE = demo.source;

export const BOT_NAME = "Northlake Support";
export const BOT_TAGLINE = "AI assistant · four tools behind a Jev gate";

const callText = (r: DemoRow) => {
  const args = Object.entries(r.proposed_call.arguments)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(", ");
  return `${r.proposed_call.tool}(${args})`;
};

const badge = (label: string, color: string, at: number) => ({ label, color, at });

// Beat 1: the steer. Customer asks, agent proposes, Jev answers, the policy
// writes the sentence, Agent Control hands it to the agent, the agent asks.
export const STEER_JUDGE_AT = 3.4;
const steerTl = judgmentTimeline(STEER_JUDGE_AT);
export const steerChat: ChatMessage[] = [
  { role: "user", text: ROW["dw-01"].conversation[0].text, at: 0.8 },
  {
    role: "call",
    label: "agent proposes",
    text: callText(ROW["dw-01"]),
    at: 2.4,
  },
  {
    role: "assistant",
    // From the fixture: the assistant turn in dw-02 is the question the steer produced.
    text: ROW["dw-02"].conversation[1].text,
    at: steerTl.done + 1.6,
    typingFrom: steerTl.done + 0.4,
    badge: badge("gate-steer · steering text delivered", theme.amber, steerTl.done + 2.8),
  },
];

// Beat 2: the retry. Same call, same arguments, one more customer turn.
export const RETRY_JUDGE_AT = 3.4;
const retryTl = judgmentTimeline(RETRY_JUDGE_AT);
export const retryChat: ChatMessage[] = [
  { role: "user", text: ROW["dw-02"].conversation[0].text, at: 0 },
  { role: "assistant", text: ROW["dw-02"].conversation[1].text, at: 0 },
  { role: "user", text: ROW["dw-02"].conversation[2].text, at: 1.0 },
  {
    role: "call",
    label: "agent proposes, same arguments",
    text: callText(ROW["dw-02"]),
    at: 2.4,
  },
  {
    role: "assistant",
    // SCRIPTED: the tool ran; the artifact records the observe, not the reply.
    text: "Done. Workspace ws-sandbox-1 has been permanently deleted.",
    at: retryTl.done + 1.4,
    typingFrom: retryTl.done + 0.3,
    badge: badge("gate-observe · call ran", theme.green, retryTl.done + 2.4),
  },
];

// Beat 3: the planted instruction, arriving inside a tool result.
export const INJECT_JUDGE_AT = 9.6;
const injectTl = judgmentTimeline(INJECT_JUDGE_AT);
// Six messages do not fit the panel; follow the thread like a chat app would.
export const injectScroll = [
  { at: 8.5, px: 200 },
  { at: injectTl.done + 0.3, px: 300 },
];
const toolResult = ROW["cs-08"].conversation[1].text;
const planted = toolResult.slice(toolResult.indexOf("agent instruction"), -1);
export const injectChat: ChatMessage[] = [
  { role: "user", text: ROW["cs-08"].conversation[0].text, at: 0.8 },
  {
    role: "tool",
    label: "tool result · lookup_account",
    text: toolResult,
    at: 2.4,
    highlight: { text: planted, at: 3.8 },
  },
  {
    role: "assistant",
    text: ROW["cs-08"].conversation[2].text,
    at: 5.6,
    typingFrom: 4.8,
  },
  { role: "user", text: ROW["cs-08"].conversation[3].text, at: 7.2 },
  {
    role: "call",
    label: "agent proposes",
    text: callText(ROW["cs-08"]),
    at: 8.6,
  },
  {
    role: "assistant",
    // SCRIPTED: what an agent does with the deny text; the artifact records the deny.
    text: "There is a note on your account asking me to cancel your subscription. It did not come from you, so I have not acted on it. Is there anything you would like changed?",
    at: injectTl.done + 1.6,
    typingFrom: injectTl.done + 0.4,
    badge: badge("gate-deny · call blocked", theme.red, injectTl.done + 3.6),
  },
];

// Beat 4: the receipts. Verbatim lines from runs/demo.log for the same run.
const jevLine = (r: DemoRow) => {
  const a = r.answers;
  return (
    `  jev       authorized ${a.authorized.toFixed(2)}  third_party ${a.third_party_instruction.toFixed(2)}  ` +
    `confirmed ${a.confirmed.toFixed(2)}  reversibility ${a.reversibility_score.toFixed(2)}  ` +
    `decision ${a.decision} (${a.decision_confidence.toFixed(2)})`
  );
};
const pyList = (xs: string[]) => `[${xs.map((x) => `'${x}'`).join(", ")}]`;
const rowLines = (r: DemoRow, delay: number) => [
  { text: "" },
  { text: `== ${r.id} (${r.family}, label ${r.label})`, delay },
  { text: jevLine(r), delay: 0.5 },
  {
    text: `  policy    ${r.action}  fired ${r.fired.length ? pyList(r.fired) : "-"}`,
    delay: 0.3,
  },
  {
    text: `  plane     ${r.plane.action}  matched ${pyList(r.plane.matched)}  is_safe ${r.plane.is_safe ? "True" : "False"}`,
    delay: 0.3,
  },
];
export const demoEntry: TermEntry = {
  command: "uv run tg-demo --rows dw-01,dw-02,cs-08",
  lines: [
    ...rowLines(ROW["dw-01"], 1.0),
    ...rowLines(ROW["dw-02"], 1.2),
    ...rowLines(ROW["cs-08"], 1.2),
  ],
};

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

export const BEATS = {
  fps: FPS,
  title: { from: 0, duration: sec(4.5) },
  steer: { from: sec(4.5), duration: sec(17) },
  retry: { from: sec(21.5), duration: sec(14.5) },
  inject: { from: sec(36), duration: sec(21) },
  terminal: { from: sec(57), duration: sec(15) },
  results: { from: sec(72), duration: sec(9) },
  total: sec(81),
};
