---
tags: [hackathon, planning, execution]
last_updated: 2026-05-08
status: verified
---

# 4-Day Execution Plan

The master execution plan for the **CarbonWay** hackathon sprint at [[DOH Hackathon 2026]]. Defines exactly what 4 team members build over 4 days to produce the Round 1 deliverables: a 10-slide PDF, a 5-minute video demo, and a working web prototype.

## Team Structure

| Role | Person | Workspace | Deliverable |
|------|--------|-----------|-------------|
| Data + Carbon Engine | P1 | `src/data/` | 4 JSON files (baseline, interventions, scenario_output, impact_summary) |
| Fullstack Developer | P2 | `src/frontend/` | Single-page web app (HTML/CSS/JS + Leaflet.js) |
| Pitch + Video + PDF | P3 | `pitch/` | 10 slides, video script, final .mp4 + .pdf |
| Senior Advisor | Advisor | — | Review checkpoints, quality assurance |

## Key Technical Decisions

- **Concept:** Locked to [[CarbonWay]] — self-funding loop via T-VER carbon credits + Safety Floor guarantee
- **Tech stack:** Plain HTML/CSS/vanilla JS + Leaflet.js CDN (no React, no build tools)
- **Data contract:** JSON schema frozen by Day 1 noon (14 segments × 5 interventions = 70 scenario entries)
- **Safety Floor:** threshold at safety_score < 30 → REJECT with red alert + pulse animation

## Daily Goals

| Day | Theme | Goal by 18:00 |
|-----|-------|---------------|
| Day 1 | Foundation | JSON v0.1 delivered, 3-panel UI static, slides 1-5 draft |
| Day 2 | Integration | Simulator interactive, Safety Floor triggers, video script done |
| Day 3 | Polish | Video-ready prototype, finalized script, dry-run completed |
| Day 4 | Assembly | Video .mp4 + PDF ready in `submit/` |

## Edge Cases (Extreme Data)

4 special segments test the Safety Floor UI:
- **SEG-EX1**: safety_score=18, 8.1 incidents/year → Guaranteed red alert
- **SEG-EX2**: 500,000 kWh/year → Huge T-VER revenue numbers
- **SEG-EX3**: safety_score=98 → Always green, no warnings
- **SEG-EX4**: 12,000 kWh/year → Tiny numbers, functional edge case

## Sources
- [[Source - 4-Day Execution Plan]]
- [[Source - Agent Prompt P1]]
- [[Source - Agent Prompt P2]]
- [[Source - Agent Prompt P3]]
- [[Source - Agent Prompt Advisor]]
- [[Source - Development Guide]]

## Related Pages
- [[CarbonWay]]
- [[Agent Prompts]]
- [[Development Guide]]
- [[Energy and Safety Pain Points]]
