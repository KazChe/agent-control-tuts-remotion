import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BEATS, CLIPS, LEAD, S1, S2, S3, S4, S4_done, S5, S6,
  CODE_ATTR, CODE_CONTEXT, CODE_FRAMEWORK, CODE_LATEST, CODE_LLM_FN, CODE_PLAIN, CODE_REVERSED, CODE_TOOL_FN,
  PARAM_NAMES, cardA, cardB, contextStep, llmInput, llmStep, runEntry, toolInput, toolStep,
} from "./data";
import { Callout } from "../../components/Cards";
import { CodeCard } from "../../components/CodeCard";
import { ConditionCard } from "../../components/ConditionCard";
import { SceneHeading } from "../../components/SceneHeading";
import { StepCard } from "../../components/StepCard";
import { Terminal } from "../../components/Terminal";
import { theme } from "../../theme";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);

const Badge: React.FC<{ text: string; color: string; at: number; left: number; top: number }> = ({ text, color, at, left, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at * fps, fps, config: { damping: 200 }, durationInFrames: 18 });
  return (
    <div style={{ position: "absolute", left, top, fontFamily: theme.fontMono, fontSize: 21, color, border: `1px solid ${color}`, background: "rgba(13,17,23,0.95)", borderRadius: 999, padding: "6px 16px", opacity: s, transform: `translateY(${(1 - s) * 10}px)`, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: theme.pageBg }}>{children}</AbsoluteFill>
);

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["Choose the step type on purpose.", "Put identity where a selector can reach it.", "When the decorator cannot see it, pass it as context."];
  return (
    <AbsoluteFill style={{ background: theme.pageBg, justifyContent: "center", alignItems: "center", fontFamily: theme.fontSans }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {items.map((s, i) => {
          const a = spring({ frame: frame - S6.lines[i] * fps, fps, config: { damping: 200 }, durationInFrames: 24 });
          return (
            <div key={s} style={{ fontSize: 48, color: theme.text, opacity: a, transform: `translateX(${(1 - a) * 40}px)` }}>
              <span style={{ color: theme.cyan, fontWeight: 800 }}>{i + 1}</span>  {s}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Episode 4 of the Agent Control series: what a control can see.
export const Ep04WhatAControlCanSee: React.FC = () => {
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
        <Page>
          <StepCard title="the step for a model call · type llm" lines={llmStep} left={120} top={420} width={800} appearAt={0.6} />
          <StepCard title="the step for a tool call · type tool" lines={toolStep} left={1000} top={420} width={800} appearAt={0.9} />
        </Page>
        <SceneHeading eyebrow="STEPS" title="The step" intent="The object the SDK builds from one decorated call and sends to the server to be judged. Not a trace." />
        <Callout appearAt={f(S1.callout)} text="A selector can only reach what is in the step." />
      </Sequence>

      <Sequence from={s2.from} durationInFrames={s2.duration}>
        {clip(1)}
        <Page>
          <CodeCard title="plain" lines={CODE_PLAIN} left={100} top={310} width={800} appearAt={f(S2.plain)} fontSize={19} />
          <Badge text="llm step · draft_reply" color={theme.amber} at={S2.llmBadge} left={120} top={478} />
          <CodeCard title="a name attribute on the function" lines={CODE_ATTR} left={100} top={545} width={800} appearAt={f(S2.attr)} fontSize={18} highlights={{ 3: { at: f(S2.toolBadge), color: theme.purple } }} />
          <Badge text="tool step · issue_refund" color={theme.purple} at={S2.toolBadge} left={120} top={785} />
          <CodeCard title="the latest SDK says it outright" lines={CODE_LATEST} left={100} top={850} width={800} appearAt={f(S2.latest)} fontSize={18} />
          <CodeCard title="framework decorator inside, @control() outside" lines={CODE_FRAMEWORK} left={960} top={310} width={860} appearAt={f(S2.framework)} fontSize={18} highlights={{ 1: { at: f(S2.order), color: theme.purple } }} />
          <Badge text="tool step · issue_refund, the framework's name" color={theme.purple} at={S2.frameworkBadge} left={980} top={505} />
          <CodeCard title="the other way round" lines={CODE_REVERSED} left={960} top={570} width={860} appearAt={f(S2.reversed)} fontSize={18} highlights={{ 1: { at: f(S2.reversedBadge), color: theme.amber } }} />
          <Badge text="llm step · a plain function, as far as @control() can see" color={theme.amber} at={S2.reversedBadge} left={980} top={765} />
          <Badge text="LangChain · Google ADK · CrewAI · AWS Strands" color={theme.cyan} at={S2.frameworks} left={980} top={850} />
        </Page>
        <SceneHeading eyebrow="STEPS" title="How a function becomes a step" intent="Plain means model step. A name on the function means tool step. Order of decorators matters." />
      </Sequence>

      <Sequence from={s3.from} durationInFrames={s3.duration}>
        {clip(2)}
        <Page>
          <CodeCard title="model step" lines={CODE_LLM_FN} left={100} top={320} width={820} appearAt={f(S3.llm)} fontSize={20} highlights={{ 1: { at: f(S3.picks), color: theme.green } }} />
          <Badge text={PARAM_NAMES} color={theme.cyan} at={S3.names} left={120} top={485} />
          <StepCard title="the step the SDK built" lines={llmInput} left={100} top={540} width={820} appearAt={S3.llm} />
          <CodeCard title="tool step" lines={CODE_TOOL_FN} left={1000} top={320} width={820} appearAt={f(S3.tool)} fontSize={20} />
          <StepCard title="the step the SDK built" lines={toolInput} left={1000} top={560} width={820} appearAt={S3.tool} fontSize={21} />
          <Badge text="input.user_id · input.amount · input.order_id" color={theme.green} at={S3.path} left={1020} top={960} />
        </Page>
        <SceneHeading eyebrow="STEPS" title="What input looks like" intent="A model step keeps one string. A tool step keeps the whole argument dictionary." />
        <Callout appearAt={f(S3.callout)} text="Same function shape, two very different steps." />
      </Sequence>

      <Sequence from={s4.from} durationInFrames={s4.duration}>
        {clip(3)}
        <Terminal entries={[runEntry]} title="gactl-tutorial - zsh" fontSize={22} width={1180} left={70} />
        <ConditionCard
          {...cardA}
          appearAt={f(S4.cardA)}
          hideAt={f(S4.cardB)}
          checkpoints={[{ at: f(S4.fireA), states: ["hit", "hit"], fired: true }]}
          right={60}
          width={600}
        />
        <ConditionCard
          {...cardB}
          appearAt={f(S4.cardB)}
          checkpoints={[{ at: f(S4.empty), states: ["hit", "miss"] }]}
          right={60}
          width={600}
          firedColor={theme.amber}
        />
        <Callout appearAt={f(S4.empty)} hideAt={f(S4.run - 0.5)} text="input.user_id resolves to nothing. The list evaluator answers: empty input, control ignored. The and never fires." />
        <Callout appearAt={f(S4_done)} text="A2 blocked. B1 allowed. Same user, same intent, different step type." />
      </Sequence>

      <Sequence from={s5.from} durationInFrames={s5.duration}>
        {clip(4)}
        <Page>
          <CodeCard title="call the evaluation yourself" lines={CODE_CONTEXT} left={100} top={340} width={880} appearAt={f(S5.call)} fontSize={21} highlights={{ 3: { at: f(S5.context), color: theme.green } }} />
          <StepCard title="the step, with context" lines={contextStep} left={1040} top={340} width={780} appearAt={S5.call} />
          <Badge text="selector path: context.user_id" color={theme.green} at={S5.path} left={1060} top={760} />
          <Badge text="works on any step type" color={theme.cyan} at={S5.works} left={120} top={700} />
        </Page>
        <SceneHeading eyebrow="STEPS" title="Context" intent="Hand the control what the decorator cannot see." />
        <Callout appearAt={f(S5.jev)} text="This is how the tool-gate experiment gave Jev the whole conversation to judge." />
      </Sequence>

      <Sequence from={s6.from} durationInFrames={s6.duration}>
        {clip(5)}
        <Closing />
        <SceneHeading eyebrow="STEPS" title="A control sees what the step carries" intent="Nothing more." />
        <Callout appearAt={f(S6.next)} text="next: the evaluators themselves" />
      </Sequence>
    </AbsoluteFill>
  );
};
