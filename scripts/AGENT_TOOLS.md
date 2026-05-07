# Agent Tooling & Scripts Guide

This directory contains utility scripts that agents can use or reference to automate their workflows.

## 1. Legacy Scripts (`/scripts/legacy/`)
These scripts were built for the old flat folder structure. **Do not run them as-is** without modifying their target paths.
- `ingest_all.py`
- `ingest_raw_md.py`
- `ingest_missing_raw_2026-05-07.ps1`

*Note to Ingester Agents:* If you want to perform bulk ingestions, you should write new scripts or modify the legacy ones to explicitly read from `/raw/inbox/` and output to `/wiki/sources/` and `/wiki/drafts/`.

## 2. Standard Agent Operations (How-To)
Since you are an Autonomous Agent, you should rely on your available system tools (e.g., shell commands, Python execution) to perform tasks.

### A. Ingestion Workflow (File Locking)
To safely process a file without colliding with other agents, use PowerShell to move it:
```powershell
# 1. Lock the file
Move-Item "raw\inbox\TargetDocument.pdf" "raw\processing\TargetDocument.pdf"

# 2. (Process the file and generate markdown in wiki/sources and wiki/drafts)

# 3. Mark as done
Move-Item "raw\processing\TargetDocument.pdf" "raw\processed\TargetDocument.pdf"
```

### B. GitOps Operations (GitOps Agent)
Execute standard git commands in the workspace root:
```bash
git pull origin main
git checkout -b feature/update-route-4
git add "wiki/entities/Route 4.md"
git commit -m "Update Route 4 details"
git push origin feature/update-route-4
```

### C. Logging
Always append your actions to your specific log file based on your role and date. Do not modify other agents' logs.
```powershell
Add-Content -Path "logs\ingester\2026-05-08_agent01.md" -Value "- [10:00] Ingested TargetDocument.pdf"
```
