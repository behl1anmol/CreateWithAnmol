# Claude Operating Context — Create with Anmol

This repository uses structured AI-assisted development.

You must use the files inside `.claude/context` as the primary source of truth before making implementation decisions.

---

# Technology Stack Rule

Always use the **latest stable version** of every technology and library in this project.

* Never suggest or use outdated major versions when a newer stable release exists
* Before selecting a library version, verify the latest stable release
* Use latest Next.js, latest Tailwind CSS (v4+), latest TypeScript, latest React
* When in doubt, check Context7 MCP or the official docs for current version

Do not introduce older versions for "compatibility" reasons unless there is a hard blocker that cannot be resolved. If a blocker exists, document it in `.claude/analysis/architectural-decisions.md`.

---

# Context Hierarchy

Use the following files intentionally depending on the task:

## vision.md

Contains:

* product vision
* creator positioning
* UX philosophy
* audience goals
* emotional direction

Use this when making:

* UX decisions
* branding decisions
* creator experience decisions
* prioritization decisions

---

## architecture.md

Contains:

* frontend architecture
* backend architecture
* rendering strategy
* deployment strategy
* routing structure
* data flow

Use this before:

* creating application structure
* implementing APIs
* changing routing
* modifying rendering logic
* introducing dependencies

Do not violate architectural constraints without explicit instruction.

---

## design-system.md

Contains:

* visual language
* color palette
* gradients
* spacing system
* glassmorphism rules
* typography rules
* motion philosophy

Use this before:

* creating UI components
* modifying layouts
* adding animations
* adjusting styling

Maintain visual consistency across all pages.

---

## frontend-rules.md

Contains:

* frontend implementation rules
* performance constraints
* component philosophy
* animation restrictions
* accessibility guidance

Use this before:

* creating components
* introducing animations
* modifying UI behavior
* restructuring frontend code

---

## backend-rules.md

Contains:

* backend implementation rules
* API constraints
* Google Sheets integration patterns
* Apps Script architecture
* caching strategy

Use this before:

* implementing APIs
* integrating Google Sheets
* changing data models
* modifying fetch logic

---

## content-model.md

Contains:

* content schemas
* data contracts
* API response shapes
* field definitions

Use this before:

* implementing content fetching
* mapping UI data
* modifying schemas
* creating API adapters

Maintain schema consistency.

---

## cms-appscript-reference.md

Contains:

* exact Google Sheets column headers for all 4 tabs (Prompts, Products, Blogs, Featured)
* complete Apps Script source code (Code.gs)
* step-by-step Apps Script deployment guide
* CORS constraint and server-side fetch requirement
* troubleshooting section

Use this before:

* setting up Google Sheets tabs for the first time
* deploying or updating Apps Script
* implementing Phase 2 fetch layer in Next.js
* debugging CMS API issues

This is the **implementation-ready reference** — more detailed than cms-schema.md.

Hierarchy priority: cms-appscript-reference.md > cms-schema.md for implementation specifics.

---

## cms-schema.md

Contains:

* Google Sheets CMS structure
* tab definitions
* column definitions
* schema contracts
* content organization rules
* operational CMS constraints

This file acts as:

# the operational source of truth for the content management system.

Use this before:

* implementing Apps Script APIs
* modifying spreadsheet schemas
* creating frontend content mappings
* updating content models
* implementing fetch normalization

The CMS schema must remain:

* stable
* normalized
* lightweight
* frontend-safe
* human-editable

Do not:

* rename columns
* reorder columns
* introduce nested structures
* create relational complexity
* modify schema semantics

without updating:

* content-model.md
* backend integration logic
* frontend mapping logic

cms-schema.md works together with:

* content-model.md
* backend-rules.md
* architecture.md

Hierarchy priority for CMS/backend implementation:

1. cms-schema.md
2. content-model.md
3. backend-rules.md
4. architecture.md

If conflicts occur:

* preserve schema consistency
* preserve frontend compatibility
* preserve operational simplicity.

---

## implementation-phases.md

Contains:

* MVP scope
* phased roadmap
* implementation priorities
* MoSCoW prioritization

Use this to:

* avoid premature implementation
* maintain MVP discipline
* prioritize correctly

Do not implement future-phase functionality unless explicitly requested.

---

## prompts/

Contains:

* reusable generation prompts
* implementation prompts
* frontend/backend scaffolding prompts

Use as reference material when generating new implementation plans.

---
## design.md

Contains:

* finalized frontend design specifications
* page layouts
* section structures
* visual hierarchy
* UI composition details
* Stitch-generated design decisions
* responsive layout intentions

This file acts as:

# the visual source of truth for frontend implementation.

Use this before:

* implementing frontend pages
* creating layouts
* building components
* modifying visual hierarchy
* refining responsive behavior
* implementing section composition

When implementing frontend UI:

* prioritize alignment with design.md
* preserve established layout structure
* preserve visual hierarchy
* preserve spacing rhythm
* preserve interaction intent

Do not:

* redesign layouts unnecessarily
* reinterpret established sections
* introduce new visual systems
* significantly alter composition without explicit instruction

design.md should work together with:

* design-system.md
* frontend-rules.md
* vision.md

Hierarchy priority for frontend implementation:

1. design.md
2. design-system.md
3. frontend-rules.md
4. vision.md

