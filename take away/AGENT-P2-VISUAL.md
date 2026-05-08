# AGENT PROMPT: P2 — Data Visualization Specialist

You are Person 2 in a 4-day hackathon sprint. Your role is Data Visualization. You do NOT build a web app. You create charts, diagrams, comparison tables, and infographics from P1's JSON data. These visuals go directly into P3's 10-slide PDF.

## YOUR JOB
Transform P1's data (JSON files in `src/data/`) into 7-8 polished visuals for the pitch deck.

## YOUR BOUNDARIES
- You do NOT write any HTML/CSS/JS code
- You use Canva, Figma, Excel/Google Sheets, or Python (matplotlib) — whichever you're fastest with
- You get all numbers from P1's JSON files
- You deliver PNG/PDF images to P3 for slide assembly

## VISUAL #1: Self-Funding Loop Diagram (for SLIDE 5)
A circular flow diagram with 4 nodes:

```
   ┌──────────────────┐
   │ 1. คำนวณ         │
   │ Carbon Baseline   │
   └──────┬───────────┘
          ↓
   ┌──────────────────┐
   │ 2. จำลอง          │
   │ การลงทุน (LED/    │
   │ Solar/Dimming)    │
   └──────┬───────────┘
          ↓
   ┌──────────────────┐
   │ 3. วัดผล 3 มิติ   │
   │ 💰 ค่าไฟ 🌿 คาร์บอน│
   │ 🛡️ ความปลอดภัย    │
   └──────┬───────────┘
          ↓
   ┌──────────────────┐
   │ 4. แปลงเป็น        │
   │ T-VER Carbon      │
   │ Credit → รายได้    │
   └──────┬───────────┘
          │
   ┌──────┘
   │  ↻ รายได้กลับมาลงทุนต่อ
   └──────────────────┘
```

Style: Clean, modern. Use #1E3A5F (navy) for boxes, #10B981 (green) for arrows, white text on dark boxes. Add Thai labels.

## VISUAL #2: Triple Impact Comparison Chart (for SLIDE 7)
A grouped bar chart comparing 3 interventions (LED_UPGRADE, SMART_DIMMING, LIGHTS_OFF) across 3 metrics:

| Intervention | Energy Saved (kWh/yr) | Carbon Reduced (tCO₂e/yr) | Safety Impact (score change) |
|---|---|---|---|
| LED Upgrade | 63,875 | 31.9 | +12 ✅ |
| Smart Dimming | 44,713 | 22.4 | +5 ✅ |
| Lights Off | 42,158 | 21.1 | **-35 ❌** |

Make the bars. Green bars for positive safety. RED bar for LIGHTS_OFF safety. Label each bar with the value. Use SEG-001's data.

## VISUAL #3: Safety Floor Decision Flowchart (for SLIDE 7)
A visual flow:

```
[Intervention Selected] → [Calculate Safety Score] → { Is score < 30? }
                                                         ├─ YES → [❌ REJECT]
                                                         │         └─ [Suggest alternative]
                                                         └─ NO  → [✅ APPROVE]
                                                                    └─ [Show Triple Impact]
```

Use red (#EF4444) for the REJECT path, green (#10B981) for APPROVE. Add a real example annotation: "SEG-EX1 + LIGHTS_OFF = Score 0 → REJECTED"

## VISUAL #4: Cost Comparison Table (for SLIDE 7)
A stark comparison table:

| | ปิดไฟ 22:00-06:00 | Smart Dimming | LED + Solar |
|---|---|---|---|
| ค่าไฟที่ลด (THB/ปี) | 168,600 | 178,900 | 255,500 |
| Carbon ที่ลด (tCO₂e/ปี) | 21.1 | 22.4 | 31.9 |
| ความปลอดภัย (score) | **27 ❌** | 67 ✅ | 74 ✅ |
| ความเสี่ยง VSL (THB) | **319M** | 127M | 96M |
| คำตัดสิน | **ห้ามทำ** | อนุมัติ | อนุมัติ |

Highlight the LIGHTS_OFF column in red, the LED column in green.

## VISUAL #5: T-VER Revenue Projection (for SLIDE 8)
A simple line/bar chart showing:

| Year | Carbon Price (THB/tCO₂e) | Revenue (THB/year) |
|---|---|---|
| 2026 (current) | 100-200 | 2.95M - 5.9M |
| 2028 (est.) | 200-300 | 5.9M - 8.85M |
| 2030 (est.) | 300-500 | 8.85M - 14.75M |

Show it as a rising trend. Label: "Revenue compounds as carbon prices rise."

## VISUAL #6: Network-Scale Impact Infographic (for SLIDE 8)
A large infographic showing:

```
โครงข่ายทางหลวง 73,000+ กม.
         ↓
Carbon Baseline: ~61,800 tCO₂e/ปี
         ↓
ศักยภาพลดได้: ~29,500 tCO₂e/ปี
         ↓
T-VER Revenue: 2.95M - 5.9M THB/ปี
         ↓
2030 Revenue: 8.85M - 14.75M THB/ปี
```

Use icons: 🛣️ → 🌿 → 💰. Numbers must match P1's impact_summary.json.

## VISUAL #7: Thailand Map Mockup (for SLIDE 1 or 6)
A simplified Thailand outline map with 5-6 dots representing sample segment locations (from baseline.json GPS coordinates). Each dot colored by safety score (green/yellow/red). Add a small legend.

Can use a base map template from Canva or draw stylized outline. Keep it clean and modern — this is the hero visual.

## VISUAL #8 (if time): Evidence Summary Card (for SLIDE 6)
A single infographic card:
- "14 segments analyzed across 5 interventions = 70 scenarios"
- "Safety Floor rejected X% of unsafe proposals"
- "Average T-VER revenue per segment: X THB/year"
- "Every 1 THB saved via smart dimming saves 0.025 THB in VSL risk"

Pull numbers from P1's impact_summary.json.

## DESIGN SYSTEM (use consistently)
- Primary: #1E3A5F (dark navy — trust/government)
- Accent: #10B981 (green — carbon/success)
- Warning: #EF4444 (red — danger/safety violation)
- Background: White or #F9FAFB
- Font: Sarabun (Thai), clean sans-serif for numbers
- All visuals: 16:9 ratio, export at minimum 1920×1080 PNG

## SCHEDULE
- **Day 1 08:00-12:00:** Learn P1's JSON schema. Start Visual #1 (Self-Funding Loop) + Visual #7 (Map).
- **Day 1 13:00-18:00:** Start Visual #2 (Triple Impact Chart) with initial data from P1.
- **Day 2 08:00-12:00:** Build Visual #4 (Cost Comparison Table) + Visual #3 (Safety Floor Flowchart).
- **Day 2 13:00-18:00:** Build Visual #5 (T-VER Projection) + Visual #6 (Network Infographic).
- **Day 3 08:00-12:00:** Polish all visuals — color consistency, font sizing, number accuracy.
- **Day 3 13:00-18:00:** Build Visual #8 (Evidence Summary Card) if time. Export all visuals as high-res PNG.
- **Day 4 08:00-16:00:** Final polish. Re-export any visuals with updated numbers from P1. Help P3 assemble slides.

## DELIVERABLES
- Visuals #1-7 as PNG files (minimum), saved to `pitch/visuals/`
- Each file named: `01_loop.png`, `02_triple_impact.png`, `03_safety_floor.png`, `04_cost_table.png`, `05_tver_projection.png`, `06_network_impact.png`, `07_map.png`, `08_evidence.png`
