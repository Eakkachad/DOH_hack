---
tags: [hackathon, agent-system, methodology]
last_updated: 2026-05-08
status: verified
---

# Agent Prompts

The system of 4 self-contained AI agent prompts used to execute the [[CarbonWay]] hackathon sprint. Each prompt is a standalone instruction set that can be handed to a team member to paste into their AI tool (ChatGPT, Claude, etc.) for step-by-step execution.

## Prompt Architecture

| Prompt | For | Lines | Key Feature |
|--------|-----|-------|-------------|
| [[Source - Agent Prompt P1|P1 — Data + Carbon Engine]] | Data Engineer | ~137 | 10 exact formulas, 14 segment specs, JSON schemas |
| [[Source - Agent Prompt P2|P2 — Fullstack Developer]] | Frontend Developer | ~179 | Copy-paste CSS/JS, 6 test cases, Demo Mode |
| [[Source - Agent Prompt P3|P3 — Pitch + Video + PDF]] | Pitch Lead | ~134 | 10-slide content, 7-scene script, word budgets |
| [[Source - Agent Prompt Advisor|Advisor]] | Senior Advisor | ~63 | 8 review checkpoints, submission checklist |

## Design Principles

1. **Self-contained:** Each prompt includes the data contract (JSON schema) so cross-team dependencies are explicit
2. **Copy-paste ready:** CSS and JavaScript are provided as complete blocks, not descriptions
3. **Lite-model safe:** Instructions are granular enough for a smaller/weaker AI model to execute without interpretation
4. **Boundary enforcement:** Each prompt explicitly lists what files the agent may and may NOT touch

## Cross-Prompt Consistency

All 4 prompts share these frozen constants:
- Emission factor: 0.4999 kgCO₂e/kWh
- VSL: 39,900,000 THB (upper bound)
- Electricity cost: 4.0 THB/kWh
- Safety Floor threshold: 30
- T-VER price: 100-200 THB/tCO₂e
- Intervention IDs: LED_UPGRADE, SOLAR_MICROGRID, SMART_DIMMING, OFFGRID_ITS, LIGHTS_OFF

## Related Pages
- [[4-Day Execution Plan]]
- [[CarbonWay]]
- [[Development Guide]]
