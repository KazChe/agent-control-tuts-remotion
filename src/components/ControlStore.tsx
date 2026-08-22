import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type ControlRow = {
  name: string;
  evaluator: string;
  on: string;
  action: string;
};

// Stylized recreation of the local Control Store view. Swap for a real
// screen recording later: drop control-store.mp4 into public/ and replace
// this component with <OffthreadVideo src={staticFile("control-store.mp4")} />.
export const ControlStore: React.FC<{
  heading: string;
  subtitle: string;
  controls: ControlRow[];
}> = ({ heading, subtitle, controls }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: theme.pageBg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontSans,
      }}
    >
      <div
        style={{
          width: 1560,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            background: theme.chrome,
            height: 64,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 10,
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{ width: 16, height: 16, borderRadius: 8, background: c }}
            />
          ))}
          <div
            style={{
              flex: 1,
              margin: "0 180px",
              background: theme.panel,
              borderRadius: 10,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.dim,
              fontFamily: theme.fontMono,
              fontSize: 22,
            }}
          >
            localhost:8000 — Control Store
          </div>
        </div>
        <div style={{ background: "#0f1524", padding: "40px 48px 56px" }}>
          <div
            style={{
              color: theme.text,
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {heading}
          </div>
          <div style={{ color: theme.dim, fontSize: 26, marginBottom: 36 }}>
            {subtitle}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.9fr 1fr 1fr 0.6fr",
              columnGap: 24,
              rowGap: 0,
              fontSize: 26,
            }}
          >
            {["NAME", "EVALUATOR", "APPLIES TO", "ACTION"].map((h) => (
              <div
                key={h}
                style={{
                  color: theme.dim,
                  fontFamily: theme.fontMono,
                  fontSize: 22,
                  letterSpacing: 2,
                  padding: "14px 0",
                  borderBottom: `1px solid ${theme.panelBorder}`,
                }}
              >
                {h}
              </div>
            ))}
            {controls.map((c, i) => {
              const s = spring({
                frame: frame - 14 - i * 16,
                fps,
                config: { damping: 200 },
                durationInFrames: 24,
              });
              const cell: React.CSSProperties = {
                padding: "24px 0",
                borderBottom: `1px solid ${theme.panelBorder}`,
                opacity: s,
                transform: `translateY(${(1 - s) * 16}px)`,
                color: theme.text,
              };
              return (
                <React.Fragment key={c.name}>
                  <div style={{ ...cell, fontFamily: theme.fontMono, color: theme.cyan }}>
                    {c.name}
                  </div>
                  <div style={cell}>{c.evaluator}</div>
                  <div style={{ ...cell, color: theme.dim }}>{c.on}</div>
                  <div style={cell}>
                    <span
                      style={{
                        background: "rgba(248, 81, 73, 0.15)",
                        color: theme.red,
                        border: `1px solid ${theme.red}`,
                        borderRadius: 999,
                        padding: "6px 20px",
                        fontFamily: theme.fontMono,
                        fontSize: 22,
                      }}
                    >
                      {c.action}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
