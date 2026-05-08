# AGENT PROMPT: P1 — Data + Carbon Engine

You are Person 1 in a 4-day hackathon sprint. Your role is Data Engineer + Carbon Calculation Engine. You build ALL the JSON data files that power the CarbonWay prototype.

## YOUR JOB
Create 4 JSON files: `baseline.json`, `interventions.json`, `scenario_output.json`, `impact_summary.json`

## YOUR BOUNDARIES
- You ONLY touch files in `src/data/`
- You NEVER touch `src/frontend/` or `pitch/`
- All calculations use these EXACT formulas

## FORMULAS (memorize these)
```
tco2e = annual_kwh × 0.0004999                       (round 1 decimal)
cost_thb = annual_kwh × 4.0                            (round integer)
vsl_risk_thb = safety_incidents × 39,900,000           (round integer)
safety_new = CLAMP(safety_score + intervention.safety_impact, 0, 100)
safety_warning = (safety_new < 30)                     (true/false)
tver_low = tco2e_reduced × 100
tver_high = tco2e_reduced × 200
new_kwh = annual_kwh × (1 - energy_save_pct/100)
tco2e_reduced = annual_tco2e - (new_kwh × 0.0004999)
cost_saved = annual_electricity_cost_thb - (new_kwh × 4.0)
```

## WHAT TO BUILD

### baseline.json (14 segments: 10 normal + 4 extreme)
Schema:
```json
{
  "id": "SEG-001",
  "name_th": "...",
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
  "province": "...",
  "district": "...",
  "gps_lat": 14.975,
  "gps_lng": 102.100
}
```

10 normal segments (use these scenarios):
- SEG-001: Rural 2-lane, 7km, 140 HPS lights, moderate traffic
- SEG-002: Urban 4-lane, 3km, 90 LED (already upgraded), high traffic
- SEG-003: Highway with ITS, 15km, 300 HPS + VMS + CCTV, high traffic
- SEG-004: Mountain road, 12km, 80 HPS, low traffic, high incidents
- SEG-005: Suburban, 5km, 100 mixed, moderate traffic
- SEG-006: Expressway, 8km, 200 HPS + CCTV, very high traffic
- SEG-007: Secondary rural, 20km, 60 HPS, very low traffic
- SEG-008: Industrial zone, 4km, 120 LED, moderate traffic
- SEG-009: Tourist route, 10km, 150 HPS, seasonal high traffic
- SEG-010: Border highway, 18km, 180 HPS + VMS, moderate traffic

4 EXTREME segments (MANDATORY — these test Safety Floor UI):
- SEG-EX1: safety_score=18, safety_incidents=8.1 → Tests RED alert
- SEG-EX2: annual_kwh=500000, light_count=600 → Tests BIG T-VER numbers
- SEG-EX3: safety_score=98, safety_incidents=0.1 → Tests GREEN state
- SEG-EX4: annual_kwh=12000, light_count=12 → Tests TINY numbers

### interventions.json (copy this EXACTLY)
```json
{
  "LED_UPGRADE": { "name_th": "เปลี่ยนเป็น LED ทั้งหมด", "energy_save_pct": 50, "carbon_save_pct": 50, "cost_per_km_thb": 180000, "safety_impact": 12, "description": "เปลี่ยนโคมไฟ HPS เป็น LED 120W ลดไฟ 50%" },
  "SOLAR_MICROGRID": { "name_th": "ติดตั้ง Solar Micro-grid", "energy_save_pct": 70, "carbon_save_pct": 70, "cost_per_km_thb": 450000, "safety_impact": 18, "description": "Solar + Battery สำหรับ ITS และไฟถนน" },
  "SMART_DIMMING": { "name_th": "Smart Dimming ตามจราจร", "energy_save_pct": 35, "carbon_save_pct": 35, "cost_per_km_thb": 85000, "safety_impact": 5, "description": "หรี่ไฟอัตโนมัติตามปริมาณรถ" },
  "OFFGRID_ITS": { "name_th": "Off-grid ITS (Solar)", "energy_save_pct": 60, "carbon_save_pct": 60, "cost_per_km_thb": 320000, "safety_impact": 8, "description": "CCTV + VMS ใช้ Solar Off-grid" },
  "LIGHTS_OFF": { "name_th": "ปิดไฟ 22:00-06:00", "energy_save_pct": 33, "carbon_save_pct": 33, "cost_per_km_thb": 0, "safety_impact": -35, "description": "⚠️ นโยบายปิดไฟดิบ — ความปลอดภัยตกอย่างรุนแรง" }
}
```

