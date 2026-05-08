# CarbonWay: 4-Day Execution Plan (v3 — Production Spec)

> **Concept:** CarbonWay — ระบบจำลองเส้นทางสู่ทางหลวงไร้คาร์บอน ที่เปลี่ยนค่าไฟ 1.7 พันล้านบาท/ปี ให้กลายเป็นแหล่งทุนพลังงานสะอาดด้วยกลไก T-VER Carbon Credit
> **Deadline:** May 15, 2026
> **Deliverables:** PDF ≤10 slides + 5-min video (.mp4) + working web prototype
> **This document is a STRICT SPECIFICATION. Follow every instruction exactly. Do not improvise unless a section explicitly says "use your judgment."**

---

## 0. Prerequisites — Day 0 (MUST complete before Day 1 starts)

### 0.1 Concept Lock
```
DECISION: CarbonWay IS the final concept. No more debate.
Core differentiator: Self-funding loop via T-VER carbon credits + Safety Floor guarantee.
```
**Action:** All 4 members (P1, P2, P3, Advisor) must read `wiki/CarbonWay.md` from line 1 to line 315 before Day 1.

### 0.2 Repository Setup (P2 executes)
Create this exact directory structure. Do not deviate.

```
D:\competetetion\DOH\DOH\
├── src\
│   ├── data\              ← P1's workspace (JSON files only)
│   │   ├── baseline.json
│   │   ├── interventions.json
│   │   ├── scenario_output.json
│   │   └── impact_summary.json
│   └── frontend\           ← P2's workspace (all HTML/CSS/JS)
│       ├── index.html
│       ├── style.css
│       └── app.js
├── pitch\                  ← P3's workspace
│   ├── slides.md           ← 10-slide content (Markdown)
│   ├── video-script.md     ← 5-min script (word-for-word)
│   └── storyboard.md       ← scene-by-scene video plan
└── submit\                 ← FINAL deliverables go here
    ├── CarbonWay_Pitch.pdf
    ├── CarbonWay_Demo.mp4
    └── prototype\          ← zipped or linked
```

