#!/usr/bin/env python3
"""
DOH Wiki Ingestion Script
Processes all .md files in /raw directory (skipping PDFs),
creating source pages in /wiki/sources and entity pages in /wiki/.
Updates index.md and appends to log.md.
"""

import os
import re
import glob
from datetime import date
from pathlib import Path

# ─── CONFIG ────────────────────────────────────────────────────────────────────
BASE_DIR    = Path(r"d:\competetetion\DOH\DOH")
RAW_DIR     = BASE_DIR / "raw"
WIKI_DIR    = BASE_DIR / "wiki"
SOURCES_DIR = WIKI_DIR / "sources"
INDEX_FILE  = BASE_DIR / "index.md"
LOG_FILE    = BASE_DIR / "log.md"
TODAY       = date.today().isoformat()

# Ensure directories exist
SOURCES_DIR.mkdir(parents=True, exist_ok=True)
WIKI_DIR.mkdir(parents=True, exist_ok=True)

# ─── HELPERS ───────────────────────────────────────────────────────────────────

def sanitize_filename(name: str) -> str:
    """Make a string safe to use as a filename."""
    # Replace characters invalid on Windows filenames
    return re.sub(r'[<>:"/\\|?*]', '-', name).strip()

def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        try:
            return path.read_text(encoding="utf-8-sig")
        except Exception as e:
            print(f"  ⚠  Could not read {path.name}: {e}")
            return ""

def extract_frontmatter_tags(content: str) -> list[str]:
    """Pull tags from YAML frontmatter."""
    match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL | re.MULTILINE)
    if not match:
        return []
    fm = match.group(1)
    tag_match = re.search(r'tags:\s*\[([^\]]+)\]', fm)
    if tag_match:
        return [t.strip().strip('"') for t in tag_match.group(1).split(',')]
    return []

def extract_title(content: str, fallback: str) -> str:
    """Extract H1 title from markdown content."""
    match = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return fallback

def extract_section(content: str, heading: str) -> str:
    """Extract a section under a given heading (up to the next ##)."""
    pattern = rf'##\s+{re.escape(heading)}\s*\n(.*?)(?=\n##|\Z)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1).strip()[:800]
    return ""

def extract_hackathon_alignment(content: str) -> list[str]:
    """Find hackathon pillar wikilinks in the content."""
    pillars = re.findall(r'\[\[([^\]]+)\]\]', content)
    target = ['Next-Gen Highway Design', 'Smart Construction Management',
              'Highway Maintenance Innovation', 'Highway Safety Solution',
              'Sustainable & Low-Carbon Highway', 'Digital Service & Communication']
    return [p for p in pillars if p in target]

