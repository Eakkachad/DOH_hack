"""
Enhanced ingest_all.py — complete pipeline for DOH Wiki ingestion.
Uses PyMuPDF for Thai PDF extraction, recursive scanning,
smart title/section parsing, and structured YAML output.
"""

import csv
import hashlib
import json
import os
import re
from datetime import datetime
from pathlib import Path

import fitz  # PyMuPDF — far better Thai PDF extraction than PyPDF2

# ── Config ───────────────────────────────────────────────────────
RAW_DIR = Path(r"d:\competetetion\DOH\DOH\raw")
WIKI_DIR = Path(r"d:\competetetion\DOH\DOH\wiki")
SOURCES_DIR = WIKI_DIR / "sources"
INDEX_FILE = Path(r"d:\competetetion\DOH\DOH\index.md")
LOG_FILE = Path(r"d:\competetetion\DOH\DOH\log.md")
TODAY = datetime.now().strftime("%Y-%m-%d")

SOURCES_DIR.mkdir(parents=True, exist_ok=True)

# Files / directories to skip (already handled manually or not useful)
SKIP_NAMES = {
    "DEPARTMENT OF HIGHWAYS.md",
    "DEPARTMENT OF HIGHWAYS 1.md",
    "จุดจอดพักรถบรรทุก - data.doh.go.th.md",
    "ถนนต้องชม - data.doh.go.th.md",
    "คู่มือรายละเอียดโครงการ DOH HACKATHON 2026 V3.1.pdf",
    "hackathon_extracted.md",
    "ระบบร้องเรียนร้องทุกข์ กรมทางหลวง 1.md",  # duplicate
}

SKIP_DIRS = {
    "csv",  # CSV files handled separately
}

# Hackathon pillars for auto-tagging
PILLARS = [
    (
        "Next-Gen Highway Design",
        [
            r"(?i)drone|โดรน|นวัตกรรม|innovation|design|ออกแบบ|augmented|AR\b|virtual|โลกเสมือน"
        ],
    ),
    (
        "Smart Construction Management",
        [r"(?i)ก่อสร้าง|construction|เข็มพืด|cim|building|สะพาน|bridge|แคมป์|camp"],
    ),
    (
        "Highway Maintenance Innovation",
        [r"(?i)บำรุง|maintenance|ทำความสะอาด|ซ่อม|ผิวทาง|asphalt|แอสฟัลต์|วัชพืช"],
    ),
    (
        "Highway Safety Solution",
        [
            r"(?i)safety|ปลอดภัย|alarm|เตือน|อุบัติเหตุ|accident|จุดเสี่ยง|จุดกลับรถ|สัญญาณไฟ|ไฟจราจร|หม้อแปลง|จราจร"
        ],
    ),
    (
        "Sustainable & Low-Carbon Highway",
        [
            r"(?i)พลังงาน|green|carbon|ยั่งยืน|sustainable|solar|แสงอาทิตย์|พลังงานทดแทน|คลีน|clean|สิ่งแวดล้อม"
        ],
    ),
    (
        "Digital Service & Communication",
        [
            r"(?i)digital|app|mobile|แอป|ข้อมูล|data|platform|แพลตฟอร์ม|smart|helpdesk|ระบบ|one.?login|สารสนเทศ"
        ],
    ),
]

