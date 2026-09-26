import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Two lanes, the agent's process on the left and the Agent Control server on
// the right, with traffic crossing the line between them. One component,
// several modes, every beat a time in seconds anchored to the narration.

export type LaneMode = "intro" | "call" | "execution" | "failure" | "timeouts" | "refresh" | "close";

export type LaneTimes = {
  // intro
  fn?: number; decorator?: number; sdk?: number;
  controls?: number; engine?: number; record?: number;
  register?: number; perCall?: number;
  // call
  preUp?: number; evaluate?: number; preBack?: number; preDeny?: number;
  runs?: number; postUp?: number; postBack?: number; postDeny?: number;
  // execution
  serverExec?: number; sdkExec?: number;
  // failure
  dark?: number; blocked?: number; evalError?: number; blocks?: number;
  // timeouts
  t1?: number; t2?: number; t3?: number;
  // refresh
  tick?: number; change?: number; pickup?: number;
  // close
  third?: number; galileo?: number;
};

const DIVIDER_X = 960;
const LANE_TOP = 275;
const LANE_BOTTOM = 1010;
const FN = { x: 330, y: 590, w: 340, h: 110 };
const DEC = { x: 290, y: 530, w: 420, h: 230 };
const SDK = { x: 330, y: 830, w: 340, h: 90 };
const CONTROLS = { x: 1100, y: 370, w: 300, h: 90 };
const ENGINE = { x: 1100, y: 530, w: 300, h: 110 };
const EVALS = { x: 1470, y: 530, w: 300, h: 110 };
const RECORD = { x: 1100, y: 810, w: 300, h: 90 };

