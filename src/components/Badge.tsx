import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A pill of monospace text pinned at a position, appearing at a second and
// optionally fading out at another. Times are seconds into the scene.
export const Badge: React.FC<{
  text: string;
  color: string;
  at: number;
  left: number;
  top: number;
  hideAt?: number;
  fontSize?: number;
}> = ({ text, color, at, left, top, hideAt, fontSize = 21 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at * fps, fps, config: { damping: 200 }, durationInFrames: 18 });
  const out =
    hideAt === undefined
      ? 1
      : interpolate(frame, [(hideAt - 0.4) * fps, hideAt * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        fontFamily: theme.fontMono,
        fontSize,
        color,
        border: `1px solid ${color}`,
        background: "rgba(13,17,23,0.95)",
        borderRadius: 999,
        padding: "6px 16px",
        opacity: s * out,
        transform: `translateY(${(1 - s) * 10}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
