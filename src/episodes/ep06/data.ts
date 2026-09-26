// Episode 6: Actions, and the steer loop. Scene lengths come from audio.json and
// every beat is anchored to a phrase in narration.md. Scenes 3 and 4 replay
// gactl-tutorial module 03 as captured in transcripts/module03/ against a local
// Agent Control server (the 2FA code typed during that run was 123456).

import audio from "./audio.json";
import { said, type Clip } from "../anchors";
import { CMD_PAUSE, CPS, T0, schedule } from "../terminalSchedule";
import type { ActionsTimes } from "../../components/ActionsList";
import type { HistoryLine, TermEntry } from "../../components/Terminal";

const FPS = 30;
export const CLIPS = audio.clips as (Clip & { file: string; title: string })[];
const PAD = 0.8;
export const LEAD = [1, 2, 2, 2, 2, 2];
const at = (i: number, phrase: string, fallback: number) => LEAD[i] + said(CLIPS[i], phrase, fallback);
const TAIL = [0.5, 0.8, 1.0, 1.5, 0.8, 1.2];
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

// Scene 1: one match, three outcomes, and the SDK's reading order.
export const S1: Required<ActionsTimes> & { order: number; thenSteer: number; observeLog: number; error: number; callout: number } = {
  observe: at(0, "Observe records the match", 0.15),
  deny: at(0, "Deny stops it", 0.25),
  steer: at(0, "Steer stops it too", 0.3),
  order: at(0, "the SDK reads them in a fixed order", 0.55),
  denyWins: at(0, "A deny wins", 0.62),
  thenSteer: at(0, "Then steer", 0.68),
  observeLog: at(0, "Observe matches are only written down", 0.72),
  error: at(0, "And if any control failed", 0.82),
  callout: at(0, "That order is the whole policy", 0.92),
};

// Scene 2: one tool, three controls.
export const S2 = {
  tool: at(1, "has one tool", 0.05),
  first: at(1, "The first is observe", 0.15),
  firstCond: at(1, "A list evaluator on the recipient name", 0.2),
  second: at(1, "The second is deny", 0.35),
  secondCond: at(1, "A list of sanctioned countries", 0.4),
  third: at(1, "The third is steer", 0.48),
  thirdCond: at(1, "A JSON schema that allows", 0.52),
  context: at(1, "the action carries a steering context", 0.66),
  code: at(1, "Notice what the agent's code contains", 0.8),
  none: at(1, "No threshold", 0.86),
  server: at(1, "All of that lives on the server", 0.94),
};
export const CONTROLS = [
  {
    title: "kam7f-audit-new-recipient",
    scope: "tool process_wire_transfer · pre",
    condition: ["input.recipient_name", 'list · not in ["Jane Smith", "Payroll Inc"]', "match_on: no_match"],
    action: "observe",
    at: S2.first,
    condAt: S2.firstCond,
  },
  {
    title: "kam7f-deny-sanctioned-countries",
    scope: "tool process_wire_transfer · pre",
    condition: ["input.destination_country", 'list · in ["North Korea", "Iran", "Syria", "Cuba"]', "match_on: match"],
    action: "deny",
    at: S2.second,
    condAt: S2.secondCond,
  },
  {
    title: "kam7f-steer-large-transfer-2fa",
    scope: "tool process_wire_transfer · pre",
    condition: ["input", "json schema, oneOf:", "  amount < 10000", "  amount >= 10000 and verified_2fa: true"],
    action: "steer",
    at: S2.third,
    condAt: S2.thirdCond,
    extra: ['steering_context.message:', '  {"required_actions": ["verify_2fa"],', '   "retry_flags": {"verified_2fa": true},', '   "reason": "Transfers of $10,000 or more ..."}'],
    extraAt: S2.context,
  },
];
export const CODE_TOOL = [
  "async def _process_wire_transfer(",
  "    amount: float, destination_country: str, recipient_name: str, verified_2fa: bool = False,",
  ") -> dict:",
  '    return {"status": "completed", "amount": amount, "recipient": recipient_name, ...}',
  "",
  '_process_wire_transfer.tool_name = "process_wire_transfer"',
  'process_wire_transfer = control(step_name="process_wire_transfer")(_process_wire_transfer)',
];