export const LaneDiagram: React.FC<{ mode: LaneMode; times?: LaneTimes }> = ({ mode, times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const at = (sec: number | undefined, frames = 20) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: frames });
  const on = (sec: number | undefined) => sec !== undefined && t >= sec;
  const pulse = (sec: number | undefined, period = 0.9) =>
    sec === undefined || t < sec ? 0 : 0.55 + 0.45 * Math.abs(Math.sin(((t - sec) / period) * Math.PI));

  // In every mode after the intro the boxes are already there.
  const intro = mode === "intro";
  const faded = mode === "close" ? 0.12 : 1;
  const vis = {
    fn: intro ? at(times.fn) : faded,
    dec: intro ? at(times.decorator) : faded,
    sdk: intro ? at(times.sdk) : faded,
    controls: intro ? at(times.controls) : 1,
    engine: intro ? at(times.engine) : 1,
    record: intro ? at(times.record) : 1,
  };

  const dark = mode === "failure" && on(times.dark);
  const blocked = mode === "failure" && on(times.blocked);
  const evalError = mode === "failure" && on(times.evalError);

  // execution: the evaluators box slides from the server lane into the agent's process
  const slide = mode === "execution" ? at(times.sdkExec, 30) : 0;
  const evalsX = interpolate(slide, [0, 1], [EVALS.x, 330]);
  const evalsY = interpolate(slide, [0, 1], [EVALS.y, 405]);

  // call: which arrow is live
  const preDeny = mode === "call" && on(times.preDeny) && !on(times.runs);
  const runs = mode === "call" && on(times.runs);
  const postLive = mode === "call" && on(times.postUp);
  const postBack = mode === "call" && on(times.postBack);
  const postDeny = mode === "call" && on(times.postDeny);

  const Box: React.FC<{
    r: { x: number; y: number; w: number; h: number };
    label: string;
    sub?: string;
    color?: string;
    lit?: number;
    opacity?: number;
    dashed?: boolean;
  }> = ({ r, label, sub, color = theme.text, lit = 0, opacity = 1, dashed }) => (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: 14,
        border: `2px ${dashed ? "dashed" : "solid"} ${lit > 0.01 ? color : theme.panelBorder}`,
        background: lit > 0.01 ? `${color}14` : "rgba(13,17,23,0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontMono,
        opacity,
        boxSizing: "border-box",
      }}
    >
      <div style={{ color: lit > 0.01 ? color : theme.text, fontSize: 26, fontWeight: 700 }}>{label}</div>
      {sub && <div style={{ color: theme.dim, fontSize: 19, marginTop: 4, fontFamily: theme.fontSans }}>{sub}</div>}
    </div>
  );

  // an arrow across the divider at height y; dir "right" goes to the server
  const Cross: React.FC<{ y: number; dir: "right" | "left"; label: string; color: string; show: number; x1?: number; x2?: number }> = ({
    y,
    dir,
    label,
    color,
    show,
    x1 = SDK.x + SDK.w + 10,
    x2 = ENGINE.x - 10,
  }) => (
    <div style={{ position: "absolute", left: x1, top: y - 1, width: x2 - x1, opacity: show }}>
      <div style={{ height: 3, background: color, width: `${100 * show}%`, marginLeft: dir === "left" ? `${100 - 100 * show}%` : 0 }} />
      <div
        style={{
          position: "absolute",
          top: -16,
          [dir === "right" ? "right" : "left"]: -8,
          color,
          fontSize: 30,
          lineHeight: "34px",
        }}
      >
        {dir === "right" ? "▶" : "◀"}
      </div>
      <div style={{ position: "absolute", top: dir === "right" ? -34 : 10, left: 0, right: 0, textAlign: "center", color, fontFamily: theme.fontMono, fontSize: 20 }}>
        {label}
      </div>
    </div>
  );

  const Tag: React.FC<{ x: number; y: number; text: string; color: string; show: number }> = ({ x, y, text, color, show }) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: theme.fontMono,
        fontSize: 20,
        color,
        border: `1px solid ${color}`,
        background: "rgba(13,17,23,0.95)",
        borderRadius: 999,
        padding: "6px 16px",
        opacity: show,
        transform: `translateY(${(1 - show) * 10}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );

  const laneTitle = (x: number, w: number, title: string, sub: string, color: string, show: number) => (
    <div style={{ position: "absolute", left: x, top: LANE_TOP + 10, width: w, textAlign: "center", opacity: show }}>
      <div style={{ fontFamily: theme.fontMono, fontSize: 22, letterSpacing: 4, color }}>{title}</div>
      <div style={{ fontFamily: theme.fontSans, fontSize: 21, color: theme.dim, marginTop: 4 }}>{sub}</div>
    </div>
  );

  const lanesIn = intro ? at(0.2) : 1;
  const third = mode === "close" ? at(times.third, 26) : 0;
  const galileo = mode === "close" ? at(times.galileo) : 0;

  return (
    <AbsoluteFill style={{ background: theme.pageBg }}>
      {/* lanes */}
      <div style={{ position: "absolute", left: 100, top: LANE_TOP, width: 800, height: LANE_BOTTOM - LANE_TOP, borderRadius: 22, border: `1px solid ${theme.panelBorder}`, background: "rgba(255,255,255,0.015)", opacity: lanesIn }} />
      <div style={{ position: "absolute", left: 1020, top: LANE_TOP, width: 800, height: LANE_BOTTOM - LANE_TOP, borderRadius: 22, border: `1px solid ${dark ? theme.red : theme.panelBorder}`, background: dark ? "rgba(248,81,73,0.05)" : "rgba(88,196,221,0.03)", opacity: lanesIn * (dark ? 0.6 : 1) }} />
      {laneTitle(100, 800, "YOUR AGENT'S PROCESS", "the data plane, where the work happens", theme.amber, lanesIn)}
      {laneTitle(1020, 800, "AGENT CONTROL SERVER", "the control plane, where the policy lives", theme.cyan, lanesIn)}
      <div style={{ position: "absolute", left: DIVIDER_X - 1, top: LANE_TOP, height: LANE_BOTTOM - LANE_TOP, borderLeft: `2px dashed ${dark ? theme.red : theme.panelBorder}`, opacity: lanesIn }} />
      {dark && (
        <div style={{ position: "absolute", left: DIVIDER_X - 130, top: 520, width: 260, background: "rgba(13,17,23,0.95)", textAlign: "center", fontFamily: theme.fontMono, fontSize: 22, color: theme.red }}>
          unreachable
        </div>
      )}

      {/* agent lane */}
      <Box r={DEC} label="" opacity={vis.dec} dashed color={theme.purple} lit={vis.dec} />
      <div style={{ position: "absolute", left: DEC.x + 16, top: DEC.y + 10, fontFamily: theme.fontMono, fontSize: 20, color: theme.purple, opacity: vis.dec }}>
        @control()
      </div>
      <Box
        r={FN}
        label="the function"
        sub={preDeny ? "never runs" : runs ? "runs" : "a model call or a tool call"}
        color={preDeny || blocked ? theme.red : theme.amber}
        lit={runs ? 1 : preDeny || blocked ? 1 : 0}
        opacity={vis.fn * (preDeny ? 0.5 : 1)}
      />
      <Box r={SDK} label="SDK" sub="asks the server, before and after" opacity={vis.sdk} />

      {/* server lane */}
      <Box r={CONTROLS} label="controls" sub="the policy, as configuration" opacity={vis.controls} color={theme.cyan} lit={mode === "refresh" && on(times.change) ? pulse(times.change, 1.2) : 0} />
      <Box r={ENGINE} label="engine" sub="evaluates each control" opacity={vis.engine} color={theme.cyan} lit={mode === "call" && on(times.evaluate) && !on(times.preBack) ? 1 : postLive && !postBack ? 1 : 0} />
      <Box
        r={{ x: evalsX, y: evalsY, w: EVALS.w, h: EVALS.h }}
        label="evaluators"
        sub={slide > 0.5 ? "sdk execution" : "regex, list, json, sql, yours"}
        opacity={vis.engine}
        color={evalError ? theme.red : theme.purple}
        lit={mode === "execution" ? 1 : evalError ? 1 : 0}
      />
      <Box r={RECORD} label="record" sub="every decision, kept" opacity={vis.record} color={theme.green} />

      {/* intro arrows */}
      {intro && (
        <>
          <Cross y={430} dir="right" label="register, fetch controls" color={theme.cyan} show={at(times.register)} x1={SDK.x + SDK.w + 10} x2={CONTROLS.x - 10} />
          <Cross y={640} dir="right" label="ask before and after, each call" color={theme.amber} show={at(times.perCall)} />
        </>
      )}

      {/* call arrows */}
      {mode === "call" && (
        <>
          <Cross y={565} dir="right" label="pre controls + input" color={preDeny ? theme.red : theme.cyan} show={at(times.preUp)} />
          <Cross y={615} dir="left" label={preDeny ? "deny" : "allow"} color={preDeny ? theme.red : theme.green} show={at(times.preBack)} />
          <Cross y={700} dir="right" label="post controls + output" color={postDeny ? theme.red : theme.cyan} show={at(times.postUp)} />
          <Cross y={750} dir="left" label={postDeny ? "deny, output held" : "allow"} color={postDeny ? theme.red : theme.green} show={at(times.postBack)} />
        </>
      )}

      {/* execution tags */}
      {mode === "execution" && (
        <>
          <Tag x={1470} y={640} text="execution: server (default)" color={theme.cyan} show={at(times.serverExec) * (1 - slide)} />
          <Tag x={330} y={355} text="execution: sdk" color={theme.purple} show={slide} />
        </>
      )}

      {/* failure */}
      {mode === "failure" && (
        <>
          <Cross y={640} dir="right" label="ask" color={dark ? theme.red : theme.cyan} show={1} />
          <Tag x={SDK.x} y={SDK.y + SDK.h + 20} text="call blocked, not waved through" color={theme.red} show={at(times.blocked)} />
          <Tag x={EVALS.x} y={EVALS.y + EVALS.h + 16} text="evaluator error on a deny control" color={theme.red} show={at(times.evalError)} />
          <div style={{ position: "absolute", left: 0, right: 0, top: LANE_BOTTOM + 8, textAlign: "center", fontFamily: theme.fontMono, fontSize: 30, fontWeight: 800, color: theme.red, letterSpacing: 3, opacity: at(times.blocks) }}>
            CANNOT JUDGE, DOES NOT GUESS. BLOCKS.
          </div>
        </>
      )}

      {/* timeouts */}
      {mode === "timeouts" && (
        <>
          <Cross y={640} dir="right" label="ask" color={theme.cyan} show={1} />
          <Tag x={CONTROLS.x} y={CONTROLS.y + CONTROLS.h + 14} text="1  timeout_ms, set on the control · 10 s" color={theme.purple} show={at(times.t1)} />
          <Tag x={ENGINE.x} y={ENGINE.y + ENGINE.h + 14} text="2  EVALUATOR_TIMEOUT_SECONDS, server fallback · 30 s" color={theme.cyan} show={at(times.t2)} />
          <Tag x={725} y={548} text="3  client timeout, SDK · 30 s" color={theme.amber} show={at(times.t3)} />
        </>
      )}

      {/* refresh */}
      {mode === "refresh" && (
        <>
          <Cross y={430} dir="left" label="fetch controls, every interval" color={theme.cyan} show={pulse(times.tick, 2.4)} x1={SDK.x + SDK.w + 10} x2={CONTROLS.x - 10} />
          <Tag x={CONTROLS.x + CONTROLS.w + 20} y={CONTROLS.y + 26} text="control changed on the server" color={theme.amber} show={at(times.change)} />
          <Tag x={SDK.x} y={SDK.y + SDK.h + 20} text="picked up on the next refresh, no restart" color={theme.green} show={at(times.pickup)} />
        </>
      )}

      {/* close: the third place */}
      {mode === "close" && (
        <>
          <div style={{ position: "absolute", left: 1560, top: RECORD.y - 70, width: 240, height: 200, borderRadius: 18, border: `2px dashed ${theme.green}`, background: "rgba(63,185,80,0.05)", opacity: third, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: theme.fontMono }}>
            <div style={{ color: theme.green, fontSize: 22, fontWeight: 700 }}>trace store</div>
            <div style={{ color: theme.dim, fontSize: 18, marginTop: 6, textAlign: "center", fontFamily: theme.fontSans, opacity: galileo }}>
              here, Galileo
              <br />
              Agent Observability
            </div>
          </div>
          <Cross y={RECORD.y + RECORD.h / 2} dir="right" label="decision" color={theme.green} show={third} x1={RECORD.x + RECORD.w + 10} x2={1550} />
        </>
      )}
    </AbsoluteFill>
  );
};
