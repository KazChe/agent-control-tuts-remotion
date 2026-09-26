import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A pinned code snippet with an optional badge, for "the code never changed".
export const CodeCard: React.FC<{
  title: string;
  lines: string[];
  badge?: { text: string; at: number; color?: string };
  appearAt?: number;
  /** frame at which the card fades out */
  hideAt?: number;
  top?: number;
  right?: number;
  left?: number;
  width?: number;
  fontSize?: number;
  /** line index -> frame at which that line gets a highlight */
  highlights?: Record<number, { at: number; color?: string }>;
}> = ({ title, lines, badge, appearAt = 0, hideAt, top = 420, right = 130, left, width = 660, fontSize = 19, highlights = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame: frame - appearAt, fps, config: { damping: 200 }, durationInFrames: 24 });
  const out =
    hideAt === undefined
      ? 1
      : interpolate(frame, [hideAt - 12, hideAt], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeS = badge
    ? spring({ frame: frame - badge.at, fps, config: { damping: 200 }, durationInFrames: 18 })
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        right: left === undefined ? right : undefined,
        left,
        width,
        opacity: inS * out,
        transform: `translateY(${(1 - inS) * 24}px)`,
        background: "rgba(13, 17, 23, 0.94)",
        border: `2px solid ${theme.panelBorder}`,
        borderRadius: 14,
        padding: "18px 24px",
        fontFamily: theme.fontMono,
        boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div style={{ color: theme.dim, fontSize: 20 }}>{title}</div>
        <div style={{ flex: 1 }} />
        {badge && badgeS > 0.01 && (
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: badge.color ?? theme.green,
              border: `1px solid ${badge.color ?? theme.green}`,
              borderRadius: 999,
              padding: "4px 14px",
              opacity: badgeS,
            }}
          >
            {badge.text}
          </div>
        )}
      </div>
      {lines.map((l, i) => {
        const h = highlights[i];
        const hs = h ? spring({ frame: frame - h.at, fps, config: { damping: 200 }, durationInFrames: 16 }) : 0;
        const color = h?.color ?? theme.cyan;
        return (
          <div
            key={i}
            style={{
              color: theme.text,
              fontSize,
              lineHeight: `${Math.round(fontSize * 1.58)}px`,
              whiteSpace: "pre",
              background: hs > 0.01 ? `${color}22` : "transparent",
              borderLeft: `4px solid ${hs > 0.01 ? color : "transparent"}`,
              paddingLeft: 10,
              marginLeft: -14,
              borderRadius: 4,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};