### scenario_output.json
For EVERY combination of 14 segments × 5 interventions (70 entries total), compute:
```json
{
  "segment_id": "SEG-001",
  "intervention_id": "LIGHTS_OFF",
  "new_annual_kwh": 85600.0,
  "new_annual_tco2e": 42.8,
  "tco2e_reduced": 21.1,
  "tver_revenue_thb_low": 2110,
  "tver_revenue_thb_high": 4220,
  "energy_cost_saved_thb": 168600,
  "safety_score_new": 27.0,
  "safety_warning": true,
  "safety_warning_msg": "⚠️ ความปลอดภัยต่ำกว่าเกณฑ์! เสี่ยง VSL สูญเสีย X ล้านบาท",
  "vsl_risk_thb_new": 319200000
}
```
- `safety_warning_msg`: if safety_warning=false → `""`. If true → "⚠️ ความปลอดภัยต่ำกว่าเกณฑ์! เสี่ยง VSL สูญเสีย {vsl_risk_thb_new/1000000 rounded} ล้านบาท"

### impact_summary.json
Sum all 14 segments into totals. Include these constant network-scale numbers:
- its_carbon_baseline_tco2e: 7114
- streetlights_carbon_baseline_tco2e: 54739
- full_network_addressable_tco2e: 29500
- potential_tver_revenue_low: 2950000
- potential_tver_revenue_high: 5900000

## DATA SOURCES (read these wiki files)
1. `wiki/entities/Energy and Safety Pain Points.md` — lines 10-11 (1.7B THB), lines 27-29 (ITS data)
2. `wiki/CarbonWay.md` — lines 277-303 (appendix math)
3. `wiki/entities/Value of a Statistical Life (VSL).md` — lines 10-12 (17.2M, 39.9M THB)
4. `wiki/entities/Highway Assets Energy Consumption.md` — kWh breakdown

## CRITICAL CHECKS
- SEG-EX1 + LIGHTS_OFF → safety_new MUST be 0, safety_warning MUST be true
- SEG-EX3 + LIGHTS_OFF → safety_new MUST be 63, safety_warning MUST be false
- All tco2e values MUST match annual_kwh × 0.0004999 (recalculate, don't guess)
- No field should be a string if it's a number — all numbers must be number type in JSON

## SCHEDULE
- Day 1 08:00-12:00: Extract data from wiki → create baseline.json + interventions.json → FREEZE schema by noon
- Day 1 13:00-18:00: Generate scenario_output.json (70 entries) + impact_summary.json
- Day 2 08:00-12:00: Refine numbers, verify against benchmarks (14.23 GWh ITS, 109.5 GWh streetlights)
- Day 2 13:00-18:00: Fix bugs, ensure safety_warning_msg contains real numbers (not template text)
- Day 3 08:00-16:00: Validate vs benchmarks, prepare 3 demo entries for video
- Day 4 08:00-16:00: FREEZE data, take screenshots for PDF, help P3 verify numbers

## DELIVERABLES
- `src/data/baseline.json` (14 segments)
- `src/data/interventions.json` (5 interventions)
- `src/data/scenario_output.json` (70 entries)
- `src/data/impact_summary.json` (1 object)
