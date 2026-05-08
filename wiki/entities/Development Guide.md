---
tags: [hackathon, guide, operations]
last_updated: 2026-05-08
status: verified
---

# Development Guide

The team handbook for the [[CarbonWay]] hackathon sprint. A practical operational manual that answers "what do I do right now?" for each team member.

## Quick Start

Each person reads their assigned agent prompt from `take away/`:
- **P1** → `AGENT-P1-DATA.md` → builds JSON data in `src/data/`
- **P2** → `AGENT-P2-FRONTEND.md` → builds web app in `src/frontend/`
- **P3** → `AGENT-P3-PITCH.md` → creates slides + video in `pitch/`
- **Advisor** → `AGENT-ADVISOR.md` → reviews at 8 designated checkpoints

## Prototype Startup

```powershell
npx serve src
# or fallback:
python -m http.server 3000 --directory src
```

Then open `http://localhost:3000/frontend/index.html`

## Daily Sync Schedule

All members attend 15-minute sync at 18:00 each day:
- **Day 1:** JSON loads in UI? Slide 1-5 draft reviewed?
- **Day 2:** All 6 test cases pass? Video script ≤700 words?
- **Day 3:** Dry-run video recording — what needs fixing?
- **Day 4 (16:00):** Final check — PDF, video, prototype all ready

## Data Flow

```
P1 (JSON) → P2 (fetch JSON → render UI)
P1 (JSON) → P3 (numbers → slides)
P2 (Prototype) → P3 (screen recording → video)
```

## Frozen Constants

Do NOT change: JSON field names, intervention IDs, Safety Floor threshold (30), emission factor (0.4999), file names in `submit/`.

## Related Pages
- [[4-Day Execution Plan]]
- [[Agent Prompts]]
- [[CarbonWay]]