def classify_file(filename: str, tags: list[str], title: str) -> dict:
    """
    Classify a raw file into wiki categories.
    Returns dict with 'category', 'entity_type', 'entity_name'.
    """
    name_lower = filename.lower()
    tags_lower  = [t.lower() for t in tags]
    title_lower = title.lower()

    # Innovation / Project documents
    is_project = (
        'project' in tags_lower or
        'innovation' in tags_lower or
        any(kw in name_lower for kw in ['km-', 'hdms', 'hua hin', 'leak', 'm-flow', 'm-pole', 'm-rc',
                                          'modern camp', 'present', 'presentation', 'project management',
                                          'transformers', 'ub2', 'อุปกรณ์', 'ชุด', 'รถ', 'เครื่อง',
                                          'หุ่นยนต์', 'รางวัล', 'สัญญาณ', 'ป้าย', 'บุ้งกี๋', 'ปั๊ม',
                                          'ระบบ', 'ศูนย์กลาง', 'เคลือบ', 'นำเสนอ', 'เสนอผลงาน',
                                          'โครงการ', 'ai and digital', 'การนำเทคโนโลยี', 'การใช้กำแพง',
                                          'การแก้ปัญหา', 'คลังความรู้', 'คู่มือการประยุกต์'])
    )

    # Policy / Strategy documents
    is_policy = any(kw in name_lower for kw in [
        'doh_แผน', 'mot_แผน', 'nat_แผน', 'mot_info', 'nat_info', 'doh_info',
        'หลักเกณฑ์', 'แนวทาง', '200m-2568', 'manual200m', 'ราคามาตรฐาน',
        'เกณฑ์ราคากลาง', 'หลักเกณฑ์ราคากลาง', 'หลักเกณฑ์การขอ',
        'คู่มือการจ้าง', 'คู่มือรายละเอียด', 'ตัวอย่าง ทดแทน',
        'แบบฟอร์ม', 'ขั้นตอน', 'รายการ', 'เกณฑ์การพิจารณา',
        'doh_แผนปฏิบัติราชการ', 'doh_แผนปฏิบัติการดิจิทัล',
    ])

    # Open data / statistics
    is_data = (
        'data.doh.go.th' in name_lower or
        any(kw in name_lower for kw in [
            'ปริมาณการจราจร', 'ดัชนีการจราจร', 'รายงานดัชนี',
            'รายงานปริมาณ', 'ระยะทาง', 'รายได้บน', 'น้ำหนักบรรทุก',
            'ความเร็วสูงสุด', 'ค่าธรรมเนียม', 'ปริมาณการเดินทาง',
            'จุดจอดพักรถ', 'จุดลานกางเต็นท์', 'จุดแวะพัก',
            'ถนนต้องชม', 'truck_stop', 'ข้อมูลพิกัดหมุดหลักฐาน',
        ])
    )

    # DOH dept overview
    is_overview = any(kw in name_lower for kw in ['department of highways', 'hackathon_extracted'])

    if is_overview:
        return {'category': 'overview', 'entity_type': 'Organization', 'entity_name': title}
    elif is_data:
        return {'category': 'data', 'entity_type': 'Open Data', 'entity_name': title}
    elif is_policy:
        return {'category': 'policy', 'entity_type': 'Policy & Strategy', 'entity_name': title}
    elif is_project:
        return {'category': 'innovation', 'entity_type': 'Innovation Project', 'entity_name': title}
    else:
        return {'category': 'other', 'entity_type': 'Document', 'entity_name': title}

# ─── GATHER FILES ──────────────────────────────────────────────────────────────

def gather_md_files() -> list[Path]:
    """Collect all .md files in raw dir (and subdirs), skip PDFs and 'source_' prefixed files."""
    files = []
    for p in sorted(RAW_DIR.rglob("*.md")):
        # Skip source_ prefixed files (already processed summaries from previous runs)
        if p.name.startswith("source_"):
            continue
        # Skip if inside a subdirectory named raw_text (those are PDF extractions handled separately)
        files.append(p)
    return files

# ─── SOURCE PAGE ───────────────────────────────────────────────────────────────

def create_source_page(raw_path: Path, title: str, tags: list[str], classification: dict,
                        summary_overview: str, hackathon_pillars: list[str]) -> str:
    """Create content for a /wiki/sources/ page."""
    pillars_str = "\n".join(f"- [[{p}]]" for p in hackathon_pillars) if hackathon_pillars else "- *(None identified)*"
    tags_str = ", ".join(tags) if tags else "document"
    entity_link = f"[[{classification['entity_name']}]]"

    content = f"""---
tags: [{tags_str}, source]
last_updated: {TODAY}
source_file: {raw_path.name}
category: {classification['category']}
---
# Source: {title}

## Metadata
- **File:** `{raw_path.name}`
- **Type:** {classification['entity_type']}
- **Entity Page:** {entity_link}

## Summary
{summary_overview[:600] if summary_overview else '*(Summary not extracted)*'}

## Hackathon Pillars
{pillars_str}

## Related Entities
- {entity_link}
- [[Department of Highways]]
- [[DOH Hackathon 2026]]
"""
    return content

# ─── ENTITY PAGE ───────────────────────────────────────────────────────────────