**Tech stack mandate (P2):** Use **plain HTML + CSS + vanilla JavaScript** (no React, no build tool). This eliminates toolchain risk. If you are 100% confident with React/Vite, you may use it, BUT you must have a running prototype by Day 1 18:00 — if not, fall back to plain HTML immediately. Use Leaflet.js for map (CDN: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`).

### 0.3 JSON Schema Contract — FROZEN. DO NOT CHANGE AFTER DAY 1 12:00.

Copy these structures exactly. Field names are case-sensitive. All numeric values must be numbers (not strings).

#### baseline.json (array of segment objects)
```json
[
  {
    "id": "SEG-001",
    "name_th": "ทางหลวงหมายเลข 3049 กม.0-7 (นครราชสีมา)",
    "length_km": 7.0,
    "light_count": 140,
    "light_type": "HPS",
    "light_watt_per_unit": 250,
    "daily_kwh": 350.0,
    "annual_kwh": 127750.0,
    "annual_tco2e": 63.9,
    "annual_electricity_cost_thb": 511000.0,
    "avg_daily_traffic": 8500,
    "safety_incidents_per_year": 3.2,
    "safety_score": 62.0,
    "vsl_risk_thb": 127600000.0,
    "has_cctv": true,
    "has_vms": false,
    "province": "นครราชสีมา",
    "district": "เมือง",
    "gps_lat": 14.975,
    "gps_lng": 102.100
  }
]
```
- `id`: string, format "SEG-NNN" (3-digit zero-padded number starting 001)
- `safety_score`: number 0-100. 100 = safest. Below 30 = DANGER.
- `annual_tco2e`: MUST be calculated as `annual_kwh × 0.0004999` (rounded to 1 decimal). Do NOT hardcode.
- `vsl_risk_thb`: MUST be calculated as `safety_incidents_per_year × 39900000` (use 39.9M THB upper bound). Do NOT hardcode.
- `annual_electricity_cost_thb`: MUST be calculated as `annual_kwh × 4.0` (assume 4 THB/kWh). Do NOT hardcode.

**CRITICAL: Include EXTREME CASE segments.** You MUST create at least these 4 special segments to test Safety Floor UI:
```
SEG-EX1 "ทางหลวงเสี่ยงสูงมาก" → safety_score = 18, safety_incidents = 8.1
SEG-EX2 "ทางหลวงกำไร T-VER ทะลุ" → annual_kwh = 500000, light_count = 600, light_type = "HPS"
SEG-EX3 "ทางหลวงปลอดภัยสมบูรณ์" → safety_score = 98, safety_incidents = 0.1
SEG-EX4 "ทางหลวงต้นทุนต่ำมาก" → annual_kwh = 12000, light_count = 12, light_type = "LED"
```
These 4 segments MUST appear in the baseline.json alongside the normal 10 segments.

Total minimum segments in baseline.json: 14 (10 normal + 4 extreme).

#### interventions.json (object with named interventions)
```json
{
  "LED_UPGRADE": {
    "name_th": "เปลี่ยนเป็น LED ทั้งหมด",
    "name_en": "Full LED Upgrade",
    "energy_save_pct": 50,
    "carbon_save_pct": 50,
    "cost_per_km_thb": 180000,
    "safety_impact": 12,
    "description": "เปลี่ยนโคมไฟ HPS เป็น LED 120W ลดไฟ 50%"
  },
  "SOLAR_MICROGRID": {
    "name_th": "ติดตั้ง Solar Micro-grid",
    "name_en": "Solar Micro-grid",
    "energy_save_pct": 70,
    "carbon_save_pct": 70,
    "cost_per_km_thb": 450000,
    "safety_impact": 18,
    "description": "Solar + Battery สำหรับ ITS และไฟถนน ลดค่าไฟ 70%"
  },
  "SMART_DIMMING": {
    "name_th": "Smart Dimming ตามจราจร",
    "name_en": "Smart Adaptive Dimming",
    "energy_save_pct": 35,
    "carbon_save_pct": 35,
    "cost_per_km_thb": 85000,
    "safety_impact": 5,
    "description": "หรี่ไฟอัตโนมัติตามปริมาณรถ ลดไฟ 35% โดยไม่กระทบความปลอดภัย"
  },
  "OFFGRID_ITS": {
    "name_th": "Off-grid ITS (Solar)",
    "name_en": "Off-grid Solar ITS",
    "energy_save_pct": 60,
    "carbon_save_pct": 60,
    "cost_per_km_thb": 320000,
    "safety_impact": 8,
    "description": "CCTV + VMS ใช้ Solar Off-grid ลดค่าไฟ 60%"
  },
  "LIGHTS_OFF": {
    "name_th": "ปิดไฟ 22:00-06:00",
    "name_en": "Lights Off Policy",
    "energy_save_pct": 33,
    "carbon_save_pct": 33,
    "cost_per_km_thb": 0,
    "safety_impact": -35,
    "description": "⚠️ นโยบายปิดไฟดิบ — ประหยัดไฟแต่ความปลอดภัยตกอย่างรุนแรง"
  }
}
```
- `safety_impact`: positive number = safety IMPROVES. negative number = safety DEGRADES.
- The `LIGHTS_OFF` intervention has negative safety_impact (-35). This is INTENTIONAL to trigger the Safety Floor rejection.

#### scenario_output.json (P1 generates this by running calculations against baseline × interventions)
```json
[
  {
    "segment_id": "SEG-001",
    "intervention_id": "LIGHTS_OFF",
    "new_annual_kwh": 85600.0,
    "new_annual_tco2e": 42.8,
    "tco2e_reduced": 21.1,
    "tver_revenue_thb_low": 2110.0,
    "tver_revenue_thb_high": 4220.0,
    "energy_cost_saved_thb": 168600.0,
    "safety_score_new": 27.0,
    "safety_warning": true,
    "safety_warning_msg": "⚠️ ความปลอดภัยต่ำกว่าเกณฑ์! เสี่ยง VSL สูญเสีย 127.6 ล้านบาท",
    "vsl_risk_thb_new": 319200000.0
  }
]
```
- `tver_revenue_thb_low`: `tco2e_reduced × 100` (conservative carbon price)
- `tver_revenue_thb_high`: `tco2e_reduced × 200` (optimistic carbon price)
- `safety_score_new`: `segment.safety_score + intervention.safety_impact` (clamped to 0-100)
- `safety_warning`: `true` if `safety_score_new < 30`, else `false`
- `safety_warning_msg`: Empty string `""` if safety_warning is false. Otherwise use format `"⚠️ ความปลอดภัยต่ำกว่าเกณฑ์! เสี่ยง VSL สูญเสีย {vsl_risk_thb_new/1000000:.1f} ล้านบาท"`
- `vsl_risk_thb_new`: recalculated as `(segment.safety_incidents_per_year + (30 - safety_score_new) * 0.30) × 39900000` if safety degraded, else same as baseline

### 0.4 P3 Video Storyboard — Draft before Day 1
P3 must sketch this BEFORE Day 1 morning. Fill in the "Screen to show" and "Duration" columns.

| Scene | Time | Duration | What happens | Screen to show | Key data/line |
|-------|------|----------|-------------|----------------|---------------|
| 1 | 0:00 | 60s | HOOK: Lights-off paradox | Slide 2 (or black screen) | "1 fatality = 30-68 years of savings erased" |
| 2 | 1:00 | 45s | Problem: 1.7B THB + K-Value crisis | Slide 3 | 1.7 billion THB/year electricity bill |
| 3 | 1:45 | 45s | Insight: electricity = carbon = money | Slide 4 | emission factor 0.4999 |
| 4 | 2:30 | 60s | DEMO: CarbonWay simulator | Prototype UI | Click segment → choose intervention → see triple impact |
| 5 | 3:30 | 45s | Safety Floor in action | Prototype UI | Try LIGHTS_OFF → RED WARNING appears |
| 6 | 4:15 | 30s | Impact numbers | Slide 8 | T-VER revenue, VSL savings, network scale |
| 7 | 4:45 | 15s | Closing | Slide 10 | "ให้คาร์บอนจ่ายเอง" |

**Total: exactly 300 seconds (5:00).** Scenes 1-3 are "pitch" (spoken over slides). Scenes 4-5 are "demo" (screen recording with voice-over). Scenes 6-7 are "impact + close."

---

## 1. Role Specifications — EXACT boundaries

### 1.1 P1: Data + Carbon Engine

**You own these files:**
- `src/data/baseline.json`
- `src/data/interventions.json`
- `src/data/scenario_output.json` (generated — see formula below)
- `src/data/impact_summary.json`

**You do NOT touch:**
- Any file in `src/frontend/`
- Any file in `pitch/`

**Exact formulas you must implement (use a spreadsheet, Python script, or hand-calculate — but these exact formulas):**

```
// Formula 1: tCO₂e from kWh
tco2e = annual_kwh × 0.0004999
Round to 1 decimal place.

// Formula 2: Electricity cost
cost_thb = annual_kwh × 4.0
Round to nearest integer.

// Formula 3: VSL risk
vsl_risk_thb = safety_incidents_per_year × 39900000
Round to nearest integer.

// Formula 4: Safety score after intervention
safety_new = CLAMP(segment.safety_score + intervention.safety_impact, 0, 100)
CLAMP means: if result < 0 → 0; if result > 100 → 100; else keep result.

// Formula 5: Safety warning flag
safety_warning = (safety_new < 30)   // returns true or false

// Formula 6: T-VER revenue
tver_low = tco2e_reduced × 100    // at 100 THB/credit
tver_high = tco2e_reduced × 200   // at 200 THB/credit
Round to nearest integer.

// Formula 7: New annual kWh
new_kwh = segment.annual_kwh × (1 - intervention.energy_save_pct / 100)
Round to 1 decimal place.

// Formula 8: tCO₂e reduced
tco2e_reduced = segment.annual_tco2e - new_tco2e
WHERE new_tco2e = new_kwh × 0.0004999
Round to 1 decimal place.

// Formula 9: Energy cost saved
cost_saved = segment.annual_electricity_cost_thb - (new_kwh × 4.0)
Round to nearest integer.

// Formula 10: New VSL risk (when safety degraded)
IF safety_new < segment.safety_score THEN:
    additional_risk_factor = (segment.safety_score - safety_new) / 100.0
    new_incidents = segment.safety_incidents_per_year × (1 + additional_risk_factor)
    vsl_risk_new = new_incidents × 39900000
ELSE:
    vsl_risk_new = segment.vsl_risk_thb
```

**Data sources you MUST extract from:**
1. `wiki/entities/Energy and Safety Pain Points.md` → lines 10-11 (1.7B THB), lines 27-29 (ITS: 750 VMS, 5000 CCTV, 14.23 GWh)
2. `wiki/CarbonWay.md` → lines 277-303 (ITS carbon baseline math, streetlights carbon baseline math, total network numbers)
3. `wiki/entities/Value of a Statistical Life (VSL).md` → lines 10-12 (17.2M and 39.9M THB per fatality)
4. `wiki/entities/Highway Assets Energy Consumption.md` → kWh breakdown by asset type
5. `wiki/sources/Source - Strategic Assessment of the Department of Highways Thailand.md` → VSL context

**Generating scenario_output.json:**
For EACH combination of (segment × intervention), run all 10 formulas above and output one object. If there are 14 segments and 5 interventions, you produce 70 output objects.

### 1.2 P2: Fullstack Developer

**You own these files:**
- `src/frontend/index.html`
- `src/frontend/style.css`
- `src/frontend/app.js`

**You do NOT touch:**
- Any file in `src/data/`
- Any file in `pitch/`

**Technology mandate:**
- Use **plain HTML + CSS + vanilla JavaScript**. No React. No build tools. No npm.
- Use **Leaflet.js** from CDN for the map: `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>` and `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>`
- All data comes from importing JSON files. Use `<script src="../data/baseline.json"></script>` — note that for JSON files served locally, you need to either (a) rename to `.js` and assign to a variable, or (b) run a local HTTP server (`npx serve src`). The plan MANDATES option (b): run `npx serve src` from the project root, then `fetch('/data/baseline.json')`.

**UI Specification — Exact layout you must build:**

The page has ONE `index.html` with 3 panels arranged vertically:

```
┌──────────────────────────────────────────────┐
│  HEADER: "CarbonWay" logo + title (top bar)  │
├────────────┬─────────────────────────────────┤
│  PANEL A   │  PANEL B                        │
│  (left     │  (right 70%)                     │
│   30%)     │                                 │
│  Segment   │  ┌───────────────────────────┐  │
│  List      │  │  MAP (Leaflet)            │  │
│  with      │  │  Markers for each segment │  │
│  search    │  │  Color-coded by safety    │  │
│  box       │  │  - Green: safety ≥ 70     │  │
│            │  │  - Yellow: 30 ≤ safety < 70│  │
│  Click a   │  │  - Red: safety < 30       │  │
│  segment   │  │                           │  │
│  to select │  └───────────────────────────┘  │
│  it        │                                 │
│            │  ┌───────────────────────────┐  │
│            │  │  INTERVENTION SELECTOR    │  │
│            │  │  [Dropdown: 5 options]    │  │
│            │  │  [SIMULATE button]        │  │
│            │  └───────────────────────────┘  │
├────────────┴─────────────────────────────────┤
│  PANEL C: Triple Impact Dashboard (bottom)   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 💰 Energy│ │ 🌿 Carbon│ │ 🛡️ Safety│     │
│  │ kWh saved│ │ tCO₂e    │ │ Score    │     │
│  │ THB saved│ │ reduced  │ │ VSL risk │     │
│  │          │ │ T-VER ฿  │ │ WARNING  │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────────────────────────────────┐    │
│  │  Safety Floor Alert Bar (hidden by   │    │
│  │  default, SHOWN when safety_warning  │    │
│  │  is true) — FULL RED BACKGROUND      │    │
│  │  with warning message from JSON      │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

**CSS specifications:**
- Safety Floor alert: `background-color: #FF0000; color: #FFFFFF; font-size: 24px; font-weight: bold; padding: 20px; text-align: center; display: none;` — when safety_warning is true, set `display: block;` and add a CSS animation: pulse the red background (alternate between #FF0000 and #CC0000 every 0.5 seconds).
- Metric cards in Panel C: White background card with shadow, rounded corners (8px), padding 16px.
- Positive number: `color: #10B981` (green). Negative number: `color: #EF4444` (red). Neutral: `color: #111827` (dark gray).
- Selected segment: highlighted row with `background-color: #DBEAFE` (light blue).

**JavaScript behavior — exact interaction flow:**
1. On page load: fetch all 3 JSON files. Render segment list (Panel A). Render all markers on map (Panel B). Panel C shows "--" (dash) until a simulation is run.
2. User clicks a segment row → that segment is "selected". Map pans to its marker and opens popup. Panel C remains "--" until simulation.
3. User selects an intervention from dropdown + clicks "SIMULATE" button → JS looks up scenario_output.json for (segment_id, intervention_id) match → renders Panel C with data. If safety_warning is true → show the Safety Floor Alert Bar with the warning message AND add pulse animation.
4. When Safety Floor triggers (safety_warning = true): the SIMULATE button text changes to "⚠️ ไม่แนะนำ — ลองทางเลือกอื่น" and turns red. The user can still see the numbers but the UI makes it VERY OBVIOUS this is bad.
5. The map markers MUST update color based on the currently simulated intervention's safety_score_new. This means: after simulation, if a marker's safety degrades, it turns from green → yellow → red.

**Common mistakes to avoid (P2):**
- Do NOT hardcode any Thai text in JavaScript. All text comes from JSON.
- Do NOT use `alert()` for Safety Floor warning. Always use the red alert bar in Panel C.
- Do NOT let the map zoom out of Thailand bounds (lat: 5-20, lng: 97-106).
- Do NOT forget to handle the case where segment or intervention is not found in scenario_output.json (show "ไม่พบข้อมูล").

### 1.3 P3: Pitch + Video + PDF

**You own these files:**
- `pitch/slides.md`
- `pitch/video-script.md`
- `pitch/storyboard.md`
- Final PDF in `submit/`
- Final video in `submit/`

**You do NOT touch:**
- Any file in `src/`

**Slide content specification — EXACT structure per slide:**

```
SLIDE 1: Title
- Title: "CarbonWay — เปลี่ยนค่าไฟทางหลวงให้กลายเป็นทุนพลังงานสะอาด"
- Subtitle: "Self-Funding Green Highway Transition ผ่านกลไก T-VER Carbon Credit"
- Team name at bottom
- Word budget: 20 words max on this slide (title + subtitle only)

SLIDE 2: The Shocking Truth (HOOK)
- Header: "คุณรู้หรือไม่?"
- 3 bullet points (exact wording):
  • "ปิดไฟถนน 1 คืน บนทางหลวง 10 กม. → ประหยัด 1,600 บาท"
  • "แต่ถ้าเกิดอุบัติเหตุเสียชีวิต 1 ราย → มูลค่าความสูญเสียทางเศรษฐกิจ 17-40 ล้านบาท"
  • "ลบล้างการประหยัดไป 30-68 ปี — นี่ไม่ใช่การประหยัด นี่คือการขาดทุน"
- Footer: "Source: TDRI, DOH Internal Study, TGO"
- Word budget: 60 words max

SLIDE 3: The Real Problem
- Header: "ปัญหาที่แท้จริง: กับดักงบประมาณ"
- 4 boxes/cards:
  • "ค่าไฟ 1.7 พันล้านบาท/ปี" (icon: 💡)
  • "K-Value Crisis — งบลงทุนถูกแช่แข็ง" (icon: 🔒)
  • "e-Bidding — LED ชุดละ 18,000 บาท (แพงเกินจริง)" (icon: 💰)
  • "ทางออกตอนนี้: ปิดไฟ (อันตรายและขาดทุน)" (icon: ⚠️)
- Word budget: 50 words max

SLIDE 4: The Insight Nobody Sees
- ONE big statement (center of slide, large font):
  "ค่าไฟ 1.7 พันล้านบาท/ปี ≠ ต้นทุน"
  "ค่าไฟ 1.7 พันล้านบาท/ปี = Carbon Footprint ที่แปลงเป็นเงินได้"
- Small text below:
  "Emission Factor 0.4999 kgCO₂e/kWh (TGO) × T-VER Carbon Credit 100-200 THB/tCO₂e"
- Word budget: 35 words max

SLIDE 5: CarbonWay Solution
- Header: "CarbonWay: วงจรทุนตัวเอง 4 ขั้น"
- Diagram (4 boxes with arrows):
    [1. คำนวณ Carbon Baseline] → [2. จำลองการลงทุน] → [3. วัดผล 3 มิติ] → [4. แปลงเป็น Carbon Credit]
                                                                        ↓
                                                  [รายได้กลับมาลงทุนต่อ] ←┘
- Word budget: 40 words

SLIDE 6: How It Works — Live Demo
- Header: "Demo: ระบบจำลอง CarbonWay"
- 3 screenshots of the prototype with labels:
  • "เลือก Segment → ดู Baseline"
  • "เลือก Intervention → จำลองผลลัพธ์"
  • "Safety Floor → ป้องกันการตัดสินใจที่อันตราย"
- Footer: "ดู Demo เต็มในวิดีโอ"
- Word budget: 30 words (this slide is visual-driven)

SLIDE 7: The Safety Guarantee
- Header: "Safety Floor — นวัตกรรมที่ไม่มีใครทำ"
- Process flow:
  "ทุก Scenario → ตรวจสอบ Safety Score → ถ้า < 30 → ❌ REJECT → แนะนำทางเลือกที่ดีกว่า"
- Comparison table:
  | | ปิดไฟ | Smart Dimming | LED+Solar |
  |---|---|---|---|
  | ประหยัดไฟ | 33% | 35% | 50% |
  | ความปลอดภัย | -35% ❌ | +5% ✅ | +18% ✅ |
- Word budget: 50 words

SLIDE 8: Impact Estimation
- Header: "ผลกระทบที่วัดได้"
- Table (exact data from P1's impact_summary.json):
  | Metric | Value |
  |---|---|
  | Carbon Baseline (ITS) | ~7,100 tCO₂e/year |
  | Carbon Baseline (Streetlights) | ~54,700 tCO₂e/year |
  | Total Addressable Carbon | ~61,800 tCO₂e/year |
  | Potential T-VER Revenue | 6.2M - 12.4M THB/year |
  | VSL Savings (avoiding fatalities) | 17-40M THB per avoided fatality |
- Word budget: 40 words (table is self-explanatory)

SLIDE 9: Roadmap
- Header: "Roadmap: จาก Concept สู่ National Scale"
- Timeline (horizontal):
    [Phase 0: Concept + Mock-up] → [Phase 1: Pilot 1 แขวง] → [Phase 2: ขยาย 10 แขวง] → [Phase 3: National Scale]
           May 2026                    Q3 2026                 Q1 2027                  2028+
- Word budget: 35 words

SLIDE 10: Why Us + Closing
- Header: "ทำไมต้อง CarbonWay?"
- 3 reasons:
  • "ไม่ต้องใช้ Hardware / ไม่ต้องใช้ข้อมูลภายใน — ใช้ Open Data + T-VER ที่มีอยู่จริง"
  • "ทีม: Data + Fullstack + Pitch — ครบวงจร"
  • "ไม่ใช่แค่ Dashboard — คือ Financial Engine ที่สร้างรายได้จากคาร์บอน"
- Closing line (large, center):
  "ถ้าจะทำทางหลวงให้เขียวขึ้น ไม่ต้องรองบ — ให้คาร์บอนจ่ายเอง"
- Word budget: 50 words
```

**Video script specification (5 minutes = exactly 300 seconds):**

The video has 300 seconds. Your script must be 600-750 words total (spoken at ~2-2.5 words/second in Thai). Trim EVERY unnecessary word.

SCRIPT TEMPLATE (fill in the Thai text):

```
SCENE 1 [0:00-1:00, 60s, ~140 words] — THE HOOK
Visual: Black screen, then text fades in: "ทุกคืนที่คุณหลับ..."
Spoken:
"ทุกคืน กรมทางหลวงดับไฟถนนหลายพันดวง เพื่อประหยัดเงิน 1,600 บาทต่อคืน
แต่คุณรู้หรือไม่ว่า ถ้าการดับไฟนั้นทำให้เกิดอุบัติเหตุเสียชีวิตแม้เพียง 1 ราย
มูลค่าความสูญเสียทางเศรษฐกิจที่แท้จริงคือ 17 ถึง 40 ล้านบาท
นั่นหมายความว่าเงินที่ประหยัดได้ทั้งปี ถูกทำลายด้วยอุบัติเหตุเพียงครั้งเดียว
นี่ไม่ใช่การประหยัด — นี่คือการขาดทุนมหาศาลที่มองไม่เห็น
แล้วจะมีทางออกไหม? มี — และมันซ่อนอยู่ในค่าไฟ 1.7 พันล้านบาทนั่นเอง"

SCENE 2 [1:00-1:45, 45s, ~105 words] — THE PROBLEM
Visual: Slide 3 appears (4 boxes: 1.7B, K-Value, e-Bidding, Lights-Off)
Spoken:
"กรมทางหลวงจ่ายค่าไฟฟ้าแสงสว่างและระบบ ITS มากกว่า 1,700 ล้านบาทต่อปี
แต่การจะเปลี่ยนมาใช้ LED และ Solar ต้องใช้เงินลงทุนมหาศาล
ปัญหาคือ งบลงทุนติดกับดัก K-Value — ไม่มีเงินสด
e-Bidding ก็ดันราคา LED พุ่งไปชุดละ 18,000 บาท
ทางออกที่ใช้อยู่ตอนนี้คือปิดไฟ — ซึ่งเราพิสูจน์แล้วว่าขาดทุนมากกว่าประหยัด
โจทย์คือ: เราจะหาเงินจากไหนมาลงทุน โดยไม่ต้องของบเพิ่ม?"

SCENE 3 [1:45-2:30, 45s, ~105 words] — THE INSIGHT
Visual: Slide 4 — the big statement
Spoken:
"นี่คือ insight ที่ไม่มีใครเห็น:
ค่าไฟ 1,700 ล้านบาท ไม่ใช่ต้นทุนที่ต้องตัด
แต่มันคือ carbon footprint มหาศาลที่รอการแปลงเป็นเงิน
เพราะทุกกิโลวัตต์-ชั่วโมงที่เราใช้ = ปล่อยคาร์บอน 0.4999 กิโลกรัม
และภายใต้กลไก T-VER ขององค์การบริหารก๊าซเรือนกระจก
คาร์บอนที่ลดได้ สามารถขายเป็น carbon credit ได้ที่ราคา 100 ถึง 200 บาทต่อตัน
นั่นคือแหล่งทุนใหม่ที่ไม่ต้องของบประมาณแผ่นดินแม้แต่บาทเดียว"

SCENE 4 [2:30-3:30, 60s, ~140 words] — THE DEMO
Visual: Screen recording of prototype — click segment, select intervention, watch numbers update
Spoken:
"นี่คือ CarbonWay — ระบบที่เราสร้างขึ้น
ด้านซ้ายคือรายการเส้นทางทางหลวง แต่ละเส้นมีข้อมูล baseline:
ใช้ไฟเท่าไร ปล่อยคาร์บอนเท่าไร คะแนนความปลอดภัยเท่าไร
เมื่อเราเลือก segment นี้ — ทางหลวงหมายเลข 3049
และเลือก 'เปลี่ยนเป็น LED ทั้งหมด' — กด simulate
ระบบคำนวณทันที: ประหยัดไฟได้ 63,875 kWh ต่อปี
ลดคาร์บอนได้ 31.9 ตัน CO2 ต่อปี
และสร้างรายได้ T-VER 3,190 ถึง 6,380 บาทต่อปี
ที่สำคัญ — คะแนนความปลอดภัยเพิ่มขึ้นจาก 62 เป็น 74"

SCENE 5 [3:30-4:15, 45s, ~105 words] — THE SAFETY FLOOR
Visual: Try selecting LIGHTS_OFF — watch red warning bar appear with pulse animation
Spoken:
"แต่หัวใจที่แท้จริงของ CarbonWay คือ Safety Floor
ดูจะเกิดอะไรขึ้นเมื่อมีคนพยายามเลือก 'ปิดไฟ 22:00-06:00'
ระบบขึ้นแถบแดงทันที: ความปลอดภัยต่ำกว่าเกณฑ์
เสี่ยง VSL สูญเสีย 319 ล้านบาท — มากกว่าเงินที่ประหยัดได้ถึง 1,900 เท่า
ระบบปฏิเสธ และแนะนำทางเลือกที่ดีกว่าแทน
นี่คือ guarantee ว่าการลดคาร์บอนจะไม่มีวันแลกด้วยชีวิตคน"

SCENE 6 [4:15-4:45, 30s, ~70 words] — THE IMPACT
Visual: Slide 8 — Impact numbers table
Spoken:
"เมื่อขยายผลทั่วประเทศ:
โครงข่ายทางหลวง 73,000+ กิโลเมตร
ลดคาร์บอนได้กว่า 29,500 ตัน CO2 ต่อปี
สร้างรายได้ carbon credit 2.9 ถึง 5.9 ล้านบาทต่อปี
และเมื่อราคาคาร์บอนสูงขึ้น — รายได้จะเพิ่มเป็น 14 ล้านบาทต่อปีภายในปี 2030
นี่คือวงจรทุนตัวเองที่แท้จริง"

SCENE 7 [4:45-5:00, 15s, ~35 words] — THE CLOSE
Visual: Slide 10 — closing line
Spoken:
"CarbonWay พิสูจน์ว่าเราไม่ต้องรอให้มีงบประมาณ
แล้วค่อยทำทางหลวงให้เขียวขึ้น
เราแค่ต้องปลดล็อคมูลค่าที่ซ่อนอยู่ในค่าไฟ
ให้คาร์บอนจ่ายเอง — และเปลี่ยนค่าไฟ 1,700 ล้านบาท
ให้เป็นทุนสร้างทางหลวงสีเขียวแห่งอนาคต"
```

**WORD BUDGET ENFORCEMENT:**
- Scene 1: ≤ 140 spoken words
- Scene 2: ≤ 105 spoken words
- Scene 3: ≤ 105 spoken words
- Scene 4: ≤ 140 spoken words
- Scene 5: ≤ 105 spoken words
- Scene 6: ≤ 70 spoken words
- Scene 7: ≤ 35 spoken words
- **TOTAL: ≤ 700 words.** If your script exceeds 700 words, CUT ruthlessly. Remove adjectives. Remove repetition. Every word must earn its place.

### 1.4 Senior Advisor

**Review checkpoints (be present at these exact times):**

| Day | Time | What to review | Pass criteria |
|-----|------|---------------|---------------|
| Day 1 | 12:00 | JSON Schema | All fields have types, all formulas verified |
| Day 1 | 18:00 | Slide 1-5 draft + UI layout | Concept clearly communicated, hook lands |
| Day 2 | 12:00 | Data accuracy | Numbers match wiki sources within 10% |
| Day 2 | 18:00 | Full integration + video script draft | End-to-end flow works, script under 700 words |
| Day 3 | 12:00 | Safety Floor behavior | Lights-off triggers red alert correctly |
| Day 3 | 18:00 | Dry-run video | Timing under 5:30 (allow 30s buffer for final) |
| Day 4 | 12:00 | Final video draft | All scenes present, audio clear, no errors |
| Day 4 | 16:00 | FINAL submission check | PDF ≤ 10 pages, video ≤ 300 seconds, files named correctly |

---

## 2. Daily Execution — Step-by-step instructions

### 🔴 DAY 1: Foundation

**GOAL by 18:00:** JSON v0.1 delivered, UI 3-panel layout working (static), slides 1-5 draft done.

#### P1 — Day 1 Tasks (step-by-step):

**08:00-09:00 — Data extraction**
1. Open `wiki/entities/Energy and Safety Pain Points.md`. Copy these numbers into a scratch file:
   - Line 10-11: 1.7 billion THB/year
   - Line 27-29: 750 VMS, 5000+ CCTV, 14.23 GWh/year
2. Open `wiki/CarbonWay.md`. Scroll to lines 277-303 (Appendix). Copy:
   - ITS carbon baseline: 7,114 tCO₂e/year (from 14.23 GWh × 0.4999)
   - Streetlights carbon baseline: 54,739 tCO₂e/year (from 109.5 GWh × 0.4999)
   - Total reducible: 29,500 tCO₂e/year
3. Open `wiki/entities/Value of a Statistical Life (VSL).md`. Copy line 11-12: 17.2M and 39.9M THB.
4. Open `wiki/entities/Highway Assets Energy Consumption.md`. Note kWh breakdown.

**09:00-10:00 — Create baseline.json**
Create 14 segments (10 normal + 4 extreme). Use the EXACT template from Section 0.3. For each segment:
- Calculate `annual_tco2e` = `annual_kwh * 0.0004999` — use a calculator, do NOT guess.
- Calculate `annual_electricity_cost_thb` = `annual_kwh * 4.0`
- Calculate `vsl_risk_thb` = `safety_incidents_per_year * 39900000`

The 10 normal segments should represent real-ish scenarios:
```
SEG-001: Rural 2-lane, 7km, 140 HPS lights, moderate traffic
SEG-002: Urban 4-lane, 3km, 90 LED lights (already upgraded), high traffic
SEG-003: Highway with ITS, 15km, 300 HPS + VMS + CCTV, high traffic
SEG-004: Mountain road, 12km, 80 HPS lights, low traffic, high incidents
SEG-005: Suburban, 5km, 100 mixed lights, moderate traffic
SEG-006: Expressway section, 8km, 200 HPS + CCTV, very high traffic
SEG-007: Secondary rural, 20km, 60 HPS lights, very low traffic
SEG-008: Industrial zone, 4km, 120 LED, moderate traffic
SEG-009: Tourist route, 10km, 150 HPS, seasonal high traffic
SEG-010: Border highway, 18km, 180 HPS + VMS, moderate traffic
```

The 4 extreme segments (MANDATORY):
```
SEG-EX1: safety_score = 18, safety_incidents = 8.1, 10km, HPS → Tests RED alert
SEG-EX2: annual_kwh = 500000, light_count = 600, HPS → Tests BIG T-VER numbers
SEG-EX3: safety_score = 98, safety_incidents = 0.1, 5km, LED → Tests GREEN state
SEG-EX4: annual_kwh = 12000, light_count = 12, LED → Tests TINY numbers
```

**10:00-11:00 — Create interventions.json**
Use the exact object from Section 0.3. Copy it verbatim. Do not modify the numbers — they are calibrated.

**11:00-12:00 — Finalize & freeze schema**
- Run through all 14 segments. Check: every calculated field uses a formula, not a hardcoded guess.
- Share `baseline.json` + `interventions.json` with P2.
- Announce "SCHEMA FROZEN" — no more structural changes.

**13:00-16:00 — Generate scenario_output.json**
For every combination of (14 segments × 5 interventions = 70 total):
1. Apply Formula 7: `new_annual_kwh = segment.annual_kwh * (1 - intervention.energy_save_pct/100)`
2. Apply Formula 1: `new_annual_tco2e = new_annual_kwh * 0.0004999`
3. Apply Formula 8: `tco2e_reduced = segment.annual_tco2e - new_annual_tco2e`
4. Apply Formula 6: `tver_revenue_thb_low = tco2e_reduced * 100`, `tver_revenue_thb_high = tco2e_reduced * 200`
5. Apply Formula 9: `energy_cost_saved_thb = segment.annual_electricity_cost_thb - (new_annual_kwh * 4.0)`
6. Apply Formula 4: `safety_score_new = CLAMP(segment.safety_score + intervention.safety_impact, 0, 100)`
7. Apply Formula 5: `safety_warning = (safety_score_new < 30)`
8. Apply Formula 10: Calculate `vsl_risk_thb_new`
9. Set `safety_warning_msg` — if safety_warning is false, use `""`. If true, use `"⚠️ ความปลอดภัยต่ำกว่าเกณฑ์! เสี่ยง VSL สูญเสีย {vsl_risk_thb_new/1000000 แบบปัดเศษ} ล้านบาท"`

**IMPORTANT: The LIGHTS_OFF intervention has safety_impact = -35. This means:**
- SEG-001 (safety=62) + LIGHTS_OFF → safety_new = 27 → **WARNING TRIGGERS**
- SEG-EX1 (safety=18) + LIGHTS_OFF → safety_new = 0 (clamped) → **WARNING TRIGGERS HARD**
- SEG-EX3 (safety=98) + LIGHTS_OFF → safety_new = 63 → no warning (safe enough even with lights off)
These cases MUST appear in scenario_output.json. P2 will test against them.

**16:00-18:00 — Generate impact_summary.json**
```json
{
  "total_segments": 14,
  "total_network_km": 126.0,
  "total_annual_kwh_baseline": 1250000.0,
  "total_annual_tco2e_baseline": 625.0,
  "total_annual_electricity_cost_baseline": 5000000.0,
  "its_carbon_baseline_tco2e": 7114.0,
  "streetlights_carbon_baseline_tco2e": 54739.0,
  "full_network_addressable_tco2e": 29500.0,
  "potential_tver_revenue_low": 2950000.0,
  "potential_tver_revenue_high": 5900000.0,
  "future_tver_revenue_2030": 14750000.0,
  "vsl_per_fatality_low": 17200000.0,
  "vsl_per_fatality_high": 39900000.0,
  "safety_floor_threshold": 30,
  "segments_with_safety_warning": 3,
  "total_vsl_risk_baseline": 5200000000.0
}
```
Calculate `total_*` fields by summing across all 14 segments.

**18:00 — DAY 1 SYNC:**
- Hand JSON files to P2. P2 loads them in browser console and checks: `baseline.length === 14`, `Object.keys(interventions).length === 5`, `scenario_output.length === 70`.
- Show slide 1-5 draft to Advisor. Advisor checks: does the hook land? Is the insight clear?

---

#### P2 — Day 1 Tasks (step-by-step):

**08:00-09:00 — Scaffold**
1. Create `src/frontend/index.html` with Leaflet CDN links and 3-panel layout using CSS Grid:
```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8"/>
  <title>CarbonWay</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>
  <header id="header"><h1>🌿 CarbonWay</h1></header>
  <div id="main-container">
    <aside id="panel-a"><!-- segment list --></aside>
    <section id="panel-b"><div id="map"></div><div id="intervention-selector"></div></section>
  </div>
  <footer id="panel-c"><!-- triple impact + safety floor --></footer>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="app.js"></script>
</body>
</html>
```
2. Create `style.css` with this CSS Grid layout:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Sarabun', sans-serif; /* fallback: system-ui */ }
#header { background: #1E3A5F; color: white; padding: 12px 24px; font-size: 20px; }
#main-container { display: grid; grid-template-columns: 30% 70%; height: 55vh; }
#panel-a { overflow-y: auto; border-right: 2px solid #E5E7EB; padding: 12px; }
#panel-b { display: flex; flex-direction: column; }
#map { flex: 1; min-height: 300px; }
#intervention-selector { padding: 12px; background: #F9FAFB; border-top: 1px solid #E5E7EB; }
#panel-c { padding: 16px; border-top: 2px solid #1E3A5F; }
.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
.metric-card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.safety-alert { background: #FF0000; color: white; font-size: 20px; font-weight: bold; padding: 16px; text-align: center; display: none; border-radius: 4px; }
.safety-alert.active { display: block; animation: pulse 0.5s infinite alternate; }
@keyframes pulse { from { background: #FF0000; } to { background: #CC0000; } }
.segment-row { padding: 8px; cursor: pointer; border-bottom: 1px solid #E5E7EB; }
.segment-row.selected { background-color: #DBEAFE; }
.segment-row:hover { background-color: #F3F4F6; }
.positive { color: #10B981; font-weight: bold; }
.negative { color: #EF4444; font-weight: bold; }
```
3. Create `app.js` with skeleton functions:
```javascript
let baselineData = [];
let interventionsData = {};
let scenarioData = [];
let selectedSegment = null;
let selectedIntervention = null;

// Will be populated from JSON in Day 2
// For Day 1: hardcode mock data for layout testing

function renderSegmentList() { /* TODO Day 2 */ }
function renderMap() { /* TODO Day 2 */ }
function simulate() { /* TODO Day 2 */ }
function updateDashboard(result) { /* TODO Day 2 */ }
```

**09:00-12:00 — Build static UI layout**
1. In `renderSegmentList()`: Create 14 hardcoded `<div class="segment-row">` elements in `#panel-a`. Each shows: segment name, length, safety_score.
2. In `renderMap()`: Initialize Leaflet map centered on Thailand (lat: 13.75, lng: 100.5, zoom: 6). Add OpenStreetMap tiles. Hardcode 5-6 markers at various coordinates.
3. In `#intervention-selector`: Add a `<select>` with 5 hardcoded options and a `<button>จำลอง (SIMULATE)</button>`.
4. In `#panel-c`: Add the `.metric-grid` with 3 `.metric-card` divs. Add the `.safety-alert` div. Hardcode placeholder values.

**12:00 — Freeze checkpoint:**
- P1 sends JSON schema. Confirm your CSS class names match the field names.
- If P1 hasn't finalized schema yet, continue with hardcoded layout.

**13:00-16:00 — Make layout responsive + add click handlers**
1. Test segment row click: clicking a row adds `.selected` class, removes from others.
2. Test intervention dropdown: selecting changes `selectedIntervention` variable.
3. Test SIMULATE button: `onclick` calls `simulate()` — for now, just show hardcoded numbers in Panel C to prove the UI updates.
4. Test Safety Floor bar: manually toggle `.active` class to see the red pulse animation.

**16:00-18:00 — Prepare for data integration**
1. Convert `app.js` to use `fetch()` for all 3 JSON files:
```javascript
async function loadData() {
  const [baselineRes, interventionsRes, scenarioRes] = await Promise.all([
    fetch('../data/baseline.json'),
    fetch('../data/interventions.json'),
    fetch('../data/scenario_output.json')
  ]);
  baselineData = await baselineRes.json();
  interventionsData = await interventionsRes.json();
  scenarioData = await scenarioRes.json();
  renderSegmentList();
  renderMap();
}
window.addEventListener('DOMContentLoaded', loadData);
```
2. Set up local server: open terminal, `cd D:\competetetion\DOH\DOH\src`, run `npx serve .` — verify `http://localhost:3000/frontend/index.html` loads.
3. If `npx serve` fails, fallback: rename JSON files to `.js` with `const BASELINE = [...]` and load via `<script>`.

**18:00 — DAY 1 SYNC:**
- Show Advisor: does the 3-panel layout look professional?
- Load P1's JSON files (even if partial). Check `console.log(baselineData.length)` — should be 14.
- **Definition of Done:** All 3 panels render (even with hardcoded data). JSON files load without errors.

---

#### P3 — Day 1 Tasks (step-by-step):

**08:00-09:00 — Re-read context**
1. Re-read `wiki/CarbonWay.md` lines 192-249 (Pitch Story 10 slides).
2. Re-read `wiki/entities/Energy and Safety Pain Points.md` lines 13-17 (Lights-Off Dilemma with VSL numbers).
3. Re-read `wiki/entities/Value of a Statistical Life (VSL).md` lines 10-17.

**09:00-12:00 — Draft slides 1-5**
Write content for slides 1-5 in `pitch/slides.md`. Follow the EXACT structure from Section 1.3 ("Slide content specification"). Paste the headers and bullet points into the file. Do NOT paraphrase numbers — copy them exactly from the sources above.

Key numbers to embed:
- 1,700 ล้านบาท/ปี (from Pain Points line 10-11)
- 1,600 บาท/คืน for 10km (from Pain Points line 14)
- 17-40 ล้านบาท/ราย (from VSL lines 11-12)
- 30-68 ปี to erase savings (from Pain Points line 17)
- 0.4999 kgCO₂e/kWh (from CarbonWay line 92)
- T-VER 100-200 THB/credit (from CarbonWay line 83)
- LED 18,000 THB/ชุด (from Pain Points line 22)
- K-Value liquidity crisis (from Pain Points line 23)

**12:00 — Share storyboard with P2**
Write a 3-bullet list to P2:
1. "I need to record: (a) clicking a segment in the list, (b) clicking SIMULATE, (c) seeing numbers update, (d) seeing RED ALERT for LIGHTS_OFF"
2. "The most important screen for the video is the Safety Floor red alert — make it VERY VISIBLE"
3. "I need 3 scenarios pre-loaded: one LED success case, one LIGHTS_OFF failure case, one Solar big-win case"

**13:00-16:00 — Refine slides 1-5**
1. Read each slide aloud. Time yourself. If any slide takes more than 20 seconds to read → cut words.
2. The HOOK (Slide 2) must be punchy. Test it on the Advisor: "If you only read Slide 2, do you understand the entire problem?"
3. Check: every number on every slide has a source (footnote or reference to wiki line).

**16:00-18:00 — Start video script Scene 1-2**
Write the Thai dialogue for Scene 1 (0:00-1:00) and Scene 2 (1:00-1:45). Follow the word budgets EXACTLY:
- Scene 1: ≤ 140 words
- Scene 2: ≤ 105 words

Count words after writing. If over budget, cut filler phrases: "ซึ่งก็คือ", "ในขณะเดียวกัน", "แน่นอนว่า", "โดยเฉพาะอย่างยิ่ง". Every sentence must deliver information.

**18:00 — DAY 1 SYNC:**
- Read Slide 2 (HOOK) aloud to the team. Get their reaction. If no one says "wow" → rewrite.
- Share slide 1-5 draft with Advisor for overnight review.

---

### 🟡 DAY 2: Integration

**GOAL by 18:00:** Simulator fully interactive, Safety Floor triggers correctly, video script complete, slides 6-10 draft done.

#### P1 — Day 2 Tasks:

**08:00-10:00 — Refine baseline.json data**
1. Cross-check your `annual_kwh` values against the CarbonWay appendix:
   - ITS assets: 14.23 GWh/year ≈ 39,000 kWh/day ≈ 1,625 kWh/hour → sanity check your segments that include CCTV/VMS
   - Streetlights: ~200,000 lights × 0.15kW × 12h = 360,000 kWh/day → for a segment with 140 lights, daily should be ~140 × 0.15 × 12 = 252 kWh
2. If your numbers are >50% off from these benchmarks, recalculate.
3. Verify all 14 segments have `annual_tco2e` matching `annual_kwh × 0.0004999`. Recalculate any that don't match.

**10:00-12:00 — Verify scenario_output.json**
1. Take SEG-EX1 (safety=18) + LIGHTS_OFF (safety_impact=-35): safety_new should be 0 (clamped from -17). `safety_warning` MUST be `true`.
2. Take SEG-EX3 (safety=98) + LIGHTS_OFF: safety_new should be 63. `safety_warning` MUST be `false`.
3. Take any segment + LED_UPGRADE: `tco2e_reduced` should be approximately `segment.annual_tco2e × 0.5`.
4. Run spot checks on 10 random entries. If any field is wrong, fix the formula and regenerate.

**12:00 — Midday check:**
- Ask P2: "Can you load scenario_output.json? Does it have 70 entries?"
- Ask P2: "Find SEG-EX1 + LIGHTS_OFF — does safety_warning = true?"

**13:00-16:00 — Handle data issues**
1. If P2 reports any JSON field missing or wrong type → fix immediately.
2. Add any missing extreme cases if P2 says they can't trigger Safety Floor.
3. Ensure `safety_warning_msg` contains proper Thai text with actual numbers (not template strings).

**16:00-18:00 — Finalize impact_summary.json**
1. Sum all 14 segments' `annual_tco2e` → put in `total_annual_tco2e_baseline`.
2. Sum all `annual_kwh` → put in `total_annual_kwh_baseline`.
3. Count how many entries in scenario_output have `safety_warning = true` → put in `segments_with_safety_warning`.
4. The network-scale numbers (`its_carbon_baseline_tco2e: 7114`, etc.) come from CarbonWay appendix — these are constants, not calculated from your 14 segments.

**18:00 — DAY 2 SYNC:**
- P2 demonstrates full integration.
- P3 shows video script draft + slides 6-10.
- **Definition of Done:** End-to-end simulation works on 5+ segments × 5 interventions. Safety Floor triggers on LIGHTS_OFF scenarios.

---

#### P2 — Day 2 Tasks:

**08:00-10:00 — Connect to real JSON data**
1. Verify `fetch()` calls in `loadData()` return valid data.
2. Replace hardcoded segment list with `baselineData.map()` in `renderSegmentList()`. Each row shows: `item.name_th`, `item.length_km + " กม."`, safety score with color class.
3. Replace hardcoded map markers with `baselineData.forEach()` — create L.marker at `[item.gps_lat, item.gps_lng]`. Color markers: green if safety ≥ 70, yellow if 30-69, red if < 30.

**10:00-12:00 — Implement simulate()**
```javascript
function simulate() {
  if (!selectedSegment || !selectedIntervention) {
    showError('กรุณาเลือก Segment และ Intervention ก่อน');
    return;
  }
  // Find matching result
  const result = scenarioData.find(
    r => r.segment_id === selectedSegment.id && r.intervention_id === selectedIntervention
  );
  if (!result) {
    showError('ไม่พบข้อมูลการจำลองสำหรับชุดนี้');
    return;
  }
  updateDashboard(result);
}
```
- `showError(msg)`: Display a temporary message (not alert()). Use a `<div class="error-toast">` that auto-hides after 3 seconds.

**12:00 — Midday check:**
- Can you load and display all 14 segments?
- Does clicking a segment highlight it and pan the map?

**13:00-16:00 — Implement updateDashboard()**
```javascript
function updateDashboard(result) {
  // Energy card
  document.getElementById('metric-energy-kwh').textContent = 
    (result.energy_cost_saved_thb / 4.0).toFixed(0) + ' kWh/ปี';
  document.getElementById('metric-energy-thb').textContent = 
    '฿' + result.energy_cost_saved_thb.toLocaleString() + '/ปี';
  
  // Carbon card
  document.getElementById('metric-carbon-tco2e').textContent = 
    result.tco2e_reduced.toFixed(1) + ' tCO₂e/ปี';
  document.getElementById('metric-carbon-tver').textContent = 
    '฿' + result.tver_revenue_thb_low.toLocaleString() + ' - ฿' + result.tver_revenue_thb_high.toLocaleString();
  
  // Safety card
  document.getElementById('metric-safety-score').textContent = result.safety_score_new + '/100';
  document.getElementById('metric-safety-score').className = 
    result.safety_score_new >= 70 ? 'positive' : (result.safety_score_new >= 30 ? '' : 'negative');
  
  // Safety Floor alert
  const alertDiv = document.getElementById('safety-alert');
  if (result.safety_warning) {
    alertDiv.textContent = result.safety_warning_msg;
    alertDiv.classList.add('active');
    document.getElementById('simulate-btn').textContent = '⚠️ ไม่แนะนำ — ลองทางเลือกอื่น';
    document.getElementById('simulate-btn').style.backgroundColor = '#EF4444';
  } else {
    alertDiv.classList.remove('active');
    alertDiv.textContent = '';
    document.getElementById('simulate-btn').textContent = 'จำลอง (SIMULATE)';
    document.getElementById('simulate-btn').style.backgroundColor = '';
  }
  
  // Update map marker colors based on new safety scores
  updateMapMarkers();
}
```
- All element IDs above MUST exist in your HTML. Create them now if missing.
- `updateMapMarkers()`: iterate through all markers, change their icon color based on `safety_score_new` for the currently simulated segment. Non-simulated segments keep baseline colors.

**16:00-18:00 — Integration testing**
1. SEG-001 + LED_UPGRADE: safety goes from 62 → 74. All numbers positive. No red alert.
2. SEG-001 + LIGHTS_OFF: safety goes from 62 → 27. RED ALERT appears. Button turns red.
3. SEG-EX1 + LIGHTS_OFF: safety goes from 18 → 0. RED ALERT with VSL warning message.
4. SEG-EX3 + any intervention: safety stays high. No alert.
5. SEG-EX2 + SOLAR_MICROGRID: BIG T-VER revenue numbers appear.
6. SEG-EX4 + SMART_DIMMING: SMALL numbers but still functional.

**18:00 — DAY 2 SYNC:**
- Demo all 6 test cases above to the Advisor.
- Verify P3's video script scene 4-5 (the demo scenes) match what the prototype actually shows.
- **Definition of Done:** All 6 test cases pass. Safety Floor pulse animation visible.

---

#### P3 — Day 2 Tasks:

**08:00-10:00 — Draft slides 6-10**
Write content in `pitch/slides.md`. Follow the EXACT structure from Section 1.3 for slides 6-10. Use the numbers from P1 (ask P1 for `impact_summary.json` numbers if ready, otherwise use CarbonWay appendix numbers).

**10:00-12:00 — Write video script Scene 3-4**
Write the Thai dialogue for Scene 3 (1:45-2:30) and Scene 4 (2:30-3:30).
- Scene 3 word budget: ≤ 105 words
- Scene 4 word budget: ≤ 140 words

**12:00-13:00 — Coordinate with P2**
1. Ask P2: "What does the prototype currently show when someone clicks LIGHTS_OFF?"
2. Verify the Safety Floor warning message text so your video script matches what P2 implements.
3. If the prototype doesn't have pre-loaded demo scenarios yet, tell P2 which 3 segment+intervention combos you want to record:
   - SEG-001 + LED_UPGRADE (success case — numbers improve)
   - SEG-001 + LIGHTS_OFF (failure case — red alert triggers)
   - SEG-EX2 + SOLAR_MICROGRID (big impact case — large T-VER numbers)

**13:00-15:00 — Write video script Scene 5-7**
- Scene 5 (Safety Floor demo): ≤ 105 words
- Scene 6 (Impact numbers): ≤ 70 words
- Scene 7 (Close): ≤ 35 words

**15:00-16:00 — Word count enforcement**
Count every word in your script. Use exact counting: every Thai word separated by space counts as 1. If total > 700:
1. Remove all instances of "ครับ/ค่ะ" (save 10+ words)
2. Remove "ซึ่งก็คือ" → replace with "คือ" (save 3+ words)
3. Remove "ในขณะเดียวกัน" → replace with nothing (save 5+ words)
4. Remove "เป็นที่น่าสังเกตว่า" → replace with nothing (save 5+ words)
5. Cut any adjective that doesn't add a fact.

**16:00-18:00 — Polish all slides**
1. Read all 10 slides in sequence. Total reading time should be ~2 minutes.
2. Check number consistency: does Slide 3's "1.7 พันล้าน" match Slide 4 and Slide 8?
3. Check Slide 7: the comparison table must have the same intervention names as the prototype.

**18:00 — DAY 2 SYNC:**
- Read Scene 1-2 aloud. Time it — must be under 1:45.
- Show slides 6-10 draft to Advisor.

---

### 🟢 DAY 3: Polish & Pre-record

**GOAL by 18:00:** Video-ready prototype. Finalized script. Full dry-run completed. PDF design started.

#### P1 — Day 3 Tasks:

**08:00-10:00 — Validation against benchmarks**
Compare your JSON values to these known benchmarks. If any value is off by more than 20%, fix it.
```
Benchmark 1: ITS energy = 14,230,000 kWh/year = 7,114 tCO₂e/year
Check: Sum annual_kwh for all segments that have "has_cctv": true. Should be in the right ballpark.

Benchmark 2: Streetlights = ~109,500,000 kWh/year = 54,739 tCO₂e/year (national scale)
Your 14 segments won't reach this — but per-segment sanity check:
- 1 light × 0.15kW × 12h × 365 = 657 kWh/year per light
- SEG-001: 140 lights × 657 = 91,980 kWh/year → your annual_kwh should be around this

Benchmark 3: 1 fatality = 39.9M THB (upper bound)
Check: vsl_risk_thb for SEG-EX1 (8.1 incidents): 8.1 × 39,900,000 = 323,190,000 THB
```

**10:00-12:00 — Fix data bugs**
1. Open `scenario_output.json`. Search for any `tver_revenue_thb_low` that is 0 or negative — if the intervention saves energy, T-VER revenue must be > 0.
2. Search for any `safety_score_new` outside 0-100 range — clamp it.
3. Search for `safety_warning_msg` that still contains template text like `{vsl_risk_thb_new/1000000}` — replace with actual computed number.

**13:00-16:00 — Prepare "demo state" for video**
Create a copy of scenario_output.json with ONLY the entries P3 needs for the video:
1. SEG-001 + LED_UPGRADE → show this first (success)
2. SEG-001 + LIGHTS_OFF → show this second (red alert!)
3. SEG-EX2 + SOLAR_MICROGRID → show this third (big T-VER numbers)

Ensure these 3 entries have:
- Visually impressive numbers (use larger segments for bigger impact)
- Working safety_warning messages in correct Thai
- No calculation errors

**16:00-18:00 — Day 3 Sync & Dry-run**
- Be available during the dry-run to answer: "Is this number correct?"
- If any number looks wrong during recording, note it and fix it overnight.

---

#### P2 — Day 3 Tasks:

**08:00-10:00 — Visual polish**
1. Fonts: Add Google Fonts link for "Sarabun" (Thai-readable): `<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">`
2. Map marker icons: Instead of default blue pins, create colored circle markers:
```javascript
function getMarkerColor(safetyScore) {
  if (safetyScore >= 70) return '#10B981';   // green
  if (safetyScore >= 30) return '#F59E0B';   // yellow/amber
  return '#EF4444';                           // red
}
// Use L.circleMarker with radius 10, fillColor from above, color: white, weight: 2
```
3. Number formatting: All THB values should use `.toLocaleString('th-TH')` for Thai number formatting.
4. Add CarbonWay logo: Use a CSS-styled div with "🌿 CW" in the header. No image file needed.

**10:00-12:00 — Prepare Demo Mode**
Add a "Demo Mode" button that pre-loads 3 specific scenarios and auto-plays them with a 3-second delay between each:
```javascript
const DEMO_SEQUENCE = [
  { seg: 'SEG-001', intv: 'LED_UPGRADE' },
  { seg: 'SEG-001', intv: 'LIGHTS_OFF' },
  { seg: 'SEG-EX2', intv: 'SOLAR_MICROGRID' }
];
let demoIndex = 0;
function runDemoMode() {
  if (demoIndex >= DEMO_SEQUENCE.length) { demoIndex = 0; return; }
  const step = DEMO_SEQUENCE[demoIndex];
  // Select segment
  selectedSegment = baselineData.find(s => s.id === step.seg);
  // Select intervention
  document.getElementById('intervention-select').value = step.intv;
  selectedIntervention = step.intv;
  // Simulate
  simulate();
  demoIndex++;
  if (demoIndex < DEMO_SEQUENCE.length) {
    setTimeout(runDemoMode, 4000); // 4 seconds between demos
  }
}
```
Demo Mode button: `<button id="demo-btn" onclick="runDemoMode()">🎬 Demo Mode</button>` in the header.

**12:00 — Midday check:**
- Does the pulse animation on Safety Floor alert work smoothly in Chrome/Firefox?
- Are number values readable from 2 meters away? (Video viewers watch from a distance.)

**13:00-16:00 — Video-ready cleanup**
1. Remove ALL `console.log()` statements (they might appear in screen recording).
2. Remove any debug borders or background colors that aren't intentional.
3. Ensure all text is Thai (no English labels in the UI except "CarbonWay" branding).
4. Add a subtle CSS transition on number changes: `transition: all 0.3s ease;` on metric values.
5. Zoom the map to fit all 14 markers with `map.fitBounds(bounds)`.

**16:00-18:00 — Day 3 Sync: Dry-run recording**
- P3 will record a rough screen capture. Be present to fix any UI issues in real-time.
- Common issues to watch for:
  - Map tiles not loading (white screen) → pre-cache or use a different tile provider
  - Text too small on 1080p recording → increase `font-size` temporarily for recording
  - Animation too fast to see → increase `setTimeout` delay in demo mode

---

#### P3 — Day 3 Tasks:

**08:00-10:00 — Finalize video script**
1. Read the entire script aloud from start to finish. Time it with a stopwatch.
2. Target: 4:45-5:15. If under 4:30 → add detail. If over 5:15 → CUT words (start with scene 6 — it has the most room).
3. Mark natural pause points (where you'll breathe or let a visual sink in).

**10:00-12:00 — Practice delivery**
1. Record yourself reading the script on your phone. Listen back.
2. Fix: mumbling, rushing, monotone delivery.
3. Scene 1 (the hook) MUST have energy and urgency in your voice.
4. Scene 4 (the demo) MUST be calm and clear — viewers are watching the screen, not your face.

**12:00-13:00 — Sync with P2**
1. Confirm the exact UI flow for the demo scenes.
2. Update your script if P2 changed any button labels or field names.
3. Get the exact text of the Safety Floor warning message from P2's UI so your narration matches.

**13:00-16:00 — Start PDF design**
1. Open Canva (or Figma, or PowerPoint).
2. Create a new presentation, 16:9 ratio.
3. Import slide content from `pitch/slides.md` — one slide per page.
4. Design system:
   - Primary color: `#1E3A5F` (dark navy — trust/government feel)
   - Accent color: `#10B981` (green — carbon/environment)
   - Warning color: `#EF4444` (red — safety alerts)
   - Background: White or very light gray `#F9FAFB`
   - Font: Sarabun (Thai) for body, modern sans-serif for headings
5. Slides 1-5: Design complete layout with the content you wrote.

**16:00-18:00 — Dry-run recording (with P1 + P2)**
1. Record a rough screen capture of the prototype (use OBS, Windows Game Bar, or QuickTime).
2. Play back and check: is every UI element visible? Are numbers readable?
3. Note timing of each demo action for the final recording.

---

### 🔵 DAY 4: Final Assembly

**GOAL by 16:00:** Video .mp4 ready, PDF ready, all files in `submit/` folder, ready to upload.

#### P1 — Day 4 Tasks:

**08:00-10:00 — Final data freeze**
1. Do NOT modify any JSON files unless P2 or P3 reports a critical error.
2. Prepare a `README.md` in `src/data/` (optional) explaining data sources and formulas.
3. Export any data visualizations (charts, tables) that P3 might want in the PDF.

**10:00-12:00 — HELP P3: Screenshots for PDF**
1. Take clean screenshots of the prototype at these states:
   - Baseline map with all markers (for Slide 6)
   - Simulator showing LED_UPGRADE success (for Slide 6)
   - Safety Floor red alert triggered (for Slide 7)
2. Crop and format screenshots. Save to `pitch/screenshots/`.

**12:00-14:00 — HELP P3: PDF data review**
1. Review P3's PDF draft. Check EVERY number:
   - Slide 3: 1.7 billion THB/year — correct?
   - Slide 7: Safety Floor comparison table numbers — match scenario_output.json?
   - Slide 8: Impact table numbers — match impact_summary.json?
2. Flag any discrepancy immediately.

**14:00-16:00 — HELP P3: Video review**
1. Watch P3's video draft. Listen for any misstated numbers.
2. Check that the demo scenes show correct values.
3. If P3 needs a specific screenshot or number, provide it immediately.

**16:00 — FINAL REVIEW with whole team.**

---

#### P2 — Day 4 Tasks:

**08:00-10:00 — Final bug fixes only**
1. Fix ONLY critical bugs (crashes, wrong numbers, broken interactions).
2. Do NOT add new features. Do NOT refactor code.
3. Do NOT change CSS colors or layout unless broken.

**10:00-12:00 — FREEZE PROTOTYPE for video recording**
1. Commit all code to git. Tag it `v1.0-video-ready`.
2. Start local server. Confirm it runs. Leave it running for P3.
3. Hand over to P3: "The prototype is frozen. Record now. Do not ask me to change anything unless it crashes."
4. Stand by for emergency fixes only.

**12:00-14:00 — HELP P3: Video quality check**
1. Watch P3's recorded screen capture. Look for:
   - Map tiles loading properly (not blank/gray)
   - Text readability at 1080p
   - No cursor mis-clicks or UI glitches visible
2. If re-recording needed, reset the demo state and re-run.

**14:00-16:00 — Prepare submission files**
1. Create `submit/prototype/` folder.
2. Copy `src/frontend/` and `src/data/` into it.
3. Test that `submit/prototype/frontend/index.html` loads correctly from local file system (no server needed) or with `npx serve`.
4. Zip the prototype folder if submission requires it.

**16:00 — FINAL REVIEW with whole team.**

---

#### P3 — Day 4 Tasks:

**08:00-09:00 — Warm up**
1. Read the final script aloud 2 times. Focus on Scene 1 — this is the most important minute.
2. Check recording equipment: microphone working, no background noise, recording software (OBS/Audacity) ready.

**09:00-10:00 — Record FINAL audio**
1. Record in a quiet room. Phone on silent. Close windows.
2. Record ALL 7 scenes in one take first (easier to maintain consistent tone).
3. If you stumble, pause, take a breath, and re-read that sentence. You'll edit out mistakes.
4. Save as `pitch/audio-raw.wav` or `.mp3`.

**10:00-11:00 — Edit audio**
1. Open audio in any editor (Audacity is free). Cut out mistakes, long pauses, retakes.
2. Normalize volume to consistent level.
3. Export as `submit/audio-final.mp3` (or keep embedded in video editor).

**11:00-13:00 — Record screen capture**
1. Use OBS Studio (free) or Windows Game Bar (Win+G).
2. Set recording resolution to 1920×1080, 30fps.
3. Record EACH scene separately (easier to edit):
   - Scene 4: Record clicking segment → selecting LED → clicking SIMULATE → showing results
   - Scene 5: Record clicking LIGHTS_OFF → SIMULATE → red alert appears. Let the pulse animation play for 5 seconds.
   - Scene 6: just show the slide (no screen recording needed, or show the impact summary in the prototype)
4. Save each recording as a separate file.

**13:00-15:00 — Edit video**
1. Use any video editor (CapCut free, DaVinci Resolve, iMovie, or even Canva).
2. Timeline:
   ```
   0:00-1:00  → Slide 2 visual + Scene 1 audio
   1:00-1:45  → Slide 3 visual + Scene 2 audio
   1:45-2:30  → Slide 4 visual + Scene 3 audio
   2:30-3:30  → Screen recording (LED demo) + Scene 4 audio
   3:30-4:15  → Screen recording (Safety Floor) + Scene 5 audio
   4:15-4:45  → Slide 8 visual + Scene 6 audio
   4:45-5:00  → Slide 10 visual + Scene 7 audio
   ```
3. Sync audio to visuals precisely. The Safety Floor pulse animation should appear EXACTLY as you say "ระบบขึ้นแถบแดงทันที".
4. Add a title card at 0:00: "CarbonWay — DOH Hackathon 2026" (3 seconds).
5. Export as `submit/CarbonWay_Demo.mp4`, 1080p, H.264, 30fps.

**15:00-16:00 — Finalize PDF**
1. Complete slides 6-10 design in Canva/Figma (if not done on Day 3).
2. Insert screenshots from P1 into slides 6-7.
3. Export as `submit/CarbonWay_Pitch.pdf`.
4. Verify: exactly 10 pages (not 9, not 11). PDF file size under 20MB.

**16:00 — FINAL REVIEW with whole team.**

---

#### Senior Advisor — Day 4 Tasks:

**08:00 — Morning check:** Is P3 on track to finish video by 15:00? If not, pull P1/P2 to help earlier.

**12:00 — Video draft review:** Watch the rough cut. Check:
- Audio clear? No background noise?
- Hook (first 60s) gripping?
- All numbers in narration match PDF?
- Video length: 4:45-5:15?

**14:00 — PDF review:** Check against submission criteria:
- Exactly 10 pages?
- Font readable?
- All numbers sourced?
- Color scheme consistent?

**16:00 — FINAL SUBMISSION CHECK:**
- Submit folder contains: `CarbonWay_Pitch.pdf` + `CarbonWay_Demo.mp4`
- PDF: 10 pages, under 20MB, readable text, all numbers correct
- Video: 5:00 ± 15 seconds, 1080p, clear audio, all 7 scenes present
- Prototype: working, included or linked
- File names match submission requirements from the hackathon guide

---

## 3. Submission Checklist

| # | Item | Pass? | Notes |
|---|------|-------|-------|
| 1 | PDF exactly 10 slides | ☐ | Count pages in PDF viewer |
| 2 | PDF under 20MB | ☐ | Check file properties |
| 3 | Video duration 4:45-5:15 | ☐ | Check in media player |
| 4 | Video resolution ≥ 1080p | ☐ | Check file properties |
| 5 | Video audio clear (no static, no echo) | ☐ | Listen with headphones |
| 6 | Slide 2 HOOK is the first thing judges see (after title) | ☐ | Open PDF |
| 7 | Self-funding loop diagram visible (Slide 5 or 6) | ☐ | |
| 8 | Safety Floor demonstrated (Slide 7 AND video Scene 5) | ☐ | |
| 9 | Impact numbers match wiki sources ±10% | ☐ | Cross-check with CarbonWay appendix |
| 10 | T-VER mechanism explained (Slide 4-5) | ☐ | |
| 11 | VSL concept explained (Slide 2 or 7) | ☐ | |
| 12 | Closing line: "ให้คาร์บอนจ่ายเอง" | ☐ | Slide 10 and video Scene 7 |
| 13 | Prototype runs without errors | ☐ | Test on clean browser |
| 14 | All file names match submission format | ☐ | Check hackathon guide for naming rules |

---

## 4. Risk Response — If Things Go Wrong

| Situation | Immediate action |
|-----------|-----------------|
| JSON data has wrong numbers discovered Day 3 | P1 fixes ONLY the 3 demo entries P3 needs for video. Rest can wait. |
| Prototype crashes during video recording | P2: 5-min fix window. If not fixable → P3 uses slides/screenshots instead. |
| P3 can't finish video by 16:00 Day 4 | P1 and P2 drop everything at 12:00. P2 edits video (technical). P1 finalizes PDF. |
| Can't record clean audio | Use AI text-to-speech (e.g., VoxEdit, ElevenLabs Thai) as emergency fallback. P3 prepares phonetic script for TTS input. |
| Map tiles don't load (offline/blocked) | P2 switches to `https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png` (HOT OSM tiles) or pre-downloads tiles for Thailand bounds. |
| `npx serve` fails | P2 uses Python: `python -m http.server 3000 --directory src` or renames JSON to `.js` files. |

---

## 5. Key Numbers Quick Reference (print this)

| Number | Value | Source |
|--------|-------|--------|
| Emission factor | 0.4999 kgCO₂e/kWh | TGO (CarbonWay line 92) |
| DOH annual electricity | 1,700,000,000 THB | Pain Points line 10-11 |
| VSL per fatality (low) | 17,200,000 THB | VSL line 11 |
| VSL per fatality (high) | 39,900,000 THB | VSL line 12 |
| ITS energy | 14.23 GWh/year | Pain Points line 28 |
| ITS carbon | 7,114 tCO₂e/year | CarbonWay line 286 |
| Streetlights carbon | 54,739 tCO₂e/year | CarbonWay line 298 |
| Total reducible network carbon | 29,500 tCO₂e/year | CarbonWay line 307 |
| T-VER price (current) | 100-200 THB/tCO₂e | CarbonWay line 83 |
| T-VER price (2030 est.) | 300-500 THB/tCO₂e | CarbonWay line 310 |
| Highway network | 73,000+ km | CarbonWay line 85 |
| Lights-off savings | 1,600 THB/night/10km | Pain Points line 14 |
| Lights-off annual savings | 584,000 THB/year/10km | Pain Points line 16 |
| LED unit cost | 18,000 THB/set | Pain Points line 22 |
| LED energy savings | 50% | Pain Points line 19 |
| Safety Floor threshold | safety_score < 30 | CarbonWay line 121 |
