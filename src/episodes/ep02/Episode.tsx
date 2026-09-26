import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BEATS, CLIPS, CONTROL_NAME, S1, S2, S3, S4, S5, S6, exfilCard, probeA, probeB,
  LEAD,
} from "./data";
import { ActionsList } from "../../components/ActionsList";
import { Callout } from "../../components/Cards";
import { ConditionCard } from "../../components/ConditionCard";
import { ControlCard } from "../../components/ControlCard";
import { LeafCondition } from "../../components/LeafCondition";
import { SceneHeading } from "../../components/SceneHeading";
import { StageStrip } from "../../components/StageStrip";
import { Terminal } from "../../components/Terminal";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);

// Episode 2 of the Agent Control series: the anatomy of a control. Scope,
// condition, action, with the module 02 composite control as the worked case.
export const Ep02AnatomyOfAControl: React.FC = () => {
  const [s1, s2, s3, s4, s5, s6] = BEATS.scenes;
  const clip = (i: number) => (
    <Sequence from={f(LEAD[i])} durationInFrames={f(CLIPS[i].seconds + 0.5)}>
      <Audio src={staticFile(CLIPS[i].file)} />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={s1.from} durationInFrames={s1.duration}>
        {clip(0)}
        <ControlCard name={CONTROL_NAME} times={S1} appearAt={0.3} />
        <Callout appearAt={f(S1.callout)} text="Control = Scope + Condition + Action" />
      </Sequence>

      <Sequence from={s2.from} durationInFrames={s2.duration}>
        {clip(1)}
        <StageStrip times={S2} />
        <SceneHeading
          eyebrow="SCOPE"
          title="One request, from arrival to result"
          intent="The points along the way where a control can watch it, and what a deny does at each."
        />
        <Callout appearAt={f(S2.callout)} text="Scope names the step type, the step name, and the stage." />
      </Sequence>

      <Sequence from={s3.from} durationInFrames={s3.duration}>
        {clip(2)}
        <LeafCondition times={S3} />
        <SceneHeading
          eyebrow="CONDITION"
          title="One leaf: a selector and an evaluator"
          intent="Pick a piece of the step, judge it, get back matched, confidence, and a message."
        />
        <Callout appearAt={f(S3.callout)} text="Matched means the condition holds. The action decides what happens." />
      </Sequence>

      <Sequence from={s4.from} durationInFrames={s4.duration}>
        {clip(3)}
        <Terminal entries={[probeA, probeB]} title="gactl-tutorial - zsh" fontSize={24} width={1180} left={70} />
        <ConditionCard
          {...exfilCard}
          appearAt={f(S4.card)}
          checkpoints={[
            { at: f(S4.quiet), states: ["miss", "hit"] },
            { at: f(S4.blocked), states: ["hit", "hit"], fired: true },
          ]}
          right={60}
          width={600}
        />
        <Callout appearAt={f(S4.nodes)} text="and, or, not. Not is how you write an exemption." />
      </Sequence>

      <Sequence from={s5.from} durationInFrames={s5.duration}>
        {clip(4)}
        <ActionsList times={S5} />
        <SceneHeading
          eyebrow="ACTION"
          title="What happens on a match"
          intent="Three choices, and one rule for when several controls match at once."
        />
      </Sequence>

      <Sequence from={s6.from} durationInFrames={s6.duration}>
        {clip(5)}
        <ControlCard name={CONTROL_NAME} times={S6} />
        <Callout appearAt={f(S6.next)} text="next: what happens on the wire when a step runs" />
      </Sequence>
    </AbsoluteFill>
  );
};
