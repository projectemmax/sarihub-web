# Changelog

All notable changes to this project will be documented in this file.

The project follows Semantic Versioning (SemVer).

## [Unreleased]

### Added

#### Storefront
- ProductMediaGalleryComponent
- Thumbnail carousel navigation
- Smart carousel navigation controls
- Automatic thumbnail auto-centering when the active gallery image changes

### Changed

#### Storefront
- Redesigned storefront product media gallery
- Refactored the product media gallery to use a unified gallery model for product and variant images
- Updated the thumbnail gallery to render from a single `GalleryImage` collection
- Synchronized variant selection with the product media gallery so the corresponding thumbnail is automatically activated
- Automatically scroll the thumbnail carousel to keep the active image visible
- Improved main product image layout
- Improved thumbnail spacing and styling
- Replaced fixed thumbnail scroll distance with responsive thumbnail-based scrolling
- Added automatic Previous/Next button state based on carousel position
- Refactored gallery image rendering to resolve thumbnail and preview images independently using image sources.
- Fixed blurry preview images when selecting variant thumbnails.

### Internal

#### Storefront
- Introduced `GalleryImage` and `GalleryImageType` models
- Refactored `ProductMediaGalleryComponent` to build a unified media collection from product and variant images
- Added `activeGalleryImage` state to support gallery synchronization and future single-source-of-truth architecture
- Added reusable thumbnail auto-centering helper for gallery navigation
- Updated the gallery model to store image sources instead of pre-rendered image URLs.
- Added reusable image resolver methods for thumbnail and preview rendering.

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