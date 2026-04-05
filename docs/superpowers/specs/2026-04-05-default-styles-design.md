# Unified Form Element Default Styles

## Problem

Form elements (inputs, buttons, selects) are styled independently in each block with inconsistent values:

- **vendor-search**: `#0073aa` blue, `6px` radius, `0.75rem 1rem` padding, `3px` focus ring
- **vendor-contact-form**: `#f05025` orange, `4px` radius, `8px 12px` padding, `1px` focus ring
- **vendor-card**: `#0073aa` blue hardcoded on footer button
- **become-vendor-cta**: uses `theabd--btn-primary` (undefined in CSS)

This creates visual inconsistency and fights theme styles.

## Solution

Two-layer approach:

1. **Base layer**: Add WordPress core element classes (`wp-element-button`) to buttons so themes handle colors, typography, and border-radius natively.
2. **Custom layer**: A shared SCSS partial (`blocks/_shared-forms.scss`) that adds what themes don't: consistent spacing, transitions, focus rings, size variants, and disabled states. No hardcoded colors. Uses CSS custom properties for overridability.

## Architecture

### New file: `blocks/_shared-forms.scss`

Imported by each block's `style.scss` that contains form elements. WordPress `@wordpress/scripts` supports SCSS imports from `block.json`-registered blocks, so partials in `blocks/` are accessible.

#### CSS Custom Properties

```scss
:root {
  --theabd-input-padding: 0.625rem 0.75rem;
  --theabd-input-radius: 6px;
  --theabd-focus-ring-width: 3px;
  --theabd-focus-ring-color: currentColor;
  --theabd-focus-ring-opacity: 0.15;
  --theabd-transition-duration: 0.2s;
  --theabd-btn-radius: 6px;
}
```

#### `.theabd--form-control` (inputs, selects, textareas)

- `padding: var(--theabd-input-padding)`
- `border: 1px solid currentColor` with low opacity (let theme handle exact color)
- `border-radius: var(--theabd-input-radius)`
- `transition: border-color, box-shadow` with `var(--theabd-transition-duration)`
- Focus: `outline: none; box-shadow: 0 0 0 var(--theabd-focus-ring-width) color-mix(in srgb, var(--theabd-focus-ring-color) calc(var(--theabd-focus-ring-opacity) * 100%), transparent)`
- No colors, no font-size (theme handles these)

#### `.theabd--btn` (layered on `wp-element-button`)

- `display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem`
- `border: none; border-radius: var(--theabd-btn-radius)`
- `cursor: pointer; transition: all var(--theabd-transition-duration) ease`
- `text-decoration: none; white-space: nowrap`
- No colors (inherited from `wp-element-button` / theme)
- Size variants:
  - `.theabd--btn-small`: `padding: 0.375rem 1rem; font-size: 0.8125rem`
  - `.theabd--btn-medium`: `padding: 0.625rem 1.25rem; font-size: 0.875rem`
  - `.theabd--btn-large`: `padding: 0.75rem 1.75rem; font-size: 1rem`
- `&:disabled { opacity: 0.6; cursor: not-allowed; }`
- Hover: subtle `transform: translateY(-1px)` and light `box-shadow` (no color change)

### Render.php Changes

#### vendor-search (`render.php`)

**Buttons**: Add `wp-element-button` class alongside `theabd--btn`:
```php
// Before:
$button_classes = array( 'theabd--btn', 'theabd--btn-theme' );

// After:
$button_classes = array( 'wp-element-button', 'theabd--btn' );
```

Remove `theabd--btn-theme` — colors now come from the theme via `wp-element-button`.

Remove inline `$button_style` for padding/font-size — size variants handled by CSS classes:
```php
// Before: match expression with inline padding styles
// After:
if ( ! empty( $button_size ) ) {
    $button_classes[] = 'theabd--btn-' . $button_size;
}
```

Keep `buttonBackgroundColor`/`buttonTextColor` attribute overrides as inline styles (user-chosen colors take priority).

**Inputs**: Add `theabd--form-control` class:
```html
<!-- Before -->
<input type="search" class="theabd--vendor-search-input" ... />

<!-- After -->
<input type="search" class="theabd--form-control theabd--vendor-search-input" ... />
```

**Selects**: Add `theabd--form-control` class:
```html
<!-- Before -->
<select class="theabd--store-filter-select">

<!-- After -->
<select class="theabd--form-control theabd--store-filter-select">
```

Also add to the sort-by select which currently has no class.

#### vendor-contact-form (`render.php`)

