import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type Judgment = {
  authorized: number;
  third_party_instruction: number;
  confirmed: number;
  reversibility_score: number;
  decision: string;
  decision_confidence: number;
};

export type GateAction = "observe" | "steer" | "deny";

export const ACTION_COLOR: Record<GateAction, string> = {
  observe: theme.green,
  steer: theme.amber,
  deny: theme.red,
};

const REVERSIBILITY_LEVELS = [
  "reads information, nothing changes",
  "the customer can undo it",
  "support can reverse it",
  "nobody can undo it",
];

// When each part of the card lands, in seconds after appearAt. Exported so a
// scene can time its chat bubbles and callouts to the card.
export const judgmentTimeline = (appearAt: number) => ({
  card: appearAt,
  rows: [0, 1, 2, 3].map((i) => appearAt + 0.5 + i * 0.45),
  decision: appearAt + 2.7,
  fired: appearAt + 3.3,
  action: appearAt + 3.9,
  message: appearAt + 4.5,
  done: appearAt + 5.2,
});

const Row: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  at: number;
  t: number;
  detail?: string;
}> = ({ label, value, max, color, at, t, detail }) => {
  const p = interpolate(t - at, [0, 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shown = value * p;
  const text = max === 1 ? shown.toFixed(2) : shown.toFixed(1);
  const visible = t >= at;
  return (
    <div style={{ opacity: visible ? 1 : 0.25, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 210, color: theme.cyan, fontSize: 22 }}>{label}</div>
        <div
          style={{
            flex: 1,
            height: 16,
            borderRadius: 8,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(shown / max) * 100}%`,
              height: "100%",
              background: color,
              borderRadius: 8,
            }}
          />
        </div>
        <div
          style={{
            width: 72,
            textAlign: "right",
            color: theme.text,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {visible ? text : ""}
        </div>
      </div>
      {detail && visible && p >= 1 && (
        <div style={{ color: theme.dim, fontSize: 19, marginTop: 4, marginLeft: 226 }}>
          {detail}
        </div>
      )}
    </div>
  );
};

// A pinned card showing one Jev judgment: the five answers filling in, the
// rules that fired, the action the policy chose, and the sentence written
// for the agent. Values come straight from the demo artifact.
export const JudgmentCard: React.FC<{
  judgment: Judgment;
  fired: string[];
  action: GateAction;
  matched: string;
  message: string;
  latencyMs: number;
  appearAt: number;
  hideAt?: number;
  left?: number;
  top?: number;
  width?: number;
}> = ({
  judgment,
  fired,
  action,
  matched,
  message,
  latencyMs,
  appearAt,
  hideAt,
  left = 1200,
  top = 100,
  width = 660,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tl = judgmentTimeline(appearAt);

  const inS = spring({
    frame: frame - appearAt * fps,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const out =
    hideAt === undefined
      ? 1
      : interpolate(t, [hideAt - 0.4, hideAt], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const pop = (at: number) =>
    spring({
      frame: frame - at * fps,
      fps,
      config: { damping: 200 },
      durationInFrames: 18,
    });

  const color = ACTION_COLOR[action];
  const showAction = t >= tl.action;
  const level = REVERSIBILITY_LEVELS[Math.min(3, Math.round(judgment.reversibility_score))];

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        opacity: inS * out,
        transform: `translateY(${(1 - inS) * 24}px)`,
        background: "rgba(13, 17, 23, 0.94)",
        border: `2px solid ${showAction ? color : theme.panelBorder}`,
        borderRadius: 14,
        padding: "22px 28px",
        fontFamily: theme.fontMono,
        boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ color: theme.text, fontSize: 24, fontWeight: 700 }}>
        Jev, one call
      </div>
      <div style={{ color: theme.dim, fontSize: 19, marginBottom: 18 }}>
        {t >= tl.rows[0] ? `jev-1.13.0 · ${latencyMs} ms · five answers` : "asking..."}
      </div>

      <Row label="authorized" value={judgment.authorized} max={1} color={theme.accent} at={tl.rows[0]} t={t} />
      <Row label="third-party" value={judgment.third_party_instruction} max={1} color={theme.red} at={tl.rows[1]} t={t} />
      <Row label="confirmed" value={judgment.confirmed} max={1} color={theme.green} at={tl.rows[2]} t={t} />
      <Row
        label="reversibility"
        value={judgment.reversibility_score}
        max={3}
        color={theme.amber}
        at={tl.rows[3]}
        t={t}
        detail={level}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6 }}>
        <div style={{ width: 210, color: theme.cyan, fontSize: 22 }}>decision</div>
        <div style={{ display: "flex", gap: 10, opacity: pop(tl.decision) }}>
          {(["proceed", "confirm", "refuse"] as const).map((d) => {
            const chosen = d === judgment.decision;
            const c = d === "proceed" ? theme.green : d === "confirm" ? theme.amber : theme.red;
            return (
              <div
                key={d}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: `1px solid ${chosen ? c : theme.panelBorder}`,
                  background: chosen ? `${c}33` : "transparent",
                  color: chosen ? c : theme.dim,
                  fontSize: 20,
                  fontWeight: chosen ? 700 : 400,
                }}
              >
                {d}
                {chosen ? ` ${judgment.decision_confidence.toFixed(2)}` : ""}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${theme.panelBorder}`,
          opacity: pop(tl.fired),
        }}
      >
        <div style={{ color: theme.dim, fontSize: 19 }}>policy rules fired</div>
        <div style={{ color: theme.text, fontSize: 21, marginTop: 4 }}>
          {fired.length === 0 ? "none" : fired.join(", ")}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          opacity: pop(tl.action),
        }}
      >
        <div style={{ color, fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>
          {action.toUpperCase()}
        </div>
        <div style={{ color: theme.dim, fontSize: 19 }}>
          Agent Control matched {matched}
        </div>
      </div>

      {action !== "observe" && (
        <div
          style={{
            marginTop: 14,
            padding: "14px 16px",
            borderRadius: 10,
            background: `${color}1a`,
            borderLeft: `6px solid ${color}`,
            color: theme.text,
            fontFamily: theme.fontSans,
            fontSize: 21,
            lineHeight: "30px",
            opacity: pop(tl.message),
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};
