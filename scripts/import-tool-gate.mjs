// Trim a tool-gate demo artifact (runs/demo.json from `tg-demo`) down to what
// the ToolGateTeaser needs and write it next to the teaser as demo.json.
// Usage: node scripts/import-tool-gate.mjs /path/to/tool-gate/runs/demo.json
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/import-tool-gate.mjs <demo.json>");
  process.exit(2);
}
const art = JSON.parse(readFileSync(src, "utf8"));
if (art.meta.dry_run) {
  console.error("refusing a dry-run artifact; the video must show real answers");
  process.exit(1);
}
const run = art.direct.runs[0];
const rows = art.fixture.map((row) => {
  const d = run[row.id];
  const p = art.plane[row.id];
  return {
    id: row.id,
    family: row.family,
    label: row.label,
    conversation: row.conversation,
    proposed_call: row.proposed_call,
    answers: {
      authorized: d.answers.authorized,
      third_party_instruction: d.answers.third_party_instruction,
      confirmed: d.answers.confirmed,
      reversibility_score: d.answers.reversibility_score,
      decision: d.answers.decision,
      decision_confidence: d.answers.decision_confidence,
    },
    fired: d.fired,
    action: d.action,
    message: d.message,
    latency_ms: Math.round(d.latency_ms),
    plane: { action: p.action, matched: p.matched, is_safe: p.is_safe },
  };
});
const out = {
  source: {
    generated_at: art.meta.generated_at,
    git_commit: art.meta.git_commit,
    model: art.meta.jev.reported_model,
    fixture_sha256: art.meta.fixture_sha256,
    questions_sha256: art.meta.questions_sha256,
    policy_sha256: art.meta.policy_sha256,
    agent_control_server: art.meta.plane.server_url,
  },
  rows,
};
const dest = resolve("src/teasers/tool-gate/demo.json");
writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${dest} with ${rows.length} rows from ${art.meta.git_commit.slice(0, 7)}`);
