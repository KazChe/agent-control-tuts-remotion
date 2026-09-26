import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  AGENT_CODE,
  BEATS,
  BOT_NAME,
  BOT_TAGLINE,
  CLIPS,
  CONTROL_BRANCHES,
  CONTROL_NAME,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  leakChat,
  runBlocked,
  runLeak,
  LEAD,
} from "./data";
import { Callout } from "../../components/Cards";
import { ChatPanel } from "../../components/ChatPanel";
import { CodeCard } from "../../components/CodeCard";
import { ConditionCard } from "../../components/ConditionCard";
import { PlaneDiagram } from "../../components/PlaneDiagram";
import { Terminal } from "../../components/Terminal";
import { theme } from "../../theme";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (sec: number) =>
    spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 24 });
  const lines = [
    ["Authored", "outside the agent."],
    ["Enforced", "inside the request."],
    ["Proven", "in the trace afterwards."],
  ];
  return (
    <AbsoluteFill
      style={{
        background: theme.pageBg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontSans,
        color: theme.text,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {lines.map(([a, b], i) => {
          const s = at(S6.lines[i]);
          return (
            <div key={a} style={{ fontSize: 54, opacity: s, transform: `translateX(${(1 - s) * 40}px)` }}>
              <span style={{ color: theme.cyan, fontWeight: 800 }}>{a}</span> {b}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 90, textAlign: "center", opacity: at(S6.title) }}>
        <div style={{ fontSize: 84, fontWeight: 800 }}>Agent Control</div>
        <div style={{ fontSize: 34, color: theme.dim, marginTop: 10 }}>
          an open-source control plane for AI agents
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          fontFamily: theme.fontMono,
          fontSize: 26,
          color: theme.dim,
          opacity: at(S6.next),
        }}
      >
        next: the anatomy of a control
      </div>
    </AbsoluteFill>
  );
};

// Episode 1 of the Agent Control series: why a control plane. Six scenes,
// each as long as its narration clip, every beat anchored to a spoken phrase.
export const Ep01WhyControlPlane: React.FC = () => {
  const [s1, s2, s3, s4, s5, s6] = BEATS.scenes;
  const clip = (i: number) => (
    <Sequence from={f(LEAD[i])} durationInFrames={f(CLIPS[i].seconds + 0.5)}>
      <Audio src={staticFile(CLIPS[i].file)} />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={s1.from} durationInFrames={s1.duration}>
        {clip(0)}
        <ChatPanel botName={BOT_NAME} botTagline={BOT_TAGLINE} messages={leakChat} />
        <Callout appearAt={f(S1.callout)} text="Nothing was there to stop it." />
      </Sequence>

      <Sequence from={s2.from} durationInFrames={s2.duration}>
        {clip(1)}
        <PlaneDiagram phase="agents" durationSeconds={s2.seconds} times={S2} />
        <Callout appearAt={f(S2.callout)} text="One rule. Three codebases. Three deploys." />
      </Sequence>

      <Sequence from={s3.from} durationInFrames={s3.duration}>
        {clip(2)}
        <PlaneDiagram phase="lift" durationSeconds={s3.seconds} times={S3} />
        <Callout
          appearAt={f(S3.callout)}
          text="Written once, as configuration. Changing it is an edit, not a release."
        />
      </Sequence>

      <Sequence from={s4.from} durationInFrames={s4.duration}>
        {clip(3)}
        <PlaneDiagram phase="planes" durationSeconds={s4.seconds} times={S4} />
        <Callout
          appearAt={f(S4.callout)}
          text="The control plane decides before the work and records after it."
        />
      </Sequence>

      <Sequence from={s5.from} durationInFrames={s5.duration}>
        {clip(4)}
        <Terminal
          entries={[runLeak, runBlocked]}
          title="support-agent - zsh"
          fontSize={23}
          width={1180}
          left={70}
        />
        <ConditionCard
          title={CONTROL_NAME}
          meta="post stage · deny · added in the console"
          operator=""
          branches={CONTROL_BRANCHES}
          appearAt={f(S5.controlCard)}
          checkpoints={[{ at: f(S5.blocked), states: ["hit"], fired: true }]}
          firedText="matched, deny fires"
          right={60}
          width={600}
        />
        <CodeCard
          title="support_agent.py"
          lines={AGENT_CODE}
          appearAt={f(0.6)}
          badge={{ text: "unchanged between runs", at: f(S5.neverMoved) }}
          top={420}
          right={40}
          width={640}
        />
        <Callout
          appearAt={f(S5.pieceOne)}
          hideAt={f(S5.leakRun - 0.4)}
          text="Piece one, in the agent. One decorator, asked before and after every call."
        />
        <Callout
          appearAt={f(S5.controlCard + 0.4)}
          hideAt={f(S5.blockedRun - 0.6)}
          text="Piece two, on the server. Which step, which stage, what to check, what to do."
        />
        <Callout appearAt={f(S5.neverMoved + 0.6)} text="Same agent, same code, between the two runs." />
      </Sequence>

      <Sequence from={s6.from} durationInFrames={s6.duration}>
        {clip(5)}
        <Closing />
      </Sequence>
    </AbsoluteFill>
  );
};
