import type { FullConfig } from '@playwright/test';
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Path where wp-now loads shared mu-plugins from.
 */
const WP_NOW_MU_PLUGINS_DIR = path.join( os.homedir(), '.wp-now', 'mu-plugins' );

/**
 * Filename used for the installed mu-plugin.
 */
const MU_PLUGIN_FILENAME = 'e2e-test-helpers.php';

async function installPlugin(
	requestUtils: RequestUtils,
	slug: string
): Promise< void > {
	try {
		await requestUtils.rest( {
			method: 'POST',
			path: '/wp/v2/plugins',
			data: { slug, status: 'active' },
		} );
	} catch ( error ) {
		// Plugin may already be installed — try activating it.
		try {
			await requestUtils.activatePlugin( slug );
		} catch {
			console.warn( `Could not install or activate plugin: ${ slug }` );
		}
	}
}

/**
 * Copy E2E test helper endpoints into wp-now's shared mu-plugins directory
 * so WordPress loads them without any coupling to the main plugin.
 */
function installMuPlugin(): void {
	const source = path.resolve( __dirname, MU_PLUGIN_FILENAME );
	const destination = path.join( WP_NOW_MU_PLUGINS_DIR, MU_PLUGIN_FILENAME );

	if ( ! fs.existsSync( WP_NOW_MU_PLUGINS_DIR ) ) {
		fs.mkdirSync( WP_NOW_MU_PLUGINS_DIR, { recursive: true } );
	}

	fs.copyFileSync( source, destination );
}

export default async function globalSetup( config: FullConfig ) {
	const { baseURL } =
		config.projects[ 0 ].use as { baseURL: string };
	const storageStatePath = 'artifacts/storage-states/admin.json';

	// Install the test-helper mu-plugin before any REST calls that depend on it.
	installMuPlugin();

	const requestUtils = await RequestUtils.setup( {
		baseURL,
		storageStatePath,
	} );

	// Install and activate required dependencies.
	await installPlugin( requestUtils, 'woocommerce' );
	await installPlugin( requestUtils, 'dokan-lite' );

	await requestUtils.activatePlugin( 'another-blocks-for-dokan' );
}