This block uses `dokan_get_template_part()` — we can't modify Dokan's template HTML. Instead, the `style.scss` will target form elements within `.theabd--vendor-contact-form` using element selectors, applying the same shared styles. No render.php changes needed.

#### become-vendor-cta (`render.php`)

```php
// Before:
<a href="..." class="theabd--btn theabd--btn-primary">

// After:
<a href="..." class="wp-element-button theabd--btn">
```

Remove `theabd--btn-primary` (undefined class, colors now from theme).

#### vendor-card (`render.php` + `style.scss`)

The footer button (`.theabd--btn-theme`) is an `<a>` tag. No render.php change needed since it's structured differently (circular icon button). The `style.scss` will be updated to remove hardcoded `#0073aa`/`#005a87` and use `currentColor` or inherit from theme.

### SCSS Changes Per Block

#### `blocks/vendor-search/style.scss`

- Add `@import '../shared-forms';` at top
- Remove the entire `.theabd--btn` block (lines 248-307) — now in shared partial
- Remove hardcoded input styles from `.theabd--vendor-search-input` (lines 173-191) — now uses `.theabd--form-control`
- Remove hardcoded select styles (lines 97-117, 222-243) — now uses `.theabd--form-control`
- Keep layout/positioning rules (flex, gap, grid structure)
- Keep the `::placeholder` color rule

#### `blocks/vendor-contact-form/style.scss`

- Add `@import '../shared-forms';` at top
- Replace hardcoded input/textarea/button styles (lines 22-83) with shared classes:
  ```scss
  .theabd--form-control,
  input[type="text"],
  input[type="email"],
  textarea {
    @extend .theabd--form-control; // or just rely on the shared element selectors
  }
  ```
- Remove `#f05025` and `#d9451d` color references entirely
- Keep `.theabd--form-group` margin, textarea min-height, privacy/alert styles

#### `blocks/vendor-card/style.scss`

- Remove hardcoded `background: #0073aa` and `background: #005a87` from `.theabd--btn-theme` in store footer (lines 219-241)
- Use `background: currentColor` filter approach or just inherit

### What Gets Removed

| Item | Location | Reason |
|------|----------|--------|
| `#0073aa`, `#005a87` | vendor-search `style.scss` | Theme handles button colors |
| `#f05025`, `#d9451d` | vendor-contact-form `style.scss` | Theme handles button/focus colors |
| `#0073aa`, `#005a87` | vendor-card `style.scss` | Theme handles button colors |
| `.theabd--btn-theme` class | All render.php + SCSS | Replaced by `wp-element-button` |
| `.theabd--btn-primary` class | become-vendor-cta `render.php` | Replaced by `wp-element-button` |
| Inline button padding/font-size | vendor-search `render.php` | Handled by size variant CSS classes |
| Duplicate input/select/button style blocks | Per-block SCSS files | Consolidated into `_shared-forms.scss` |

### What Stays Block-Specific

- Layout rules (flex, grid, positioning)
- Vendor-search filter panel structure (caret arrow, box-shadow, collapse behavior)
- Vendor-card hover transform and card structure
- Contact form `.theabd--form-group` margin, textarea min-height, alert styles
- Editor-specific styles (unchanged)

## `color-mix()` Browser Support

`color-mix(in srgb, ...)` has 94%+ global support (Chrome 111+, Firefox 113+, Safari 16.2+). For the focus ring, we can use a simpler fallback:

```scss
// Fallback for older browsers
box-shadow: 0 0 0 var(--theabd-focus-ring-width) rgba(0, 0, 0, var(--theabd-focus-ring-opacity));
// Modern browsers
@supports (color: color-mix(in srgb, red, blue)) {
  box-shadow: 0 0 0 var(--theabd-focus-ring-width) color-mix(in srgb, var(--theabd-focus-ring-color) calc(var(--theabd-focus-ring-opacity) * 100%), transparent);
}
```

Given WP 6.0+ requirement and typical WordPress user browser profiles, the fallback may be unnecessary but adds safety at minimal cost.

## Testing

- Visual check: buttons, inputs, selects look consistent across vendor-search, contact-form, become-vendor-cta
- Theme compatibility: test with Twenty Twenty-Four (block theme) — elements should inherit theme colors
- Custom properties: verify overriding `--theabd-btn-radius` in theme CSS changes button radius
- Button color attributes: verify `buttonBackgroundColor`/`buttonTextColor` in vendor-search still work as inline overrides
- Focus states: tab through all form elements, verify consistent focus ring
- Size variants: test `small`, `medium`, `large` button sizes in vendor-search block settings
- RTL: verify styles work in RTL mode (no directional issues expected since we use logical properties where possible)
