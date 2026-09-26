import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// A leaf condition: a selector picks a path out of the step, an evaluator
// judges it, and the result is matched plus confidence plus message.
export type LeafTimes = {
  selector?: number; // "A selector picks"
  paths?: number; // "by path"
  evaluator?: number; // "An evaluator judges"
  evaluators?: number[]; // one per name: regex, list, json, sql, custom
  result?: number; // "answers with matched"
  holds?: number; // "Matched means the condition holds"
};

const STEP_LINES: { text: string; isOutput?: boolean }[] = [
  { text: "{" },
  { text: '  "type": "llm",' },
  { text: '  "name": "draft_customer_reply",' },
  { text: '  "input": "What is the customer\'s SSN?",' },
  { text: '  "output": "The customer\'s SSN is 987-65-4329, ...",', isOutput: true },
  { text: "}" },
];
const EVALUATORS = ["regex", "list", "json", "sql", "your own"];

export const LeafCondition: React.FC<{ times?: LeafTimes }> = ({ times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = (sec: number | undefined) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 20 });
  const sel = at(times.selector);
  const showPaths = times.paths !== undefined && t >= times.paths;
  const evalIn = at(times.evaluator);
  const res = at(times.result);
  const holds = at(times.holds);

  const panel: React.CSSProperties = {
    background: "rgba(13,17,23,0.94)",
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 16,
    padding: "22px 28px",
    fontFamily: theme.fontMono,
    boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
  };

  return (
    <AbsoluteFill style={{ background: theme.pageBg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {/* the step */}
        <div style={{ ...panel, width: 760 }}>
          <div style={{ color: theme.dim, fontSize: 20, marginBottom: 10 }}>the step</div>
          {STEP_LINES.map((l, i) => (
            <div
              key={i}
              style={{
                color: theme.text,
                fontSize: 21,
                lineHeight: "36px",
                whiteSpace: "pre",
                background: l.isOutput && sel > 0.01 ? `${theme.purple}33` : "transparent",
                borderRadius: 6,
                outline: l.isOutput && sel > 0.01 ? `2px solid ${theme.purple}` : "none",
              }}
            >
              {l.text}
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 12, opacity: sel }}>
            <span style={{ color: theme.purple, fontSize: 22 }}>selector</span>
            <span style={{ color: theme.text, fontSize: 22, border: `1px solid ${theme.purple}`, borderRadius: 999, padding: "2px 14px" }}>
              path: output
            </span>
          </div>
          <div style={{ marginTop: 10, color: theme.dim, fontSize: 20, opacity: showPaths ? 1 : 0 }}>
            also: input · context.user_id · input.destination_country
          </div>
        </div>

        <div style={{ color: theme.dim, fontSize: 48, opacity: evalIn }}>→</div>

        {/* the evaluator */}
        <div style={{ ...panel, width: 470, opacity: evalIn, transform: `translateY(${(1 - evalIn) * 20}px)` }}>
          <div style={{ color: theme.dim, fontSize: 20, marginBottom: 10 }}>evaluator</div>
          {EVALUATORS.map((name, i) => {
            const a = at(times.evaluators?.[i]);
            const chosen = i === 0;
            return (
              <div
                key={name}
                style={{
                  fontSize: 26,
                  lineHeight: "44px",
                  color: chosen ? theme.text : theme.dim,
                  fontWeight: chosen ? 700 : 400,
                  opacity: a,
                  transform: `translateX(${(1 - a) * 20}px)`,
                }}
              >
                {name}
                {chosen && <span style={{ color: theme.dim, fontSize: 20 }}>  \b\d{"{3}"}-\d{"{2}"}-\d{"{4}"}\b</span>}
              </div>
            );
          })}
        </div>

        <div style={{ color: theme.dim, fontSize: 48, opacity: res }}>→</div>

        {/* the result */}
        <div style={{ ...panel, width: 400, opacity: res, transform: `translateY(${(1 - res) * 20}px)`, border: `2px solid ${holds > 0.5 ? theme.red : theme.panelBorder}` }}>
          <div style={{ color: theme.dim, fontSize: 20, marginBottom: 10 }}>result</div>
          <div style={{ fontSize: 26, lineHeight: "44px", color: theme.text }}>
            matched <span style={{ color: theme.red, fontWeight: 700 }}>true</span>
          </div>
          <div style={{ fontSize: 26, lineHeight: "44px", color: theme.text }}>confidence 1.0</div>
          <div style={{ fontSize: 21, lineHeight: "32px", color: theme.dim }}>message "Pattern found"</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
