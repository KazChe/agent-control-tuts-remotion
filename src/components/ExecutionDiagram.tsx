import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Where an evaluator runs (execution server or sdk) and how the server keeps
// one instance per name and config, each with a timeout. Times are seconds.
export type ExecutionTimes = {
  server?: number;
  builtins?: number;
  sdk?: number;
  env?: number;
  cache?: number;
  stateless?: number;
  timeout?: number;
  json15?: number;
  own?: number;
};

const CACHE_ROWS = [
  { key: "list:9f3a12…", timeout: "10 s" },
  { key: "json:1c7be0…", timeout: "15 s" },
  { key: "regex:77d0aa…", timeout: "10 s" },
  { key: "galileo.luna:e41c…", timeout: "timeout_ms from config" },
];

const box: React.CSSProperties = {
  position: "absolute",
  background: "rgba(13,17,23,0.9)",
  border: `2px solid ${theme.panelBorder}`,
  borderRadius: 18,
  padding: "20px 26px",
  fontFamily: theme.fontMono,
};

const Chip: React.FC<{ text: string; color: string; s: number; left: number; top: number }> = ({ text, color, s, left, top }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      fontFamily: theme.fontMono,
      fontSize: 20,
      color,
      border: `1px solid ${color}`,
      borderRadius: 999,
      padding: "6px 16px",
      opacity: s,
      transform: `translateY(${(1 - s) * 10}px)`,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

export const ExecutionDiagram: React.FC<{ times?: ExecutionTimes }> = ({ times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (sec: number | undefined) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 20 });
  const intro = at(0.4);
  const server = at(times.server);
  const builtins = at(times.builtins);
  const sdk = at(times.sdk);
  const env = at(times.env);
  const cache = at(times.cache);
  const stateless = at(times.stateless);
  const timeout = at(times.timeout);
  const json15 = at(times.json15);
  const own = at(times.own);
  return (
    <AbsoluteFill style={{ background: theme.pageBg }}>
      {/* agent process */}
      <div style={{ ...box, left: 120, top: 290, width: 720, height: 300, opacity: intro }}>
        <div style={{ color: theme.amber, fontSize: 20, letterSpacing: 4 }}>YOUR AGENT PROCESS</div>
        <div style={{ color: theme.dim, fontSize: 19, marginTop: 6 }}>the decorated function, the SDK</div>
      </div>
      <Chip text='"execution": "sdk"' color={theme.amber} s={sdk} left={150} top={400} />
      <Chip text="evaluator runs here, inside the agent" color={theme.amber} s={sdk} left={150} top={455} />
      <Chip text="for what lives only in the agent's environment" color={theme.dim} s={env} left={150} top={510} />

      {/* server */}
      <div style={{ ...box, left: 1080, top: 290, width: 720, height: 300, opacity: intro, border: `2px solid ${server > 0.5 ? theme.cyan : theme.panelBorder}` }}>
        <div style={{ color: theme.cyan, fontSize: 20, letterSpacing: 4 }}>AGENT CONTROL SERVER</div>
        <div style={{ color: theme.dim, fontSize: 19, marginTop: 6 }}>controls, the evaluation engine</div>
      </div>
      <Chip text='"execution": "server"' color={theme.cyan} s={server} left={1110} top={400} />
      <Chip text="evaluator runs here, nothing to install client side" color={theme.cyan} s={server} left={1110} top={455} />
      <Chip text="regex · list · json · sql  already there" color={theme.green} s={builtins} left={1110} top={510} />

      {/* arrow between */}
      <div style={{ position: "absolute", left: 870, top: 410, width: 180, textAlign: "center", color: theme.dim, fontFamily: theme.fontMono, fontSize: 19, opacity: intro }}>
        step ⟶ judged ⟶ result
      </div>

      {/* cache */}
      <div style={{ ...box, left: 120, top: 640, width: 1680, height: 330, opacity: cache }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <div style={{ color: theme.purple, fontSize: 20, letterSpacing: 4 }}>INSTANCE CACHE</div>
          <div style={{ color: theme.dim, fontSize: 19 }}>one instance per evaluator name and config hash, reused across requests</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "520px 1fr", rowGap: 10, marginTop: 22, fontSize: 21 }}>
          {CACHE_ROWS.map((r, i) => {
            const rowS = i === 3 ? own : cache;
            const tS = i === 1 ? json15 : i === 3 ? own : timeout;
            return (
              <React.Fragment key={r.key}>
                <div style={{ color: theme.text, opacity: rowS }}>{r.key}</div>
                <div style={{ color: i === 3 ? theme.purple : theme.cyan, opacity: tS }}>timeout {r.timeout}</div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <Chip text="so an evaluator must not keep per request state" color={theme.red} s={stateless} left={150} top={900} />
    </AbsoluteFill>
  );
};
