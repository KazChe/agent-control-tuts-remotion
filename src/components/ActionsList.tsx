import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Three actions stacked; each definition slides in when the narrator reaches
// it, and deny gets its "wins" tag when the voice says so.
export type ActionsTimes = { observe?: number; deny?: number; steer?: number; denyWins?: number };

const ROWS = [
  { key: "observe" as const, color: theme.green, text: "Records the match and touches nothing. A log line, a rule in report-only mode." },
  { key: "deny" as const, color: theme.red, text: "Stops the request. Pre, the function never runs. Post, the output never escapes." },
  { key: "steer" as const, color: theme.amber, text: "Sends the agent a message about what to fix. The agent corrects itself and retries." },
];

export const ActionsList: React.FC<{ times?: ActionsTimes }> = ({ times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (sec: number | undefined) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 22 });
  const wins = at(times.denyWins);
  return (
    <AbsoluteFill style={{ background: theme.pageBg, justifyContent: "center", alignItems: "center", fontFamily: theme.fontSans, paddingTop: 120 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        {ROWS.map((r) => {
          const s = at(times[r.key]);
          const isDeny = r.key === "deny";
          return (
            <div
              key={r.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 40,
                width: 1500,
                padding: "26px 34px",
                borderRadius: 18,
                border: `2px solid ${isDeny && wins > 0.5 ? r.color : theme.panelBorder}`,
                background: isDeny && wins > 0.5 ? `${r.color}12` : "rgba(13,17,23,0.9)",
              }}
            >
              <div style={{ width: 260, fontFamily: theme.fontMono, fontSize: 44, fontWeight: 800, color: r.color, letterSpacing: 2 }}>
                {r.key.toUpperCase()}
              </div>
              <div style={{ flex: 1, fontSize: 30, color: theme.text, lineHeight: "44px", opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
                {r.text}
              </div>
              {isDeny && (
                <div style={{ fontFamily: theme.fontMono, fontSize: 22, color: r.color, border: `1px solid ${r.color}`, borderRadius: 999, padding: "8px 18px", opacity: wins }}>
                  wins when several match
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
