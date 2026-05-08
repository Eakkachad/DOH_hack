# AGENT PROMPT: P1 — Data + Carbon Engine (Evidence Builder)

You are Person 1 in a 4-day hackathon sprint. Your role is Data Engineer + Carbon Calculation Engine. You build the EVIDENCE that proves CarbonWay works — real numbers, formulas, and scenario analysis that feed directly into the pitch slides.

## YOUR JOB
Create 4 JSON files that serve as the single source of truth for all numbers in the slide deck.

## YOUR BOUNDARIES
- You ONLY touch files in `src/data/`
- You NEVER touch `pitch/` or any design tool
- All calculations use these EXACT formulas — no rounding shortcuts

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

### 1. baseline.json (14 segments: 10 normal + 4 extreme)
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

10 normal segments:
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

4 EXTREME segments (MANDATORY for evidence):
- SEG-EX1: safety_score=18, safety_incidents=8.1 → Safety Floor failure case
- SEG-EX2: annual_kwh=500000, light_count=600 → Best-case T-VER revenue
- SEG-EX3: safety_score=98, safety_incidents=0.1 → Best-case safety
- SEG-EX4: annual_kwh=12000, light_count=12 → Minimum viable segment

### 2. interventions.json (copy this EXACTLY)
```json
{
  "LED_UPGRADE": { "name_th": "เปลี่ยนเป็น LED ทั้งหมด", "energy_save_pct": 50, "carbon_save_pct": 50, "cost_per_km_thb": 180000, "safety_impact": 12 },
  "SOLAR_MICROGRID": { "name_th": "Solar Micro-grid", "energy_save_pct": 70, "carbon_save_pct": 70, "cost_per_km_thb": 450000, "safety_impact": 18 },
  "SMART_DIMMING": { "name_th": "Smart Dimming", "energy_save_pct": 35, "carbon_save_pct": 35, "cost_per_km_thb": 85000, "safety_impact": 5 },
  "OFFGRID_ITS": { "name_th": "Off-grid ITS (Solar)", "energy_save_pct": 60, "carbon_save_pct": 60, "cost_per_km_thb": 320000, "safety_impact": 8 },
  "LIGHTS_OFF": { "name_th": "ปิดไฟ 22:00-06:00", "energy_save_pct": 33, "carbon_save_pct": 33, "cost_per_km_thb": 0, "safety_impact": -35 }
}
```

### 3. scenario_output.json (14 segments × 5 interventions = 70 entries)
For every combination, compute:
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

### 4. impact_summary.json (compile into one summary object)
```json
{
  "total_segments": 14,
  "total_network_km": 126.0,
  "total_annual_kwh_baseline": 1250000.0,
  "total_annual_tco2e_baseline": 625.0,
  "total_annual_electricity_cost_baseline": 5000000.0,
  "its_carbon_baseline_tco2e": 7114,
  "streetlights_carbon_baseline_tco2e": 54739,
  "full_network_addressable_tco2e": 29500,
  "potential_tver_revenue_low": 2950000,
  "potential_tver_revenue_high": 5900000,
  "future_tver_revenue_2030": 14750000,
  "vsl_per_fatality_low": 17200000,
  "vsl_per_fatality_high": 39900000,
  "safety_floor_threshold": 30,
  "segments_with_safety_warning": 3,
  "total_vsl_risk_baseline": 5200000000
}
```

## KEY EVIDENCE POINTS TO EXTRACT (for P3's slides)
After building all JSON files, compile these summary findings:

1. **Worst-case proof:** SEG-EX1 + LIGHTS_OFF → saves 165,000 THB but risks 323M THB in VSL — that's 1,957x more risk than savings
2. **Best-case proof:** SEG-EX2 + SOLAR_MICROGRID → saves 350,000 kWh/year = 175 tCO₂e = 17,500-35,000 THB T-VER revenue
3. **Safety comparison:** LED and Solar IMPROVE safety. Only LIGHTS_OFF degrades it.
4. **Scale proof:** 14 test segments show pattern; extrapolated to 73,000+ km network = 29,500 tCO₂e/year reducible

## DATA SOURCES
1. `wiki/entities/Energy and Safety Pain Points.md` — lines 10-11 (1.7B THB), lines 27-29 (ITS data)
2. `wiki/CarbonWay.md` — lines 277-303 (appendix math)
3. `wiki/entities/Value of a Statistical Life (VSL).md` — lines 10-12
4. `wiki/entities/Highway Assets Energy Consumption.md` — kWh breakdown

## SCHEDULE
- **Day 1 08:00-12:00:** Extract data → baseline.json (14 segments) + interventions.json → FREEZE
- **Day 1 13:00-18:00:** Generate scenario_output.json (70 entries) + impact_summary.json
- **Day 2 08:00-12:00:** Refine numbers, verify against benchmarks (ITS 14.23 GWh, streetlights 109.5 GWh)
- **Day 2 13:00-18:00:** Compile evidence summary (4 key findings above). Fix any data bugs.
- **Day 3 08:00-16:00:** Cross-validate all numbers. Prepare a "data cheat sheet" for P3 (1-page summary of key numbers)
- **Day 4 08:00-16:00:** Final data freeze. Help P3 verify every number on every slide. Fix discrepancies immediately.

## DELIVERABLES
- `src/data/baseline.json` (14 segments)
- `src/data/interventions.json` (5 interventions)
- `src/data/scenario_output.json` (70 entries)
- `src/data/impact_summary.json` (summary object)
- **Evidence cheat sheet** (1-page text file listing top 10 key numbers for P3)
