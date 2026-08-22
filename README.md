# agent-control-tuts-remotion

Programmatic tutorial videos for the [Agent Control tutorials](https://github.com/agentcontrol/agent-control)
learning path, built with [Remotion](https://www.remotion.dev/). Videos are React
components driven by real, captured CLI output, so when the course content changes
you update the data and re-render instead of re-recording a screencast.

The first deliverable is a ~2 minute teaser for module 02 (evaluators, selectors
and conditions), covering the modules that run against the open-source Agent
Control server locally: modules 02, 03 and 05.

## Why code-driven video

The tutorials use deterministic stand-in functions instead of live LLM calls, so
every run produces byte-identical output. That output is captured once and fed
into the compositions as props. Crisp text, no typos, and a `git diff` shows
exactly what changed between versions of a video.

## Prerequisites

- Node.js 18+ (LTS recommended)
- For regenerating transcripts: a local Agent Control OSS server (8.4.0) and the
  gactl-tutorial repo. See "Regenerating the source data" below.

## Commands

```console
npm install
npm run dev                                            # Remotion Studio (preview, scrub the timeline)
npx remotion render Module02Teaser out/module02-teaser.mp4
```

## Project structure

```
src/
  Root.tsx                  # composition registry (1920x1080 @ 30fps)
  theme.ts                  # shared colors and fonts
  components/               # shared, module-agnostic building blocks
    Terminal.tsx            # simulated terminal: typed commands, timed output, auto-scroll
    Cards.tsx               # title card, concept slide, callout lower-third, outro
    ControlStore.tsx        # stylized Control Store table (swap for a screen recording later)
  modules/
    module02/
      data.ts               # captured CLI output + beat timeline (the "script")
      Teaser.tsx            # beat-by-beat assembly of the module 02 teaser
transcripts/
  module02/                 # raw captured stdout the data files are built from
  module03/                 # captured, video not built yet
  module05/                 # captured, video not built yet
```

To add a module: drop its captured stdout under `transcripts/moduleXX/`, create
`src/modules/moduleXX/{data.ts,Teaser.tsx}` from the module02 pair, and register
the composition in `Root.tsx`. Components stay shared and take everything
module-specific as props.

## UI walkthrough recording

The console footage in the video is not a manual screen recording: it is a
scripted Playwright session against the local server, so it reproduces exactly
and can be re-captured whenever the UI changes.

```console
node scripts/record-ui.mjs
ffmpeg -y -ss 1.5 -i recordings/ui-walkthrough.webm \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -an public/ui-walkthrough.mp4
```

The script injects a visible cursor dot (Playwright recordings have no OS
pointer), switches the console to dark mode, then walks: agents overview,
kam7f-eval-lab, Controls tab, and opens the Edit Control modal. The trim
(`-ss 1.5`) cuts the light-to-dark flash at startup. If the recording length
changes, update the `uiWalkthrough` beat in `src/modules/module02/data.ts`.

## Regenerating the source data

The transcript data in `src/data/` comes from real runs against a local
Agent Control 8.4.0 server:

1. In the agent-control clone: `git checkout v8.4.0 && docker compose up -d`
   (pin the server image to `galileoai/agent-control-server:8.4.0`).
2. In the gactl-tutorial repo: create a Python 3.12 venv, install
   `agent-control-sdk==8.4.0`, copy `.env.local.example` to `.env.local`, set a
   prefix, then run the module scripts and capture stdout with `tee`.

The captured prefix in the current data is `kam7f`. If you re-capture with a
different prefix, update the names in `src/data/module02.ts` to match.

## Roadmap

- Real screen recording of the Control Store UI in place of the stylized table
- Full-length videos for modules 02, 03 and 05 from a parameterized composition
- Narration variants (captions first, voiceover later)
