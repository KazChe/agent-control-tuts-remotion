import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  /** Seconds when the bubble appears (assistant messages then stream). */
  at: number;
  /** Show the typing indicator from this second until the bubble appears. */
  typingFrom?: number;
  /** Substring to mark with a red PII pulse once revealed. */
  highlight?: { text: string; at: number };
  /** Small tag under the bubble, e.g. "Agent Control · steer". */
  badge?: { label: string; color: string; at: number };
};

const STREAM_WPS = 16;

const Bubble: React.FC<{ msg: ChatMessage; t: number }> = ({ msg, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isUser = msg.role === "user";
  const pop = spring({
    frame: frame - msg.at * fps,
    fps,
    config: { damping: 200 },
    durationInFrames: 14,
  });

  const words = msg.text.split(" ");
  const shown = isUser
    ? words.length
    : Math.min(words.length, Math.floor((t - msg.at) * STREAM_WPS));
  const visibleText = words.slice(0, Math.max(0, shown)).join(" ");

  const hl = msg.highlight;
  const hlActive = hl !== undefined && t >= hl.at;
  const hlPulse = hl
    ? interpolate((t - hl.at) % 1.6, [0, 0.8, 1.6], [1, 0.55, 1])
    : 1;

  const renderText = () => {
    if (!hl || !hlActive || !visibleText.includes(hl.text)) {
      return visibleText;
    }
    const [before, ...rest] = visibleText.split(hl.text);
    return (
      <>
        {before}
        <span
          style={{
            background: `rgba(248, 81, 73, ${0.22 * hlPulse})`,
            borderBottom: `4px solid ${theme.red}`,
            borderRadius: 4,
            padding: "0 4px",
            fontWeight: 700,
          }}
        >
          {hl.text}
        </span>
        {rest.join(hl.text)}
      </>
    );
  };

  const badgeS =
    msg.badge === undefined
      ? 0
      : spring({
          frame: frame - msg.badge.at * fps,
          fps,
          config: { damping: 200 },
          durationInFrames: 18,
        });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        opacity: pop,
        transform: `translateY(${(1 - pop) * 18}px)`,
        marginBottom: 26,
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: "20px 28px",
          borderRadius: isUser ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
          background: isUser ? theme.accent : "#1c2434",
          color: isUser ? "#ffffff" : theme.text,
          fontSize: 31,
          lineHeight: "46px",
          fontFamily: theme.fontSans,
        }}
      >
        {renderText()}
      </div>
      {msg.badge && badgeS > 0.01 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: badgeS,
            fontFamily: theme.fontMono,
            fontSize: 21,
            color: msg.badge.color,
            border: `1px solid ${msg.badge.color}`,
            borderRadius: 999,
            padding: "6px 18px",
          }}
        >
          <span style={{ fontSize: 24 }}>🛡</span>
          {msg.badge.label}
        </div>
      )}
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "24px 30px",
        borderRadius: "22px 22px 22px 6px",
        background: "#1c2434",
        width: 120,
        marginBottom: 26,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: theme.dim,
            opacity: 0.35 + 0.65 * Math.abs(Math.sin((frame / 10 + i * 0.9) % Math.PI)),
          }}
        />
      ))}
    </div>
  );
};

export const ChatPanel: React.FC<{
  botName: string;
  botTagline: string;
  messages: ChatMessage[];
}> = ({ botName, botTagline, messages }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

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
          width: 1280,
          height: 860,
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          background: "#10182a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: theme.chrome,
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            borderBottom: `1px solid ${theme.panelBorder}`,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            💬
          </div>
          <div style={{ fontFamily: theme.fontSans }}>
            <div style={{ color: theme.text, fontSize: 27, fontWeight: 700 }}>
              {botName}
            </div>
            <div style={{ color: theme.dim, fontSize: 20 }}>{botTagline}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: theme.green,
            }}
          />
        </div>

        <div style={{ flex: 1, padding: "36px 40px", overflow: "hidden" }}>
          {messages.map((m, i) => {
            if (t < m.at) {
              const showTyping =
                m.typingFrom !== undefined && t >= m.typingFrom;
              return showTyping ? <TypingDots key={i} /> : null;
            }
            return <Bubble key={i} msg={m} t={t} />;
          })}
        </div>

        <div
          style={{
            margin: "0 40px 32px",
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 14,
            padding: "20px 26px",
            color: theme.dim,
            fontSize: 24,
            fontFamily: theme.fontSans,
          }}
        >
          Type a message...
        </div>
      </div>
    </AbsoluteFill>
  );
};
