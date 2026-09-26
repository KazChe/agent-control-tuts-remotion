import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A Step object drawn as JSON, one line per field, each line appearing at its
// own time and optionally highlighted. Used for "what a control can see".
export type StepLine = { text: string; at?: number; highlight?: "on" | "off" | "missing" };

export const StepCard: React.FC<{
  title: string;
  lines: StepLine[];
  left: number;
  top: number;
  width: number;
  appearAt?: number;
  fontSize?: number;
}> = ({ title, lines, left, top, width, appearAt = 0, fontSize = 23 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = (sec: number | undefined) =>
    sec === undefined ? 1 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 18 });
  const inS = at(appearAt);
  const bg = (h?: StepLine["highlight"]) =>
    h === "on" ? `${theme.green}26` : h === "off" ? `${theme.red}26` : h === "missing" ? `${theme.red}14` : "transparent";
  const border = (h?: StepLine["highlight"]) =>
    h === "on" ? theme.green : h === "off" ? theme.red : h === "missing" ? theme.red : "transparent";
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        opacity: inS,
        transform: `translateY(${(1 - inS) * 16}px)`,
        background: "rgba(13,17,23,0.94)",
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: 16,
        padding: "18px 24px",
        fontFamily: theme.fontMono,
        boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ color: theme.dim, fontSize: 20, marginBottom: 10 }}>{title}</div>
      {lines.map((l, i) => {
        const a = at(l.at);
        const shown = l.at === undefined || t >= l.at;
        return (
          <div
            key={i}
            style={{
              color: l.highlight === "missing" ? theme.dim : theme.text,
              fontSize,
              lineHeight: `${Math.round(fontSize * 1.6)}px`,
              whiteSpace: "pre",
              opacity: shown ? a : 0,
              background: shown ? bg(l.highlight) : "transparent",
              borderLeft: `4px solid ${shown ? border(l.highlight) : "transparent"}`,
              paddingLeft: 10,
              marginLeft: -14,
              borderRadius: 4,
              textDecoration: l.highlight === "missing" ? "line-through" : "none",
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
};
