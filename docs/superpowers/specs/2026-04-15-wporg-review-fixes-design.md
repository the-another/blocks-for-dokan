# WordPress.org Plugin Review Fixes — Design Spec

**Date**: 2026-04-15
**Plugin**: Another Blocks for Dokan v1.0.9
**Context**: Addressing all issues raised in the WordPress.org plugin review.

---

## Issue 1: Invalid Author/Plugin URIs

**Problem**: `Author URI` and `Plugin URI` use `theanother.org` which doesn't resolve. The correct domain is `the-another.org`.

**Fix**: Update the main plugin file header:

| Field      | Current                                              | New                                                     |
|------------|------------------------------------------------------|---------------------------------------------------------|
| Author URI | `https://theanother.org`                             | `https://the-another.org`                               |
| Plugin URI | `https://theanother.org/plugin/another-blocks-for-dokan/` | `https://the-another.org/plugin/another-blocks-for-dokan/` |

**Files**: `another-blocks-for-dokan.php` (lines 4, 8)

---

## Issue 2: Inline `<script>` — Use `wp_enqueue` Commands

**Problem**: `blocks/vendor-search/render.php:301` outputs a raw `<script>` tag for filter toggle/sort functionality.

**Fix**: Extract the JavaScript to a standalone file and enqueue it properly:

1. Create `blocks/vendor-search/view.js` containing the filter toggle logic.
2. Register the script handle `theabd-vendor-search-view` in `class-blocks.php` via `wp_register_script()` (same pattern as the existing `theabd-vendor-query-loop-view` registration at line 144).
3. In `render.php`, replace the inline `<script>` block with `wp_enqueue_script( 'theabd-vendor-search-view' )`.
4. The script is self-contained DOM manipulation with no dynamic PHP data, so no `wp_add_inline_script()` or `wp_localize_script()` is needed.

**Files**:
- `blocks/vendor-search/view.js` (new)
- `blocks/vendor-search/render.php` (remove lines 300-346)
- `includes/class-blocks.php` (add registration)

---

## Issue 3: Undocumented External Services (Mapbox & Google Maps)

**Problem**: `blocks/vendor-store-location/render.php` uses Mapbox static maps API and Google Maps Embed API. The `readme.txt` does not disclose these services, their data transmission, or link to terms/privacy policies.

**Fix**: Add an `== External services ==` section to `readme.txt` before `== Changelog ==`:

```
== External services ==

= Mapbox Static Maps =

The Vendor Store Location block can display a static map image using the Mapbox Static Images API. When a vendor has configured a Mapbox access token and store coordinates (latitude/longitude), the block loads a map image from Mapbox's servers.

* **Data sent**: Store latitude, longitude, zoom level, and the site's Mapbox access token.
* **When**: Each time the Vendor Store Location block renders on the frontend with Mapbox selected as the map provider.
* **Service provider**: Mapbox, Inc.
* [Mapbox Terms of Service](https://www.mapbox.com/tos/)
* [Mapbox Privacy Policy](https://www.mapbox.com/privacy/)

= Google Maps Embed =

The Vendor Store Location block can alternatively display an interactive embedded map using the Google Maps Embed API. When a vendor has configured a Google Maps API key and store address, the block loads a map iframe from Google's servers.

* **Data sent**: Store address, zoom level, and the site's Google Maps API key.
* **When**: Each time the Vendor Store Location block renders on the frontend with Google Maps selected as the map provider.
* **Service provider**: Google LLC.
* [Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms)
* [Google Privacy Policy](https://policies.google.com/privacy)
```

**Files**: `readme.txt`

---

## Issue 4: Hardcoded File/Directory Paths

**Problem**: Two locations use WordPress internal constants directly instead of recommended functions.

### 4a. `includes/templates/class-store-template.php:159`

```php
$canvas_path = ABSPATH . WPINC . '/template-canvas.php';
```

