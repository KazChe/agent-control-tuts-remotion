import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BEATS,
  setupEntry,
  transfer1Entry,
  transfer2Entry,
  transfer2History,
  transfer3Entry,
  transfer3History,
} from "./data";
import {
  Callout,
  ConceptSlide,
  OutroCard,
  TitleCard,
} from "../../components/Cards";
import { ConditionCard } from "../../components/ConditionCard";
import { Terminal } from "../../components/Terminal";
import { theme } from "../../theme";

const STEP_META = "pre stage · tool step: process_wire_transfer";

export const Module03Teaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={BEATS.title.from} durationInFrames={BEATS.title.duration}>
        <TitleCard
          eyebrow="Agent Control · local OSS server"
          title="Module 03"
          subtitle="Actions: observe, deny, steer"
        />
      </Sequence>

      <Sequence from={BEATS.concept.from} durationInFrames={BEATS.concept.duration}>
        <ConceptSlide
          heading="One condition machinery, three actions"
          boxes={[
            { label: "OBSERVE", desc: "record, don't interfere", color: theme.green },
            { label: "DENY", desc: "stop the call", color: theme.red },
            { label: "STEER", desc: "correct and retry", color: theme.amber },
          ]}
          formulaPlain="same selector + evaluator, different action"
          formulaAccent="= three different consequences"
        />
      </Sequence>

      <Sequence from={BEATS.setup.from} durationInFrames={BEATS.setup.duration}>
        <Terminal entries={[setupEntry]} />
        {/* Setup complete prints at ~f169 */}
        <Callout
          appearAt={185}
          hideAt={468}
          text="Three controls on the same wire-transfer tool step. Only the action differs."
        />
      </Sequence>

      {/* One beat per transfer; annotations timed from each beat's frame 0.
          With a typed command, output starts ~f70; without one, ~f31. */}
      <Sequence
        from={BEATS.transfer1.from}
        durationInFrames={BEATS.transfer1.duration}
      >
        <Terminal entries={[transfer1Entry]} />
        {/* header f101, COMPLETED f134 */}
        <ConditionCard
          title="kam7f-audit-new-recipient"
          meta={`observe · ${STEP_META}`}
          operator="IF"
          branches={[
            {
              label: "input",
              detail: 'recipient_name not in ["Jane Smith", "Payroll Inc"]',
            },
          ]}
          appearAt={104}
          checkpoints={[{ at: 144, states: ["hit"], fired: true }]}
          firedText="matched → recorded only, transfer proceeds"
          firedColor={theme.green}
        />
        <Callout
          appearAt={152}
          hideAt={378}
          text="Observe: the control matched a new recipient and recorded it. Nothing was blocked."
        />
      </Sequence>

      <Sequence
        from={BEATS.transfer2.from}
        durationInFrames={BEATS.transfer2.duration}
      >
        <Terminal history={transfer2History} entries={[transfer2Entry]} />
        {/* header f49, DENIED f82 */}
        <ConditionCard
          title="kam7f-deny-sanctioned-countries"
          meta={`deny · ${STEP_META}`}
          operator="IF"
          branches={[
            {
              label: "input",
              detail: "destination_country in [North Korea, Iran, Syria, Cuba]",
            },
          ]}
          appearAt={49}
          checkpoints={[{ at: 92, states: ["hit"], fired: true }]}
          firedText="matched → denied: the tool never ran"
        />
        <Callout
          appearAt={100}
          hideAt={378}
          text="Deny: a sanctioned destination stops the transfer before the tool executes."
        />
      </Sequence>

      <Sequence
        from={BEATS.transfer3.from}
        durationInFrames={BEATS.transfer3.duration}
      >
        <Terminal history={transfer3History} entries={[transfer3Entry]} />
        {/* header f49, STEERED f82, 2FA prompt f133, COMPLETED f196 */}
        <ConditionCard
          title="kam7f-steer-large-transfer-2fa"
          meta={`steer · ${STEP_META}`}
          operator="IF"
          branches={[
            { label: "input", detail: "amount >= $10,000 without verified_2fa" },
          ]}
          appearAt={49}
          checkpoints={[
            { at: 88, states: ["hit"], fired: true },
            { at: 206, states: ["miss"] },
          ]}
          firedText="matched → steer: guidance sent back to the agent"
          firedColor={theme.amber}
        />
        <Callout
          appearAt={95}
          hideAt={195}
          text="Steer: the typed exception carries what to fix: verify_2fa."
        />
        <Callout
          appearAt={212}
          hideAt={545}
          text="The agent corrected its own request and retried. Deny stops an agent; steer teaches it."
        />
      </Sequence>

      <Sequence from={BEATS.outro.from} durationInFrames={BEATS.outro.duration}>
        <OutroCard
          checks={[
            "3 controls on one tool step, one per action",
            "COMPLETED · DENIED · STEERED, then COMPLETED",
            "steer: the agent fixed its own request and retried",
          ]}
          footer="gactl-tutorial · module-03-actions"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