# Sections we try to detect in Thai DOH documents
# Patterns searched anywhere in text — positional splitting handles ordering.
# NOTE:  breaks on Thai chars (not \w), so we avoid it.
SECTION_PATTERNS = [
    (r"(\d+[\.\)]\s*)?ความเป(็|)นมา", "background"),
    (r"(\d+[\.\)]\s*)?วัตถุประสงค(์|)\s*(และ\s*)?เป(้|)าหมาย", "objectives"),
    (
        r"(\d+[\.\)]\s*)?(ขั้นตอน|วิธี(การ|)|กระบวนการ)\s*(คิด|ดำเน(ิ|)น(การ|งาน|)|ปฏ(ิ|)บ(ั|)ต(ิ|)(การ|งาน|)|ท(ำ|))",
        "method",
    ),
    (
        r"(\d+[\.\)]\s*)?(การ)?(ประเม(ิ|)นผล|ผลการ(ดำเน(ิ|)น|ทดสอบ|ประเม(ิ|)น))\s*(และ\s*(แสดงผล|เปร(ี|)ยบเท(ี|)ยบ))?",
        "evaluation",
    ),
    (
        r"(\d+[\.\)]\s*)?(การ)?[นน](ำ|า)\s*(ไป)?\s*(ปฏ(ิ|)บ(ั|)ต(ิ|)(การ|)|ใช(้|)(งาน|))",
        "implementation",
    ),
    (
        r"(\d+[\.\)]\s*)?ประโยชน(์|)\s*(ที่\s*)?(ได(้|)ร(ั|)บ|ที่คาด(ว่า)?\s*(จะ\s*)?ได(้|)ร(ั|)บ)",
        "benefits",
    ),
    (r"(\d+[\.\)]\s*)?(สร(ุ|)ปบทเร(ี|)ยน|ข(้|)อส(ั|)งเกต|บทสร(ุ|)ป)", "lessons_learned"),
    (
        r"(\d+[\.\)]\s*)?(ต(ั|)วช(ี้|)ว(ั|)ด|KPI|ด(ั|)ชน(ี|)ช(ี้|)ว(ั|)ด)\s*(ความสำเร็จ|ผลงาน|)?",
        "indicators",
    ),
    (
        r"(\d+[\.\)]\s*)?(งบประมาณ|budget|ค(่|)าใช(้|)จ(่|)าย|cost|แหล(่|)งงบประมาณ)",
        "budget",
    ),
]


# ── Thai Text Cleanup ─────────────────────────────────────────────
def clean_thai_text(text: str) -> str:
    """
    Fix Thai PDF artifacts:
    1. Remove single spaces between Thai characters (ก า ร → การ)
    2. Collapse multiple newlines
    3. Normalize whitespace
    """
    if not text:
        return ""
    # Remove spaces between Thai characters (but NOT newlines!)
    # Thai Unicode block: \u0E00-\u0E7F
    text = re.sub(r"(?<=[\u0E00-\u0E7F])[ \t]+(?=[\u0E00-\u0E7F])", "", text)
    # Collapse 3+ newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Normalize other whitespace
    text = re.sub(r"[ \t]+", " ", text)
    # Remove empty lines with just whitespace
    text = re.sub(r"\n[ \t]+\n", "\n\n", text)
    return text.strip()


def extract_text_pdf(filepath: Path) -> str:
    """Extract all text from a PDF using PyMuPDF with Thai cleanup."""
    try:
        doc = fitz.open(str(filepath))
        full_text = []
        for page in doc:
            t = page.get_text()
            if t:
                full_text.append(clean_thai_text(t))
        doc.close()
        return "\n\n".join(full_text)
    except Exception as e:
        return f"[PDF extraction error: {e}]"


def extract_text_md(filepath: Path) -> str:
    """Read markdown file."""
    try:
        return filepath.read_text(encoding="utf-8")
    except Exception:
        return ""


