import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// One control drawn as three regions, scope, condition, action, each with a
// side label that appears at its own time. Times are seconds into the scene.
export type ControlCardTimes = { scope?: number; condition?: number; action?: number };

const REGIONS = [
  {
    key: "scope" as const,
    label: "SCOPE",
    question: "when do we check",
    color: theme.cyan,
    lines: ['"scope": {', '  "step_types": ["llm"],', '  "step_names": ["draft_customer_reply"],', '  "stages": ["post"]', "},"],
  },
  {
    key: "condition" as const,
    label: "CONDITION",
    question: "what do we check, and how",
    color: theme.purple,
    lines: ['"condition": {', '  "selector": {"path": "output"},', '  "evaluator": {', '    "name": "regex",', '    "config": {"pattern": "\\b\\d{3}-\\d{2}-\\d{4}\\b"}', "  }", "},"],
  },
  {
    key: "action" as const,
    label: "ACTION",
    question: "what do we do on a match",
    color: theme.red,
    lines: ['"action": {"decision": "deny"}'],
  },
];

export const ControlCard: React.FC<{ name: string; times?: ControlCardTimes; appearAt?: number }> = ({
  name,
  times = {},
  appearAt = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (sec: number | undefined) =>
    sec === undefined
      ? 0
      : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 22 });
  const inS = at(appearAt);
  return (
    <AbsoluteFill
      style={{ background: theme.pageBg, justifyContent: "center", alignItems: "center", fontFamily: theme.fontMono }}
    >
      <div
        style={{
          width: 1500,
          opacity: inS,
          transform: `translateY(${(1 - inS) * 20}px)`,
          background: "rgba(13,17,23,0.94)",
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 18,
          padding: "28px 36px",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ color: theme.dim, fontSize: 24, marginBottom: 18 }}>
          control <span style={{ color: theme.text, fontWeight: 700 }}>{name}</span>
        </div>
        {REGIONS.map((r) => {
          const s = at(times[r.key]);
          return (
            <div key={r.key} style={{ display: "flex", gap: 28, alignItems: "stretch", marginBottom: 14 }}>
              <div
                style={{
                  flex: 1,
                  borderLeft: `6px solid ${s > 0.01 ? r.color : theme.panelBorder}`,
                  background: s > 0.01 ? `${r.color}12` : "transparent",
                  borderRadius: 10,
                  padding: "14px 22px",
                }}
              >
                {r.lines.map((l, i) => (
                  <div key={i} style={{ color: theme.text, fontSize: 25, lineHeight: "38px", whiteSpace: "pre" }}>
                    {l}
                  </div>
                ))}
              </div>
              <div style={{ width: 420, display: "flex", flexDirection: "column", justifyContent: "center", opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
                <div style={{ color: r.color, fontSize: 30, fontWeight: 800, letterSpacing: 3 }}>{r.label}</div>
                <div style={{ color: theme.dim, fontSize: 24, fontFamily: theme.fontSans, marginTop: 4 }}>{r.question}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
