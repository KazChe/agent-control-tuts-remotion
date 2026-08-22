import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BEATS, exampleControl, probesEntry, setupEntry } from "./data";
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

      <Sequence from={BEATS.probes.from} durationInFrames={BEATS.probes.duration}>
        <Terminal entries={[probesEntry]} />
        {/* Terminal line timings from buildTimeline in Terminal.tsx:
            1b result f247, 3a header f317, 3a result f362, 3b header f492,
            3b result f542. Card and callout events sit a few frames after
            the lines they annotate. */}
        <ConditionCard
          title="kam7f-account-id-exfiltration"
          meta="post stage · deny · both branches must match"
          operator="AND"
          branches={[
            {
              label: "input",
              detail: 'contains "forward this" | "external" | "share with"',
            },
            { label: "output", detail: "matches \\bACCT-\\d{6}\\b" },
          ]}
          appearAt={322}
          hideAt={1090}
          checkpoints={[
            { at: 372, states: ["miss", "hit"] },
            { at: 497, states: ["idle", "idle"] },
            { at: 550, states: ["hit", "hit"], fired: true },
          ]}
        />
        <Callout
          appearAt={260}
          hideAt={315}
          text="1b is blocked pre-stage: the agent function never even ran."
        />
        <Callout
          appearAt={378}
          hideAt={487}
          text="3a passes even though the reply contains an account ID: the AND condition needs the input branch to match too."
        />
        <Callout
          appearAt={562}
          hideAt={950}
          text="3b trips both branches: blocked post-stage, so the reply was generated but never escaped."
        />
      </Sequence>

      <Sequence from={BEATS.outro.from} durationInFrames={BEATS.outro.duration}>
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};
