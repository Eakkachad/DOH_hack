# AGENT PROMPT: P2 — Fullstack Developer

You are Person 2 in a 4-day hackathon sprint. Your role is Fullstack Developer. You build the interactive CarbonWay web prototype.

## YOUR JOB
Build a single-page web app with 3 panels: Segment List + Map, Intervention Selector, Triple Impact Dashboard with Safety Floor alert.

## YOUR BOUNDARIES
- You ONLY touch files in `src/frontend/` (index.html, style.css, app.js)
- You NEVER touch `src/data/` or `pitch/`
- All data comes from P1's JSON files via `fetch()` — do NOT hardcode numbers or Thai text

## TECH STACK (mandatory)
- Plain HTML + CSS + vanilla JavaScript (no React, no build tools)
- Leaflet.js from CDN: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- Serve via `npx serve src` from project root (or `python -m http.server` as fallback)

## DATA CONTRACT (from P1)
Load these 3 files via fetch:
- `fetch('../data/baseline.json')` → array of 14 segment objects (see schema below)
- `fetch('../data/interventions.json')` → object with 5 intervention keys
- `fetch('../data/scenario_output.json')` → array of 70 result objects

### Segment schema (what you'll render)
```
id, name_th, length_km, light_count, light_type, annual_kwh, annual_tco2e,
annual_electricity_cost_thb, avg_daily_traffic, safety_incidents_per_year,
safety_score (0-100), vsl_risk_thb, has_cctv, has_vms,
province, district, gps_lat, gps_lng
```

### Scenario output schema (what you look up on simulate)
```
segment_id, intervention_id, new_annual_kwh, new_annual_tco2e,
tco2e_reduced, tver_revenue_thb_low, tver_revenue_thb_high,
energy_cost_saved_thb, safety_score_new, safety_warning (bool),
safety_warning_msg (string), vsl_risk_thb_new
```

## UI LAYOUT — Build this exactly

```
┌──────────────────────────────────────────────┐
│  HEADER: "🌿 CarbonWay" (dark navy #1E3A5F)  │
├────────────┬─────────────────────────────────┤
│  PANEL A   │  PANEL B                        │
│  (30%)     │  (70%)                          │
│  Segment   │  ┌───────────────────────────┐  │
│  List      │  │  MAP (Leaflet)            │  │
│  - 14 rows │  │  Circle markers color by  │  │
│  - Click   │  │  safety_score:            │  │
│    to      │  │  Green ≥ 70               │  │
│    select  │  │  Yellow 30-69             │  │
│            │  │  Red < 30                 │  │
│            │  └───────────────────────────┘  │
│            │  ┌───────────────────────────┐  │
│            │  │  INTERVENTION SELECTOR    │  │
│            │  │  <select> 5 options       │  │
│            │  │  <button> SIMULATE        │  │
│            │  └───────────────────────────┘  │
├────────────┴─────────────────────────────────┤
│  PANEL C: Triple Impact Dashboard            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 💰 Energy│ │ 🌿 Carbon│ │ 🛡️ Safety│     │
│  │ X kWh/ปี │ │ X tCO₂e  │ │ XX/100   │     │
│  │ ฿X/ปี    │ │ saved    │ │ VSL risk │     │
│  │          │ │ T-VER ฿  │ │          │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────────────────────────────────┐    │
│  │  SAFETY FLOOR ALERT (hidden default)  │    │
│  │  RED background, white text, pulse   │    │
│  │  Shows safety_warning_msg from JSON  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## CSS SPECIFICATIONS (copy-paste)
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Sarabun', sans-serif; }
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

## JAVASCRIPT BEHAVIOR

### Data loading (runs on page load)
```javascript
async function loadData() {
  const [b, i, s] = await Promise.all([
    fetch('../data/baseline.json'),
    fetch('../data/interventions.json'),
    fetch('../data/scenario_output.json')
  ]);
  baselineData = await b.json();
  interventionsData = await i.json();
  scenarioData = await s.json();
  renderSegmentList();
  renderMap();
}
```

### renderSegmentList()
- Map baselineData to create one `<div class="segment-row">` per segment
- Show: name_th, length_km + " กม.", safety_score with color class
- On click: set selectedSegment, highlight row, pan map to gps_lat/gps_lng

### renderMap()
- Init Leaflet map centered on Thailand (lat:13.75, lng:100.5, zoom:6)
- Add OpenStreetMap tiles
- Create L.circleMarker for each segment, radius 10
- Color: green (safety≥70), orange (30-69), red (<30)

### simulate()
```javascript
function simulate() {
  if (!selectedSegment || !selectedIntervention) return showError('กรุณาเลือก Segment และ Intervention');
  const result = scenarioData.find(r => r.segment_id === selectedSegment.id && r.intervention_id === selectedIntervention);
  if (!result) return showError('ไม่พบข้อมูล');
  updateDashboard(result);
}
```

### updateDashboard(result)
- Energy card: show `energy_cost_saved_thb/4` kWh + `energy_cost_saved_thb` THB
- Carbon card: show `tco2e_reduced` tCO₂e + T-VER revenue range
- Safety card: show `safety_score_new`/100 with green/yellow/red color
- Safety Floor alert: if `safety_warning === true` → show red bar with `safety_warning_msg`, pulse animation, change SIMULATE button to "⚠️ ไม่แนะนำ — ลองทางเลือกอื่น" in red. Else hide bar.
- Update map marker colors based on new safety score

### updateMapMarkers()
- Re-color the currently simulated segment's marker based on safety_score_new
- Other markers keep baseline colors

## TEST CASES (must pass by Day 2 18:00)
1. SEG-001 + LED_UPGRADE → safety 62→74, all green, no alert
2. SEG-001 + LIGHTS_OFF → safety 62→27, RED ALERT with pulse
3. SEG-EX1 + LIGHTS_OFF → safety 18→0, RED ALERT
4. SEG-EX3 + any → safety stays high, no alert
5. SEG-EX2 + SOLAR_MICROGRID → BIG T-VER revenue
6. SEG-EX4 + SMART_DIMMING → small numbers, still functional

## DEMO MODE (add on Day 3)
```javascript
const DEMO_SEQUENCE = [
  { seg: 'SEG-001', intv: 'LED_UPGRADE' },
  { seg: 'SEG-001', intv: 'LIGHTS_OFF' },
  { seg: 'SEG-EX2', intv: 'SOLAR_MICROGRID' }
];
```
Auto-play with 4-second delay between demos. Add `<button>🎬 Demo Mode</button>` in header.

## SCHEDULE
- **Day 1:** Scaffold HTML/CSS/JS skeleton → static layout with hardcoded data → fetch plumbing ready
- **Day 2:** Connect real JSON → implement simulate() + updateDashboard() → pass all 6 test cases
- **Day 3:** Visual polish (fonts, colors, transitions) → Demo Mode → video-ready cleanup (remove console.log, fix text size)
- **Day 4:** Bug fixes only → FREEZE for video → help P3 with screen recording → zip submission

## COMMON MISTAKES TO AVOID
- Do NOT use alert(). Use a toast div that auto-hides.
- Do NOT hardcode Thai text — read from JSON.
- Do NOT let map zoom outside Thailand (lat:5-20, lng:97-106).
- Handle missing segment/intervention gracefully (show "ไม่พบข้อมูล").
- Remove ALL console.log() before Day 3 end.