// Scene 3: observe, then deny, on the captured run.
export const S3 = {
  t1: at(2, "Five hundred dollars", 0.05),
  obsMatched: at(2, "The observe control matched", 0.15),
  completed: at(2, "Completed nothing else", 0.28),
  recorded: at(2, "The match is recorded on the server", 0.35),
  t2: at(2, "Five thousand dollars", 0.55),
  denied: at(2, "Denied", 0.62),
  neverRan: at(2, "The tool never ran", 0.66),
  reason: at(2, "the reason printed", 0.72),
  obsAgain: at(2, "The observe control matched here too", 0.85),
  wins: at(2, "but deny wins", 0.92),
};
const BANK_CMD = "python banking_agent.py";
export const S3_mount = S3.t1 - T0 - 0.2 - BANK_CMD.length / CPS - CMD_PAUSE - 0.4;
const T1_LINES = [
  { text: "--- transfer: $500.00 to Carlos Rivera in United States", at: S3.t1 },
  { text: "  COMPLETED: {'status': 'completed', 'amount': 500.0,", at: S3.completed },
  { text: "    'recipient': 'Carlos Rivera', 'destination': 'United States'}" },
];
const T2_LINES = [
  { text: "--- transfer: $5,000.00 to Unknown in North Korea", at: S3.t2 },
  { text: "  DENIED by control: kam7f-deny-sanctioned-countries", at: S3.denied },
  { text: "    reason: Control triggered. Logic: any, MatchOn: match. Matched: North Korea", at: S3.reason },
];
export const transfers12: TermEntry[] = schedule(S3_mount, [
  { command: BANK_CMD, lines: [{ text: "" }, ...T1_LINES, { text: "" }, ...T2_LINES] },
]);
export const observeCard = {
  title: "kam7f-audit-new-recipient",
  meta: "observe · tool process_wire_transfer · pre",
  operator: "",
  branches: [{ label: "input.recipient_name", detail: "not on the known list" }],
  firedText: "matched, recorded, request untouched",
};
export const denyCard = {
  title: "kam7f-deny-sanctioned-countries",
  meta: "deny · tool process_wire_transfer · pre",
  operator: "",
  branches: [{ label: "input.destination_country", detail: "in the sanctioned list" }],
  firedText: "matched, deny, the tool never runs",
};

// Scene 4: steer, the loop. The terminal continues from scene 3's output.
export const S4 = {
  t3: at(3, "Fifteen thousand dollars", 0.03),
  fires: at(3, "the steer control fires", 0.1),
  raises: at(3, "the SDK raises a steer error", 0.14),
  parses: at(3, "It parses the message", 0.24),
  required: at(3, "sees the required action", 0.28),
  collects: at(3, "collects the code", 0.34),
  flags: at(3, "applies the retry flags", 0.38),
  again: at(3, "calls the tool again", 0.44),
  every: at(3, "The retry goes through every control", 0.48),
  satisfied: at(3, "The schema is satisfied now", 0.55),
  completes: at(3, "the transfer completes", 0.6),
  oneString: at(3, "one string", 0.7),
  convention: at(3, "is a convention", 0.8),
  caps: at(3, "the agent caps its retries", 0.9),
  forever: at(3, "must not loop forever", 0.96),
};
export const history34: HistoryLine[] = [
  { kind: "cmd", text: BANK_CMD },
  { kind: "out", text: "" },
  ...T1_LINES.map((l) => ({ kind: "out" as const, text: l.text })),
  { kind: "out", text: "" },
  ...T2_LINES.map((l) => ({ kind: "out" as const, text: l.text })),
];
export const transfer3: TermEntry[] = schedule(0, [
  {
    lines: [
      { text: "" },
      { text: "--- transfer: $15,000.00 to Jane Smith in United Kingdom", at: S4.t3 },
      { text: "  STEERED by control: kam7f-steer-large-transfer-2fa (attempt 1)", at: S4.fires },
      { text: "    reason: Transfers of $10,000 or more require identity verification via 2FA", at: S4.raises },
      { text: "    required actions: ['verify_2fa']", at: S4.required },
      { text: "    enter your 6-digit 2FA code (or 'cancel'): 123456", at: S4.collects },
      { text: "    2FA verified, retrying with corrected request...", at: S4.again },
      { text: "  COMPLETED: {'status': 'completed', 'amount': 15000.0,", at: S4.completes },
      { text: "    'recipient': 'Jane Smith', 'destination': 'United Kingdom'}" },
    ],
  },
]);
export const CODE_HANDLER = [
  "for attempt in range(1, MAX_RETRIES + 1):",
  "    try:",
  "        result = await process_wire_transfer(**kwargs)",
  "        return",
  "    except ControlSteerError as exc:",
  "        ctx = parse_steering_context(exc.steering_context)",
  '        actions = ctx.get("required_actions", [])',
  '        if "verify_2fa" in actions:',
  "            if not collect_2fa():",
  "                return",
  '            kwargs.update(ctx.get("retry_flags", {}))',
  '            # loop: the corrected request is evaluated again',
];

