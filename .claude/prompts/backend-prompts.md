# Backend Prompts — Create with Anmol

# Purpose

This document contains reusable backend implementation prompts for:

* Google Sheets integration
* Google Apps Script APIs
* lightweight content infrastructure
* static-first content fetching
* normalized API responses

These prompts must follow:

* architecture.md
* backend-rules.md
* content-model.md
* implementation-phases.md

The backend architecture must remain:

* lightweight
* content-focused
* static-first
* operationally simple

Avoid:

* backend overengineering
* database systems
* authentication systems
* unnecessary infrastructure
* SaaS-style backend complexity

---

# Prompt — Google Sheets CMS Setup

```text id="xv9hpr"
Design the Google Sheets CMS structure for Create with Anmol.

Requirements:
- single spreadsheet architecture
- separate tabs for:
  - Prompts
  - Products
  - Blogs
  - Featured

Follow content-model.md strictly.

Requirements:
- human-editable structure
- mobile-manageable workflow
- explicit field naming
- normalized content organization

Avoid:
- nested spreadsheet structures
- relational complexity
- presentation-specific logic
- spreadsheet overengineering
```

---

# Prompt — Apps Script API Foundation

```text id="yvnd7w"
Create the Google Apps Script API foundation for Create with Anmol.

Requirements:
- lightweight implementation
- normalized JSON responses
- readable code structure
- stateless API behavior

Create endpoints for:
- /api/prompts
- /api/products
- /api/blogs
- /api/featured

Requirements:
- predictable response structures
- defensive null handling
- lightweight validation
- frontend-safe responses

Avoid:
- backend frameworks
- authentication
- databases
- complex business logic
- excessive transformation layers
```

---

# Prompt — Prompts API Implementation

```text id="f8e7a0"
Implement the Prompts API using Google Apps Script.

Requirements:
- fetch content from Prompts sheet
- normalize response structure
- follow content-model.md
- return lightweight JSON

Each prompt item should support:
- id
- title
- description
- image
- category
- reelLink
- promptLink
- featured
- order

Requirements:
- graceful missing field handling
- readable implementation
- lightweight transformation logic

Avoid:
- nested response structures
- unnecessary metadata
- spreadsheet-specific frontend coupling
```

---

# Prompt — Products API Implementation

```text id="pj5ytp"
Implement the Products API using Google Apps Script.

Requirements:
- fetch content from Products sheet
- normalize JSON responses
- follow content-model.md
- support frontend-safe rendering

Each product item should support:
- id
- title
- description
- image
- productLink
- featured
- order

Requirements:
- lightweight implementation
- defensive null handling
- stable response structures

Avoid:
- ecommerce backend complexity
- pricing systems
- inventory systems
- authentication logic
```

---

# Prompt — Blogs API Implementation

```text id="9dq7qb"
Implement the Blogs API using Google Apps Script.

Requirements:
- fetch content from Blogs sheet
- normalize JSON responses
- follow content-model.md
- support static rendering workflows

Each blog item should support:
- id
- title
- excerpt
- image
- articleLink
- category
- readTime
- featured
- order

Requirements:
- predictable schema behavior
- lightweight implementation
- graceful fallback handling

Avoid:
- CMS-style complexity
- markdown rendering systems
- blog engine abstractions
```

---

# Prompt — Featured Content API

```text id="29khq6"
Implement the Featured content API using Google Apps Script.

Requirements:
- fetch content from Featured sheet
- support homepage orchestration
- preserve lightweight architecture
- follow content-model.md

Each featured item should support:
- id
- contentType
- contentId
- section
- order

Purpose:
- avoid hardcoded homepage content
- support manual content curation

Avoid:
- dynamic recommendation systems
- algorithmic content ranking
- backend personalization logic
```

---

# Prompt — Frontend Fetch Abstraction Layer

```text id="t9n1kh"
Create a frontend fetch abstraction layer for Create with Anmol.

Structure:
- lib/api
- lib/content

Requirements:
- isolate fetch logic
- normalize API consumption
- reduce frontend/backend coupling
- support future migration flexibility

The frontend should never directly depend on:
- spreadsheet structures
- Apps Script implementation details
- raw endpoint formatting

Avoid:
- duplicated fetch logic
- page-level API implementations
- tightly coupled integrations
```

---

# Prompt — Static Fetching Integration

```text id="89bl4d"
Implement static-first content fetching for Create with Anmol.

Requirements:
- build-time fetching
- incremental revalidation
- CDN-friendly rendering
- lightweight API usage

Focus on:
- performance
- predictable rendering
- low operational complexity

Avoid:
- per-request rendering
- realtime systems
- high-frequency polling
- unnecessary runtime fetching
```

---

# Prompt — Backend Validation Refinement

```text id="gh8m7g"
Refine backend validation and response safety.

Requirements:
- validate required fields
- handle missing values safely
- preserve frontend-safe responses
- maintain lightweight implementation

Validation should remain:
- minimal
- readable
- maintainable

Avoid:
- complex validation frameworks
- excessive schema systems
- backend-heavy abstractions
```

---

# Prompt — Backend Error Handling

```text id="90dxjq"
Implement lightweight backend error handling for Create with Anmol.

Requirements:
- graceful fallback behavior
- frontend-safe responses
- predictable API outputs
- operational simplicity

Preferred:
- empty arrays
- safe default responses
- minimal error exposure

Avoid:
- verbose backend exceptions
- complex error systems
- leaking implementation details
```

---

# Prompt — Backend Performance Optimization

```text id="d4j8mx"
Optimize backend performance for Create with Anmol.

Focus on:
- lightweight payloads
- predictable responses
- reduced transformation overhead
- frontend rendering efficiency

Requirements:
- normalized JSON
- minimal response size
- stable endpoint behavior

Avoid:
- oversized responses
- unnecessary metadata
- expensive aggregation logic
- backend-heavy processing
```

---

# Prompt — Final Backend Review

```text id="b86p5m"
Review the backend implementation for architectural consistency.

Validate:
- compliance with backend-rules.md
- compliance with content-model.md
- lightweight architecture
- static-first compatibility
- frontend-safe responses
- operational simplicity

Ensure the backend remains:
- maintainable
- lightweight
- performant
- understandable

Avoid:
- backend overengineering
- unnecessary abstractions
- infrastructure complexity
- SaaS-style backend drift
```
