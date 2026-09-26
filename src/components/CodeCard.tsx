import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A pinned code snippet with an optional badge, for "the code never changed".
export const CodeCard: React.FC<{
  title: string;
  lines: string[];
  badge?: { text: string; at: number; color?: string };
  appearAt?: number;
  top?: number;
  right?: number;
  width?: number;
}> = ({ title, lines, badge, appearAt = 0, top = 420, right = 130, width = 660 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame: frame - appearAt, fps, config: { damping: 200 }, durationInFrames: 24 });
  const badgeS = badge
    ? spring({ frame: frame - badge.at, fps, config: { damping: 200 }, durationInFrames: 18 })
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        width,
        opacity: inS,
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
      {lines.map((l, i) => (
        <div key={i} style={{ color: theme.text, fontSize: 19, lineHeight: "30px", whiteSpace: "pre" }}>
          {l}
        </div>
      ))}
    </div>
  );
};