def create_entity_page(title: str, classification: dict, tags: list[str],
                        summary: str, objectives: str, benefits: str, budget: str,
                        hackathon_pillars: list[str], source_page_name: str,
                        raw_path: Path) -> str:
    """Create or update content for a /wiki/ entity page."""
    pillars_str = "\n".join(f"- [[{p}]]" for p in hackathon_pillars) if hackathon_pillars else "- *(Not classified)*"
    tags_str = ", ".join(tags) if tags else "document"

    sections = []
    if summary:
        sections.append(f"## Overview\n{summary[:800]}")
    if objectives:
        sections.append(f"## Objectives & Goals\n{objectives[:600]}")
    if benefits:
        sections.append(f"## Benefits\n{benefits[:500]}")
    if budget:
        sections.append(f"## Budget / Cost\n{budget[:400]}")

    body = "\n\n".join(sections) if sections else "*(Content to be enriched)*"

    content = f"""---
tags: [{tags_str}]
last_updated: {TODAY}
entity_type: {classification['entity_type']}
category: {classification['category']}
source_file: {raw_path.name}
---
# {title}

{body}

## Hackathon Alignment
{pillars_str}

## Related Pages
- [[Department of Highways]]
- [[DOH Hackathon 2026]]

## Sources
- [[Source: {source_page_name}]]
"""
    return content

# ─── MAIN INGESTION ────────────────────────────────────────────────────────────

