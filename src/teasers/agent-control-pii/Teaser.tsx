import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BEATS, BOT_NAME, BOT_TAGLINE, leakChat, steeredChat } from "./data";
import { Callout, CtaCard } from "../../components/Cards";
import { ChatPanel } from "../../components/ChatPanel";
import { GalileoSlot } from "../../components/GalileoSlot";

// Customer-facing teaser, not a tutorial: hook first, receipts last.
// The three GalileoSlot beats become UiClip recordings once console
// access is set up (swap in <UiClip src="..." urlLabel="..." />).
export const AgentControlPiiTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={BEATS.leak.from} durationInFrames={BEATS.leak.duration}>
        <ChatPanel botName={BOT_NAME} botTagline={BOT_TAGLINE} messages={leakChat} />
        <Callout
          appearAt={20}
          hideAt={230}
          text="Your support agent answers fast. Sometimes too fast."
        />
        {/* PII highlight pulses at ~f246 */}
        <Callout
          appearAt={270}
          hideAt={580}
          text="That account number just left the building. Nothing stopped it."
        />
      </Sequence>

      <Sequence
        from={BEATS.traceLeak.from}
        durationInFrames={BEATS.traceLeak.duration}
      >
        <GalileoSlot
          label="The leak, in your traces"
          detail="Galileo trace view: the assistant's reply with the account number in the output span."
        />
        <Callout
          appearAt={60}
          hideAt={258}
          text="Galileo already sees every reply. Agent Control can act on them."
        />
      </Sequence>

      <Sequence
        from={BEATS.createControl.from}
        durationInFrames={BEATS.createControl.duration}
      >
        <GalileoSlot
          label="Creating the control"
          detail="Console click-through: new control, account-number pattern on the output, steer action with guidance. Played back at 2x."
        />
        <Callout
          appearAt={90}
          hideAt={438}
          text="One control, authored in the console. No code change, no redeploy."
        />
      </Sequence>

      <Sequence from={BEATS.steered.from} durationInFrames={BEATS.steered.duration}>
        <ChatPanel
          botName={BOT_NAME}
          botTagline={BOT_TAGLINE}
          messages={steeredChat}
        />
        {/* badge appears at ~f288 */}
        <Callout
          appearAt={300}
          hideAt={438}
          text="Same agent. Same question. The control steered it to a safe answer."
        />
      </Sequence>

      <Sequence
        from={BEATS.traceReceipt.from}
        durationInFrames={BEATS.traceReceipt.duration}
      >
        <GalileoSlot
          label="The receipt"
          detail="Project, trace, control span: the steered call recorded with control name, action, and matched condition."
        />
        <Callout
          appearAt={70}
          hideAt={288}
          text="Every decision lands in the trace. Compliance gets receipts, not promises."
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
