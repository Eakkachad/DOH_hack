---
tags: [concept, energy, cost, ITS, DOH]
last_updated: 2026-05-07
---
# Highway Assets Energy Consumption (ค่าไฟพลังงานสินทรัพย์ทางหลวง)

**Highway Assets Energy Consumption** refers to the energy demand and electricity cost structure associated with the infrastructure managed by the [[DEPARTMENT OF HIGHWAYS]] (DOH) in Thailand. 

## Overview
The DOH manages a massive nationwide network of highway infrastructure, which poses significant energy demands. Managing these electricity costs is critical for budget sustainability and the transition toward a Low Carbon Highway by 2040. Currently, data on total power consumption is highly decentralized, split across 104 Highway Districts and ~7,850 Local Administrative Organizations (LAOs), making it challenging to aggregate national costs. Mathematical extrapolations estimate the true national energy bill for DOH and LAO-subsidized highway lighting to exceed **1.7 billion THB annually**.

## Key Energy Consumers on Highways

### 1. Streetlighting
Streetlights constitute the highest energy load. 
- Traditional **High-Pressure Sodium (HPS)** lamps (250W-400W) consume an estimated 486 THB/month per unit. 
- **The "Lights-Off" Policy**: Enacted on May 1, 2026, as a short-term cost-reduction measure, lighting on secondary 4-digit roads is sometimes turned off between 22:00 and 06:00. While this saves ~1,600 THB per night per 10km, it creates catastrophic conflicts with road safety standards. The macroeconomic cost of a single resulting fatal accident ([[Value of a Statistical Life (VSL)]]) instantly wipes out 30 to 68 years of electricity savings.
- **Future Goals (2040)**: DOH aims to transition at least 80% of highway lighting to LED (which reduces energy use by 50-60%) or off-grid Solar LED systems. However, progress is heavily bottlenecked by rigid e-bidding procurement regulations and high median hardware prices.

### 2. Intelligent Transportation Systems (ITS)
Unlike streetlighting, ITS devices operate 24/7, creating a high, continuous base load:
- **CCTV Networks**: Tens of thousands of high-definition cameras (using PoE) draw around 15-30W each. When combined with fiber-optic network infrastructure and central GPU servers for video analytics, the total system energy cost is immense.
- **Variable Message Signs (VMS)**: The energy load varies based on ambient light and pixel density. During the daytime, VMS boards operate at near 100% brightness to combat glare, drawing 1,500 - 3,000 watts, while dimming to 10-20% at night.
- **Traffic Signals**: These consume a constant load and are increasingly integrated with standalone solar arrays to lower long-term costs.

## Budget Constraints and Challenges
The DOH's operational budget is heavily pressured by rising Ft (fuel adjustment) rates in electricity tariffs. Because energy costs represent a significant portion of construction material costs (like asphalt), the government frequently has to inject central budget funds (e.g., over 600 million THB in 2024) to cover "K-value" adjustments for contractors.

## Recommendations for Sustainability
- **Centralized Dashboard**: Implementing a unified Highway Registration Information System (HRIS) to visualize real-time power loads and pinpoint anomalies.
- **Dynamic Dimming**: Coupling LED lighting with motion sensors so lights only operate at 100% capacity when traffic is present, mitigating the safety risks of complete shut-offs.
- **Micro-grids for ITS**: Requiring new ITS installations to utilize self-sustaining solar (off-grid) power, turning the DOH from a pure energy consumer into an "Energy Prosumer."
- **OpEx Procurement Models**: Shifting from traditional CapEx hardware purchasing to Energy Performance Contracts (EPC) or Hardware-as-a-Service (HaaS) models to bypass bidding gridlocks and K-Value capital starvation.

## Source Documents
- [[Source - ค่าไฟพลังงานสินทรัพย์ทางหลวง DOH]]
- [[Source - Strategic Assessment of the Department of Highways Thailand]]
