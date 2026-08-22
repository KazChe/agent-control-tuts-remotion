import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: theme.pageBg,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: theme.fontSans,
      color: theme.text,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const TitleCard: React.FC<{
  eyebrow: string;
  title: string;
  subtitle: string;
}> = ({ eyebrow, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const sub = spring({
    frame: frame - 14,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  return (
    <Page>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: theme.cyan,
            fontFamily: theme.fontMono,
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: pop,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            margin: "24px 0 10px",
            opacity: pop,
            transform: `translateY(${(1 - pop) * 40}px)`,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 44,
            color: theme.dim,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 30}px)`,
          }}
        >
          {subtitle}
        </div>
      </div>
    </Page>
  );
};

export const ConceptSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const boxes = [
    { label: "SELECTOR", desc: "which data", color: theme.cyan },
    { label: "EVALUATOR", desc: "what judgment", color: theme.purple },
    { label: "COMPOSITION", desc: "AND / OR", color: theme.amber },
  ];
  const formula = spring({
    frame: frame - 75,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  return (
    <Page>
      <div style={{ fontSize: 52, fontWeight: 700, marginBottom: 70 }}>
        Anatomy of a control condition
      </div>
      <div style={{ display: "flex", gap: 48 }}>
        {boxes.map((b, i) => {
          const s = spring({
            frame: frame - 12 - i * 22,
            fps,
            config: { damping: 14 },
            durationInFrames: 35,
          });
          return (
            <div
              key={b.label}
              style={{
                width: 380,
                padding: "44px 0",
                textAlign: "center",
                borderRadius: 20,
                border: `2px solid ${b.color}`,
                background: "rgba(255,255,255,0.03)",
                opacity: s,
                transform: `scale(${0.8 + 0.2 * s})`,
              }}
            >
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 40,
                  fontWeight: 700,
                  color: b.color,
                }}
              >
                {b.label}
              </div>
              <div style={{ fontSize: 30, color: theme.dim, marginTop: 14 }}>
                {b.desc}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: theme.fontMono,
          fontSize: 34,
          color: theme.text,
          opacity: formula,
        }}
      >
        selector + evaluator (+ composition){" "}
        <span style={{ color: theme.green }}>= one condition, enforced server-side</span>
      </div>
    </Page>
  );
};

export const Callout: React.FC<{ text: string; appearAt?: number; hideAt?: number }> = ({
  text,
  appearAt = 0,
  hideAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const out =
    hideAt === undefined
      ? 1
      : interpolate(frame, [hideAt - 12, hideAt], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const o = inS * out;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - inS) * 30}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          background: "rgba(13, 17, 23, 0.92)",
          border: `1px solid ${theme.accent}`,
          borderLeft: `10px solid ${theme.accent}`,
          borderRadius: 14,
          padding: "22px 38px",
          fontFamily: theme.fontSans,
          fontSize: 34,
          color: theme.text,
          boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const checks = [
    "3 controls created and attached via the API",
    "1a / 3a ALLOWED — 1b / 3b BLOCKED",
    "pre-stage vs post-stage: where the block happened",
  ];
  return (
    <Page>
      <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 56 }}>
        You should see…
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        {checks.map((c, i) => {
          const s = spring({
            frame: frame - 10 - i * 18,
            fps,
            config: { damping: 200 },
            durationInFrames: 25,
          });
          return (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                fontSize: 40,
                opacity: s,
                transform: `translateX(${(1 - s) * 40}px)`,
              }}
            >
              <span style={{ color: theme.green, fontSize: 44 }}>✓</span>
              <span>{c}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 80,
          fontFamily: theme.fontMono,
          fontSize: 30,
          color: theme.dim,
          opacity: spring({
            frame: frame - 80,
            fps,
            config: { damping: 200 },
            durationInFrames: 30,
          }),
        }}
      >
        gactl-tutorial · module-02-evaluators
      </div>
    </Page>
  );
};
