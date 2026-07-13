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
- Zoom interaction foundation for the product media gallery
- Clickable product preview with zoom indicator overlay
- Added ProductImageLightboxComponent for fullscreen product image preview.
- Implemented lightbox open/close interaction from the product media gallery.
- Added backdrop click and close button support.
- Locked page scrolling while the lightbox is open.
- Improved responsive fullscreen image viewing experience.
- Added Previous and Next navigation controls to the Product Image Lightbox.
- Added image position counter for gallery navigation.
- Added hover interactions for lightbox navigation controls.
- Added keyboard navigation support for the Product Image Lightbox.
- Added Left Arrow (`←`) navigation to the previous gallery image.
- Added Right Arrow (`→`) navigation to the next gallery image.
- Added Escape (`Esc`) shortcut to close the lightbox.
- Added interactive zoom support to the Product Image Lightbox.
- Added double-click to zoom in and out.
- Added mouse wheel zoom with configurable zoom levels.
- Added drag-to-pan support for zoomed images.
- Added one-finger pan support for zoomed images on touch devices.
- Added pinch-to-zoom gesture support using Pointer Events.
- Added touch pointer state management for multi-touch interactions.
- Added immersive viewing mode that hides lightbox controls while dragging.
- Added dynamic cursor states (`zoom-in`, `grab`, `grabbing`) for improved user interaction.
- Intelligent image preloading for the Product Media Gallery.
- Adjacent image preloading using the browser image cache for smoother gallery navigation.
- Automatic preloading of previous and next gallery images whenever the active image changes.
- Support for preloading both product and variant images.
- Duplicate preload prevention using an in-memory cache for improved efficiency.
- Keyboard navigation for Product Media Gallery thumbnails.
- Support for Arrow Left, Arrow Right, Home, and End keys.
- Automatic thumbnail scrolling to keep the focused item visible.
- Improved accessibility with ARIA labels and active thumbnail indication.
- Added production-ready skeleton loading state.
- Replaced spinner with structured placeholders matching the page layout.
- Added animated shimmer effect.
- Added gallery, thumbnails, product info, sidebar, and related products skeletons.
- Reduced layout shift during product loading.
- Improved perceived loading performance.

### Product Detail
- Added a production-ready skeleton loader for the Product Detail page.
- Added animated shimmer effect for loading placeholders.
- Added skeleton placeholders for the gallery, product information, sidebar, and related products.
- Improved perceived loading performance and reduced layout shift during product loading.

### Product Card
- Added modern hover animation with smooth card elevation.
- Added subtle product image zoom effect on hover.
- Added button hover animation for improved interaction feedback.

### Changed

