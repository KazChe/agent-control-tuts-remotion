import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BEATS,
  BOT_NAME,
  BOT_TAGLINE,
  INJECT_JUDGE_AT,
  RETRY_JUDGE_AT,
  ROW,
  STEER_JUDGE_AT,
  demoEntry,
  injectChat,
  injectScroll,
  retryChat,
  steerChat,
} from "./data";
import { Callout, CtaCard, TitleCard } from "../../components/Cards";
import { ChatPanel } from "../../components/ChatPanel";
import { JudgmentCard, judgmentTimeline } from "../../components/JudgmentCard";
import { Terminal } from "../../components/Terminal";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);

const CHAT = { width: 1060, height: 900, left: 70 };
const CARD = { left: 1180, top: 90, width: 670 };

// Companion to the post "A typed judgment where the plane only had a score".
// One steer round trip, its confirmed retry, and a planted instruction, with
// every answer taken from a live tg-demo run against a local Agent Control
// server. See data.ts for what is captured and what is scripted.
export const ToolGateTeaser: React.FC = () => {
  const steerTl = judgmentTimeline(STEER_JUDGE_AT);
  const retryTl = judgmentTimeline(RETRY_JUDGE_AT);
  const injectTl = judgmentTimeline(INJECT_JUDGE_AT);
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={BEATS.title.from} durationInFrames={BEATS.title.duration}>
        <TitleCard
          eyebrow="Agent Control + Jev"
          title="Not yet, ask this"
          subtitle="A tool-call gate that can say confirm first, and knows when you did"
        />
      </Sequence>

      <Sequence from={BEATS.steer.from} durationInFrames={BEATS.steer.duration}>
        <ChatPanel botName={BOT_NAME} botTagline={BOT_TAGLINE} messages={steerChat} {...CHAT} />
        <JudgmentCard
          judgment={ROW["dw-01"].answers}
          fired={ROW["dw-01"].fired}
          action={ROW["dw-01"].action}
          matched={ROW["dw-01"].plane.matched.join(", ")}
          message={ROW["dw-01"].message}
          latencyMs={ROW["dw-01"].latency_ms}
          appearAt={STEER_JUDGE_AT}
          {...CARD}
        />
        <Callout
          appearAt={f(2.6)}
          hideAt={f(steerTl.rows[0] + 1.2)}
          text="Before the tool runs, Agent Control asks the evaluator. Here that is one Jev call."
        />
        <Callout
          appearAt={f(steerTl.action + 0.2)}
          hideAt={f(steerTl.done + 1.4)}
          text="Two rules fire. The policy writes the sentence, and the steer control hands it to the agent."
        />
        <Callout
          appearAt={f(steerTl.done + 3.2)}
          hideAt={f(16.4)}
          text="The agent asks. To go further it has to come back with the same call."
        />
      </Sequence>

      <Sequence from={BEATS.retry.from} durationInFrames={BEATS.retry.duration}>
        <ChatPanel botName={BOT_NAME} botTagline={BOT_TAGLINE} messages={retryChat} {...CHAT} />
        <JudgmentCard
          judgment={ROW["dw-02"].answers}
          fired={ROW["dw-02"].fired}
          action={ROW["dw-02"].action}
          matched={ROW["dw-02"].plane.matched.join(", ")}
          message={ROW["dw-02"].message}
          latencyMs={ROW["dw-02"].latency_ms}
          appearAt={RETRY_JUDGE_AT}
          {...CARD}
        />
        <Callout
          appearAt={f(retryTl.rows[2] + 0.9)}
          hideAt={f(retryTl.action - 0.1)}
          text="confirmed went from 0.02 to 0.98. The third question is the exit from the loop."
        />
        <Callout
          appearAt={f(retryTl.action + 0.3)}
          hideAt={f(13.9)}
          text="No rule fires. The observe control matches, the call runs, the answers go to the audit event."
        />
      </Sequence>

      <Sequence from={BEATS.inject.from} durationInFrames={BEATS.inject.duration}>
        <ChatPanel
          botName={BOT_NAME}
          botTagline={BOT_TAGLINE}
          messages={injectChat}
          scroll={injectScroll}
          {...CHAT}
        />
        <JudgmentCard
          judgment={ROW["cs-08"].answers}
          fired={ROW["cs-08"].fired}
          action={ROW["cs-08"].action}
          matched={ROW["cs-08"].plane.matched.join(", ")}
          message={ROW["cs-08"].message}
          latencyMs={ROW["cs-08"].latency_ms}
          appearAt={INJECT_JUDGE_AT}
          {...CARD}
        />
        <Callout
          appearAt={f(4.0)}
          hideAt={f(7.0)}
          text="The instruction arrived inside a tool result. The customer only asked for status."
        />
        <Callout
          appearAt={f(injectTl.action + 0.2)}
          hideAt={f(injectTl.done + 1.4)}
          text="Third-party instruction 0.96. Denied, and the agent is told what it found."
        />
      </Sequence>

      <Sequence from={BEATS.terminal.from} durationInFrames={BEATS.terminal.duration}>
        <Terminal entries={[demoEntry]} title="tool-gate - zsh" fontSize={22} />
        <Callout
          appearAt={f(9.5)}
          hideAt={f(14.6)}
          text="The same three rows through a live Agent Control server. One control matched per call."
        />
      </Sequence>

      <Sequence from={BEATS.results.from} durationInFrames={BEATS.results.duration}>
        <CtaCard
          headline="32, 32, 33 of 40"
          sub="Forty labeled conversations, three runs, every deny row denied, 112 ms per call, $0.07 per thousand calls. About a cent in total."
          action="untounium.dev · A typed judgment where the plane only had a score"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
