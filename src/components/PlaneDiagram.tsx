import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// The diagram behind episode 1, scenes 2 to 4. Three agents with guardrail
// checks written into their code; the checks lift out into one box above;
// the picture settles into a data plane and a control plane. Every beat is
// a time in seconds, normally anchored to a word in the narration.

export type PlanePhase = "agents" | "lift" | "planes";

export type PlaneTimes = {
  /** agents: when each agent's checks light up, and when REDEPLOY starts pulsing */
  lit?: [number, number, number];
  redeploy?: number;
  /** lift: control box appears, checks travel between these two times, label, arrows */
  controlIn?: number;
  travel?: [number, number];
  label?: number;
  arrows?: number;
  /** planes: divider and labels, the work row, the decide and record labels */
  divider?: number;
  workRow?: number;
  decide?: number;
  record?: number;
};

const AGENTS = [
  { name: "Support bot", x: 260 },
  { name: "Coding agent", x: 760 },
  { name: "Billing agent", x: 1260 },
];
const BOX = { y: 560, w: 400, h: 240 };
const CONTROL = { x: 760, y: 130, w: 400, h: 200 };
const WORK_Y = 835;
const LINES = [
  { w: 0.7, check: false },
  { w: 0.55, check: true },
  { w: 0.8, check: false },
  { w: 0.45, check: true },
];
const LINE_H = 14;
const LINE_GAP = 22;
const LINE_TOP = 70;

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const PlaneDiagram: React.FC<{
  phase: PlanePhase;
  durationSeconds: number;
  times?: PlaneTimes;
}> = ({ phase, durationSeconds, times = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const d = durationSeconds;
  const at = (sec: number, frames = 20) =>
    spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: frames });
  const between = (a: number, b: number) => clamp((t - a) / Math.max(0.01, b - a));

  const lit = times.lit ?? [0.22 * d, 0.36 * d, 0.48 * d];
  const redeployAt = times.redeploy ?? 0.66 * d;
  const [travelStart, travelEnd] = times.travel ?? [0.12 * d, 0.45 * d];
  const controlInAt = times.controlIn ?? 0.1 * d;
  const labelAt = times.label ?? 0.5 * d;
  const arrowsAt = times.arrows ?? 0.55 * d;
  const dividerAt = times.divider ?? 0.08 * d;
  const workRowAt = times.workRow ?? 0.3 * d;
  const decideAt = times.decide ?? 0.55 * d;
  const recordAt = times.record ?? 0.7 * d;

  const redeployPulse =
    phase === "agents" && t >= redeployAt
      ? 0.5 + 0.5 * Math.abs(Math.sin(((t - redeployAt) * fps) / 9))
      : 0;

  const travel = phase === "lift" ? between(travelStart, travelEnd) : phase === "planes" ? 1 : 0;
  const controlIn = phase === "lift" ? at(controlInAt) : phase === "planes" ? 1 : 0;
  const arrowsUp = phase === "lift" ? at(arrowsAt) : phase === "planes" ? 1 : 0;
  const controlLabel = phase === "lift" ? at(labelAt) : phase === "planes" ? 1 : 0;

  const divider = phase === "planes" ? at(dividerAt) : 0;
  const workRow = phase === "planes" ? at(workRowAt) : 0;
  const decide = phase === "planes" ? at(decideAt) : 0;
  const record = phase === "planes" ? at(recordAt) : 0;

  const boxIn = (i: number) => (phase === "agents" ? at(0.4 + i * 0.5, 24) : 1);

  const busY = CONTROL.y + CONTROL.h + 70;
  const stemX = CONTROL.x + CONTROL.w / 2;
  const first = AGENTS[0].x + BOX.w / 2;
  const last = AGENTS[AGENTS.length - 1].x + BOX.w / 2;

  return (
    <AbsoluteFill style={{ background: theme.pageBg, fontFamily: theme.fontSans }}>
      {/* divider and plane labels */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 470,
          borderTop: `2px dashed ${theme.panelBorder}`,
          opacity: divider,
        }}
      />
      <div style={{ position: "absolute", left: 120, top: 400, opacity: divider }}>
        <div style={{ fontFamily: theme.fontMono, fontSize: 22, letterSpacing: 4, color: theme.cyan }}>
          CONTROL PLANE
        </div>
        <div style={{ fontSize: 24, color: theme.dim, marginTop: 4 }}>decides before, records after</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 500, opacity: divider }}>
        <div style={{ fontFamily: theme.fontMono, fontSize: 22, letterSpacing: 4, color: theme.amber }}>
          DATA PLANE
        </div>
        <div style={{ fontSize: 24, color: theme.dim, marginTop: 4 }}>the work</div>
      </div>

      {/* control box */}
      <div
        style={{
          position: "absolute",
          left: CONTROL.x,
          top: CONTROL.y,
          width: CONTROL.w,
          height: CONTROL.h,
          borderRadius: 18,
          border: `2px solid ${theme.cyan}`,
          background: "rgba(88,196,221,0.06)",
          opacity: controlIn,
          transform: `translateY(${(1 - controlIn) * 20}px)`,
          padding: "18px 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.text }}>Controls</div>
        <div style={{ fontSize: 21, color: theme.dim, marginTop: 4, opacity: controlLabel }}>
          policy, as configuration
        </div>
      </div>

      {/* connectors: each agent rises to a bus under the control box, one stem joins the box */}
      <div
        style={{
          position: "absolute",
          left: stemX - 1,
          top: CONTROL.y + CONTROL.h,
          width: 2,
          height: (busY - CONTROL.y - CONTROL.h) * arrowsUp,
          background: theme.panelBorder,
          opacity: arrowsUp,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: first,
          top: busY - 1,
          width: (last - first) * arrowsUp,
          height: 2,
          background: theme.panelBorder,
          opacity: arrowsUp,
        }}
      />
      {AGENTS.map((a) => (
        <div
          key={`up-${a.name}`}
          style={{
            position: "absolute",
            left: a.x + BOX.w / 2 - 1,
            top: busY,
            width: 2,
            height: (BOX.y - busY) * arrowsUp,
            background: theme.panelBorder,
            opacity: arrowsUp,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: stemX - 190,
          top: CONTROL.y + CONTROL.h + 18,
          fontFamily: theme.fontMono,
          fontSize: 22,
          color: theme.cyan,
          opacity: decide,
        }}
      >
        decide ↓
      </div>
      <div
        style={{
          position: "absolute",
          left: stemX + 30,
          top: CONTROL.y + CONTROL.h + 18,
          fontFamily: theme.fontMono,
          fontSize: 22,
          color: theme.green,
          opacity: record,
        }}
      >
        ↑ record
      </div>

      {/* agent boxes */}
      {AGENTS.map((a, i) => {
        const s = boxIn(i);
        const isLit = phase !== "agents" || t >= lit[i];
        return (
          <div
            key={a.name}
            style={{
              position: "absolute",
              left: a.x,
              top: BOX.y,
              width: BOX.w,
              height: BOX.h,
              borderRadius: 18,
              border: `2px solid ${theme.panelBorder}`,
              background: "rgba(13,17,23,0.9)",
              opacity: s,
              transform: `scale(${0.85 + 0.15 * s})`,
              padding: "18px 24px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: theme.text }}>{a.name}</div>
            <div style={{ fontFamily: theme.fontMono, fontSize: 18, color: theme.dim }}>agent code</div>
            {LINES.map((l, j) => {
              if (l.check && travel > 0) return null;
              const isRed = l.check && isLit;
              return (
                <div
                  key={j}
                  style={{
                    position: "absolute",
                    left: 24,
                    top: LINE_TOP + j * (LINE_H + LINE_GAP),
                    width: (BOX.w - 48) * l.w,
                    height: LINE_H,
                    borderRadius: 7,
                    background: isRed ? theme.red : "rgba(255,255,255,0.12)",
                    boxShadow: isRed ? `0 0 18px ${theme.red}66` : "none",
                  }}
                />
              );
            })}
            {redeployPulse > 0 && (
              <div
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: 18,
                  fontFamily: theme.fontMono,
                  fontSize: 20,
                  fontWeight: 700,
                  color: theme.amber,
                  border: `1px solid ${theme.amber}`,
                  borderRadius: 999,
                  padding: "4px 14px",
                  opacity: redeployPulse,
                }}
              >
                REDEPLOY
              </div>
            )}
          </div>
        );
      })}

      {/* travelling checks: from each box to a stack inside the control box */}
      {travel > 0 &&
        AGENTS.flatMap((a, i) =>
          LINES.map((l, j) => {
            if (!l.check) return null;
            const startX = a.x + 24;
            const startY = BOX.y + LINE_TOP + j * (LINE_H + LINE_GAP);
            const endX = CONTROL.x + 24;
            const endY = CONTROL.y + 110 + i * 28;
            const x = interpolate(travel, [0, 1], [startX, endX]);
            const y = interpolate(travel, [0, 1], [startY, endY]);
            const w = interpolate(travel, [0, 1], [(BOX.w - 48) * l.w, CONTROL.w - 48]);
            const o = j === 1 ? 1 : interpolate(travel, [0.6, 1], [1, 0]);
            return (
              <div
                key={`${i}-${j}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: w,
                  height: LINE_H,
                  borderRadius: 7,
                  background: theme.red,
                  boxShadow: `0 0 18px ${theme.red}66`,
                  opacity: clamp(o),
                }}
              />
            );
          }),
        )}

      {/* the work row: models and tools under the agents */}
      <div
        style={{
          position: "absolute",
          left: 260,
          top: WORK_Y,
          width: 1400,
          height: 70,
          borderRadius: 14,
          border: `2px solid ${theme.amber}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          fontFamily: theme.fontMono,
          fontSize: 24,
          color: theme.text,
          opacity: workRow,
        }}
      >
        <span>models</span>
        <span style={{ color: theme.dim }}>·</span>
        <span>tools</span>
        <span style={{ color: theme.dim }}>·</span>
        <span>data</span>
      </div>
      {AGENTS.map((a) => (
        <div
          key={`down-${a.name}`}
          style={{
            position: "absolute",
            left: a.x + BOX.w / 2 - 1,
            top: BOX.y + BOX.h,
            width: 2,
            height: (WORK_Y - BOX.y - BOX.h) * workRow,
            background: `${theme.amber}88`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
