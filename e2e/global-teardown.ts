import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const WP_NOW_MU_PLUGINS_DIR = path.join( os.homedir(), '.wp-now', 'mu-plugins' );
const MU_PLUGIN_FILENAME = 'e2e-test-helpers.php';

/**
 * Remove the E2E test helper mu-plugin so it doesn't linger
 * in the shared wp-now directory after tests finish.
 */
export default async function globalTeardown() {
	const target = path.join( WP_NOW_MU_PLUGINS_DIR, MU_PLUGIN_FILENAME );

	if ( fs.existsSync( target ) ) {
		fs.unlinkSync( target );
	}
}
