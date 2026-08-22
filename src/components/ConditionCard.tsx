import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type BranchState = "idle" | "hit" | "miss";

export type ConditionBranch = {
  label: string;
  detail: string;
};

type Checkpoint = {
  at: number;
  states: BranchState[];
  /** True when the composite condition fired and the action ran. */
  fired?: boolean;
};

const glyph: Record<BranchState, { char: string; color: string }> = {
  idle: { char: "·", color: "#4a5568" },
  hit: { char: "✓", color: "#3fb950" },
  miss: { char: "✗", color: "#8b949e" },
};

// A pinned card showing a composite condition's branches, with per-branch
// match marks driven by frame checkpoints. Lets the viewer see WHY a
// probe passed or tripped while the terminal scrolls underneath.
export const ConditionCard: React.FC<{
  title: string;
  meta: string;
  operator: string;
  branches: ConditionBranch[];
  appearAt: number;
  hideAt?: number;
  checkpoints: Checkpoint[];
  /** Footer + border when a checkpoint has fired: true. */
  firedText: string;
  firedColor?: string;
}> = ({
  title,
  meta,
  operator,
  branches,
  appearAt,
  hideAt,
  checkpoints,
  firedText,
  firedColor = theme.red,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inS = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const out =
    hideAt === undefined
      ? 1
      : interpolate(frame, [hideAt - 12, hideAt], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const active = [...checkpoints].reverse().find((c) => frame >= c.at);
  const states = active?.states ?? branches.map(() => "idle" as BranchState);
  const fired = active?.fired ?? false;

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        right: 130,
        width: 660,
        opacity: inS * out,
        transform: `translateY(${(1 - inS) * 24}px)`,
        background: "rgba(13, 17, 23, 0.94)",
        border: `2px solid ${fired ? firedColor : theme.panelBorder}`,
        borderRadius: 14,
        padding: "22px 28px",
        fontFamily: theme.fontMono,
        boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          color: theme.text,
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ color: theme.dim, fontSize: 20, marginBottom: 18 }}>
        {meta}
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        <div
          style={{
            color: theme.amber,
            fontSize: 24,
            fontWeight: 700,
            paddingTop: 4,
          }}
        >
          {operator}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {branches.map((b, i) => {
            const g = glyph[states[i]];
            return (
              <div key={b.label} style={{ display: "flex", gap: 12 }}>
                <span
                  style={{
                    color: g.color,
                    fontSize: 24,
                    fontWeight: 700,
                    width: 26,
                  }}
                >
                  {g.char}
                </span>
                <span style={{ fontSize: 21, lineHeight: "30px" }}>
                  <span style={{ color: theme.cyan }}>{b.label}</span>
                  <span style={{ color: theme.text }}> {b.detail}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {fired && (
        <div
          style={{
            marginTop: 16,
            color: firedColor,
            fontSize: 21,
            fontWeight: 700,
          }}
        >
          {firedText}
        </div>
      )}
    </div>
  );
};
