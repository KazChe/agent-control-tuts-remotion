import type { TermEntry } from "../components/Terminal";

// Terminal scheduling. The Terminal component builds its own timeline
// (0.5 s, then per entry prePause, command typing at 28 chars/s plus 0.6 s,
// then each line after its delay). This mirrors that arithmetic so a line can
// be asked to land at an absolute scene second, given when the terminal mounts.
export const T0 = 0.5;
export const CPS = 28;
export const CMD_PAUSE = 0.6;
const GAP = 0.14;
export type Target = { text: string; at?: number; min?: number };
export type Spec = { command?: string; startAt?: number; lines: Target[] };
export const schedule = (mountAt: number, specs: Spec[]): TermEntry[] => {
  let t = T0;
  return specs.map((e) => {
    const pre = e.startAt === undefined ? 0.2 : Math.max(0.2, e.startAt - mountAt - t);
    t += pre;
    if (e.command !== undefined) t += e.command.length / CPS + CMD_PAUSE;
    const lines = e.lines.map((l) => {
      const min = l.min ?? GAP;
      const delay = l.at === undefined ? min : Math.max(min, l.at - mountAt - t);
      t += delay;
      return { text: l.text, delay };
    });
    return { command: e.command, prePause: pre, lines };
  });
};
