# ADR-0002: Repository Governance and Merge Strategy

- **Status:** Accepted
- **Date:** 2026-07-20
- **Decision Makers:** SariHub Development Team
- **Version:** 1.0

---

# Context

As SariHub approaches its first production release, the Git workflow and repository governance were reviewed to ensure a safe, consistent, and scalable release process.

The objectives were to:

- Protect the production branch from accidental changes.
- Keep the development workflow efficient.
- Standardize merge strategies across repositories.
- Prepare the project for future team growth.
- Minimize deployment risk while maintaining developer productivity.

The following repositories are governed by this decision:

- `sarihub-web`
- `sarihub-api`

---

# Decision

SariHub adopts a lightweight repository governance model appropriate for a small engineering team while remaining scalable as the project grows.

The production branch (`main`) is protected.

The integration branch (`develop`) remains flexible during the current stage of development.

---

# Branch Protection Strategy

## Protected Branch

```
main
```

The `main` branch represents production.

All production releases must go through a Pull Request.

Direct updates are prohibited.

---

## Development Branch

```
develop
```

The `develop` branch represents the integration environment.

At the current stage of the project:

- Direct updates are allowed.
- Feature branches are still encouraged.
- Automatic deployment to the Staging environment occurs after updates.

This decision minimizes unnecessary workflow overhead while the project is maintained primarily by a single developer.

---

# Release Workflow

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

# Main Branch Rules

The following protection rules are applied to the `main` branch.

## Restrict Updates

Enabled

Direct pushes are not allowed.

---

## Restrict Deletions

Enabled

Prevents accidental deletion of the production branch.

---

## Pull Request Required

Enabled

All production releases require a Pull Request.

---

## Required Approvals

Current setting:

```
0
```

Reason:

The project is currently maintained by a single primary developer.

The Pull Request itself serves as the production release gate.

This setting should be reviewed when additional maintainers join the project.

---

## Conversation Resolution

Enabled

All review conversations must be resolved before merging.

This promotes disciplined code reviews and prepares the workflow for future team collaboration.

---

## Force Pushes

Blocked

Force pushes are prohibited on the production branch.

---

## Status Checks

Currently disabled.

Reason:

Automated CI validation has not yet been introduced.

Status checks will be enabled after implementing:

- Frontend build validation
- Backend build validation
- ESLint
- Unit tests
- End-to-end tests

---

# Merge Strategy

SariHub standardizes on **Squash Merge**.

Repository settings:

- Merge Commit — Disabled
- Squash Merge — Enabled
- Rebase Merge — Disabled

Reason:

Squash Merge provides a clean and readable project history while preserving detailed development history within feature branches.

Example:

```
feature/product-gallery

Commit 1
Commit 2
Commit 3
Commit 4
```

After merge:

```
feat: Product Media Gallery
```

---

# Pull Request Settings

Repository configuration includes:

- Squash Merge enabled
- Merge Commits disabled
- Rebase Merge disabled
- Always suggest updating pull request branches
- Automatically delete merged feature branches
- Auto-merge disabled

---

# Repository Alignment

The same governance model is applied consistently across:

- sarihub-web
- sarihub-api

Maintaining identical repository governance reduces operational complexity and improves maintainability.

---

# Future Evolution

As the project grows, repository governance may evolve to include:

- Protected `develop` branch
- Required pull request approvals
- CODEOWNERS
- Required CI status checks
- Security scanning
- Code quality gates
- Automated release workflows

These enhancements can be introduced incrementally without changing the overall release architecture.

---

# Benefits

This governance model provides:

- Safe production releases
- Consistent Git history
- Clean feature integration
- Reduced deployment risk
- Simple workflow for a small team
- Scalable foundation for future collaboration

---

# Decision Summary

SariHub adopts a hybrid governance model where:

- `main` is protected.
- `develop` remains flexible.
- Production releases require Pull Requests.
- Squash Merge is the standard merge strategy.
- Repository governance is identical across both repositories.

This strategy balances developer productivity with production stability and serves as the standard Git governance model for the SariHub Marketplace.