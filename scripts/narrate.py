#!/usr/bin/env python3
"""Turn an episode's narration.md into one audio clip per scene plus audio.json.

Usage (from the repo root; needs SPEECHIFY_API_KEY in .env for the default engine):
    uv run --with speechify-api --with python-dotenv scripts/narrate.py ep01
    uv run --with python-dotenv scripts/narrate.py ep01 --engine say   # macOS draft voice

Scenes are the "## N. Title (about S s)" sections of src/episodes/<ep>/narration.md.
Clips land in public/narration/<ep>/NN.mp3; durations go to src/episodes/<ep>/audio.json,
which the episode's data.ts reads to size each scene. Re-run after any script edit.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
VOICE_ID = "jack"
MODEL = "simba-3.2"


def scenes(md: str) -> list[tuple[int, str, str]]:
    found = re.findall(r"^## (\d+)\. (.+?) \(about \d+ s\)\n\n(.+?)(?=\n## |\Z)", md, re.M | re.S)
    return [(int(n), t, " ".join(body.split())) for n, t, body in found]


def duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
    )
    return float(out.decode().strip())


def say(text: str, mp3: Path) -> list[dict]:
    aiff = mp3.with_suffix(".aiff")
    subprocess.run(["say", "-v", "Samantha", "-r", "165", "-o", str(aiff), text], check=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(aiff), "-codec:a", "libmp3lame", "-q:a", "2", str(mp3)],
        check=True,
    )
    aiff.unlink()
    return []  # the Mac voice gives no word timings; beats fall back to fractions


def speechify(text: str, mp3: Path) -> list[dict]:
    """Generate the clip and return word timings [{value, start, end} in seconds]."""
    import base64

    from speechify import Speechify

    client = Speechify(token=os.environ["SPEECHIFY_API_KEY"])
    resp = client.audio.speech(
        input=text,
        voice_id=VOICE_ID,
        model=MODEL,
        audio_format="mp3",
        options={"text_normalization": False},
    )
    mp3.write_bytes(base64.b64decode(resp.audio_data))
    marks = resp.speech_marks.model_dump() if resp.speech_marks else {"chunks": []}
    words = []
    for c in marks.get("chunks", []):
        if c.get("type") == "word":
            words.append({"value": c["value"], "start": round(c["start_time"] / 1000, 3), "end": round(c["end_time"] / 1000, 3)})
    return words


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode", help="e.g. ep01")
    ap.add_argument("--engine", choices=["speechify", "say"], default="speechify")
    ap.add_argument("--only", type=int, default=None, help="regenerate one scene number")
    args = ap.parse_args()

    load_dotenv(ROOT / ".env")
    if args.engine == "speechify" and not os.environ.get("SPEECHIFY_API_KEY"):
        print("SPEECHIFY_API_KEY is not set in .env", file=sys.stderr)
        return 2

    ep_dir = ROOT / "src" / "episodes" / args.episode
    out_dir = ROOT / "public" / "narration" / args.episode
    out_dir.mkdir(parents=True, exist_ok=True)
    meta_path = ep_dir / "audio.json"
    existing = json.loads(meta_path.read_text()) if meta_path.exists() else {"clips": []}
    by_scene = {c["scene"]: c for c in existing.get("clips", [])}

    for n, title, text in scenes((ep_dir / "narration.md").read_text()):
        mp3 = out_dir / f"{n:02d}.mp3"
        if args.only is not None and n != args.only:
            continue
        words = (speechify if args.engine == "speechify" else say)(text, mp3)
        by_scene[n] = {
            "scene": n,
            "title": title,
            "file": f"narration/{args.episode}/{n:02d}.mp3",
            "seconds": round(duration(mp3), 2),
            "words": len(text.split()),
            "timings": words,
        }
        print(f"{n:02d} {by_scene[n]['seconds']:6.2f} s  {title}")

    clips = [by_scene[k] for k in sorted(by_scene)]
    voice = f"speechify {VOICE_ID} ({MODEL})" if args.engine == "speechify" else "macOS Samantha, draft"
    meta_path.write_text(json.dumps({"voice": voice, "clips": clips}, indent=2) + "\n")
    print(f"total {sum(c['seconds'] for c in clips):.1f} s -> {meta_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
