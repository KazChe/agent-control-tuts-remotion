import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BEATS,
  BOT_NAME,
  BOT_TAGLINE,
  CLIPS,
  deniedChat,
  leakChat,
  run1Entry,
  run2Entry,
} from "./data";
import { Callout, CtaCard } from "../../components/Cards";
import { ChatPanel } from "../../components/ChatPanel";
import { Terminal } from "../../components/Terminal";
import { UiClip } from "../../components/UiClip";

const CONSOLE_LABEL = "Galileo console";

// Customer-facing teaser: hook first, receipts last. Console beats are
// real Playwright recordings from the Splunk demo cluster; terminal beats
// replay the real captured transcripts; the SSN string is identical
// across chat, terminal, and trace.
export const AgentControlPiiTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={BEATS.chatLeak.from} durationInFrames={BEATS.chatLeak.duration}>
        <ChatPanel botName={BOT_NAME} botTagline={BOT_TAGLINE} messages={leakChat} />
        <Callout
          appearAt={20}
          hideAt={230}
          text="Your support agent answers fast. Sometimes too fast."
        />
        <Callout
          appearAt={265}
          hideAt={460}
          text="An SSN, over chat, to whoever asked. Nothing stopped it."
        />
      </Sequence>

      <Sequence from={BEATS.term1.from} durationInFrames={BEATS.term1.duration}>
        <Terminal entries={[run1Entry]} title="support-agent - zsh" />
        {/* pii leak ALLOWED prints at ~f246 */}
        <Callout
          appearAt={255}
          hideAt={378}
          text="The real agent, running: ALLOWED, SSN and all."
        />
      </Sequence>

      <Sequence
        from={BEATS.traceLeak.from}
        durationInFrames={BEATS.traceLeak.duration}
      >
        <UiClip
          src={CLIPS.traceLeak.src}
          urlLabel={CONSOLE_LABEL}
          playbackRate={CLIPS.traceLeak.rate}
        />
        <Callout
          appearAt={140}
          hideAt={290}
          text="Galileo already logs every reply. There it is, in the trace."
        />
        <Callout
          appearAt={320}
          hideAt={475}
          text="Agent Control can act on what Galileo sees."
        />
      </Sequence>

      <Sequence
        from={BEATS.createControl.from}
        durationInFrames={BEATS.createControl.duration}
      >
        <UiClip
          src={CLIPS.createControl.src}
          urlLabel={CONSOLE_LABEL}
          playbackRate={CLIPS.createControl.rate}
        />
        <Callout
          appearAt={90}
          hideAt={370}
          text="One control: a regex on the output, deny on match. Authored in the console."
        />
        <Callout appearAt={410} hideAt={580} text="No code change. No redeploy." />
      </Sequence>

      <Sequence
        from={BEATS.bindControl.from}
        durationInFrames={BEATS.bindControl.duration}
      >
        <UiClip
          src={CLIPS.bindControl.src}
          urlLabel={CONSOLE_LABEL}
          playbackRate={CLIPS.bindControl.rate}
        />
        <Callout
          appearAt={110}
          hideAt={350}
          text="Attach it to your agent stream. That is the whole rollout."
        />
      </Sequence>

      <Sequence from={BEATS.term2.from} durationInFrames={BEATS.term2.duration}>
        <Terminal entries={[run2Entry]} title="support-agent - zsh" />
        {/* BLOCKED prints at ~f240 */}
        <Callout
          appearAt={250}
          hideAt={378}
          text="Same agent, byte for byte. This time the reply never escaped."
        />
      </Sequence>

      <Sequence
        from={BEATS.traceBlocked.from}
        durationInFrames={BEATS.traceBlocked.duration}
      >
        <UiClip
          src={CLIPS.traceBlocked.src}
          urlLabel={CONSOLE_LABEL}
          playbackRate={CLIPS.traceBlocked.rate}
        />
        <Callout
          appearAt={130}
          hideAt={340}
          text="The trace now carries the control span. Receipts, not promises."
        />
      </Sequence>

      <Sequence from={BEATS.chatDeny.from} durationInFrames={BEATS.chatDeny.duration}>
        <ChatPanel
          botName={BOT_NAME}
          botTagline={BOT_TAGLINE}
          messages={deniedChat}
        />
        <Callout
          appearAt={270}
          hideAt={380}
          text="Same question. Safe answer. Full audit trail."
        />
      </Sequence>

      <Sequence from={BEATS.cta.from} durationInFrames={BEATS.cta.duration}>
        <CtaCard
          headline="Stop the leak before it ships."
          sub="Agent Control is live in your Galileo deployment today."
          action="Reply here for the hands-on walkthrough"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
