<?php
/**
 * Global helper functions.
 *
 * @package AnotherBlocksForDokan
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use The_Another\Plugin\Blocks_For_Dokan\Blocks;
use The_Another\Plugin\Blocks_For_Dokan\Container\Container;
use The_Another\Plugin\Blocks_For_Dokan\Container\Hook_Manager;

/**
 * Get the Another Blocks for Dokan instance.
 *
 * @return Blocks The Blocks instance.
 */
function tanbfd_plugin(): Blocks {
	return Blocks::get_instance();
}

/**
 * Get the dependency injection container.
 *
 * @return Container The container instance.
 */
function tanbfd_container(): Container {
	return tanbfd_plugin()->get_container();
}

/**
 * Get the hook manager.
 *
 * @return Hook_Manager The hook manager instance.
 */
function tanbfd_hooks(): Hook_Manager {
	return tanbfd_plugin()->get_hook_manager();
}
