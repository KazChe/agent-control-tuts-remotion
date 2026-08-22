import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  BEATS,
  exampleControl,
  probes1Entry,
  probes3aEntry,
  probes3aHistory,
  probes3bEntry,
  probes3bHistory,
  setupEntry,
} from "./data";

const exfilCard = {
  title: "kam7f-account-id-exfiltration",
  meta: "post stage · deny · both branches must match",
  operator: "AND",
  branches: [
    {
      label: "input",
      detail: 'contains "forward this" | "external" | "share with"',
    },
    { label: "output", detail: "matches \\bACCT-\\d{6}\\b" },
  ],
};
import {
  Callout,
  ConceptSlide,
  OutroCard,
  TitleCard,
} from "../../components/Cards";
import { ConditionCard } from "../../components/ConditionCard";
import { ControlForm } from "../../components/ControlForm";
import { Terminal } from "../../components/Terminal";
import { UiClip } from "../../components/UiClip";

export const Module02Teaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={BEATS.title.from} durationInFrames={BEATS.title.duration}>
        <TitleCard
          eyebrow="Agent Control · local OSS server"
          title="Module 02"
          subtitle="Evaluators, selectors & conditions"
        />
      </Sequence>

      <Sequence from={BEATS.concept.from} durationInFrames={BEATS.concept.duration}>
        <ConceptSlide />
      </Sequence>

      <Sequence
        from={BEATS.controlForm.from}
        durationInFrames={BEATS.controlForm.duration}
      >
        <ControlForm control={exampleControl} />
        <Callout
          appearAt={140}
          text="The Agent Control UI's Edit Control form: select the input, judge it against a list, deny on match. The setup script creates three of these."
        />
      </Sequence>

      <Sequence from={BEATS.setup.from} durationInFrames={BEATS.setup.duration}>
        <Terminal entries={[setupEntry]} />
        <Callout
          appearAt={210}
          text="The same control, authored from a script via the API. The server object is identical either way."
        />
      </Sequence>

      <Sequence
        from={BEATS.uiWalkthrough.from}
        durationInFrames={BEATS.uiWalkthrough.duration}
      >
        <UiClip src="ui-walkthrough.mp4" urlLabel="localhost:8000 - Agent Control" />
        <Callout
          appearAt={110}
          hideAt={280}
          text="The real console: our agent, with the three controls the script just created."
        />
        <Callout
          appearAt={330}
          text="Opening one of them shows the same Edit Control form, live, with no Galileo deployment required."
        />
      </Sequence>

      {/* The probe run is three beats, one per teaching moment. Each
          beat's card/callout timings are local to that beat's frame 0,
          so they cannot drift against a long scrolling timeline. Later
          beats receive the earlier lines as instantly rendered history.
          Local line timings per beat come from buildTimeline: with a
          command, output starts ~f68; without one, ~f31. */}
      <Sequence from={BEATS.probes1.from} durationInFrames={BEATS.probes1.duration}>
        <Terminal entries={[probes1Entry]} />
        {/* 1b BLOCKED prints at ~f247 */}
        <Callout
          appearAt={255}
          hideAt={348}
          text="1b is blocked pre-stage: the agent function never even ran."
        />
      </Sequence>

      <Sequence
        from={BEATS.probes3a.from}
        durationInFrames={BEATS.probes3a.duration}
      >
        <Terminal history={probes3aHistory} entries={[probes3aEntry]} />
        {/* 3a header ~f49, ALLOWED ~f94 */}
        <ConditionCard
          {...exfilCard}
          appearAt={49}
          hideAt={318}
          checkpoints={[{ at: 104, states: ["miss", "hit"] }]}
        />
        <Callout
          appearAt={112}
          hideAt={318}
          text="3a passes even though the reply contains an account ID: the AND condition needs the input branch to match too."
        />
      </Sequence>

      <Sequence
        from={BEATS.probes3b.from}
        durationInFrames={BEATS.probes3b.duration}
      >
        <Terminal history={probes3bHistory} entries={[probes3bEntry]} />
        {/* 3b header ~f49, BLOCKED ~f98 */}
        <ConditionCard
          {...exfilCard}
          appearAt={8}
          hideAt={408}
          checkpoints={[{ at: 108, states: ["hit", "hit"], fired: true }]}
        />
        <Callout
          appearAt={118}
          hideAt={408}
          text="3b trips both branches: blocked post-stage, so the reply was generated but never escaped."
        />
      </Sequence>

      <Sequence from={BEATS.outro.from} durationInFrames={BEATS.outro.duration}>
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};
