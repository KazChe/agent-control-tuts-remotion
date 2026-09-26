import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A heading pinned to the top of a diagram scene: which part of the anatomy
// this is, what the picture shows, and one line of intent.
export const SceneHeading: React.FC<{ eyebrow: string; title: string; intent: string; appearAt?: number }> = ({
  eyebrow,
  title,
  intent,
  appearAt = 0.2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - appearAt * fps, fps, config: { damping: 200 }, durationInFrames: 24 });
  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: theme.fontSans,
        opacity: s,
        transform: `translateY(${(1 - s) * 16}px)`,
      }}
    >
      <div style={{ fontFamily: theme.fontMono, fontSize: 22, letterSpacing: 5, color: theme.cyan }}>{eyebrow}</div>
      <div style={{ fontSize: 46, fontWeight: 800, color: theme.text, marginTop: 10 }}>{title}</div>
      <div style={{ fontSize: 26, color: theme.dim, marginTop: 8 }}>{intent}</div>
    </div>
  );
};
