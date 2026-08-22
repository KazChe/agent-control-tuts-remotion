import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BEATS, controls, probesEntry, setupEntry } from "./data";
import {
  Callout,
  ConceptSlide,
  OutroCard,
  TitleCard,
} from "../../components/Cards";
import { ControlStore } from "../../components/ControlStore";
import { Terminal } from "../../components/Terminal";

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

      <Sequence from={BEATS.setup.from} durationInFrames={BEATS.setup.duration}>
        <Terminal entries={[setupEntry]} />
        <Callout
          appearAt={210}
          text="Policy is authored from a script, via the API — the server object is the same one the console edits."
        />
      </Sequence>

      <Sequence
        from={BEATS.controlStore.from}
        durationInFrames={BEATS.controlStore.duration}
      >
        <ControlStore
          heading="Controls · kam7f-eval-lab"
          subtitle="Authored by setup_controls.py, the same objects the console form edits"
          controls={controls}
        />
        <Callout
          appearAt={150}
          text="The local Control Store at localhost:8000 shows all three controls — no Galileo deployment required."
        />
      </Sequence>

      <Sequence from={BEATS.probes.from} durationInFrames={BEATS.probes.duration}>
        <Terminal entries={[probesEntry]} />
        <Callout
          appearAt={225}
          hideAt={420}
          text="1b is blocked pre-stage: the agent function never even ran."
        />
        <Callout
          appearAt={450}
          hideAt={690}
          text="3a passes even though the reply contains an account ID — the AND condition needs the input branch to match too."
        />
        <Callout
          appearAt={720}
          hideAt={960}
          text="3b trips both branches: blocked post-stage — the reply was generated but never escaped."
        />
      </Sequence>

      <Sequence from={BEATS.outro.from} durationInFrames={BEATS.outro.duration}>
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};