def ingest():
    files = gather_md_files()
    print(f"Found {len(files)} .md files to ingest.\n")

    results = {
        'sources_created': [],
        'entities_created': [],
        'entities_updated': [],
        'skipped': [],
        'errors': []
    }

    # Track entity names for index
    entities_by_category = {
        'overview': [],
        'innovation': [],
        'policy': [],
        'data': [],
        'other': []
    }

    for raw_path in files:
        print(f"Processing: {raw_path.name}")
        try:
            content = read_file(raw_path)
            if not content:
                results['errors'].append(raw_path.name)
                continue

            # Extract info
            title         = extract_title(content, raw_path.stem)
            tags          = extract_frontmatter_tags(content)
            classification = classify_file(raw_path.name, tags, title)
            summary       = extract_section(content, "Overview")
            objectives    = extract_section(content, "Objectives & Goals")
            benefits      = extract_section(content, "Benefits")
            budget        = extract_section(content, "Budget / Cost")
            hackathon_pillars = extract_hackathon_alignment(content)

            # Clean title for filenames
            source_page_name = sanitize_filename(title)
            entity_page_name = sanitize_filename(title)

            # ── SOURCE PAGE ──────────────────────────────────────────────────
            source_file = SOURCES_DIR / f"Source - {source_page_name}.md"
            source_content = create_source_page(
                raw_path, title, tags, classification,
                summary, hackathon_pillars
            )
            source_file.write_text(source_content, encoding="utf-8")
            results['sources_created'].append(source_page_name)

            # ── ENTITY PAGE ──────────────────────────────────────────────────
            entity_file = WIKI_DIR / f"{entity_page_name}.md"
            entity_content = create_entity_page(
                title, classification, tags, summary, objectives,
                benefits, budget, hackathon_pillars, source_page_name, raw_path
            )

            if entity_file.exists():
                results['entities_updated'].append(entity_page_name)
            else:
                results['entities_created'].append(entity_page_name)
            entity_file.write_text(entity_content, encoding="utf-8")

            # Track for index
            cat = classification['category']
            if cat not in entities_by_category:
                entities_by_category[cat] = []
            entities_by_category[cat].append(entity_page_name)

        except Exception as e:
            print(f"  ✗ Error: {e}")
            results['errors'].append(raw_path.name)

    # ── ALSO INGEST raw_text/ PDF EXTRACTIONS ─────────────────────────────────
    raw_text_dir = BASE_DIR / "raw_text"
    if raw_text_dir.exists():
        for rt_path in sorted(raw_text_dir.glob("*.md")):
            print(f"Processing (raw_text): {rt_path.name}")
            try:
                content = read_file(rt_path)
                if not content:
                    results['errors'].append(rt_path.name)
                    continue

                title = extract_title(content, rt_path.stem)
                tags  = extract_frontmatter_tags(content)
                if not tags:
                    tags = ['project', 'technical-report']
                classification = {
                    'category': 'technical-report',
                    'entity_type': 'Technical Report (DI-Series)',
                    'entity_name': title
                }
                summary    = extract_section(content, "Overview") or content[:600]
                objectives = extract_section(content, "Objectives")
                benefits   = ""
                budget     = extract_section(content, "Budget")

                source_page_name = sanitize_filename(title)
                entity_page_name = sanitize_filename(title)

                source_file = SOURCES_DIR / f"Source - {source_page_name}.md"
                source_content = create_source_page(
                    rt_path, title, tags, classification, summary, []
                )
                source_file.write_text(source_content, encoding="utf-8")

                entity_file = WIKI_DIR / f"{entity_page_name}.md"
                entity_content = create_entity_page(
                    title, classification, tags, summary, objectives,
                    benefits, budget, [], source_page_name, rt_path
                )
                if entity_file.exists():
                    results['entities_updated'].append(entity_page_name)
                else:
                    results['entities_created'].append(entity_page_name)
                entity_file.write_text(entity_content, encoding="utf-8")

                entities_by_category.setdefault('technical-report', []).append(entity_page_name)
                results['sources_created'].append(source_page_name)

            except Exception as e:
                print(f"  ✗ Error: {e}")
                results['errors'].append(rt_path.name)

    # ── UPDATE INDEX.MD ───────────────────────────────────────────────────────
    print("\nUpdating index.md...")

    def make_list(items, prefix="- [[", suffix="]]"):
        if not items:
            return "*(No entries yet)*"
        unique = sorted(set(items))
        return "\n".join(f"{prefix}{i}{suffix}" for i in unique)

    # Build categorized sections
    innovation_entries = entities_by_category.get('innovation', [])
    policy_entries     = entities_by_category.get('policy', [])
    data_entries       = entities_by_category.get('data', [])
    tech_entries       = entities_by_category.get('technical-report', [])
    other_entries      = entities_by_category.get('other', [])
    overview_entries   = entities_by_category.get('overview', [])

    # Merge with existing hardcoded entries
    org_entries = list(set(overview_entries + [
        'Department of Highways', 'DOH Hackathon 2026'
    ]))
    infra_entries = list(set(['Truck Stops (จุดจอดพักรถบรรทุก)', 'Must-See Roads (ถนนต้องชม)'] + data_entries))

    source_names = sorted(set(results['sources_created']))

    new_index = f"""---
last_updated: {TODAY}
---
# Highway Infrastructure and Networks Wiki Index

Welcome to the DOH Highway Infrastructure and Networks Knowledge Base.
Total sources ingested: **{len(source_names)}** | Total entity pages: **{len(results['entities_created']) + len(results['entities_updated'])}**

---

## Entities

### Organizations & Programs
{make_list(org_entries)}

### Innovation Projects (นวัตกรรม)
{make_list(innovation_entries)}

### Policy & Strategy (นโยบายและยุทธศาสตร์)
{make_list(policy_entries)}

### Open Data & Statistics (ข้อมูลเปิด)
{make_list(infra_entries)}

### Technical Reports (DI-Series)
{make_list(tech_entries)}

### Other Documents
{make_list(other_entries)}

---

## Sources
{make_list(source_names, prefix="- [[Source - ", suffix="]]")}
"""
    INDEX_FILE.write_text(new_index, encoding="utf-8")
    print("  ✓ index.md updated.")

    # ── APPEND TO LOG.MD ─────────────────────────────────────────────────────
    log_entry = f"""
## [{TODAY}] ingest | Full Raw MD Ingestion
- **Sources created:** {len(results['sources_created'])}
- **Entity pages created:** {len(results['entities_created'])}
- **Entity pages updated:** {len(results['entities_updated'])}
- **Errors:** {len(results['errors'])}
"""
    if results['errors']:
        log_entry += "- Error files:\n"
        for e in results['errors']:
            log_entry += f"  - {e}\n"

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_entry)
    print("  ✓ log.md updated.")

    # ── SUMMARY ──────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("INGESTION COMPLETE")
    print("="*60)
    print(f"  Sources created  : {len(results['sources_created'])}")
    print(f"  Entities created : {len(results['entities_created'])}")
    print(f"  Entities updated : {len(results['entities_updated'])}")
    print(f"  Errors           : {len(results['errors'])}")
    if results['errors']:
        print("\n  Error files:")
        for e in results['errors']:
            print(f"    - {e}")

if __name__ == "__main__":
    ingest()
