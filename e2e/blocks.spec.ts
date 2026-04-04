/**
 * E2E tests for Another Blocks for Dokan.
 *
 * Tests block insertion and editor rendering for plugin blocks.
 * Frontend rendering requires Dokan + WooCommerce vendor data and is not tested here.
 *
 * Blocks are grouped by insertion context:
 * - Top-level blocks: can be inserted directly into a post.
 * - Nested blocks: require a parent/ancestor block (e.g., vendor-query-loop).
 */

import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Become Vendor CTA Block', () => {
	test( 'displays CTA content in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'CTA Block Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-become-vendor-cta',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-become-vendor-cta'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'Become a Vendor' );
	} );

	test( 'can publish page with block', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { title: 'CTA Publish Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-become-vendor-cta',
		} );
		await editor.publishPost();

		const errorNotice = page.locator(
			'.components-snackbar-list .is-error'
		);
		await expect( errorNotice ).toHaveCount( 0 );
	} );
} );

test.describe( 'Store Header Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Store Header Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-store-header',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-store-header'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'Vendor Store Header' );
	} );
} );

test.describe( 'Store Banner Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Store Banner Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-store-banner',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-store-banner'
		);

		await expect( block ).toBeVisible();
	} );
} );

test.describe( 'Vendor Query Loop Block', () => {
	test( 'can be inserted and is visible in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Query Loop Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-query-loop',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-query-loop'
		);

		await expect( block ).toBeVisible();
	} );

	test( 'can publish page with block', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { title: 'Query Loop Publish Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-query-loop',
		} );
		await editor.publishPost();

		const errorNotice = page.locator(
			'.components-snackbar-list .is-error'
		);
		await expect( errorNotice ).toHaveCount( 0 );
	} );
} );

test.describe( 'More From Seller Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'More From Seller Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-more-from-seller',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-more-from-seller'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'More from Seller' );
	} );
} );

test.describe( 'Product Vendor Info Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Product Vendor Info Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-product-vendor-info',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-product-vendor-info'
		);

		await expect( block ).toBeVisible();
	} );
} );

test.describe( 'Store Tabs Block', () => {
	test( 'displays tabs preview in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Store Tabs Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-store-tabs',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-store-tabs'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'Products' );
	} );
} );

test.describe( 'Store Sidebar Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Store Sidebar Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-store-sidebar',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-store-sidebar'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'Vendor Store Sidebar' );
	} );
} );

test.describe( 'Contact Form Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Contact Form Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-contact-form',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-contact-form'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'Contact Form' );
	} );
} );

test.describe( 'Store Terms & Conditions Block', () => {
	test( 'displays placeholder in editor', async ( {
		admin,
		editor,
	} ) => {
		await admin.createNewPost( { title: 'Terms Test' } );
		await editor.insertBlock( {
			name: 'the-another/blocks-for-dokan-vendor-store-terms-conditions',
		} );

		const block = editor.canvas.locator(
			'.wp-block-the-another-blocks-for-dokan-vendor-store-terms-conditions'
		);

		await expect( block ).toBeVisible();
		await expect( block ).toContainText( 'Terms & Conditions' );
	} );
} );