// Scene 5: steer inside a framework. Code from the installed SDK integrations,
// the docs LangChain page, and examples/steer_action_demo in the Agent Control repo.
export const S5 = {
  handled: at(4, "the loop is handled for you", 0.05),
  adk: at(4, "The Google agent development kit", 0.1),
  inject: at(4, "injects the guidance", 0.18),
  prefixed: at(4, "prefixed Agent Control guidance", 0.24),
  tool: at(4, "On a tool step", 0.32),
  strands: at(4, "The AWS Strands handler", 0.42),
  guide: at(4, "a guide action", 0.48),
  langchain: at(4, "LangChain and LangGraph have no plugin", 0.55),
  helper: at(4, "The decorator goes on a helper", 0.62),
  returns: at(4, "returns a message as its result", 0.68),
  nextTurn: at(4, "on the next turn", 0.72),
  graph: at(4, "is a LangGraph graph", 0.76),
  catches: at(4, "Its node catches the steer", 0.8),
  state: at(4, "writes the flag into the graph state", 0.86),
  edge: at(4, "a conditional edge routes back", 0.9),
  same: at(4, "Same server same control", 0.95),
};
export const CODE_ADK = [
  "# model step, pre stage",
  'instruction += "\\n\\nAgent Control guidance: " + exc.steering_context',
  "# tool step",
  "return build_blocked_tool_response(exc.steering_context)",
];
export const CODE_STRANDS = [
  "async def steer_after_model(...):",
  "    result = await evaluate_controls(...)",
  "    if steer_match:",
  "        return Guide(reason=steering_message)",
  "    return Proceed()",
];
export const CODE_LANGCHAIN = [
  "@control()",
  "async def _execute_query_with_validation(query: str):",
  "    return query_tool.invoke(query)",
  "",
  '@tool("sql_db_query")',
  "async def safe_query_tool(query: str):",
  "    try:",
  "        return await _execute_query_with_validation(query=query)",
  "    except ControlViolationError as exc:",
  '        return f"Query blocked: {exc.message}"',
];
export const CODE_LANGGRAPH = [
  "async def process_transfer_node(state):",
  "    try:",
  "        ... await process_wire_transfer(...)",
  "    except ControlSteerError as e:",
  "        steering_data = parse_steering_context(e.steering_context)",
  "        ... collect the 2FA code ...",
  '        return {**state, "verified_2fa": True, "status": "processing"}',
  "",
  'workflow.add_conditional_edges("process", route_next,',
  '    {"process": "process", "end": END})',
];

// Scene 6: close.
export const S6 = {
  lines: [at(5, "Observe to watch", 0.05), at(5, "Deny to stop", 0.12), at(5, "Steer to correct", 0.18)],
  habit: at(5, "Ship a new control as observe first", 0.35),
  read: at(5, "read what it would have done", 0.48),
  flip: at(5, "then flip it to deny or steer", 0.58),
  server: at(5, "The definition changes on the server", 0.7),
  next: at(5, "Next writing an evaluator", 0.9),
};
