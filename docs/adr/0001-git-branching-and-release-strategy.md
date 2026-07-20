# ADR-0001: Git Branching and Release Strategy

- **Status:** Accepted
- **Date:** 2026-07-16
- **Decision Makers:** SariHub Development Team
- **Version:** 1.0

---

# Context

SariHub is a production-ready marketplace platform consisting of:

- Angular 17 Frontend
- NestJS Backend
- Prisma ORM
- Neon PostgreSQL
- Cloudinary
- PayMongo
- Vercel
- Render

As the project matures toward production, a release strategy is required that balances:

- Fast development
- Safe deployments
- Stable production releases
- Low operational overhead
- Future team scalability

The project currently has:

- Local Development
- Staging Environment
- Production Environment

with automatic deployments already configured for the staging environment.

---

# Decision

SariHub will adopt a **Hybrid CI/CD Release Strategy**.

Development deployments are fully automated.

Production deployments require an intentional release decision through a Pull Request before being automatically deployed.

---

# Branch Strategy

```
feature/*
      │
      ▼
develop
      │
      ▼
Automatic Staging Deployment
      │
      ▼
QA Testing
      │
      ▼
Pull Request
      │
      ▼
main
      │
      ▼
Automatic Production Deployment
```

---

# Branch Responsibilities

## feature/*

Purpose

- Individual feature development
- Bug fixes
- Refactoring
- Experiments

Rules

- Created from develop
- Merged back into develop
- Deleted after merge

---

## develop

Purpose

Integration branch.

Contains the latest stable development code.

Every merge automatically deploys to the Staging environment.

Environment

- Frontend Staging (Vercel)
- Backend Staging (Render)
- Neon Staging Database

Responsibilities

- Continuous Integration
- Integration Testing
- QA Testing

---

## main

Purpose

Production branch.

Represents the latest production release.

Every merge automatically deploys to Production.

Environment

- Frontend Production
- Backend Production
- Neon Production Database

Rules

- No direct pushes
- Pull Requests only
- Production releases only

---

# Deployment Workflow

```
Developer

↓

feature/*

↓

Local Testing

↓

Merge into develop

↓

Automatic Deployment

↓

Staging Environment

↓

QA Testing

↓

Pull Request

↓

Code Review

↓

Merge into main

↓

Automatic Production Deployment
```

---

# Release Philosophy

SariHub follows the principle:

> Deploy automatically. Release intentionally.

Deployment is automated.

Production release is a deliberate engineering decision.

---

# Benefits

- Continuous integration
- Automatic staging deployments
- Reduced manual deployment work
- Controlled production releases
- Clear release history
- Easier rollback
- Supports future team growth

---

# GitHub Branch Protection

## main

Required

- Pull Request required
- No direct push
- Require passing checks
- Resolve conversations before merge

Recommended

- Signed commits (future)
- Required approvals (future)

---

## develop

Current

Direct push allowed.

Future

May require Pull Requests when multiple developers join the project.

---

# Versioning

Every production release should include:

- Updated CHANGELOG.md
- Semantic Version
- Git Tag
- GitHub Release

Example

```
v1.0.0
```

---

# Rollback Strategy

Application rollback

- Redeploy previous Git tag

Database rollback

- Restore verified database backup when required
- Prefer forward-only Prisma migrations whenever possible

---

# Future Evolution

As the engineering team grows, this workflow can evolve to include:

- Multiple reviewers
- Protected develop branch
- Automated testing gates
- Security scanning
- Performance testing
- Release candidates
- Blue/Green deployment
- Canary deployment

without changing the overall architecture.

---

# Decision Summary

This strategy provides:

- Fast developer workflow
- Safe production releases
- Fully automated deployments
- Minimal operational overhead
- Enterprise-grade scalability

and will serve as the standard release workflow for the SariHub Marketplace.