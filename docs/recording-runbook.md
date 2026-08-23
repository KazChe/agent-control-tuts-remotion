# Teaser recording runbook (Splunk demo cluster)

Flow follows gactl-tutorial module 01 (leak, author in console, bind to
log stream, re-run unchanged, show the control span), with teaser names.

Environment: DONE. `.env` verified all-PASS; project `kamc-acp-teaser-demo`
and log stream `support-bot` exist.

Every console clip: `node scripts/record-manual.mjs <clip-name> https://console.demo.sao.splunkcloud.com`
from remotion-poc. You navigate; CLOSE THE BROWSER WINDOW to stop and save
that clip (one browser session = one clip file). Login persists across
runs after the first. Emails and the org label blur automatically;
spot-check every clip anyway.

## Clip 1: `galileo-create-control`

Sidebar -> Controls -> Create new control. Form values (module 01 step 2):

| Field | Value |
|---|---|
| Control name | `kamc-acp-block-ssn` (no spaces) |
| Description | `Deny SSN-shaped output from support replies` |
| Stages | REMOVE the default `PRE (before execution)` chip, add `POST (after execution)` - judge the output, after the function runs (form defaults to PRE on this deployment) |
| Action | `Deny` |
| Execution environment | `Server` (default) |
| Step types | REMOVE the default `tool` chip, add `llm` (required: the agent registers as an llm step; scoped to tool the control never fires) |
| Evaluator | Add evaluator -> `Regex` |
| Evaluator path | REPLACE the default `*` with `output` (default evaluates everything the stage sees) |
| Evaluator pattern | `\b\d{3}-\d{2}-\d{4}\b` |
| Flags / advanced | leave empty |

Save. The enabled toggle next to the control in the list confirms it.

## CLI run 1 (Claude runs, terminal only): the leak

```bash
cd /Users/kam/development/git_clones/gactl-tutorial
set -a; source .env; set +a
cd module-01-first-control
python support_agent.py 2>&1 | tee /Users/kam/development/remotion-poc/transcripts/teaser-run1-leak.txt
```

Expected: `safe request` ALLOWED; `pii leak` prints the draft reply with
SSN `987-65-4329`. The control exists but is not bound to the log
stream, so nothing fires. That gap is the teaching moment.

## Clip 2: `galileo-trace-leak`

Project `kamc-acp-teaser-demo` -> log stream `support-bot` -> open the
`pii leak` trace: SSN visible in the trace output, no control span.

## Clip 3: `galileo-bind-control`

Project -> Agent Stream `support-bot` -> **Controls** tab -> **Add control**
(empty-state button) -> in the "Add controls / Control store" picker,
search `kamc-acp` -> on the `kamc-acp-block-ssn` row (Step LLM, Stage
POST, Execution Server, Source custom) click **Clone and attach**.

## CLI run 2 (Claude runs): same script, unchanged, now blocked

Same command as run 1, tee to `teaser-run2-blocked.txt`.

Expected: `safe request` still ALLOWED; `pii leak` now prints
`BLOCKED by control: kamc-acp-block-ssn-clone-<id>` with reason
`Pattern '\b\d{3}-\d{2}-\d{4}\b' found`. The draft line still prints
above the block: POST stage means the reply was generated but never
escaped. That detail becomes a caption.

## Clip 4: `galileo-trace-blocked`

Same log stream: the new run's traces next to the old ones, the blocked
one carrying a control span naming the control, stage, and evaluator.

## After recording

Transcode each clip, trimming hesitation at the edges:

```bash
ffmpeg -y -ss <start> -to <end> -i recordings/<name>.webm \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -an public/<name>.mp4
```

Terminal transcripts feed the Terminal beats; clips replace the
GalileoSlot placeholders. Chat mock: with deny, beat 1c's friendly reply
stays (the app layer catches the violation and shows a safe message) and
the badge reads "Agent Control · deny".

## Redaction notes

- The browser URL bar is never captured (Playwright records the page only).
- Auto-blurred: email addresses, `demo-v2-poc`. Add other project names
  to REDACT_PATTERNS in scripts/record-manual.mjs if pickers will open.
- Watch for: project picker popups, avatars, search suggestions.
