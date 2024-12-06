<?php
/**
 * Add page tabs query var for safe usage and register wp rest api endpoint for loading block styles.
 *
 * @package movant
 */

/**
 * Handle API rest request to load block styles.
 *
 *  @param WP_REST_Request $request The request object.
 */
function handle_load_styles_request( WP_REST_Request $request ): WP_REST_Response {
	$style_ids = $request->get_param( 'styleIds' );

	if ( ! is_array( $style_ids ) ) {
		return new WP_REST_Response( 'Invalid style IDs format', 400 );
	}

	if ( empty( $style_ids ) ) {
		return new WP_REST_Response( 'No style IDs provided', 400 );
	}

	$styles = get_styles_by_ids( $style_ids );

	if ( empty( $styles ) ) {
		return new WP_REST_Response( 'No styles found for the provided IDs', 404 );
	}

	return new WP_REST_Response( $styles, 200 );
}

/**
 * Get block styles by their IDs.
 *
 * @param array<int> $style_ids The style IDs.
 * @return array<int, mixed> The block styles.
 */
function get_styles_by_ids( $style_ids ): array {
	$block_names = collect( $style_ids )
		->map( fn( $id ) => preg_replace( '/-/', '/', (string) $id, 1 ) )
		->toArray();

	$block_registry = \WP_Block_Type_Registry::get_instance();
	$blocks         = collect( $block_registry->get_all_registered() );

	$filtered_blocks = $blocks->filter( fn( $block, $block_name ) => in_array( $block_name, $block_names, true ) );

	$styles = $filtered_blocks
		->flatMap(
			fn( $block ) => collect( $block->style_handles )
				->filter( fn( $handle ) => isset( wp_styles()->registered[ $handle ] ) )
				->map(
					function ( $handle ) {
						$style_url = wp_styles()->registered[ $handle ]->src ?? '';
						if ( empty( $style_url ) ) {
							return null;
						}
						return sprintf(
							// phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedStylesheet
							'<link id="%s-css" rel="stylesheet" href="%s" type="text/css">',
							esc_attr( $handle ),
							esc_url( $style_url )
						);
					}
				)
				->filter( fn( $item ) => is_string( $item ) )
		)
		->values()
		->toArray();
	return $styles;
}

/**
 * Add page tabs query var for safe usage.
 *
 * @param array<string> $vars The array of allowed query variable names.
 *
 * @return string[]
 */
function movant_add_page_tabs_query_var( array $vars ): array {
	$vars[] = 'current-tab';
	return $vars;
}
add_action( 'query_vars', 'movant_add_page_tabs_query_var', 10, 1 );

/**
 * Register wp rest api endpoint for loading block styles.
 */
function register_style_api_endpoint(): void {
	register_rest_route(
		'movant/v1',
		'/load-styles',
		array(
			'methods'             => 'POST',
			'callback'            => 'handle_load_styles_request',
			'permission_callback' => '__return_true',
		)
	);
}

add_action( 'rest_api_init', 'register_style_api_endpoint' );

/**
 * Add data-style-id attribute to blocks
 */
add_filter(
	'render_block',
	function ( $block_content, $block ) {

		if ( str_starts_with( $block['blockName'] ?? '', 'movant/' ) ) {
			$style_id = str_replace( array( '/', '_' ), '-', $block['blockName'] );

			if ( 'movant-page-tabs' === $style_id ) {
				return $block_content;
			}

			if ( preg_match( '/<\w+/', $block_content, $matches ) ) {
				$tag           = $matches[0];
				$replacement   = $tag . ' data-style-id="' . esc_attr( $style_id ) . '"';
				$block_content = str_replace( $tag, $replacement, $block_content );
			}
		}

		return $block_content;
	},
	10,
	2
);
