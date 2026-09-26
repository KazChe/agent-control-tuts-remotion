import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BEATS, CLIPS, LEAD, S1, S2, S3, S4, S5, S6, S7 } from "./data";
import { Callout } from "../../components/Cards";
import { LaneDiagram } from "../../components/LaneDiagram";
import { SceneHeading } from "../../components/SceneHeading";
import { theme } from "../../theme";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["Register once.", "Ask before, ask after.", "Block when it cannot judge.", "Refresh on a timer."];
  return (
    <div style={{ position: "absolute", left: 100, top: 400, width: 800, fontFamily: theme.fontSans }}>
      {items.map((s, i) => {
        const a = spring({ frame: frame - S7.lines[i] * fps, fps, config: { damping: 200 }, durationInFrames: 22 });
        return (
          <div key={s} style={{ fontSize: 40, color: theme.text, lineHeight: "70px", opacity: a, transform: `translateX(${(1 - a) * 30}px)`, textAlign: "center" }}>
            {s}
          </div>
        );
      })}
    </div>
  );
};

// Episode 3 of the Agent Control series: the request flow. Seven scenes on
// the two-lane diagram, agent process on the left, server on the right.
export const Ep03RequestFlow: React.FC = () => {
  const [s1, s2, s3, s4, s5, s6, s7] = BEATS.scenes;
  const clip = (i: number) => (
    <Sequence from={f(LEAD[i])} durationInFrames={f(CLIPS[i].seconds + 0.5)}>
      <Audio src={staticFile(CLIPS[i].file)} />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <Sequence from={s1.from} durationInFrames={s1.duration}>
        {clip(0)}
        <LaneDiagram mode="intro" times={S1} />
        <SceneHeading eyebrow="REQUEST FLOW" title="Two lanes, two moments" intent="What lives where, and when traffic crosses the line." />
        <Callout appearAt={f(S1.callout)} text="Once at startup. Twice per call, before and after." />
      </Sequence>

      <Sequence from={s2.from} durationInFrames={s2.duration}>
        {clip(1)}
        <LaneDiagram mode="call" times={S2} />
        <SceneHeading eyebrow="REQUEST FLOW" title="One call, in order" intent="Pre controls, the function, post controls. A deny at either point stops the rest." />
        <Callout appearAt={f(S2.callout)} text="Two round trips per call. The agent's code knows about neither." />
      </Sequence>

      <Sequence from={s3.from} durationInFrames={s3.duration}>
        {clip(2)}
        <LaneDiagram mode="execution" times={S3} />
        <SceneHeading eyebrow="REQUEST FLOW" title="Where the evaluator runs" intent="Server by default. SDK when the judging needs something only the agent has." />
        <Callout appearAt={f(S3.callout)} text="The control stays on the server. Only the judging moves." />
      </Sequence>

      <Sequence from={s4.from} durationInFrames={s4.duration}>
        {clip(3)}
        <LaneDiagram mode="failure" times={S4} />
        <SceneHeading eyebrow="REQUEST FLOW" title="When things fail" intent="An unreachable server or a broken evaluator blocks the call. It is never waved through." />
      </Sequence>

      <Sequence from={s5.from} durationInFrames={s5.duration}>
        {clip(4)}
        <LaneDiagram mode="timeouts" times={S5} />
        <SceneHeading eyebrow="REQUEST FLOW" title="The three timeouts" intent="On the control, on the server, and in the SDK. Each bounds a different wait." />
        <Callout appearAt={f(S5.callout)} text="Set the first per control. Keep all three shorter than the agent can afford to wait." />
      </Sequence>

      <Sequence from={s6.from} durationInFrames={s6.duration}>
        {clip(5)}
        <LaneDiagram mode="refresh" times={S6} />
        <SceneHeading eyebrow="REQUEST FLOW" title="Policy without a deploy" intent="Controls are fetched at startup and refreshed on an interval." />
        <Callout appearAt={f(S6.callout)} text="Change the control on the server. The running agent picks it up." />
      </Sequence>

      <Sequence from={s7.from} durationInFrames={s7.duration}>
        {clip(6)}
        <LaneDiagram mode="close" times={S7} />
        <Recap />
        <SceneHeading eyebrow="REQUEST FLOW" title="What crosses the line" intent="Four things per agent, and one more that lands next to the trace." />
        <Callout appearAt={f(S7.next)} text="next: what a control can see when it looks at a step" />
      </Sequence>
    </AbsoluteFill>
  );
};
