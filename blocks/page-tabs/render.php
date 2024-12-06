<?php
/**
 * Render page tabs block.
 *
 * @package movant
 */

$current_tab = get_query_var( 'current-tab' );
$current_tab = is_string( $current_tab ) ? $current_tab : '';

$state = wp_interactivity_state( 'movantPagesTabs', array( 'current-tab' => $current_tab ) );

$selected_pages = $attributes['selectedPages'] ?? array();
if ( empty( $selected_pages ) || ! is_array( $selected_pages ) ) {
	echo wp_kses_post( '<p>' . esc_html__( 'No pages selected.', 'movant' ) . '</p>' );
	return;
}

$tab_pages = get_posts(
	array(
		'post_type'   => array( 'page', 'education' ),
		'post__in'    => $selected_pages,
		'orderby'     => 'post__in',
		'numberposts' => -1,
	)
);

if ( empty( $tab_pages ) ) {
	echo wp_kses_post( '<p>' . esc_html__( 'No valid pages found.', 'movant' ) . '</p>' );
	return;
}

$tab_pages = array_filter( $tab_pages, fn( $page ) => $page instanceof WP_Post );

$active_page = null;
foreach ( $tab_pages as $tab_page ) {
	if ( $tab_page->post_name === $current_tab ) {
		$active_page = $tab_page;
		break;
	}
}

if ( ! $active_page ) {
	$active_page = $tab_pages[0];
}

$content     = $active_page->post_content;
$active_slug = $active_page->post_name;
$class_name  = $attributes['className'] ?? '';
?>
<div class="wp-block-movant-page-tabs wp-block-block alignfull wp-block-block--no-inline-padding" data-wp-interactive="movantPagesTabs" data-wp-router-region="movant-tabs">
	<div class="wp-block-movant-page-tabs__wrapper swiper is-layout-constrained alignfull">
		<ul class="wp-block-movant-page-tabs__tabs swiper-wrapper">
			<?php foreach ( $tab_pages as $tab_page ) : ?>
				<li class="wp-block-movant-page-tabs__tab swiper-slide <?php echo esc_attr( $tab_page->post_name === $active_slug ? 'wp-block-movant-page-tabs__tab--active active-slide' : '' ); ?>">
					<button type="button"
						data-wp-bind--value="state.currentTab"
						data-wp-on--click="actions.updateTab"
						data-value="<?php echo esc_url( add_query_arg( 'current-tab', $tab_page->post_name, home_url( $_SERVER['REQUEST_URI'] ) ) ); ?>">
						<?php echo esc_html( $tab_page->post_title ); ?>
					</button>
				</li>
			<?php endforeach; ?>
		</ul>
		<div class="swiper-button-prev"></div>
		<div class="swiper-button-next"></div>
	</div>
	<div class="wp-block-movant-page-tabs__content-wrapper alignfull">
		<div class="wp-block-movant-page-tabs__content wp-block-movant-page-tabs__content--active">
			<div class="wp-block-movant-page-tabs__tab-content">
				<?php
				$filtered_content = apply_filters( 'the_content', $content );
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo is_string( $filtered_content ) ? $filtered_content : '';
				?>
			</div>
		</div>
	</div>
</div>
