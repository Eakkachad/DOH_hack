$ErrorActionPreference = "Stop"

$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RawDir = Join-Path $BaseDir "raw"
$WikiDir = Join-Path $BaseDir "wiki"
$SourcesDir = Join-Path $WikiDir "sources"
$IndexFile = Join-Path $BaseDir "index.md"
$LogFile = Join-Path $BaseDir "log.md"
$Today = "2026-05-07"

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$Utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$Thai874 = [System.Text.Encoding]::GetEncoding(874)

function Repair-ThaiMojibake {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) { return $Text }
    if ($Text -notmatch "เธ|เน|โ€|โ|โ") { return $Text }
    try {
        $candidate = [System.Text.Encoding]::UTF8.GetString($Thai874.GetBytes($Text))
        if ($candidate -match "[ก-๙]") { return $candidate }
    } catch {}
    return $Text
}

function Read-RawThaiText {
    param([string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    try {
        $text = $Utf8Strict.GetString($bytes)
    } catch {
        $text = $Thai874.GetString($bytes)
    }
    return (Repair-ThaiMojibake $text)
}

function Write-Utf8 {
    param([string]$Path, [string]$Text)
    [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
}

function Get-RawByPattern {
    param([string]$Pattern)
    $matches = @(Get-ChildItem -File -LiteralPath $RawDir -Filter "*.md" | Where-Object { $_.Name -notlike "source_*" -and $_.Name -like $Pattern })
    if ($matches.Count -ne 1) {
        throw "Pattern '$Pattern' matched $($matches.Count) files."
    }
    return $matches[0]
}

function Get-RawByUrl {
    param([string]$Url)
    $matches = @()
    foreach ($file in Get-ChildItem -File -LiteralPath $RawDir -Filter "*.md" | Where-Object { $_.Name -notlike "source_*" }) {
        if ($Url -notlike "*gemini.google.com*" -and $file.Name -like "*DOH*") { continue }
        $text = Read-RawThaiText $file.FullName
        if ($text.Contains($Url)) { $matches += $file }
    }
    if ($matches.Count -ne 1) {
        throw "URL '$Url' matched $($matches.Count) files."
    }
    return $matches[0]
}

function Get-RawByText {
    param([string]$Needle)
    $matches = @()
    foreach ($file in Get-ChildItem -File -LiteralPath $RawDir -Filter "*.md" | Where-Object { $_.Name -notlike "source_*" }) {
        $text = Read-RawThaiText $file.FullName
        if ($text.Contains($Needle)) { $matches += $file }
    }
    if ($matches.Count -ne 1) {
        throw "Text '$Needle' matched $($matches.Count) files."
    }
    return $matches[0]
}

function Add-IndexLink {
    param([string]$Page, [string]$Section)
    $index = [System.IO.File]::ReadAllText($IndexFile, [System.Text.Encoding]::UTF8)
    $link = "- [[$Page]]"
    if ($index.Contains($link)) { return }
    $heading = "### $Section"
    if ($index.Contains($heading)) {
        $index = $index.Replace($heading, "$heading`n$link")
    } else {
        $index += "`n`n### $Section`n$link`n"
    }
    Write-Utf8 $IndexFile $index
}

function New-SourcePage {
    param([hashtable]$Item, [System.IO.FileInfo]$RawFile, [string]$EntityPage)
    $sourcePage = "Source - $($RawFile.BaseName)"
    $sourcePath = Join-Path $SourcesDir "$sourcePage.md"
    $rawText = Read-RawThaiText $RawFile.FullName
    $excerpt = ($rawText -replace "`r","" -split "`n" | Where-Object { $_.Trim().Length -gt 0 } | Select-Object -First 10) -join "`n"
    if ($excerpt.Length -gt 1200) { $excerpt = $excerpt.Substring(0, 1200) + "..." }

    $content = @"
---
tags: [source, clipping, highway]
last_updated: $Today
source_file: $($RawFile.Name)
source_url: $($Item.Url)
published: $($Item.Published)
category: $($Item.Category)
---
# Source: $($Item.Title)

## Metadata
- **File:** $($RawFile.Name)
- **Published:** $($Item.Published)
- **Source URL:** $($Item.Url)
- **Entity Page:** [[$EntityPage]]

## Summary
$($Item.Summary)

## Key Points
$($Item.Points)

## Related Entities
$($Item.Related)

## Encoding Note
This source was read with strict UTF-8 first, Windows-874 fallback, and UTF-8-as-Windows-874 mojibake repair where needed.

## Source Excerpt
$excerpt
"@
    Write-Utf8 $sourcePath $content
    Add-IndexLink $sourcePage "Sources"
    return $sourcePage
}

function Upsert-EntityPage {
    param([string]$Page, [string]$Title, [string]$Tags, [string]$EntityType, [string]$Body, [string[]]$SourcePages)
    $path = Join-Path $WikiDir "$Page.md"
    $sources = ($SourcePages | ForEach-Object { "- [[$_]]" }) -join "`n"
    $content = @"
---
tags: [$Tags]
last_updated: $Today
entity_type: $EntityType
---
# $Title

$Body

## Sources
$sources
"@
    Write-Utf8 $path $content
}

$items = @(
    @{
        Selector = "Url"
        Entity = "M81"
        Title = "DOH response to M81 navigation-app confusion"
        Published = "2025-10-05"
        Url = "https://today.line.me/th/v3/article/JPO12OP"
        Category = "motorway-operations"
        Summary = "The source reports that [[Department of Highways]] responded to cases where online navigation apps incorrectly directed users into [[M81]] during trial operation. DOH focused on clearer guide signs, warning signs, pavement symbols, and updated entrance/exit data."
        Points = "- Improve signs and pavement markings at entrances, exits, and key connectors.`n- Coordinate directly with navigation-app providers to update entrance/exit points, toll gates, opening hours, and temporary restrictions.`n- Public contact channels include DOH hotline 1586 and Motorway Call Center 1586 press 7."
        Related = "- [[M81]]`n- [[Department of Highways]]`n- [[Highway Safety Solution]]`n- [[Digital Service & Communication]]"
    },
    @{
        Selector = "Url"
        Entity = "M-Flow Payment and Scam Issues"
        Title = "M-Flow balance not visible after trip"
        Published = "unknown"
        Url = "https://pantip.com/topic/41796768"
        Category = "tolling-user-experience"
        Summary = "A user forum source shows a practical [[M-Flow]] issue: after passing through M-Flow, the payable balance was not visible for several days, creating uncertainty about penalties and support workflow."
        Points = "- User was advised to contact 1586 and provide vehicle registration, pass time/date, toll point, and direction.`n- The case highlights delayed-billing UX risk for otherwise compliant users.`n- The discussion recommends contacting support before the 7-day window expires."
        Related = "- [[M-Flow]]`n- [[M-Flow Payment and Scam Issues]]`n- [[Digital Service & Communication]]"
    },
    @{
        Selector = "Url"
        Entity = "M-Flow Payment and Scam Issues"
        Title = "M-Flow phishing SMS warning"
        Published = "unknown"
        Url = "https://www.prd.go.th/th/content/category/detail/id/31/iid/498167"
        Category = "cyber-safety"
        Summary = "The source warns about phishing SMS messages impersonating [[M-Flow]], using unpaid-bill or 10x-penalty pressure to push users into fake links."
        Points = "- Official channels named in the source are `mflowthai.com`, the M-Flow app, and Line Official `@mflowthai`.`n- Fake links may use unfamiliar domains such as `.cc`, `.top`, or `.vip`.`n- Users who submit card or account data should freeze cards/accounts and report through online police channels or hotline 1441."
        Related = "- [[M-Flow]]`n- [[M-Flow Payment and Scam Issues]]`n- [[Digital Service & Communication]]"
    },
    @{
        Selector = "Url"
        Entity = "San Khayom Interchange Project"
        Title = "San Khayom four-lane bridge project"
        Published = "2026-05-02"
        Url = "https://www.dailynews.co.th/news/5830049/"
        Category = "project"
        Summary = "Daily News reports draft TOR/procurement details for an interchange project at [[Route 121]] and [[Route 1367]] around San Khayom intersection in Chiang Mai, with a budget around 650 million baht."
        Points = "- Work limits: Route 121 km 22+350-23+800 and Route 1367 km 2+400-3+800, total about 2.050 km.`n- Central price: 649,907,634.78 baht from FY2569 budget of 650 million baht.`n- Main structure: twin prestressed-concrete bridge, 4 lanes, about 525 m long, excluding approaches.`n- Construction duration: 1,080 days, about 3 years."
        Related = "- [[San Khayom Interchange Project]]`n- [[Route 121]]`n- [[Route 1367]]`n- [[Chiang Mai]]"
    },
    @{
        Selector = "Url"
        Entity = "San Khayom Interchange Project"
        Title = "Community concerns over San Khayom interchange"
        Published = "2026-05-06"
        Url = "https://www.chiangmainews.co.th/social/3929396/"
        Category = "project-consultation"
        Summary = "Chiang Mai News reports a public meeting on 6 May 2026 where residents raised concerns about bridge/underpass plans around San Khayom and nearby Route 121 intersections."
        Points = "- More than 200 residents joined the meeting.`n- Concerns include impacts on more than 10 communities, noise, accident risk, old travel patterns, and traffic-volume assumptions.`n- 365 residents reportedly petitioned the Chiang Mai governor to review or slow the project.`n- Highway officials said the design would be reviewed and adjusted."
        Related = "- [[San Khayom Interchange Project]]`n- [[Route 121]]`n- [[Chiang Mai]]"
    },
    @{
        Selector = "Url"
        Entity = "Road Safety Big Data"
        Title = "Road crash myths from big data"
        Published = "2019-11-22"
        Url = "https://thaipublica.org/2019/11/napat-big-data-ai-for-safer-roads/"
        Category = "road-safety"
        Summary = "ThaiPublica interviews Dr. Napat Jatusripitak about using Big Data and AI to test road-safety assumptions and evaluate interventions with evidence."
        Points = "- The article states Thailand had more than 20,000 road deaths per year, or more than 55 per day.`n- It discusses multi-agency datasets and policy evaluation for checkpoints, bridge/underpass motorcycle restrictions, and spatial crash risk.`n- The source supports evidence-based evaluation under [[Highway Safety Solution]]."
        Related = "- [[Road Safety Big Data]]`n- [[Highway Safety Solution]]`n- [[Department of Highways]]"
    },
    @{
        Selector = "Url"
        Entity = "Road Lighting Energy-Saving Measures"
        Title = "Rural roads lights-off energy saving debate"
        Published = "2026-04-26"
        Url = "https://news.ch7.com/detail/869546"
        Category = "energy-safety"
        Summary = "The source reports public debate around [[Department of Rural Roads]] measures to reduce or switch off road lighting in selected low-risk areas from 1 May 2026."
        Points = "- Screening criteria include low night traffic, no hazardous points, and no repeated-crash history.`n- Field offices should survey, assess, monitor, and restore lights if risk remains.`n- Public criticism focuses on safety, crime risk, and the alternative of LED conversion."
        Related = "- [[Road Lighting Energy-Saving Measures]]`n- [[Department of Rural Roads]]`n- [[Sustainable & Low-Carbon Highway]]`n- [[Highway Safety Solution]]"
    },
    @{
        Selector = "Pattern"
        Pattern = "*50%*.md"
        Entity = "Road Lighting Energy-Saving Measures"
        Title = "DOH LED conversion and selective lights-off plan"
        Published = "2026-04-27"
        Url = "unknown"
        Category = "energy-safety"
        Summary = "The source reports [[Department of Highways]] plans to convert road lights nationwide to LED while using selective lights-off measures on low-risk secondary/night-low-volume sections."
        Points = "- LED conversion is described as saving about 50% energy.`n- Lights-off screening is limited to sections without safety risk.`n- Intersections, U-turns, curves, and other risk points are not intended to be switched off."
        Related = "- [[Road Lighting Energy-Saving Measures]]`n- [[Department of Highways]]`n- [[Sustainable & Low-Carbon Highway]]"
    },
    @{
        Selector = "Text"
        Text = "22.00-06.00"
        Entity = "Road Lighting Energy-Saving Measures"
        Title = "Four-digit highway selective lights-off measure"
        Published = "2026-04-27"
        Url = "unknown"
        Category = "energy-safety"
        Summary = "The source reports selective lights-off on some four-digit highway sections from May 2026, generally during 22.00-06.00, with stated safety screening."
        Points = "- The measure is described as affecting about 4% of four-digit highway lighting, from about 500,000 lights.`n- Expected energy saving is about 10% for the selected lights-off measure.`n- LED replacement is described as a longer-term plan, including about 300,000 lights in 2026 and about 650,000 more in the next year."
        Related = "- [[Road Lighting Energy-Saving Measures]]`n- [[Department of Highways]]`n- [[Sustainable & Low-Carbon Highway]]"
    },
    @{
        Selector = "Url"
        Entity = "Road Lighting Energy-Saving Measures"
        Title = "Political criticism of rural-road lights-off policy"
        Published = "2026-04-26"
        Url = "https://today.line.me/th/v3/article/LXvzwMG"
        Category = "energy-safety"
        Summary = "Matichon/LINE Today reports criticism by Suphanat Minchaiynunt and others that switching off rural-road lights may reduce safety; the suggested alternative is replacing HPS lighting with LED."
        Points = "- Criticism argues that pole spacing, height, and placement were designed for needed visibility.`n- The source repeats the agency screening criteria for low-risk areas.`n- The key proposal is to convert orange/HPS lights to LED instead of removing illumination."
        Related = "- [[Road Lighting Energy-Saving Measures]]`n- [[Department of Rural Roads]]`n- [[Highway Safety Solution]]"
    },
    @{
        Selector = "Url"
        Entity = "Department of Highways"
        Title = "Gemini research note on DOH problem areas"
        Published = "unknown"
        Url = "https://gemini.google.com/app/699d5e9f80dcb6eb?utm_source=app_launcher&utm_medium=owned&utm_campaign=base_all"
        Category = "research-notes"
        Summary = "A Gemini conversation used as a research note. It frames possible DOH problem areas such as construction management, overloaded trucks, M-Flow user/cyber issues, and the road-lighting energy-saving debate. Treat as a research note, not as a primary factual source."
        Points = "- Useful for issue clustering and future research questions.`n- Should be validated against primary DOH documents, news articles, or datasets before being used as evidence.`n- Related to lighting policy, M-Flow UX, and road-safety analytics pages."
        Related = "- [[Department of Highways]]`n- [[Road Lighting Energy-Saving Measures]]`n- [[M-Flow Payment and Scam Issues]]`n- [[Road Safety Big Data]]"
    }
)

$sourceByEntity = @{}
foreach ($item in $items) {
    $rawFile = switch ($item.Selector) {
        "Url" { Get-RawByUrl $item.Url }
        "Text" { Get-RawByText $item.Text }
        default { Get-RawByPattern $item.Pattern }
    }
    $sourcePage = New-SourcePage $item $rawFile $item.Entity
    if (-not $sourceByEntity.ContainsKey($item.Entity)) { $sourceByEntity[$item.Entity] = @() }
    $sourceByEntity[$item.Entity] += $sourcePage
}

Upsert-EntityPage "M81" "M81 (Bang Yai - Kanchanaburi Motorway)" "route, motorway, operations, safety" "Route / Motorway" @"
[[M81]] is the Bang Yai - Kanchanaburi motorway corridor. The newly ingested source set highlights an operations issue: navigation-app data, temporary operating conditions, and physical highway signage must stay aligned during trial or staged opening.

## Operations Issue
- On 5 October 2025, [[Department of Highways]] acknowledged cases where online navigation apps directed users incorrectly into [[M81]].
- DOH response focused on clearer guide signs, warning signs, pavement symbols, and direct coordination with navigation providers.
- This is a [[Digital Service & Communication]] issue as much as a physical signage issue.

## Related Pages
- [[Department of Highways]]
- [[Highway Safety Solution]]
- [[Digital Service & Communication]]
"@ $sourceByEntity["M81"]

Upsert-EntityPage "M-Flow Payment and Scam Issues" "M-Flow Payment and Scam Issues" "tolling, digital-service, cybersecurity, user-experience" "Issue Cluster" @"
This page tracks user-facing payment and cybersecurity issues around [[M-Flow]], supplementing the main [[M-Flow]] page.

## Payment Visibility
- A user forum source describes passing through M-Flow but not seeing a payable balance for several days.
- The support workflow requested registration, date/time, toll point, and direction.
- Delayed balance visibility can make compliant users uncertain about penalties.

## SMS Scam Risk
- A PRD warning describes SMS scams impersonating M-Flow with unpaid-bill or 10x penalty pressure.
- Official channels named by the source are `mflowthai.com`, the M-Flow app, and Line Official `@mflowthai`.
- Scam domains may use unfamiliar TLDs such as `.cc`, `.top`, or `.vip`.

## Related Pages
- [[M-Flow]]
- [[Digital Service & Communication]]
"@ $sourceByEntity["M-Flow Payment and Scam Issues"]

Upsert-EntityPage "San Khayom Interchange Project" "San Khayom Interchange Project" "project, interchange, bridge, chiang-mai, route" "Highway Project" @"
The [[San Khayom Interchange Project]] concerns improvements around [[Route 121]] and [[Route 1367]] in San Sai District, [[Chiang Mai]].

## Project Scope
- Reported limits: [[Route 121]] km 22+350 to km 23+800 and [[Route 1367]] km 2+400 to km 3+800, total about 2.050 km.
- Central price: 649,907,634.78 baht, from FY2569 budget of 650 million baht.
- Main structure: twin prestressed-concrete bridge, 4 traffic lanes, about 525 m long, excluding approaches.
- Other work includes concrete pavement, drainage, sidewalks, lighting, pavement markings, signs, and safety equipment.
- Construction duration: 1,080 days, about 3 years.

## Public Consultation
- A 6 May 2026 public meeting reportedly had more than 200 residents.
- Concerns include impacts on more than 10 communities, noise, road safety, existing travel patterns, and traffic-volume assumptions.
- 365 residents reportedly petitioned the Chiang Mai governor to review or slow the project.

## Open Question
One source emphasizes procurement readiness and a 650 million baht bridge solution. The later consultation source emphasizes unresolved local concerns and possible design changes. Track the final TOR/design after consultation.

## Related Pages
- [[Route 121]]
- [[Route 1367]]
- [[Chiang Mai]]
- [[Smart Construction Management]]
"@ $sourceByEntity["San Khayom Interchange Project"]

Upsert-EntityPage "Road Safety Big Data" "Road Safety Big Data" "safety, big-data, analytics, policy" "Concept" @"
[[Road Safety Big Data]] covers the use of multi-agency datasets, AI, and statistical comparison to understand road crashes and evaluate safety interventions.

## Key Claims from Source
- The ThaiPublica interview states Thailand had more than 20,000 road deaths per year, or more than 55 per day.
- The source discusses using data to test common assumptions rather than relying only on intuition.
- Example topics include police checkpoints, motorcycle restrictions on bridges/underpasses, and spatial/time-based crash risk.

## Engineering Relevance
For highway agencies, crash analysis should be treated as a data pipeline: geocoded crashes, time windows, road context, intervention logs, and before/after comparison.

## Related Pages
- [[Highway Safety Solution]]
- [[Department of Highways]]
"@ $sourceByEntity["Road Safety Big Data"]

Upsert-EntityPage "Road Lighting Energy-Saving Measures" "Road Lighting Energy-Saving Measures" "lighting, energy, safety, sustainability, policy" "Policy / Operations" @"
This page synthesizes the 2026 road-lighting energy-saving debate across [[Department of Highways]] and [[Department of Rural Roads]] sources.

## Measures Reported
- DOH sources describe selective lights-off measures on some four-digit highway sections from around May 2026, generally 22.00-06.00.
- DRR sources describe reducing or switching off some rural-road lighting from 1 May 2026 in low-risk areas.
- Criteria repeated across sources include low night traffic, no hazardous junction/curve/bottleneck, and no repeated-crash history.

## Safety Controls
- Agencies stated that intersections, U-turns, curves, bridges, dense-traffic areas, and other risk points should remain lit.
- Local offices should survey, assess, monitor, and restore lighting if a location remains risky.
- Public communication is required before implementation.

## LED Alternative
- Multiple sources frame LED replacement as the more durable solution: LED conversion is described as saving roughly 50% of energy while retaining illumination.
- One DOH source reports a plan to change about 300,000 lights in 2026 and about 650,000 more in the following year.

## Open Question
The policy aims to save energy, but criticism centers on safety, crime risk, and visibility. Track crash data before/after any lights-off pilot before treating the measure as effective.

## Related Pages
- [[Department of Highways]]
- [[Department of Rural Roads]]
- [[Sustainable & Low-Carbon Highway]]
- [[Highway Safety Solution]]
"@ $sourceByEntity["Road Lighting Energy-Saving Measures"]

foreach ($page in @("M81","M-Flow Payment and Scam Issues","San Khayom Interchange Project","Road Safety Big Data","Road Lighting Energy-Saving Measures")) {
    $section = switch ($page) {
        "M81" { "Routes & Networks" }
        "San Khayom Interchange Project" { "Projects & Development" }
        "Road Lighting Energy-Saving Measures" { "Infrastructure & Engineering" }
        default { "Concepts & Systems" }
    }
    Add-IndexLink $page $section
}

$logEntry = @"

## [$Today] ingest | Missing Raw News and Encoding-Safe Thai Read
- Ingested 11 previously missing raw Markdown files from `/raw/`.
- Created source pages with UTF-8 output under `/wiki/sources/`.
- Created/updated entity pages: [[M81]], [[M-Flow Payment and Scam Issues]], [[San Khayom Interchange Project]], [[Road Safety Big Data]], [[Road Lighting Energy-Saving Measures]].
- Used mixed Thai encoding handling in memory: strict UTF-8 read, Windows-874 fallback, and repair of known Thai mojibake markers.
"@
[System.IO.File]::AppendAllText($LogFile, $logEntry, $Utf8NoBom)

Write-Output "Ingested $($items.Count) raw files."
