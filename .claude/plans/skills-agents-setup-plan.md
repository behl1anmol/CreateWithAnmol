# Plan: Claude Code Workspace Skills, Hooks, Agents & Rules Setup

**Date:** 2026-05-30
**Branch:** claude/workspace-skills-agents-setup-GupTd
**Status:** Implemented
**Session:** Skills, agents, hooks, and slash commands configuration

---

## Problem Statement

The Create with Anmol project had no structured Claude Code workspace automation:
- No slash commands for common development workflows
- No custom agents for specialized tasks
- No hooks for lifecycle automation
- No enforced project-specific development workflow

Each Claude session had to rediscover context, repeat setup, and manually follow CLAUDE.md rules without tooling enforcement.

---

## Solution

Create a comprehensive Claude Code workspace configuration:
1. **4 slash commands**: `/feature`, `/bugfix`, `/reviewer`, `/tester`
2. **5 custom agents**: feature-agent, bugfix-agent, reviewer-agent, tester-agent, orchestrator-agent
3. **3 lifecycle hooks**: session-start, post-session-update, pre-tool-validation
4. **settings.json**: hook event bindings

---

## Architecture Decisions

### Decision 1: Skills as SKILL.md for Slash Commands
**Rationale:** Skills in `.claude/skills/<name>/SKILL.md` become `/<name>` slash commands. This follows the existing `deploy-cloudflare` skill pattern already in the project. When Claude Code loads the skill, the SKILL.md content is injected as context, and Claude follows its workflow instructions. No new abstractions required — it's the established Claude Code pattern.

### Decision 2: Custom Agents in `.claude/agents/`
**Rationale:** Claude Code custom agents are markdown files with YAML frontmatter in `.claude/agents/`. They define specialized system prompts and tool access. Using agents (rather than having one monolithic skill) provides:
- Separation of concerns per phase
- Focused, smaller system prompts that don't bloat context
- Parallelizable execution via the `Agent` tool
- Reusability (reviewer-agent can be called by orchestrator OR standalone)

### Decision 3: Orchestrator Pattern for Multi-Phase Workflows
**Rationale:** A feature from idea to production requires: implement → review → fix → test. These are distinct cognitive modes. A single prompt trying to do all four produces mediocre results in each. The orchestrator coordinates specialized subagents, passing context between phases, and synthesizing results. Maximum 3 iteration cycles before escalating to human (prevents infinite loops).

### Decision 4: Hook Events Selected
- **SessionStart**: Orients Claude with branch, status, recent commits. Reduces repeated `git status` calls at session start.
- **Stop**: Reminds about analysis file updates — addresses the recurring context-loss issue between sessions documented in session-handoff.md.
- **PreToolUse (Bash)**: Warns on destructive command patterns without blocking (exit 0 always). Blocking hooks are too disruptive for agentic workflows.

### Decision 5: No Separate Rules Directory
**Rationale:** CLAUDE.md already serves as the project rules file. Creating a parallel `rules/` directory would create competing sources of truth. Instead, CLAUDE.md is updated to reference the new agents/skills.

---

## Files Created

### Skills (Slash Commands)
| File | Command | Purpose |
|------|---------|---------|
| `.claude/skills/feature/SKILL.md` | `/feature` | Structured feature development: read context → plan → implement → validate → test → document |
| `.claude/skills/bugfix/SKILL.md` | `/bugfix` | Bug diagnosis: reproduce → root cause → fix → regression test → document |
| `.claude/skills/reviewer/SKILL.md` | `/reviewer` | Code review: CRITICAL/HIGH/MEDIUM/LOW findings with file:line references |
| `.claude/skills/tester/SKILL.md` | `/tester` | Playwright E2E: run tests, diagnose failures, write new coverage |

### Agents
| File | Role |
|------|------|
| `.claude/agents/feature-agent.md` | Frontend/backend feature implementation specialist |
| `.claude/agents/bugfix-agent.md` | Bug diagnosis and minimal-fix specialist |
| `.claude/agents/reviewer-agent.md` | Code review against project rules |
| `.claude/agents/tester-agent.md` | Playwright testing and coverage specialist |
| `.claude/agents/orchestrator-agent.md` | Multi-phase workflow coordinator (spawns subagents) |

### Hooks & Configuration
| File | Event |
|------|-------|
| `.claude/hooks/session-start.sh` | SessionStart |
| `.claude/hooks/post-session-update.sh` | Stop |
| `.claude/hooks/pre-tool-validation.sh` | PreToolUse (Bash) |
| `.claude/settings.json` | Event bindings |

---

## How the System Works

### Single-Phase Usage
```
User: /feature "Add dark mode toggle"
  ↓
SKILL.md loads → Structured workflow:
  1. Read design-system.md, frontend-rules.md
  2. Write plan to .claude/plans/feature-dark-mode-2026-05-30.md
  3. Implement with existing glass utilities + type classes
  4. npm run build (zero TypeScript errors required)
  5. npx playwright test (all tests must pass)
  6. Update session-handoff.md
```

### Multi-Phase Orchestration
```
User: /orchestrator "Add dark mode toggle"
  ↓
orchestrator-agent.md → Plans phases → Spawns:

  Phase 1: feature-agent
    → reads context files
    → implements feature
    → validates build + tests
    → reports: files changed, build status

  Phase 2: reviewer-agent
    → git diff main...HEAD
    → checks against all project rules
    → reports: CRITICAL/HIGH/MEDIUM/LOW findings

  Phase 3: bugfix-agent (if CRITICAL/HIGH found)
    → fixes each issue minimally
    → re-validates build

  Phase 4: tester-agent
    → runs all Playwright tests
    → writes new tests for new UI
    → reports: X/Y passing, coverage gaps

  Final: orchestrator synthesizes → updates analysis files
```

---

## Integration with Existing Documentation

The skills and agents integrate with:
- `.claude/context/` — agents read these before making decisions
- `.claude/analysis/` — updated after each session by all agents
- `.claude/plans/` — feature/bugfix plans written here per workflow
- `e2e/` — tester-agent writes Playwright tests here
- `npm run build` — TypeScript validation gate in all agents
- `npx playwright test` — E2E gate in feature and tester agents

---

## Quality Gates (Enforced by All Agents)
1. `npm run build` must pass with ZERO TypeScript errors
2. All existing Playwright tests must continue passing
3. New UI must have Playwright test coverage
4. Analysis files must be updated at session end
5. Plan file must be committed with changes
