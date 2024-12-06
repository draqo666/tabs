import apiFetch from '@wordpress/api-fetch';

/**
 * Helper function to fetch posts by type
 * @param {string} type
 * @param {string} queryParams
 * @return {Promise<Object[]>} A promise resolving to an array of post objects.
 */
export const fetchPostsByType = ( type, queryParams ) =>
	apiFetch( { path: `/wp/v2/${ type }?${ queryParams }` } );

/**
 * Helper function to map post to option
 *
 * @param    {Object} post
 * @param    {string} type
 * @return {Object} An object representing the option.
 * @property {string} label - The label for the option, derived from the post's title or ID.
 * @property {number} value - The ID of the post.
 * @property {string} type  - The type of the post.
 */
export const mapPostToOption = ( post, type ) => ( {
	label: post.title.rendered || post.id,
	value: post.id,
	type,
} );
