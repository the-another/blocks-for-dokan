<?php
/**
 * Plugin Name: Another Blocks for Dokan
 * Plugin URI: https://theanother.org/plugin/another-blocks-for-dokan/
 * Description: FSE-compatible Gutenberg blocks for Dokan multi-vendor marketplace. Convert Dokan templates into dynamic blocks for Full Site Editing.
 * Version: 1.0.3
 * Author: The Another
 * Author URI: https://theanother.org
 * Requires at least: 6.0
 * Requires PHP: 8.3
 * Text Domain: another-blocks-for-dokan
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package AnotherBlocksDokan
 * @since 1.0.0
 */

// Exit if accessed directly.

use The_Another\Plugin\Blocks_Dokan\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'ANOTHER_BLOCKS_DOKAN_VERSION', '1.0.3' );
define( 'ANOTHER_BLOCKS_DOKAN_PLUGIN_FILE', __FILE__ );
define( 'ANOTHER_BLOCKS_DOKAN_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ANOTHER_BLOCKS_DOKAN_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ANOTHER_BLOCKS_DOKAN_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Minimum PHP version check.
if ( version_compare( PHP_VERSION, '8.3', '<' ) ) {
	add_action(
		'admin_notices',
		function () {
			?>
			<div class="notice notice-error">
				<p><?php echo esc_html( 'Dokan Blocks requires PHP 8.3 or higher. Please upgrade your PHP version.' ); ?></p>
			</div>
			<?php
		}
	);
	return;
}

// Minimum WordPress version check.
if ( version_compare( get_bloginfo( 'version' ), '6.0', '<' ) ) {
	add_action(
		'admin_notices',
		function () {
			?>
			<div class="notice notice-error">
				<p><?php echo esc_html( 'Dokan Blocks requires WordPress 6.0 or higher for FSE support. Please upgrade WordPress.' ); ?></p>
			</div>
			<?php
		}
	);
	return;
}

// Load Composer autoloader.
$another_blocks_autoload_file = ANOTHER_BLOCKS_DOKAN_PLUGIN_DIR . 'vendor/autoload.php';
require_once $another_blocks_autoload_file;

// Initialize plugin.
add_action(
	'init',
	function () {
		try {
			Blocks::get_instance()->init();
		} catch ( Exception $e ) {
			wp_die(
				esc_html( $e->getMessage() ),
				'Another Blocks for Dokan experienced an Error',
				array( 'response' => 500 )
			);
		}
	},
	10 // Priority 10 to register blocks early.
);