#### Storefront
- Redesigned storefront product media gallery
- Refactored the product media gallery to use a unified gallery model for product and variant images
- Updated the thumbnail gallery to render from a single `GalleryImage` collection
- Synchronized variant selection with the product media gallery so the corresponding thumbnail is automatically activated
- Refactored gallery image rendering to resolve thumbnail and preview images independently using image sources
- Fixed blurry preview images when selecting variant thumbnails
- Automatically scroll the thumbnail carousel to keep the active image visible
- Improved main product image layout
- Improved thumbnail spacing and styling
- Replaced fixed thumbnail scroll distance with responsive thumbnail-based scrolling
- Added automatic Previous/Next button state based on carousel position
- Integrated Product Image Lightbox into the Product Media Gallery.
- Replaced placeholder preview click behavior with fullscreen image viewing.
- Improved lightbox responsiveness and spacing across different screen sizes.
- Updated close button placement to an image overlay for a cleaner user experience.
- Moved Cloudinary image size configuration into a shared constant for reuse.
- Refactored Product Media Gallery to centralize active image state management.
- Improved lightbox responsiveness, animations, and overall user experience.
- Enhanced navigation controls with polished hover and disabled states.
- Improved desktop accessibility and user experience for the Product Image Lightbox.
- Unified keyboard and mouse navigation behavior using the existing gallery navigation flow.
- Improved Product Image Lightbox with smooth zoom and pan interactions.
- Refined desktop and mobile pan interactions to use shared boundary calculations.
- Improved pan boundaries to use the available viewport instead of the shrink-wrapped image container.
- Enhanced drag experience for portrait, landscape, and square images.
- Improved touch gesture handling by separating swipe navigation and image panning based on zoom state.
- Improved lightbox interaction consistency across desktop and mobile devices.
- Centralized zoom reset behavior when closing the lightbox or navigating between images.
- Refined lightbox controls to prevent UI overlap while manipulating zoomed images.
- Improved navigation and zoom experience across desktop devices.
- Centralized product pricing logic into a shared pricing utility.
- Unified price display across Product Grid, Product Card, Featured Products, and Product Detail.
- Improved configurable product pricing by displaying the lowest variant price before selection.
- Display a single price when all variants share the same price and a price range when variant prices differ.
- Removed duplicate storefront pricing calculations.
- Refactored Product Detail by extracting a reusable `ProductVariantPickerComponent`.
- Improved separation of responsibilities between Product Detail and variant selection UI.
- Preserved ProductDetailComponent as the source of truth for variant state while using Input/Output communication.
- Prepared the storefront architecture for future enhancements such as color swatches, multi-option variants, and improved accessibility.
- Enhanced the Product Variant Picker with improved selection indicators.
- Improved visual styling for out-of-stock variants while keeping them visible.
- Refined variant card layout for better readability and user experience.
- Continued polishing the reusable `ProductVariantPickerComponent` for production readiness.
- Replaced the custom quantity controls on the Product Detail page with the reusable `QuantitySelectorComponent`.
- Improved consistency of quantity selection across the storefront.
- Reduced duplicated UI implementation while preserving existing quantity validation and stock limit behavior.
- Replaced the Product Detail quantity controls with the reusable `QuantitySelectorComponent`.
- Added dynamic Add to Cart button labels for variant selection, stock availability, and loading states.
- Centralized Add to Cart UI state management to improve template readability and maintainability.
- Continued refining the Product Detail purchase experience while preserving existing business logic.
- Replaced the custom Product Detail quantity controls with the reusable `QuantitySelectorComponent`.
- Fixed quantity selector availability for both simple and variant products.
- Added dynamic Add to Cart button states based on variant selection, stock availability, and loading status.
- Improved disabled button styling to better match the storefront theme.
- Continued polishing the Product Detail purchase experience without changing business logic.

### Product Detail
- Removed obsolete gallery state after moving image management to `ProductMediaGalleryComponent`.
- Removed unused loading state and dead review submission code.
- Simplified variant selection logic by removing redundant image synchronization.
- Removed temporary debugging code, testing utilities, and unused imports.
- Improved overall maintainability through component cleanup and dead code removal.

### Internal

#### Storefront
- Introduced `GalleryImage` and `GalleryImageType` models
- Refactored `ProductMediaGalleryComponent` to build a unified media collection from product and variant images
- Added `activeGalleryImage` state to support gallery synchronization and future single-source-of-truth architecture
- Updated the gallery model to store image sources instead of pre-rendered image URLs
- Added reusable image resolver methods for thumbnail and preview rendering
- Added reusable thumbnail auto-centering helper for gallery navigation
- Unified desktop and mobile pan boundary calculations through a shared `clampPan()` helper.
- Simplified lightbox interaction logic by removing obsolete image sizing calculations introduced during development.

### Fixed
- Fixed image position not resetting after zooming out.
- Fixed transformed image overlapping lightbox controls.
- Fixed navigation button visibility conflict while in immersive mode.
- Fixed mobile pan and swipe gesture conflicts while interacting with zoomed images.
- Fixed pinch-to-zoom state transitions causing unstable dragging.
- Fixed unequal horizontal pan boundaries.
- Fixed flickering while dragging zoomed images.
- Fixed excessive dragging beyond image boundaries.
- Fixed viewport constraint calculations for zoomed image panning.
- Updated storefront stock availability checks to support variant-based inventory.
- Products with variants are now considered available when at least one variant has stock.
- Fixed Out of Stock button state for configurable products.

### Product Card
- Centered the product price and Add to Cart button for a more balanced layout.
- Improved product card alignment by pinning the pricing section to the bottom of the card.
- Enhanced layout consistency for products with single prices and price ranges.
- Improved overall visual hierarchy and browsing experience in the product grid.

### Notes
- This release establishes the foundation for future lightbox enhancements, including gallery navigation, keyboard shortcuts, image zoom, and mobile pinch-to-zoom support.
- This release establishes the foundation for advanced Product Image Lightbox interactions, including keyboard navigation, interactive zoom, desktop and mobile pan support, pinch-to-zoom gestures, and shared viewport-aware pan boundary calculations. Future milestones will focus on double-tap zoom, pinch focal-point zooming, smoother gesture transitions, and optional momentum scrolling.

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