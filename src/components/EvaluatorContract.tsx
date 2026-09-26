import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// The evaluator contract: the selected piece goes in, an EvaluatorResult comes
// out, and every evaluator answers with the same four fields. Times are seconds.
export type ContractTimes = {
  piece?: number;
  matched?: number;
  confidence?: number;
  message?: number;
  metadata?: number;
  /** one per chip: regex, list, json, sql, luna, yours */
  chips?: number[];
  always?: number;
  meaning?: number;
};

const CHIPS = [
  { name: "regex", sub: "a pattern", builtin: true },
  { name: "list", sub: "values", builtin: true },
  { name: "json", sub: "a schema", builtin: true },
  { name: "sql", sub: "statements", builtin: true },
  { name: "galileo.luna", sub: "model backed · add-on", builtin: false },
  { name: "yours", sub: "custom package", builtin: false },
];

const RESULT = [
  { key: "matched" as const, text: "matched:    true", color: theme.green },
  { key: "confidence" as const, text: "confidence: 1.0", color: theme.cyan },
  { key: "message" as const, text: 'message:    "Control triggered. Matched: AcmeCorp"', color: theme.text },
  { key: "metadata" as const, text: 'metadata:   {"matches": ["AcmeCorp"], "logic": "any"}', color: theme.dim },
];

const panel: React.CSSProperties = {
  position: "absolute",
  background: "rgba(13,17,23,0.94)",
  border: `1px solid ${theme.panelBorder}`,
  borderRadius: 16,
  padding: "18px 24px",
  fontFamily: theme.fontMono,
  boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
};

export const EvaluatorContract: React.FC<{ times?: ContractTimes }> = ({ times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (sec: number | undefined, d = 20) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: d });
  const piece = at(times.piece);
  const box = at(0.5);
  const always = at(times.always);
  const meaning = at(times.meaning);
  return (
    <AbsoluteFill style={{ background: theme.pageBg }}>
      {/* the selected piece */}
      <div style={{ ...panel, left: 100, top: 330, width: 470, opacity: piece, transform: `translateX(${(1 - piece) * -20}px)` }}>
        <div style={{ color: theme.dim, fontSize: 20, marginBottom: 10 }}>the piece the selector picked</div>
        <div style={{ color: theme.cyan, fontSize: 21 }}>selector: {"{"}"path": "input"{"}"}</div>
        <div style={{ color: theme.text, fontSize: 21, marginTop: 8, whiteSpace: "pre-wrap" }}>"Is AcmeCorp better than you?"</div>
      </div>
      <div style={{ position: "absolute", left: 590, top: 385, fontSize: 44, color: theme.dim, opacity: piece }}>→</div>

      {/* the evaluator */}
      <div
        style={{
          ...panel,
          left: 660,
          top: 320,
          width: 400,
          height: 170,
          border: `2px solid ${theme.purple}`,
          opacity: box,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: theme.purple, fontSize: 22, letterSpacing: 4 }}>EVALUATOR</div>
        <div style={{ color: theme.text, fontSize: 30, fontWeight: 700, marginTop: 8 }}>evaluate(data)</div>
        <div style={{ color: theme.dim, fontSize: 19, marginTop: 8 }}>any of them, same shape</div>
      </div>
      <div style={{ position: "absolute", left: 1090, top: 385, fontSize: 44, color: theme.dim, opacity: box }}>→</div>

      {/* the result */}
      <div style={{ ...panel, left: 1160, top: 320, width: 660, opacity: box }}>
        <div style={{ color: theme.dim, fontSize: 20, marginBottom: 10 }}>EvaluatorResult</div>
        {RESULT.map((r) => {
          const s = at(times[r.key]);
          return (
            <div key={r.key} style={{ color: r.color, fontSize: 20, lineHeight: "34px", whiteSpace: "pre", opacity: s, transform: `translateX(${(1 - s) * 16}px)` }}>
              {r.text}
            </div>
          );
        })}
      </div>

      {/* the answerers */}
      <div style={{ position: "absolute", left: 100, top: 690, fontFamily: theme.fontSans, color: theme.dim, fontSize: 22, opacity: at(times.chips?.[0]) }}>
        whoever answers, the shape is the same
      </div>
      {CHIPS.map((c, i) => {
        const s = at(times.chips?.[i]);
        const tag = c.builtin ? always : meaning;
        const left = 100 + i * 290;
        return (
          <React.Fragment key={c.name}>
            <div
              style={{
                ...panel,
                left,
                top: 735,
                width: 260,
                padding: "14px 18px",
                border: `2px solid ${c.builtin ? theme.cyan : theme.purple}`,
                opacity: s,
                transform: `translateY(${(1 - s) * 14}px)`,
              }}
            >
              <div style={{ color: c.builtin ? theme.cyan : theme.purple, fontSize: 24, fontWeight: 700 }}>{c.name}</div>
              <div style={{ color: theme.dim, fontSize: 17, marginTop: 4 }}>{c.sub}</div>
            </div>
            <div
              style={{
                position: "absolute",
                left,
                top: 850,
                width: 260,
                fontFamily: theme.fontMono,
                fontSize: 17,
                color: c.builtin ? theme.cyan : theme.purple,
                opacity: tag,
                textAlign: "center",
              }}
            >
              {c.builtin ? "confidence 1.0, always" : "confidence 0.0 to 1.0"}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
