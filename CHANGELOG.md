# Changelog

All notable changes to this project will be documented in this file.

The project follows Semantic Versioning (SemVer).

## [Unreleased]

### Added

#### Storefront
- ProductMediaGalleryComponent
- Thumbnail carousel navigation
- Smart carousel navigation controls

### Changed

#### Storefront
- Redesigned storefront product media gallery
- Refactored the product media gallery to use a unified gallery model for product and variant images
- Updated the thumbnail gallery to render from a single `GalleryImage` collection
- Synchronized variant selection with the product media gallery so the corresponding thumbnail is automatically activated
- Improved main product image layout
- Improved thumbnail spacing and styling
- Replaced fixed thumbnail scroll distance with responsive thumbnail-based scrolling
- Added automatic Previous/Next button state based on carousel position

### Internal

#### Storefront
- Introduced `GalleryImage` and `GalleryImageType` models
- Refactored `ProductMediaGalleryComponent` to build a unified media collection from product and variant images
- Added the initial `activeGalleryImage` state to support the upcoming single-source-of-truth gallery architecture


---

## [0.6.0] - 2026-07-02

### Added

- Category Hierarchy
- Category Variant Templates
- Brand Management
- AI Product Description
- Product Image Upload
- Variant Image Upload
- Cloudinary Integration
- Reusable SKU Generator
- Dynamic Variant Generation
- Product Response DTO support

### Changed

- Refactored SKU generation into reusable `SkuGenerator` utility
- Introduced ProductResponseMapper architecture
- Improved Product Response DTO structure
- Improved Variant Image handling
- Refactored Product Form SKU generation

### Fixed

- Fixed duplicate variant SKU generation for multi-word attributes
- Fixed variant image upload workflow
- Fixed product image response mapping

---

## [0.5.0] - 2026-06-18

### Added

- Brand Management
- Brand Logo Upload
- Product Brand Integration

### Changed

- Improved Brand Management UX

### Fixed

- Brand filter issues
- Brand modal preview improvements

---

## [0.4.0] - 2026-06-10

### Added

- Category Hierarchy
- Category Variant Templates
- Dynamic Product Variants

### Changed

- Category Tree redesign

### Fixed

- Parent category validation