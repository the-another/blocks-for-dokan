<?php
/**
 * E2E test helpers – REST endpoints for creating/deleting Dokan vendors.
 *
 * Installed as a wp-now mu-plugin by the Playwright global setup.
 * Never loaded by the main plugin; not shipped in production releases.
 *
 * @package AnotherBlocksForDokan
 * @since 1.0.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'theabd-test/v1',
			'/create-vendor',
			array(
				'methods'             => 'POST',
				'callback'            => function ( WP_REST_Request $request ) {
					$index    = (int) $request->get_param( 'index' );
					$username = 'e2evendor' . $index . '_' . time() . wp_rand( 100, 999 );

					$store_name = $request->get_param( 'store_name' ) ?? 'Test Store ' . $index;
					$featured   = $request->get_param( 'featured' ) ?? false;
					$address    = $request->get_param( 'address' ) ?? array();

					$user_id = wp_insert_user(
						array(
							'user_login'   => $username,
							'user_email'   => $username . '@example.com',
							'user_pass'    => wp_generate_password(),
							'role'         => 'seller',
							'display_name' => $store_name,
						)
					);

					if ( is_wp_error( $user_id ) ) {
						return $user_id;
					}

					update_user_meta( $user_id, 'dokan_enable_selling', 'yes' );
					update_user_meta( $user_id, 'dokan_store_name', $store_name );

					if ( $featured ) {
						update_user_meta( $user_id, 'dokan_feature_seller', 'yes' );
					}

					// Dokan reads vendor data from dokan_profile_settings.
					// Always set it so to_array() returns store_name and address.
					$profile_settings = array(
						'store_name' => $store_name,
					);
					if ( ! empty( $address ) ) {
						$profile_settings['address'] = $address;
					}
					update_user_meta( $user_id, 'dokan_profile_settings', $profile_settings );

					return array(
						'id'       => $user_id,
						'username' => $username,
					);
				},
				'permission_callback' => function () {
					return current_user_can( 'create_users' );
				},
			)
		);

		register_rest_route(
			'theabd-test/v1',
			'/delete-vendor/(?P<id>[\d]+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => function ( WP_REST_Request $request ) {
					require_once ABSPATH . 'wp-admin/includes/user.php';
					return array( 'deleted' => wp_delete_user( (int) $request['id'], 1 ) );
				},
				'permission_callback' => function () {
					return current_user_can( 'delete_users' );
				},
			)
		);
	}
);
