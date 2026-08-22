import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type TermLine = {
  text: string;
  /** Seconds to wait before this line appears (defaults to a small gap). */
  delay?: number;
};

export type TermEntry = {
  command: string;
  lines: TermLine[];
  /** Seconds of idle prompt before typing starts. */
  prePause?: number;
};

const CHARS_PER_SEC = 28;
const CMD_PAUSE = 0.6;
const DEFAULT_LINE_GAP = 0.14;

const FONT_SIZE = 30;
const LINE_HEIGHT = 46;
const MAX_LINES = 15;

type TimedItem =
  | { kind: "cmd"; text: string; start: number; end: number }
  | { kind: "out"; text: string; at: number };

const buildTimeline = (entries: TermEntry[]): TimedItem[] => {
  const items: TimedItem[] = [];
  let t = 0.5;
  for (const entry of entries) {
    t += entry.prePause ?? 0.4;
    const typeDur = entry.command.length / CHARS_PER_SEC;
    items.push({ kind: "cmd", text: entry.command, start: t, end: t + typeDur });
    t += typeDur + CMD_PAUSE;
    for (const line of entry.lines) {
      t += line.delay ?? DEFAULT_LINE_GAP;
      items.push({ kind: "out", text: line.text, at: t });
    }
  }
  return items;
};

const lineColor = (
  text: string,
): { color: string; bold?: boolean; italic?: boolean } => {
  if (text.trimStart().startsWith("»")) return { color: theme.dim, italic: true };
  if (text.includes("ALLOWED")) return { color: theme.green };
  if (text.includes("BLOCKED") || text.includes("DENIED"))
    return { color: theme.red, bold: true };
  if (text.includes("STEERED")) return { color: theme.amber, bold: true };
  if (text.trimStart().startsWith("---")) return { color: theme.cyan, bold: true };
  if (text.startsWith("Setup complete") || text.startsWith("Done."))
    return { color: theme.green };
  return { color: theme.text };
};

export const Terminal: React.FC<{
  entries: TermEntry[];
  title?: string;
}> = ({ entries, title = "gactl-tutorial - zsh" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const timeline = useMemo(() => buildTimeline(entries), [entries]);

  const rendered: React.ReactNode[] = [];
  let lineCount = 0;
  let anyTyping = false;

  timeline.forEach((item, i) => {
    if (item.kind === "cmd") {
      if (t < item.start) return;
      const done = t >= item.end;
      const chars = done
        ? item.text.length
        : Math.floor(((t - item.start) / (item.end - item.start)) * item.text.length);
      if (!done) anyTyping = true;
      lineCount++;
      rendered.push(
        <div key={i} style={{ height: LINE_HEIGHT, whiteSpace: "pre" }}>
          <span style={{ color: theme.accent, fontWeight: 700 }}>{"❯ "}</span>
          <span style={{ color: theme.text }}>{item.text.slice(0, chars)}</span>
          {!done && <Cursor />}
        </div>,
      );
    } else {
      if (t < item.at) return;
      const { color, bold, italic } = lineColor(item.text);
      lineCount++;
      rendered.push(
        <div
          key={i}
          style={{
            height: LINE_HEIGHT,
            whiteSpace: "pre",
            color,
            fontWeight: bold ? 700 : 400,
            fontStyle: italic ? "italic" : "normal",
          }}
        >
          {item.text || " "}
        </div>,
      );
    }
  });

  const showIdlePrompt = !anyTyping && lineCount > 0;
  const totalLines = lineCount + (showIdlePrompt ? 1 : 0);
  const scroll = Math.max(0, totalLines - MAX_LINES) * LINE_HEIGHT;

  return (
    <AbsoluteFill
      style={{
        background: theme.pageBg,
        justifyContent: "center",
        alignItems: "center",
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
            height: 56,
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
              textAlign: "center",
              color: theme.dim,
              fontFamily: theme.fontSans,
              fontSize: 22,
            }}
          >
            {title}
          </div>
          <div style={{ width: 68 }} />
        </div>
        <div
          style={{
            background: theme.panel,
            padding: "24px 36px",
            fontFamily: theme.fontMono,
            fontSize: FONT_SIZE,
          }}
        >
          {/* Viewport clips at the content box, so a scrolled-off line can
              never bleed into the padding area above it. */}
          <div style={{ height: MAX_LINES * LINE_HEIGHT, overflow: "hidden" }}>
            <div style={{ transform: `translateY(${-scroll}px)` }}>
              {rendered}
              {showIdlePrompt && (
                <div style={{ height: LINE_HEIGHT }}>
                  <span style={{ color: theme.accent, fontWeight: 700 }}>
                    {"❯ "}
                  </span>
                  <Cursor />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 16) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: FONT_SIZE,
        marginLeft: 2,
        verticalAlign: "text-bottom",
        background: visible ? theme.text : "transparent",
      }}
    />
  );
};
