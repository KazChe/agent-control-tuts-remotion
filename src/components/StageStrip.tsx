import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A request passing through a step: pre check, the function, post check.
// Times are seconds into the scene, anchored to the narration.
export type StageStripTimes = {
  pre?: number; // "before the step runs"
  post?: number; // "or after"
  stageLabel?: number; // "called the stage"
  preDeny?: number; // "the function never runs"
  postDeny?: number; // "holds its output back"
  stepType?: number; // "The step type"
  stepName?: number; // "the step name"
  stage?: number; // "And the stage"
  blockedAtPost?: number; // "blocked at post"
};

export const StageStrip: React.FC<{ times?: StageStripTimes }> = ({ times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = (sec: number | undefined) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 20 });
  const on = (sec: number | undefined) => sec !== undefined && t >= sec;

  const preDeny = on(times.preDeny) && !on(times.postDeny);
  const postDeny = on(times.postDeny);
  const showPost = on(times.post);
  const showPre = on(times.pre);

  const Node: React.FC<{ label: string; sub?: string; color: string; lit: number; dead?: boolean; width?: number }> = ({
    label,
    sub,
    color,
    lit,
    dead,
    width = 300,
  }) => (
    <div
      style={{
        width,
        height: 150,
        borderRadius: 16,
        border: `2px solid ${lit > 0.01 ? color : theme.panelBorder}`,
        background: lit > 0.01 ? `${color}14` : "rgba(13,17,23,0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity: dead ? 0.35 : 1,
        fontFamily: theme.fontMono,
      }}
    >
      <div style={{ color: lit > 0.01 ? color : theme.text, fontSize: 30, fontWeight: 700 }}>{label}</div>
      {sub && <div style={{ color: theme.dim, fontSize: 20, marginTop: 6, fontFamily: theme.fontSans }}>{sub}</div>}
    </div>
  );
  const Arrow: React.FC<{ blocked?: boolean }> = ({ blocked }) => (
    <div style={{ width: 90, display: "flex", alignItems: "center", justifyContent: "center", color: blocked ? theme.red : theme.dim, fontSize: 44 }}>
      {blocked ? "✕" : "→"}
    </div>
  );

  const chips = [
    { key: "stepType", text: "step type · llm or tool", at: times.stepType },
    { key: "stepName", text: "step name · draft_customer_reply", at: times.stepName },
    { key: "stage", text: "stage · pre or post", at: times.stage },
  ];

  return (
    <AbsoluteFill style={{ background: theme.pageBg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Node label="request" color={theme.text} lit={0} width={220} />
        <Arrow />
        <Node label="pre" sub="before the step runs" color={preDeny || on(times.blockedAtPost) ? theme.cyan : theme.cyan} lit={showPre ? at(times.pre) : 0} />
        <Arrow blocked={preDeny} />
        <Node label="the step" sub="model call or tool call" color={theme.amber} lit={on(times.postDeny) ? 1 : 0} dead={preDeny} />
        <Arrow />
        <Node label="post" sub="after it ran" color={postDeny ? theme.red : theme.cyan} lit={showPost ? at(times.post) : 0} />
        <Arrow blocked={postDeny} />
        <Node label="result" color={theme.text} lit={0} width={220} dead={preDeny || postDeny} />
      </div>

      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontFamily: theme.fontMono, fontSize: 26, color: theme.cyan, opacity: at(times.stageLabel), letterSpacing: 3 }}>
        STAGE
      </div>

      <div style={{ position: "absolute", top: 700, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
        {chips.map((c) => (
          <div
            key={c.key}
            style={{
              fontFamily: theme.fontMono,
              fontSize: 24,
              color: theme.text,
              border: `1px solid ${theme.cyan}`,
              borderRadius: 999,
              padding: "12px 26px",
              opacity: at(c.at),
              transform: `translateY(${(1 - at(c.at)) * 16}px)`,
            }}
          >
            {c.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
