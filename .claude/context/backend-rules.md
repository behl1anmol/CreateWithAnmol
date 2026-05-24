# Backend Rules — Create with Anmol

# Backend Philosophy

The backend architecture should remain:

* lightweight
* static-first
* content-focused
* operationally simple
* maintainable

The backend is NOT intended to become:

* a traditional application backend
* a business logic platform
* a database-heavy system
* a SaaS infrastructure layer

The backend exists primarily to:

* expose normalized content
* support static rendering
* provide lightweight content APIs
* simplify frontend integration

---

# Core Backend Stack

Use:

* Google Sheets
* Google Apps Script

Avoid introducing:

* databases
* backend frameworks
* server infrastructure
* serverless complexity
* authentication systems

The backend should remain:

* minimal
* understandable
* low-maintenance

---

# Backend Architecture Philosophy

The architecture follows:

# lightweight API gateway philosophy.

Flow:

```text id="bdqggm"
Google Sheets
    ↓
Google Apps Script
    ↓
Normalized JSON APIs
    ↓
Next.js Fetch Layer
```

The backend should:

* expose content cleanly
* remain stateless
* avoid business logic complexity
* support static-first rendering

---

# Google Sheets Rules

Google Sheets acts as:

# lightweight headless CMS.

Use:

* a single spreadsheet
* multiple tabs

Recommended tabs:

```text id="r5n0ls"
Prompts
Products
Blogs
Featured
```

Avoid:

* multiple spreadsheet fragmentation
* relational spreadsheet structures
* nested data systems
* spreadsheet-driven presentation logic

Sheets should remain:

* human-editable
* mobile-manageable
* operationally simple

---

# Apps Script Rules

Apps Script should:

* expose normalized APIs
* remain lightweight
* avoid excessive transformation logic
* remain readable

Apps Script should NOT:

* become application backend
* contain frontend rendering logic
* implement authentication systems
* implement complex business workflows

---

# API Endpoint Rules

Preferred endpoint structure:

```text id="3pbr7l"
/api/prompts
/api/products
/api/blogs
/api/featured
```

Endpoints should:

* return normalized JSON
* remain predictable
* maintain stable response structures

Avoid:

* deeply nested APIs
* dynamic endpoint generation
* query-heavy APIs
* complex routing systems

---

# Response Structure Rules

API responses should:

* remain flat
* remain normalized
* support frontend rendering directly

Avoid:

* nested relational responses
* excessive metadata
* presentation-specific formatting

The backend should provide:

# content only.

The frontend handles:

* presentation
* layout
* styling
* interaction

---

# Schema Rules

Schemas should:

* remain explicit
* follow content-model.md
* support optional fields safely

Avoid:

* dynamic schema generation
* schema drift
* inconsistent field naming

All schema updates should:

* preserve backward compatibility
* remain frontend-safe

---

# Fetching Philosophy

The backend should support:

# static-first fetching.

Preferred frontend strategy:

* build-time fetches
* incremental revalidation
* periodic refreshes

Avoid:

* per-request backend rendering
* realtime systems
* high-frequency polling

The system is content-driven, not realtime-driven.

---

# Caching Rules

Caching should prioritize:

* performance
* simplicity
* low operational overhead

Preferred:

* static page generation
* incremental revalidation
* CDN caching

Avoid:

* custom cache infrastructure
* cache invalidation complexity
* realtime synchronization systems

---

# Validation Rules

Apps Script should provide:

* lightweight validation
* defensive null handling
* predictable response behavior

Validate:

* required fields
* URLs
* missing values

Avoid:

* excessive validation frameworks
* complex schema engines

Validation should remain:

* lightweight
* operationally simple

---

# Error Handling Rules

Backend responses should:

* fail gracefully
* remain predictable
* avoid frontend-breaking behavior

Preferred:

* empty arrays
* safe fallback values
* lightweight error responses

Avoid:

* verbose backend errors
* leaking internal implementation details
* complex exception systems

---

# Security Philosophy

The backend is intentionally:

# low-risk and low-complexity.

Avoid implementing:

* authentication
* authorization
* user sessions
* admin dashboards
* private data systems

The system primarily serves:

* public creator content
* public content metadata
* public discovery flows

---

# Backend Performance Rules

Backend performance should prioritize:

* low latency
* predictable responses
* lightweight payloads

Avoid:

* oversized responses
* unnecessary fields
* expensive transformations
* complex aggregation logic

The backend should remain:

* fast
* lightweight
* operationally stable

---

# Operational Simplicity Rules

Operational simplicity is a primary requirement.

The backend should:

* require minimal maintenance
* remain easy to debug
* remain easy to update manually

Avoid:

* infrastructure-heavy systems
* multi-service complexity
* deployment-heavy architectures

The project should remain manageable by:

# a solo creator-developer workflow.

---

# Future Expansion Philosophy

Future expansion may include:

* YouTube content
* creator resources
* additional content domains
* lightweight creator utilities

However:
future functionality must preserve:

* simplicity
* maintainability
* static-first philosophy
* lightweight operations

Avoid evolving toward:

* enterprise backend systems
* database-heavy architectures
* SaaS infrastructure complexity

---

# Backend Constraint

Every backend decision should prioritize:

1. simplicity
2. maintainability
3. performance
4. frontend compatibility
5. operational efficiency

Avoid introducing complexity unless it significantly improves:

* maintainability
* scalability
* developer workflow
* content management efficiency
