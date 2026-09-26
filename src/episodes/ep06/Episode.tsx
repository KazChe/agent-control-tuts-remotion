import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BEATS, CLIPS, LEAD, S1, S2, S3, S3_mount, S4, S5, S6,
  CODE_ADK, CODE_HANDLER, CODE_LANGCHAIN, CODE_LANGGRAPH, CODE_STRANDS, CODE_TOOL, CONTROLS,
  denyCard, history34, observeCard, transfer3, transfers12,
} from "./data";
import { ActionsList } from "../../components/ActionsList";
import { Badge } from "../../components/Badge";
import { Callout } from "../../components/Cards";
import { CodeCard } from "../../components/CodeCard";
import { ConditionCard } from "../../components/ConditionCard";
import { SceneHeading } from "../../components/SceneHeading";
import { Terminal } from "../../components/Terminal";
import { theme } from "../../theme";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);
const ACTION_COLOR: Record<string, string> = { observe: theme.green, deny: theme.red, steer: theme.amber };

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: theme.pageBg }}>{children}</AbsoluteFill>
);

// One control drawn as name, scope, condition, action, with the condition and
// any extra lines arriving on their own words. Used for scene 2.
const ControlSummary: React.FC<{
  title: string;
  scope: string;
  condition: string[];
  action: string;
  at: number;
  condAt: number;
  extra?: string[];
  extraAt?: number;
  left: number;
}> = ({ title, scope, condition, action, at, condAt, extra, extraAt, left }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (sec: number | undefined) =>
    sec === undefined ? 0 : spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 20 });
  const inS = sp(at);
  const cond = sp(condAt);
  const ex = sp(extraAt);
  const color = ACTION_COLOR[action];
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 290,
        width: 560,
        opacity: inS,
        transform: `translateY(${(1 - inS) * 16}px)`,
        background: "rgba(13,17,23,0.94)",
        border: `2px solid ${color}`,
        borderRadius: 16,
        padding: "18px 22px",
        fontFamily: theme.fontMono,
        boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ color: theme.text, fontSize: 21, fontWeight: 700 }}>{title}</div>
      <div style={{ color: theme.dim, fontSize: 17, marginTop: 4 }}>{scope}</div>
      <div style={{ marginTop: 14, opacity: cond, transform: `translateX(${(1 - cond) * 12}px)` }}>
        <div style={{ color: theme.purple, fontSize: 15, letterSpacing: 3 }}>CONDITION</div>
        {condition.map((l, i) => (
          <div key={i} style={{ color: i === 0 ? theme.cyan : theme.text, fontSize: 17, lineHeight: "26px", whiteSpace: "pre" }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, opacity: cond }}>
        <div style={{ color: theme.red, fontSize: 15, letterSpacing: 3 }}>ACTION</div>
        <div style={{ color, fontSize: 22, fontWeight: 800, border: `1px solid ${color}`, borderRadius: 999, padding: "2px 14px" }}>{action}</div>
      </div>
      {extra && (
        <div style={{ marginTop: 10, opacity: ex }}>
          {extra.map((l, i) => (
            <div key={i} style={{ color: i === 0 ? theme.amber : theme.text, fontSize: 15, lineHeight: "23px", whiteSpace: "pre" }}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ text: string; color: string; at: number; left: number; top: number; width?: number }> = ({ text, color, at, left, top, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at * fps, fps, config: { damping: 200 }, durationInFrames: 20 });
  return (
    <div style={{ position: "absolute", left, top, width, fontFamily: theme.fontMono, fontSize: 26, fontWeight: 700, color, border: `2px solid ${color}`, background: "rgba(13,17,23,0.94)", borderRadius: 14, padding: "14px 22px", opacity: s, transform: `translateY(${(1 - s) * 14}px)`, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["Observe to watch.", "Deny to stop.", "Steer to correct."];
  return (
    <AbsoluteFill style={{ background: theme.pageBg, fontFamily: theme.fontSans }}>
      <div style={{ position: "absolute", left: 120, top: 300, display: "flex", flexDirection: "column", gap: 24 }}>
        {items.map((s, i) => {
          const a = spring({ frame: frame - S6.lines[i] * fps, fps, config: { damping: 200 }, durationInFrames: 24 });
          return (
            <div key={s} style={{ fontSize: 48, color: theme.text, opacity: a, transform: `translateX(${(1 - a) * 40}px)` }}>
              <span style={{ color: theme.cyan, fontWeight: 800 }}>{i + 1}</span>  {s}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 120, top: 640, color: theme.dim, fontFamily: theme.fontMono, fontSize: 20, letterSpacing: 4, opacity: spring({ frame: frame - S6.habit * fps, fps, config: { damping: 200 }, durationInFrames: 20 }) }}>
        ROLLING OUT A NEW CONTROL
      </div>
      <Chip text="observe" color={theme.green} at={S6.habit} left={120} top={690} />
      <Chip text="read what it would have done" color={theme.cyan} at={S6.read} left={330} top={690} />
      <Chip text="deny  |  steer" color={theme.red} at={S6.flip} left={870} top={690} />
    </AbsoluteFill>
  );
};

// Episode 6 of the Agent Control series: actions, and the steer loop.
export const Ep06Actions: React.FC = () => {
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
        <ActionsList times={S1} />
        <SceneHeading eyebrow="ACTIONS" title="One match, three outcomes" intent="What happens after a condition matches, and the order the SDK reads several matches in." />
        <Badge text="1 · deny wins" color={theme.red} at={S1.denyWins} left={210} top={905} fontSize={22} />
        <Badge text="2 · steer" color={theme.amber} at={S1.thenSteer} left={430} top={905} fontSize={22} />
        <Badge text="3 · observe, written down" color={theme.green} at={S1.observeLog} left={600} top={905} fontSize={22} />
        <Badge text="any evaluation error · nothing runs" color={theme.dim} at={S1.error} left={980} top={905} fontSize={22} />
      </Sequence>

      <Sequence from={s2.from} durationInFrames={s2.duration}>
        {clip(1)}
        <Page>
          {CONTROLS.map((c, i) => (
            <ControlSummary key={c.title} {...c} left={100 + i * 580} />
          ))}
          <CodeCard title="the agent's tool, all of it" lines={CODE_TOOL} left={100} top={735} width={1200} appearAt={f(S2.code)} fontSize={16} />
          <Badge text="no threshold · no country list · no verification rule" color={theme.amber} at={S2.none} left={100} top={985} />
          <Badge text="all of that lives on the server" color={theme.cyan} at={S2.server} left={860} top={985} />
        </Page>
        <SceneHeading eyebrow="ACTIONS" title="One tool, three controls" intent="The banking agent's wire transfer, with an observe, a deny, and a steer control on it." />
      </Sequence>

      <Sequence from={s3.from} durationInFrames={s3.duration}>
        {clip(2)}
        <Sequence from={f(S3_mount)}>
          <Terminal entries={transfers12} title="gactl-tutorial - zsh" fontSize={20} width={1100} left={70} top={290} maxLines={12} />
        </Sequence>
        <SceneHeading eyebrow="ACTIONS" title="Observe, then deny" intent="Two transfers from the captured run. The observe match leaves no trace in the output." />
        <ConditionCard
          {...observeCard}
          appearAt={f(S3.t1)}
          checkpoints={[{ at: f(S3.obsMatched), states: ["hit"], fired: true }]}
          firedColor={theme.green}
          right={60}
          width={660}
          top={290}
        />
        <ConditionCard
          {...denyCard}
          appearAt={f(S3.t2)}
          checkpoints={[{ at: f(S3.denied), states: ["hit"], fired: true }]}
          right={60}
          width={660}
          top={560}
        />
        <Callout appearAt={f(S3.recorded)} hideAt={f(S3.t2)} text="Completed, nothing else. The match is recorded on the server. Reading that record is the evidence section." />
        <Callout appearAt={f(S3.obsAgain)} text="Both matched on this transfer. Deny wins, the run stops." />
      </Sequence>

      <Sequence from={s4.from} durationInFrames={s4.duration}>
        {clip(3)}
        <Terminal entries={transfer3} history={history34} title="gactl-tutorial - zsh" fontSize={19} width={1100} left={70} top={290} maxLines={13} />
        <SceneHeading eyebrow="ACTIONS" title="Steer, the loop" intent="The agent reads the steering context, does what it asks, and retries." />
        <CodeCard
          title="banking_agent.py · the steer handler"
          lines={CODE_HANDLER}
          right={60}
          top={270}
          width={660}
          appearAt={f(S4.raises)}
          fontSize={15}
          highlights={{
            4: { at: f(S4.raises), color: theme.amber },
            5: { at: f(S4.parses), color: theme.cyan },
            6: { at: f(S4.required), color: theme.cyan },
            8: { at: f(S4.collects), color: theme.cyan },
            10: { at: f(S4.flags), color: theme.green },
            2: { at: f(S4.again), color: theme.green },
            0: { at: f(S4.caps), color: theme.red },
          }}
        />
        <Badge text="steering_context: one string, a message" color={theme.amber} at={S4.oneString} left={1200} top={640} fontSize={19} />
        <Badge text="required_actions, retry_flags: a convention, not a schema" color={theme.dim} at={S4.convention} left={1200} top={695} fontSize={19} />
        <Badge text="MAX_RETRIES = 3" color={theme.red} at={S4.caps} left={1200} top={750} fontSize={19} />
        <Callout appearAt={f(S4.every)} hideAt={f(S4.oneString)} text="The retry is evaluated by all three controls again. Nothing matches now." />
        <Callout appearAt={f(S4.forever)} text="A steer that is never satisfied must not loop forever." />
      </Sequence>

      <Sequence from={s5.from} durationInFrames={s5.duration}>
        {clip(4)}
        <Page>
          <CodeCard title="LangChain · the docs pattern, @control() on a helper inside @tool" lines={CODE_LANGCHAIN} left={100} top={290} width={860} appearAt={f(S5.langchain)} fontSize={16} highlights={{ 0: { at: f(S5.helper), color: theme.cyan }, 8: { at: f(S5.returns), color: theme.amber }, 9: { at: f(S5.returns), color: theme.amber } }} />
          <CodeCard title="LangGraph · the repo's steer demo, a node that routes to itself" lines={CODE_LANGGRAPH} left={980} top={290} width={840} appearAt={f(S5.graph)} fontSize={15} highlights={{ 3: { at: f(S5.catches), color: theme.amber }, 6: { at: f(S5.state), color: theme.green }, 8: { at: f(S5.edge), color: theme.cyan }, 9: { at: f(S5.edge), color: theme.cyan } }} />
          <CodeCard title="Google ADK plugin" lines={CODE_ADK} left={100} top={640} width={860} appearAt={f(S5.adk)} fontSize={16} highlights={{ 1: { at: f(S5.inject), color: theme.amber }, 3: { at: f(S5.tool), color: theme.cyan } }} />
          <CodeCard title="AWS Strands handler" lines={CODE_STRANDS} left={980} top={640} width={840} appearAt={f(S5.strands)} fontSize={16} highlights={{ 3: { at: f(S5.guide), color: theme.amber } }} />
        </Page>
        <SceneHeading eyebrow="ACTIONS" title="Steer inside a framework" intent="Same server, same control, same message. Only the delivery changes." />
        <Callout appearAt={f(S5.nextTurn)} hideAt={f(S5.graph)} text="The model reads the message on its next turn." />
        <Callout appearAt={f(S5.same)} text="Same server, same control, same message. Only the delivery changes." />
      </Sequence>

      <Sequence from={s6.from} durationInFrames={s6.duration}>
        {clip(5)}
        <Closing />
        <SceneHeading eyebrow="ACTIONS" title="Watch, stop, correct" intent="And ship every new control as observe first." />
        <Callout appearAt={f(S6.server)} hideAt={f(S6.next)} text="The definition changes on the server. The agent's code does not." />
        <Callout appearAt={f(S6.next)} text="next: writing an evaluator of your own" />
      </Sequence>
    </AbsoluteFill>
  );
};
