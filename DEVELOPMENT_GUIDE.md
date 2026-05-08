# CarbonWay — Development Guide

> **For:** All 4 team members (P1 Data, P2 Frontend, P3 Pitch, Advisor)
> **Deadline:** May 15, 2026 (4-day build sprint starts now)
> **Deliverables:** `submit/CarbonWay_Pitch.pdf` + `submit/CarbonWay_Demo.mp4` + working prototype

---

## Quick Start — What Each Person Does Right Now

### P1 (Data + Carbon Engine)
1. Read your agent prompt: `take away/AGENT-P1-DATA.md`
2. Open `wiki/CarbonWay.md` and `wiki/entities/Energy and Safety Pain Points.md`
3. Start extracting numbers → create JSON in `src/data/`

### P2 (Fullstack Developer)
1. Read your agent prompt: `take away/AGENT-P2-FRONTEND.md`
2. Create `src/frontend/index.html`, `style.css`, `app.js`
3. Start building the 3-panel layout

### P3 (Pitch + Video + PDF)
1. Read your agent prompt: `take away/AGENT-P3-PITCH.md`
2. Open `wiki/CarbonWay.md` (lines 192-249 for pitch structure)
3. Start writing slides 1-5 in `pitch/slides.md`

### Advisor (Review + Coach)
1. Read your agent prompt: `take away/AGENT-ADVISOR.md`
2. Note the review checkpoint times — be present at those times
3. Review the master plan once: `take away/hackathon-4day-plan.md`

---

## Folder Map — Where Everything Lives

```
DOH\
├── src\                       ← P1 + P2 work here (build output)
│   ├── data\                  ← P1: put JSON files here
│   │   ├── baseline.json         (14 segments)
│   │   ├── interventions.json    (5 interventions)
│   │   ├── scenario_output.json  (70 entries — 14×5)
│   │   └── impact_summary.json   (1 object — totals)
│   └── frontend\              ← P2: put HTML/CSS/JS here
│       ├── index.html
│       ├── style.css
│       └── app.js
├── pitch\                     ← P3: put slides + scripts here
│   ├── slides.md                 (10-slide content)
│   ├── video-script.md           (5-min spoken script)
│   ├── storyboard.md             (scene-by-scene plan)
│   └── screenshots\              ← Day 4: P1 puts screenshots here
├── submit\                    ← FINAL deliverables go here
│   ├── CarbonWay_Pitch.pdf       (≤10 pages, ≤20MB)
│   └── CarbonWay_Demo.mp4        (5:00 ± 15s, 1080p)
├── wiki\                      ← Knowledge base (read-only for build)
│   ├── CarbonWay.md              (concept, pitch structure, appendix math)
│   ├── entities\                 (196 entity pages — P1's data source)
│   └── sources\                  (299 source summaries)
├── take away\                 ← All planning documents
│   ├── hackathon-4day-plan.md    (master plan — full spec)
│   ├── AGENT-P1-DATA.md          (→ P1's instructions)
│   ├── AGENT-P2-FRONTEND.md      (→ P2's instructions)
│   ├── AGENT-P3-PITCH.md         (→ P3's instructions)
│   ├── AGENT-ADVISOR.md          (→ Advisor's instructions)
│   ├── guide_question.md         (data gaps still to fill)
│   └── Digital Service & Communication.md  (original concept notes)
└── raw\                       ← Cleaned (all old raw files removed)
```

---

## How to Run the Prototype (P2)

From the project root (`D:\competetetion\DOH\DOH\`):

```powershell
# Option 1: npx serve (recommended)
npx serve src

# Option 2: Python fallback
python -m http.server 3000 --directory src
```

Then open `http://localhost:3000/frontend/index.html`

---

## Daily Sync Schedule (ALL must attend)

| When | Duration | What | Who runs it |
|------|----------|------|-------------|
| Day 1, 18:00 | 15 min | JSON loads in UI? Slide 1-5 draft reviewed? | Coordinator / Advisor |
| Day 2, 18:00 | 15 min | All 6 test cases pass? Video script ≤700 words? | Advisor |
| Day 3, 18:00 | 20 min | Dry-run video recording. What needs fixing? | Team |
| Day 4, 16:00 | 15 min | Final check: PDF 10 pages, video 5 min, everything in submit/ | Advisor |

---

## Key Numbers (everyone uses these — no deviations)

| Number | Use |
|--------|-----|
| 0.4999 kgCO₂e/kWh | Emission factor (all carbon calculations) |
| 4.0 THB/kWh | Electricity cost (all cost calculations) |
| 39,900,000 THB | VSL per fatality (upper bound, for warnings) |
| 17,200,000 - 39,900,000 THB | VSL range (for slides) |
| 100 - 200 THB/tCO₂e | T-VER carbon credit price (current) |
| 30 | Safety Floor threshold (score < 30 = REJECT) |
| 1,700,000,000 THB/year | DOH total electricity bill |
| 1,600 THB/night | Lights-off savings per 10km |

---

## Data Flow Between People

```
P1 creates baseline.json + interventions.json
        │
        ├──→ P2 loads via fetch() to render map + segment list
        │
        └──→ P1 computes scenario_output.json (70 entries)
                │
                ├──→ P2 uses scenario_output.json to power simulator
                │
                └──→ P3 uses impact_summary.json numbers in slides
                        │
                        └──→ P3 records video of P2's prototype
```

**Rule:** P1 changes JSON schema → must tell P2 immediately. After Day 1 noon, schema is **frozen**.

---

## What NOT to Change

- JSON field names (they're case-sensitive and P2's code depends on them)
- The 5 intervention IDs: `LED_UPGRADE`, `SOLAR_MICROGRID`, `SMART_DIMMING`, `OFFGRID_ITS`, `LIGHTS_OFF`
- The Safety Floor threshold (30)
- The emission factor (0.4999)
- File names in `submit/` (`CarbonWay_Pitch.pdf`, `CarbonWay_Demo.mp4`)

---

## If Something Breaks

| Problem | Action |
|---------|--------|
| P2 can't load JSON | Check `npx serve` is running from `src/` directory. Check file paths in fetch(). |
| Map shows white screen | Switch tile provider to `https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png` |
| Safety Floor doesn't trigger | Verify SEG-EX1 + LIGHTS_OFF in scenario_output.json has `safety_warning: true` |
| Video too long | P3: cut Scene 6 first (has the most room). Remove filler words. |
| Someone falls behind | Advisor: re-assign P1/P2 to help the bottlenecked person |

---

## Submission — Day 4 Final Checklist

- [ ] `submit/CarbonWay_Pitch.pdf` — 10 slides, under 20MB
- [ ] `submit/CarbonWay_Demo.mp4` — 4:45-5:15, 1080p, clear audio
- [ ] Prototype runs locally (in `src/frontend/`)
- [ ] Slide 2 HOOK is gripping
- [ ] Safety Floor demonstrated in BOTH slides AND video
- [ ] All numbers match between slides, video, and prototype
- [ ] File names match submission requirements from hackathon guide