This is actually the standard WordPress approach for loading `template-canvas.php` — WordPress core itself constructs this path the same way. However, to satisfy the reviewer, wrap it with `wp_normalize_path()`:

```php
$canvas_path = wp_normalize_path( ABSPATH . WPINC . '/template-canvas.php' );
```

### 4b. `includes/class-install.php:76`

```php
$dokan_plugin_file = WP_PLUGIN_DIR . '/dokan-lite/dokan.php';
```

Replace with WordPress's `get_plugins()` API, which avoids hardcoding the path entirely:

```php
if ( ! function_exists( 'get_plugins' ) ) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
}
$all_plugins   = get_plugins();
$dokan_version = $all_plugins['dokan-lite/dokan.php']['Version'] ?? '';
```

Note: This code runs during plugin activation and admin contexts where `wp-admin/includes/plugin.php` is typically already loaded, making the `require_once` guard a no-op in practice. The `ABSPATH` usage in the guard is acceptable per WordPress conventions (it's not a plugin path).

**Files**:
- `includes/templates/class-store-template.php` (line 159)
- `includes/class-install.php` (line 76, plus refactor the version detection)

---

## Issue 5: Escaping Output

**Problem**: The reviewer flagged 10 specific instances, but the codebase has ~45 `phpcs:ignore WordPress.Security.EscapeOutput` comments across all block render files. All must be addressed.

### Comprehensive strategy

**Find every instance**: Search all `blocks/*/render.php` files for `phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped` and fix each one. The categories below cover every pattern in the codebase.

**A. `$wrapper_attributes` from `get_block_wrapper_attributes()`** (~20 instances across all blocks):

Present in virtually every block's `render.php`. Wrap with `wp_kses_post()`:

```php
echo wp_kses_post( $wrapper_attributes );
```

**Affected files**: `vendor-card`, `vendor-search`, `vendor-store-location`, `vendor-store-status`, `vendor-store-sidebar`, `vendor-store-terms-conditions`, `vendor-query-pagination`, `vendor-store-tabs`, `vendor-avatar`, `vendor-store-phone`, `vendor-store-name`, `vendor-store-header`, `vendor-store-hours`, `vendor-store-address`, `become-vendor-cta`, `vendor-contact-form`, `vendor-query-loop`, `product-vendor-info`, `more-from-seller` — all their `render.php` files.

**B. `$style_attr`, `$wrapper_style_attr`, `$img_style_attr`** (~5 instances):

Manually constructed style attribute strings. Wrap with `wp_kses_post()`:

```php
echo wp_kses_post( $style_attr );
```

**Affected files**: `vendor-card`, `vendor-avatar`, `product-vendor-info`.

**C. `$aria_attrs` and other manually constructed HTML attribute strings** (~1 instance):

```php
echo wp_kses_post( $aria_attrs );
```

**Affected files**: `vendor-store-tabs`.

**D. `WP_Block::render()` output** (~10 instances):

Block renders return HTML from WordPress's block rendering pipeline. Wrap with `wp_kses_post()`:

```php
echo wp_kses_post( $inner_block_instance->render() );
```

**Affected files**: `vendor-card`, `vendor-query-loop`, `product-vendor-info`.

**E. `$content` variable (block inner content)** (~3 instances):

```php
echo wp_kses_post( $content );
```

**Affected files**: `vendor-card` (x2), `product-vendor-info`.

**F. Plugin render helper functions** (~2 instances):

```php
echo wp_kses_post( theabd_vendor_query_loop_render_items( ... ) );
```

**Affected files**: `vendor-query-loop`.

**G. Third-party function output** (~1 instance):

```php
echo wp_kses_post( dokan_generate_ratings( $rating, $count ) );
```

**Affected files**: `vendor-rating`.

### Implementation approach

Rather than tracking individual line numbers (which shift as we edit), the implementer should:
1. Run `grep -rn 'phpcs:ignore WordPress.Security.EscapeOutput' blocks/*/render.php` to get the full list.
2. For each instance, wrap the echoed expression with `wp_kses_post()`.
3. Remove the `// phpcs:ignore` comment.
4. Run `composer lint` to verify no escaping warnings remain.

---

## Issue 6: Generic Prefixes

**Problem**: The reviewer flagged three prefix groups and the namespace starting with "the":
1. `dokan` prefix — 7 elements
2. `another_blocks_for` prefix — 7 elements (these are the `ANOTHER_BLOCKS_FOR_DOKAN_*` constants)
3. `the_another_plugin` prefix — 7 elements

**Decision**: We will **not** rename the `The_Another\Plugin\Blocks_Dokan` namespace. "The Another" is a proper brand name, not a generic "the" prefix. We'll note this in the review response.

### Identifiers to rename

**A. Functions using `another_blocks_for_` prefix → rename to `theabd_`** (3 functions):
- `functions/functions.php:22` — `another_blocks_for_dokan()` → `theabd_plugin()`
- `functions/functions.php:31` — `another_blocks_for_dokan_container()` → `theabd_container()`
- `functions/functions.php:40` — `another_blocks_for_dokan_hooks()` → `theabd_hooks()`
- Call sites are internal to `functions/functions.php` (they call each other). Search codebase for any external callers to update.

**B. Filter using `another_blocks_for_` prefix → rename to `theabd_`** (1 filter):
- `includes/templates/class-block-templates-controller.php:57` — `another_blocks_for_dokan_registered_templates` → `theabd_registered_templates`

**C. Script/style handles using `dokan_` prefix → rename to `theabd-`** (3 handles):
- `includes/class-blocks.php:183` — `dokan-blocks-frontend` → `theabd-blocks-frontend`
- `includes/class-blocks.php:195` — `dokan-blocks-editor` → `theabd-blocks-editor`
- `includes/class-blocks.php:223` — `dokan-blocks-editor` → `theabd-blocks-editor`
- Line 197 also references `dokan-blocks-frontend` as a dependency — update there too.

**D. Transient names using `dokan_` prefix → rename to `theabd_`** (2 instances):
- `blocks/vendor-query-loop/render.php:170` — `dokan_store_listing_random_orderby` → `theabd_store_listing_random_orderby`
- `blocks/vendor-query-loop/render.php:173` — same transient in `set_transient()`

**E. Local variable in main plugin file** (1 instance):
- `another-blocks-for-dokan.php:45` — `$another_blocks_for_dokan_autoload_file` → `$theabd_autoload_file`
- This is a local variable, not a global, but the reviewer may have counted it in the "another_blocks_for" tally.

### Already correct (no changes needed)
- All `theabd_render_*_block()` functions (21 instances)
- All `theabd_*` filters (6 unique filters)
- `theabd-vendor-query-loop-view` script handle
- `theabd--*` CSS classes
- `ANOTHER_BLOCKS_FOR_DOKAN_*` constants — these use a 22-character prefix (`ANOTHER_BLOCKS_FOR_DOKAN_`) that is unique and follows WordPress constant naming conventions. The reviewer likely counted them under the "another_blocks_for" group, but they are distinct enough to not conflict. We'll justify this in the review response.
- Dokan core hooks like `dokan_is_store_open` (external API, not our prefix)
- `$_wp_current_template_content` (WordPress core global, already has phpcs:ignore)

---

## Out of Scope

- No changes to the block registration names (`the-another/blocks-for-dokan-*`) — these are the published block names and changing them would break existing content.
- No changes to the text domain `theanother-blocks-for-dokan`.
- No architectural changes.

---

## Testing Strategy

1. Run `composer lint` after all changes to verify PHPCS compliance.
2. Run `composer test` to verify no regressions.
3. Manual test: activate plugin, verify blocks render correctly on frontend.
4. Verify the inline script replacement works (filter toggle, sort-by auto-submit).
5. Verify external service links in readme resolve correctly.
