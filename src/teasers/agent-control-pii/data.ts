import type { ChatMessage } from "../../components/ChatPanel";
import { theme } from "../../theme";

export const BOT_NAME = "Aurora Bank · Support Assistant";
export const BOT_TAGLINE = "AI assistant · answers in seconds";

const USER_ASK =
  "Hi! Can you send my account details over to my accountant? Her email is dana@acmeledger.com";

// Beat 1a: the leak. The assistant happily forwards PII.
export const leakChat: ChatMessage[] = [
  { role: "user", text: USER_ASK, at: 1.2 },
  {
    role: "assistant",
    at: 4.4,
    typingFrom: 2.2,
    text: "Done! I have emailed your full account details, including account ACCT-482913, to dana@acmeledger.com. Anything else?",
    highlight: { text: "ACCT-482913", at: 8.2 },
  },
];

// Beat 1c: same ask, control steers the agent to a safe alternative.
export const steeredChat: ChatMessage[] = [
  { role: "user", text: USER_ASK, at: 1.0 },
  {
    role: "assistant",
    at: 4.6,
    typingFrom: 2.0,
    text: "I can't share account identifiers over chat or email. I have sent a secure verification link to the email on your file so you can share access safely.",
    badge: { label: "Agent Control · steer", color: theme.amber, at: 9.6 },
  },
];

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);

export const BEATS = {
  fps: FPS,
  leak: { from: 0, duration: sec(20) },
  traceLeak: { from: sec(20), duration: sec(9) },
  createControl: { from: sec(29), duration: sec(15) },
  steered: { from: sec(44), duration: sec(15) },
  traceReceipt: { from: sec(59), duration: sec(10) },
  cta: { from: sec(69), duration: sec(9) },
  total: sec(78),
};
