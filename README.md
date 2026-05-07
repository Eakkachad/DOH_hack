# DOH Hackathon 2026: Knowledge Base and Multi-Agent System

This repository serves as the central knowledge base and the execution environment for the Autonomous Multi-Agent System developed for the Department of Highways (DOH) Hackathon 2026.

## System Architecture

The project utilizes a GitOps-driven, multi-agent architecture designed to incrementally build and maintain a highly interlinked Obsidian markdown wiki. Concurrency and conflict resolution are managed through strict directory segregation and role-based agent workflows.

### Agent Roles
1. **Ingester Agent**: Monitors raw data inputs, extracts entities, and proposes structured drafts.
2. **Synthesizer Agent**: Reviews proposed drafts, resolves data conflicts, and merges verified knowledge into the core entities directory.
3. **Linter Agent**: Maintains the health of the wiki by identifying orphan pages, broken links, and dynamically generating the central index.
4. **GitOps Agent**: Automates version control operations, pull requests, and system notifications.

### Directory Structure
- `/raw/inbox/`: Drop zone for new raw source files.
- `/raw/processing/`: Lock directory for files currently being ingested.
- `/raw/processed/`: Archive for successfully ingested raw files.
- `/raw/failed/`: Archive for files that encountered ingestion errors.
- `/wiki/entities/`: Verified and persistent knowledge base entities.
- `/wiki/sources/`: Summaries and structured extractions from raw files.
- `/wiki/drafts/`: Proposed updates awaiting synthesis.
- `/logs/<role>/`: Role-specific chronological execution logs.
- `/config/`: Machine-specific configurations (excluded from version control).
- `/scripts/`: Operational scripts and legacy tools.

## Latest Updates
- **Structural Migration**: Transitioned from a flat file system to a role-based, concurrency-safe directory structure.
- **Workflow Standardization**: Implemented standard operating procedures (SOPs) for file locking and state management during the ingestion process.
- **Legacy Script Archiving**: Deprecated early-stage Python and PowerShell scripts, moving them to `/scripts/legacy/` to prepare for agent-native automation.

## Current Issues and Limitations
- **Legacy Script Incompatibility**: Existing batch ingestion scripts in `/scripts/legacy/` rely on the deprecated flat structure and require refactoring to utilize the new `inbox` and `processing` pipelines.
- **Agent Orchestration**: The trigger mechanism between agents (e.g., transitioning a file from draft to synthesis) currently requires manual automation or scheduled jobs, pending full event-driven integration.

## Usage Instructions
1. **Configuration**: Reference `/config/.agent_config.example.json` to setup local machine credentials. Ensure your actual configuration file is ignored by Git.
2. **Data Ingestion**: Place new raw documents into `/raw/inbox/`.
3. **Execution**: Agents must target the new directory paths. Refer to `AGENTS.md` and `scripts/AGENT_TOOLS.md` for standard operating procedures.
4. **Contribution**: All direct modifications to core entities should be managed via Pull Requests to prevent direct merge conflicts on the main branch.