If conflicts occur:

* preserve the visual intent defined in design.md
* while maintaining architecture and performance constraints.

---

# Core Engineering Principles

The project prioritizes:

1. Visual consistency
2. Architectural simplicity
3. Mobile responsiveness
4. Performance
5. Maintainability
6. Reusable component architecture

---

# Performance Philosophy

The website must remain:

* lightweight
* smooth
* mobile-friendly
* performant

Avoid:

* unnecessary dependencies
* excessive animations
* WebGL
* large animation frameworks
* excessive blur
* overengineered abstractions

Prefer:

* static-first rendering
* reusable components
* CSS transitions
* lightweight effects

---

# Visual Philosophy

The visual system is:

* Apple Liquid Glass inspired
* cinematic
* editorial
* restrained
* premium

Avoid:

* cyberpunk aesthetics
* neon effects
* excessive glow
* cluttered SaaS layouts
* gaming-style UI

---

# Development Philosophy

This project follows:

* MVP-first implementation
* iterative refinement
* component reuse
* architecture-first development

Avoid:

* premature optimization
* unnecessary backend complexity
* overengineering

---

# Important Constraint

Preserve established visual direction and architecture continuity unless explicitly instructed otherwise.

---

## analysis/

Contains:
- implementation learnings
- debugging discoveries
- architectural decisions
- session continuity notes
- recurring issues and fixes

This directory acts as:
# persistent engineering memory.

Use these files before:
- continuing implementation
- refactoring architecture
- debugging issues
- making structural decisions
- starting work in a new Claude session

Claude should continuously update:
- implementation-notes.md
- lessons-learned.md
- debugging-log.md
- architectural-decisions.md
- session-handoff.md

after meaningful implementation or debugging work.

The purpose is to:
- preserve engineering continuity
- reduce repeated mistakes
- minimize context loss across sessions
- improve implementation consistency

Important:
- append instead of overwriting
- preserve chronological history
- keep entries concise and technical
- document rationale behind important decisions

---

## Stitch MCP

The repository uses Stitch MCP as the authoritative frontend design reference.

Claude must use Stitch MCP before:
- implementing frontend pages
- creating layouts
- modifying responsive structure
- creating shared UI composition
- adjusting spacing or hierarchy

The Stitch design should be treated as:
# the primary visual implementation reference.

design.md acts as:
- supporting documentation
- implementation clarification
- UX rationale
- visual specification notes

When conflicts occur:
- prioritize Stitch MCP layout structure
- preserve Stitch spacing rhythm
- preserve Stitch composition hierarchy
- preserve Stitch responsive intent

Do not:
- reinterpret layouts unnecessarily
- redesign sections
- introduce alternate composition systems
- deviate from the established visual structure

The frontend implementation should closely match:
- Stitch composition
- Stitch layout hierarchy
- Stitch spacing behavior
- Stitch responsive structure

while still following:
- architecture constraints
- frontend performance constraints
- design-system consistency

---

## Stitch Fidelity Requirement

Frontend implementations must achieve high structural and visual parity with Stitch MCP designs.

Avoid:
- placeholder implementations
- simplified compositions
- incomplete sections
- missing card systems
- reduced visual density

Claude must:
1. inspect Stitch MCP before implementation
2. compare current implementation against Stitch
3. identify missing structures/components
4. preserve layout hierarchy accurately

The implementation should feel:
- compositionally complete
- visually dense where appropriate
- editorial
- cinematic
- faithful to Stitch hierarchy

Do not treat Stitch designs as loose inspiration.
Treat them as implementation references.

---

## Workspace Automation

The `.claude/` directory contains a full suite of development automation:

### Slash Commands (Skills)
| Command | Purpose |
|---------|---------|
| `/feature` | Structured feature development: read context → plan → implement → validate → test |
| `/bugfix` | Bug diagnosis: reproduce → 5-point root cause → minimal fix → regression test |
| `/reviewer` | Code review: CRITICAL/HIGH/MEDIUM/LOW findings with exact file:line references |
| `/tester` | Playwright E2E: run tests, diagnose failures, write new coverage |
| `/deploy-cloudflare` | Step-by-step Cloudflare Pages deployment guide |

### Custom Agents
| Agent | Invoke with | Purpose |
|-------|------------|---------|
| `feature-agent` | Agent tool | Frontend/backend feature implementation specialist |
| `bugfix-agent` | Agent tool | 5-point root cause analysis + minimal fix specialist |
| `reviewer-agent` | Agent tool | Code review against all project rules |
| `tester-agent` | Agent tool | Playwright testing and coverage specialist |
| `orchestrator-agent` | Agent tool | Multi-phase coordinator: spawns all agents in sequence |

### Hooks (Automated)
| Hook | Event | Purpose |
|------|-------|---------|
| `session-start.sh` | SessionStart | Shows branch, status, recent commits, quick reference |
| `post-session-update.sh` | Stop | Reminds about analysis file updates |
| `pre-tool-validation.sh` | PreToolUse (Bash) | Warns on destructive patterns |

### Multi-Phase Orchestration
For complete feature pipelines, use `orchestrator-agent`:
```
feature-agent → reviewer-agent → bugfix-agent (if issues) → tester-agent
```

All agents read `.claude/context/` files before making decisions.
All agents update `.claude/analysis/` files after completing work.
