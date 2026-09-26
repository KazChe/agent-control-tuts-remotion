import React from "react";
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BEATS, CLIPS, LEAD, S1, S2, S3, S4, S4_mount, S5, S6,
  CODE_ALLOWLIST, CODE_BLOCKLIST, CODE_JSON, CODE_LIST, CODE_REGEX, CODE_SQL, CODE_TOOLS,
  competitorCard, competitorRun, refundCard, ruleRuns, sqlCard,
} from "./data";
import { Badge } from "../../components/Badge";
import { Callout } from "../../components/Cards";
import { CodeCard } from "../../components/CodeCard";
import { ConditionCard } from "../../components/ConditionCard";
import { EvaluatorContract } from "../../components/EvaluatorContract";
import { ExecutionDiagram } from "../../components/ExecutionDiagram";
import { SceneHeading } from "../../components/SceneHeading";
import { Terminal } from "../../components/Terminal";
import { theme } from "../../theme";

const FPS = BEATS.fps;
const f = (s: number) => Math.round(s * FPS);

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: theme.pageBg }}>{children}</AbsoluteFill>
);

const Chip: React.FC<{ text: string; color: string; at: number; left: number; top: number; width?: number }> = ({ text, color, at, left, top, width = 300 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at * fps, fps, config: { damping: 200 }, durationInFrames: 20 });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        fontFamily: theme.fontMono,
        fontSize: 26,
        fontWeight: 700,
        color,
        border: `2px solid ${color}`,
        background: "rgba(13,17,23,0.94)",
        borderRadius: 14,
        padding: "16px 20px",
        opacity: s,
        transform: `translateY(${(1 - s) * 14}px)`,
      }}
    >
      {text}
    </div>
  );
};