def extract_text_csv(filepath: Path) -> str:
    """Read CSV and return summary."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            headers = next(reader, [])
            rows = list(reader)
        summary = f"CSV with {len(rows)} rows. Columns: {', '.join(headers[:15])}"
        if len(headers) > 15:
            summary += f" (+{len(headers) - 15} more)"
        return summary
    except Exception as e:
        return f"[CSV read error: {e}]"


def extract_text(filepath: Path) -> str:
    """Dispatch to correct extractor based on extension."""
    ext = filepath.suffix.lower()
    if ext == ".pdf":
        return extract_text_pdf(filepath)
    elif ext in (".md", ".markdown"):
        return extract_text_md(filepath)
    elif ext == ".csv":
        return extract_text_csv(filepath)
    elif ext in (".png", ".jpg", ".jpeg", ".gif", ".bmp"):
        return f"[Image file: {filepath.name}]"
    else:
        # Try as text
        try:
            return filepath.read_text(encoding="utf-8")
        except Exception:
            return f"[Binary/unreadable file: {filepath.name}]"


# ── Title Extraction ──────────────────────────────────────────────
def extract_title(filepath: Path, text: str) -> str:
    """
    Extract a meaningful title.
    For DI-prefix PDFs: use content from the first substantive page.
    For others: use filename cleaned up.
    """
    name = filepath.stem

    # For DI-prefix PDFs, extract title from first non-blank content page
    if re.match(r"^DI\d+", name) and filepath.suffix == ".pdf":
        lines = [
            l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 3
        ]
        # First few meaningful lines usually contain the title
        title_lines = []
        for line in lines[:8]:
            # Skip award labels, page numbers, boilerplate
            if re.match(r"^(รางวัล|นวัตกรรมด้าน|ปีงบประมาณ|\d+$|หน้า\s+\d+)", line):
                if len(title_lines) < 1:
                    # Keep award info as secondary
                    title_lines.append(line)
                continue
            if len(line) > 5:
                title_lines.append(line)
            if len(title_lines) >= 3:
                break
        if title_lines:
            return " — ".join(title_lines[:3])[:120]

    # For Thai-named files, clean up the filename
    # Remove trailing timestamp patterns like _20231002...
    clean = re.sub(r"[_\-]\d{8,}.*$", "", name)
    # Remove data.doh.go.th suffix
    clean = re.sub(r"\s*[-–—]\s*data\.doh\.go\.th\s*$", "", clean)
    # Truncate
    if len(clean) > 100:
        clean = clean[:97] + "..."
    return clean


# ── Section Parsing ───────────────────────────────────────────────
def detect_sections(text: str) -> dict:
    """
    Detect structured sections in Thai DOH documents.
    Uses positional splitting: finds all section header positions,
    then partitions text between them. Handles Thai docs where
    section labels sometimes trail their content.
    """
    # Find all section header matches with their positions
    matches = []
    for pattern, name in SECTION_PATTERNS:
        for m in re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE):
            matches.append((m.start(), m.end(), name, m.group()))

    if not matches:
        return {"preamble": text.strip()} if text.strip() else {}

    # Sort by position
    matches.sort(key=lambda x: x[0])

    # Build sections: text from one header to the next
    result = {}

    # Text before first header goes to preamble
    first_start = matches[0][0]
    preamble = text[:first_start].strip()
    if preamble and len(preamble) > 15:
        result["preamble"] = preamble

    for i, (start, end, name, matched_text) in enumerate(matches):
        # Content from after this header to before the next header (or EOF)
        next_start = matches[i + 1][0] if i + 1 < len(matches) else len(text)
        content = text[end:next_start].strip()

        # Skip duplicate section names; merge content instead
        if name in result:
            if content and len(content) > 5:
                result[name] = result[name] + "\n" + content
        else:
            # Include the header line itself for context
            header_line = matched_text.strip()
            full_content = (
                (header_line + "\n" + content).strip() if content else header_line
            )
            if len(full_content) > 5:
                result[name] = full_content

    # Merge preamble into background if both exist
    if "preamble" in result and "background" in result:
        result["background"] = result["preamble"] + "\n" + result["background"]
        del result["preamble"]

    # Filter out noise sections (too short to be meaningful)
    result = {k: v for k, v in result.items() if len(v) > 10}
    return result


def summarize_section(text: str, max_chars: int = 500) -> str:
    """Truncate section text for token-efficient storage."""
    text = text.strip()
    if len(text) <= max_chars:
        return text
    # Try to break at sentence/phrase boundary
    truncated = text[:max_chars]
    last_break = max(
        truncated.rfind("\n"),
        truncated.rfind("。"),
        truncated.rfind(". "),
        truncated.rfind("  "),
    )
    if last_break > max_chars // 2:
        return truncated[:last_break].strip() + "\n\n[…ต่อ…]"
    return truncated + "…"


# ── Tag Inference ─────────────────────────────────────────────────
def infer_tags(text: str, filename: str) -> tuple:
    """Return (tags_list, linked_pillars_list)."""
    tags = ["project"]
    linked_pillars = []

    for pillar_name, patterns in PILLARS:
        for pat in patterns:
            if re.search(pat, text) or re.search(pat, filename, re.IGNORECASE):
                if pillar_name not in linked_pillars:
                    linked_pillars.append(pillar_name)
                    # Add abbreviated tag
                    tag_map = {
                        "Next-Gen Highway Design": "innovation",
                        "Smart Construction Management": "construction",
                        "Highway Maintenance Innovation": "maintenance",
                        "Highway Safety Solution": "safety",
                        "Sustainable & Low-Carbon Highway": "sustainability",
                        "Digital Service & Communication": "digital",
                    }
                    abbr = tag_map.get(pillar_name)
                    if abbr and abbr not in tags:
                        tags.append(abbr)
                break

    if not linked_pillars:
        linked_pillars.append("Next-Gen Highway Design")
        if "innovation" not in tags:
            tags.append("innovation")

    return tags, linked_pillars


# ── Safe Filename ─────────────────────────────────────────────────
def safe_filename(name: str) -> str:
    """Make a safe filename for wiki pages."""
    # Remove characters unsafe for filenames
    safe = re.sub(r'[<>:"/\\|?*]', "", name)
    # Truncate to reasonable length, trying to break at a space
    if len(safe) > 100:
        safe = safe[:97]
        last_space = safe.rfind(" ")
        if last_space > 60:
            safe = safe[:last_space]
        safe = safe + "..."
    return safe.strip()


# ── Main Ingestion ────────────────────────────────────────────────
def ingest():
    processed = []
    errors = []

    # Collect all files recursively
    all_files = []
    for root, dirs, files in os.walk(RAW_DIR):
        # Skip designated dirs
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if fname in SKIP_NAMES:
                continue
            fpath = Path(root) / fname
            if fpath.suffix.lower() in (".pdf", ".md", ".csv", ".png", ".jpg", ".jpeg"):
                all_files.append(fpath)

    print(f"Found {len(all_files)} files to process.\n")

    for fpath in sorted(all_files):
        fname = fpath.name
        print(f"Processing: {fname} ...", end=" ", flush=True)

        # Extract text
        text = extract_text(fpath)
        if not text or text.startswith("[PDF extraction error"):
            print(f"SKIP (no extractable text)")
            errors.append((fname, "No text extracted"))
            continue
        if text.startswith("[Image file"):
            # For images, create a minimal entry
            text_preview = text
            clean = text
        else:
            clean = clean_thai_text(text)
            text_preview = clean[:800] if len(clean) > 800 else clean

        # Extract title
        title = extract_title(fpath, clean)
        safe_title = safe_filename(title)
        if not safe_title:
            safe_title = safe_filename(fpath.stem)

        # Detect sections (for structured output)
        sections = detect_sections(clean)

        # Infer tags
        tags, linked_pillars = infer_tags(clean, fname)

        # Build structured content for wiki page
        content_parts = []

        # Overview
        # Smart overview: use first substantive paragraph, not preamble
        overview_text = ""
        overview_from_bg = False
        if "background" in sections:
            overview_text = summarize_section(sections["background"], 400)
            overview_from_bg = True
        elif "preamble" in sections:
            overview_text = summarize_section(sections["preamble"], 400)
        else:
            overview_text = text_preview[:400]
        content_parts.append(f"## Overview\n{overview_text}")

        # Background (show after overview if distinct)
        if "background" in sections and not overview_from_bg:
            bg_text = summarize_section(sections["background"], 500)
            if len(bg_text) > 50:
                content_parts.append(f"## Background\n{bg_text}")

        # Objectives
        if "objectives" in sections:
            obj_text = summarize_section(sections["objectives"], 500)
            content_parts.append(f"## Objectives & Goals\n{obj_text}")

        # Method / Process
        if "method" in sections:
            method_text = summarize_section(sections["method"], 500)
            content_parts.append(f"## Method / Process\n{method_text}")

        # Evaluation
        if "evaluation" in sections:
            eval_text = summarize_section(sections["evaluation"], 400)
            content_parts.append(f"## Evaluation & Results\n{eval_text}")

        # Implementation
        if "implementation" in sections:
            impl_text = summarize_section(sections["implementation"], 400)
            content_parts.append(f"## Implementation\n{impl_text}")

        # Benefits
        if "benefits" in sections:
            ben_text = summarize_section(sections["benefits"], 400)
            content_parts.append(f"## Benefits\n{ben_text}")

        # Lessons Learned
        if "lessons_learned" in sections:
            ll_text = summarize_section(sections["lessons_learned"], 400)
            content_parts.append(f"## Lessons Learned\n{ll_text}")

        # Budget
        if "budget" in sections:
            budget_text = summarize_section(sections["budget"], 300)
            content_parts.append(f"## Budget / Cost\n{budget_text}")

        # Hackathon alignment
        links_md = "\n".join([f"- [[{p}]]" for p in linked_pillars])
        content_parts.append(
            f"## Hackathon Alignment\n"
            f"This project aligns with the following [[DOH Hackathon 2026]] pillars:\n{links_md}"
        )

        # Source reference
        content_parts.append(f"## Related Sources\n- [[Source: {safe_title}]]")

        body = "\n\n".join(content_parts)

        # ── Write Wiki Entity Page ──
        entity_path = WIKI_DIR / f"{safe_title}.md"
        try:
            entity_path.write_text(
                f"---\ntags: [{', '.join(tags)}]\n"
                f"last_updated: {TODAY}\n"
                f"source_file: {fname}\n"
                f"source_path: {fpath.relative_to(RAW_DIR)}\n"
                f"---\n"
                f"# {title}\n\n"
                f"{body}\n",
                encoding="utf-8",
            )
        except Exception as e:
            print(f"FAIL (entity write: {e})")
            errors.append((fname, f"Entity write: {e}"))
            continue

        # ── Write Source Page ──
        source_path = SOURCES_DIR / f"{safe_title}.md"
        try:
            source_path.write_text(
                f"---\ntags: [source, {', '.join(tags)}]\n"
                f"last_updated: {TODAY}\n"
                f"original_file: {fname}\n"
                f"---\n"
                f"# Source: {title}\n\n"
                f"**Original File**: `{fpath.relative_to(RAW_DIR)}`\n\n"
                f"## Summary\n{text_preview}\n",
                encoding="utf-8",
            )
        except Exception as e:
            print(f"FAIL (source write: {e})")
            errors.append((fname, f"Source write: {e}"))

        processed.append((safe_title, title, tags))
        print(f"OK -> [[{safe_title}]]")

    # ── Update index.md ──
    print(f"\nUpdating index.md ...")
    try:
        existing_index = INDEX_FILE.read_text(encoding="utf-8")
        # Remove old auto-generated section if present
        existing_index = re.sub(
            r"\n*### All Hackathon Projects & Data\n(?:- \[\[.*\]\]\n)*",
            "",
            existing_index,
        ).rstrip()

        new_entries = "\n".join(
            [f"- [[{t[0]}]]" for t in sorted(processed, key=lambda x: x[1].lower())]
        )
        INDEX_FILE.write_text(
            existing_index + f"\n\n### All Hackathon Projects & Data\n{new_entries}\n",
            encoding="utf-8",
        )
    except Exception as e:
        print(f"Index update failed: {e}")

    # ── Update log.md ──
    print(f"Updating log.md ...")
    try:
        with LOG_FILE.open("a", encoding="utf-8") as lf:
            lf.write(f"\n## [{TODAY}] ingest | Enhanced Pipeline (PyMuPDF)\n")
            lf.write(
                f"- Processed {len(processed)} files with full Thai PDF extraction.\n"
            )
            lf.write(f"- Used PyMuPDF for superior Thai character handling.\n")
            lf.write(f"- Structured section extraction for DI-template documents.\n")
            if errors:
                lf.write(f"- {len(errors)} errors encountered:\n")
                for ename, eerr in errors[:10]:
                    lf.write(f"  - {ename}: {eerr}\n")
    except Exception as e:
        print(f"Log update failed: {e}")

    # ── Summary ──
    print(f"\n{'=' * 60}")
    print(
        f"Ingestion complete: {len(processed)} files processed, {len(errors)} errors."
    )
    if errors:
        print("Errors:")
        for ename, eerr in errors:
            print(f"  - {ename}: {eerr}")


if __name__ == "__main__":
    ingest()