// Scene 6: the four in the box, the add-ons beside them, then the three lines.
const Beyond: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (sec: number) => spring({ frame: frame - sec * fps, fps, config: { damping: 200 }, durationInFrames: 22 });
  const lines = ["One contract.", "Four built-ins.", "Two polarities, found or broken."];
  return (
    <AbsoluteFill style={{ background: theme.pageBg, fontFamily: theme.fontSans }}>
      <div style={{ position: "absolute", left: 120, top: 300, color: theme.cyan, fontFamily: theme.fontMono, fontSize: 20, letterSpacing: 4, opacity: at(S6.builtins) }}>
        IN THE BOX · DETERMINISTIC
      </div>
      {["regex", "list", "json", "sql"].map((n, i) => (
        <Chip key={n} text={n} color={theme.cyan} at={S6.builtins + i * 0.12} left={120 + i * 190} top={345} width={150} />
      ))}
      <Badge text="cannot judge tone, intent, or whether a reply is on topic" color={theme.dim} at={S6.cannot} left={120} top={440} />

      <div style={{ position: "absolute", left: 1000, top: 300, color: theme.purple, fontFamily: theme.fontMono, fontSize: 20, letterSpacing: 4, opacity: at(S6.model) }}>
        ADD-ON PACKAGES · SAME ENTRY POINT, SAME CONTRACT
      </div>
      <Chip text="galileo.luna" color={theme.purple} at={S6.luna} left={1000} top={345} width={280} />
      <Badge text="Galileo's model backed evaluator, installed separately" color={theme.purple} at={S6.luna} left={1000} top={440} />
      <Chip text="contrib" color={theme.purple} at={S6.contrib} left={1330} top={345} width={200} />
      <Badge text="cisco · budget · defenseclaw · a template" color={theme.dim} at={S6.contrib} left={1000} top={495} />
      <Chip text="yours" color={theme.green} at={S6.yours} left={1580} top={345} width={200} />
      <Badge text="an upcoming section" color={theme.green} at={S6.yours} left={1580} top={495} />

      <div style={{ position: "absolute", left: 120, top: 640, display: "flex", flexDirection: "column", gap: 24 }}>
        {lines.map((s, i) => {
          const a = at(S6.lines[i]);
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

// Episode 5 of the Agent Control series: evaluators.
export const Ep05Evaluators: React.FC = () => {
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
        <EvaluatorContract times={S1} />
        <SceneHeading eyebrow="EVALUATORS" title="One contract" intent="The selected piece goes in. Matched, confidence, message, and metadata come out. Every evaluator, the same four." />
        <Callout appearAt={f(S1.contract)} hideAt={f(S1.apart)} text="That is the whole contract." />
        <Callout appearAt={f(S1.apart)} text="The control plane cannot tell them apart. Only the confidence number hints at who answered." />
      </Sequence>

      <Sequence from={s2.from} durationInFrames={s2.duration}>
        {clip(1)}
        <Page>
          <CodeCard title="regex" lines={CODE_REGEX} left={100} top={290} width={820} appearAt={f(S2.regex)} hideAt={f(S2.run)} fontSize={19} highlights={{ 3: { at: f(S2.found), color: theme.cyan }, 4: { at: f(S2.flag), color: theme.amber } }} />
          <Badge text="matches when the pattern is found anywhere in the text" color={theme.cyan} at={S2.found} hideAt={S2.run} left={120} top={595} />
          <Badge text="RE2 · linear time · a bad pattern cannot stall the server" color={theme.green} at={S2.linear} hideAt={S2.run} left={120} top={650} />
          <Badge text='flags: ["IGNORECASE"] is the only flag' color={theme.amber} at={S2.flag} hideAt={S2.run} left={120} top={705} />

          <CodeCard title="list" lines={CODE_LIST} left={1000} top={290} width={820} appearAt={f(S2.list)} hideAt={f(S2.run)} fontSize={19} highlights={{ 3: { at: f(S2.list), color: theme.cyan }, 4: { at: f(S2.mode), color: theme.purple }, 5: { at: f(S2.logic), color: theme.amber }, 6: { at: f(S2.caseToggle), color: theme.amber } }} />
          <Badge text="exact" color={theme.purple} at={S2.exact} hideAt={S2.run} left={1020} top={640} />
          <Badge text="contains" color={theme.purple} at={S2.contains} hideAt={S2.run} left={1135} top={640} />
          <Badge text="starts_with" color={theme.purple} at={S2.starts} hideAt={S2.run} left={1285} top={640} />
          <Badge text="ends_with" color={theme.purple} at={S2.ends} hideAt={S2.run} left={1465} top={640} />
          <Badge text="contains = whole word: \\b(acmecorp|competitorx)\\b" color={theme.purple} at={S2.wholeWord} hideAt={S2.run} left={1020} top={695} />
          <Badge text="logic: any | all" color={theme.amber} at={S2.logic} hideAt={S2.run} left={1020} top={750} />
          <Badge text="case_sensitive: false" color={theme.amber} at={S2.caseToggle} hideAt={S2.run} left={1260} top={750} />
        </Page>
        <Sequence from={f(S2.run)}>
          <Terminal entries={competitorRun} title="gactl-tutorial - zsh" fontSize={22} width={1180} left={70} />
        </Sequence>
        <ConditionCard
          {...competitorCard}
          appearAt={f(S2.run + 0.3)}
          checkpoints={[{ at: f(S2.found2), states: ["hit"], fired: false }, { at: f(S2.holds), states: ["hit"], fired: true }]}
          right={60}
          width={600}
          top={290}
        />
        <Sequence durationInFrames={f(S2.run)}>
          <SceneHeading eyebrow="EVALUATORS" title="Regex and list" intent="The two text evaluators. Both match when something is found." />
        </Sequence>
        <Callout appearAt={f(S2.denied)} text="1b denied at pre. The model never ran." />
      </Sequence>

      <Sequence from={s3.from} durationInFrames={s3.duration}>
        {clip(2)}
        <Page>
          <CodeCard title="blocklist · the default" lines={CODE_BLOCKLIST} left={100} top={300} width={820} appearAt={f(S3.switch)} fontSize={21} highlights={{ 3: { at: f(S3.byDefault), color: theme.red } }} />
          <Badge text="fires when a value is found" color={theme.red} at={S3.foundBadge} left={120} top={560} />
          <CodeCard title="allowlist · match_on: no_match" lines={CODE_ALLOWLIST} left={1000} top={300} width={820} appearAt={f(S3.noMatch)} fontSize={21} highlights={{ 3: { at: f(S3.noMatch), color: theme.green } }} />
          <Badge text="fires when none of the values are present" color={theme.green} at={S3.none} left={1020} top={560} />
          <Badge text='require the word "approved" in a reply' color={theme.green} at={S3.approved} left={1020} top={615} />
          <CodeCard title="or restrict a tool step to a handful of tool names" lines={CODE_TOOLS} left={1000} top={680} width={820} appearAt={f(S3.tools)} hideAt={f(S3.empty)} fontSize={20} />
          <Badge text="blocklist  ⟶  allowlist, same evaluator" color={theme.cyan} at={S3.allowlist} left={120} top={640} />
        </Page>
        <SceneHeading eyebrow="EVALUATORS" title="The same evaluator, turned around" intent="match_on decides whether finding a value fires the control, or failing to find one." />
        <Callout appearAt={f(S3.same)} hideAt={f(S3.empty)} text="Same evaluator, inverted." />
        <Callout appearAt={f(S3.empty)} text='Empty selected value: matched false, "Empty input - control ignored". Decided before match_on is applied.' />
      </Sequence>

      <Sequence from={s4.from} durationInFrames={s4.duration}>
        {clip(3)}
        <Page>
          <Chip text="regex · list  match when something is FOUND" color={theme.cyan} at={S4.polarityFound} left={140} top={420} width={900} />
          <Chip text="json · sql  match when a rule is BROKEN" color={theme.amber} at={S4.polarityBroken} left={140} top={520} width={900} />
        </Page>
        <Sequence from={f(S4_mount)}>
          <Terminal entries={ruleRuns} title="gactl-tutorial - zsh" fontSize={20} width={1100} left={70} />
        </Sequence>
        <CodeCard title="json" lines={CODE_JSON} right={60} top={280} width={660} appearAt={f(S4.jsonCard)} hideAt={f(S4.sql)} fontSize={17} highlights={{ 6: { at: f(S4.limit), color: theme.amber } }} />
        <Badge text="also: required_fields · field_types · constraints · patterns" color={theme.dim} at={S4.required} hideAt={S4.sql} left={1200} top={690} fontSize={17} />
        <ConditionCard
          {...refundCard}
          appearAt={f(S4.allowed)}
          hideAt={f(S4.sql)}
          checkpoints={[{ at: f(S4.passes), states: ["miss"] }, { at: f(S4.matches), states: ["hit"], fired: true }]}
          right={60}
          width={660}
          top={745}
        />
        <CodeCard title="sql" lines={CODE_SQL} right={60} top={280} width={660} appearAt={f(S4.sql)} fontSize={18} highlights={{ 3: { at: f(S4.dialect), color: theme.cyan }, 4: { at: f(S4.ops), color: theme.amber } }} />
        <Badge text="parsed with sqlglot, not matched as text" color={theme.cyan} at={S4.parser} hideAt={S4.fourth} left={1200} top={570} />
        <Badge text="block_ddl · block_dcl" color={theme.amber} at={S4.ddl} hideAt={S4.fourth} left={1200} top={625} />
        <Badge text="allowed_tables · blocked_tables · schemas" color={theme.amber} at={S4.tables} hideAt={S4.fourth} left={1200} top={680} />
        <Badge text="require_limit · max_limit · max_result_window" color={theme.amber} at={S4.limitCheck} hideAt={S4.fourth} left={1200} top={735} />
        <Badge text="max_joins · max_union_count · max_subquery_depth" color={theme.amber} at={S4.joins} hideAt={S4.fourth} left={1200} top={790} />
        <ConditionCard
          {...sqlCard}
          appearAt={f(S4.fourth)}
          checkpoints={[{ at: f(S4.select + 0.8), states: ["miss"] }, { at: f(S4.del + 0.8), states: ["hit"], fired: true }]}
          right={60}
          width={660}
          top={620}
        />
        <Sequence durationInFrames={f(S4_mount)}>
          <SceneHeading eyebrow="EVALUATORS" title="JSON and SQL, the rule breakers" intent="The config describes what is allowed. The evaluator matches when the data breaks it." />
        </Sequence>
      </Sequence>

      <Sequence from={s5.from} durationInFrames={s5.duration}>
        {clip(4)}
        <ExecutionDiagram times={S5} />
        <SceneHeading eyebrow="EVALUATORS" title="Where it runs" intent="Execution server or SDK. One cached instance per name and config. A timeout on each." />
        <Callout appearAt={f(S5.env)} hideAt={f(S5.how)} text="SDK execution is for evaluators, or dependencies, that live only in the agent's environment. Custom evaluators, later." />
      </Sequence>

      <Sequence from={s6.from} durationInFrames={s6.duration}>
        {clip(5)}
        <Beyond />
        <SceneHeading eyebrow="EVALUATORS" title="Beyond the box" intent="Deterministic built-ins, model backed add-ons, and your own, all through one contract." />
        <Callout appearAt={f(S6.next)} text="next: the actions, and the steer loop" />
      </Sequence>
    </AbsoluteFill>
  );
};
