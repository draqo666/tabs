import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import { useEffect, useState } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import AsyncSelect from 'react-select/async';
import apiFetch from '@wordpress/api-fetch';
import './editor.scss';
import { __ } from '@wordpress/i18n';
import { fetchPostsByType, mapPostToOption } from './utils/helpers.js';

export default function Edit( { attributes, setAttributes, context: { postId } } ) {
	const { selectedPages = [] } = attributes;

	const [ selectedOptions, setSelectedOptions ] = useState( [] );

	const cache = new Map();

	const fetchPosts = ( inputValue ) => {
		const queryParams = `search=${ inputValue }&per_page=100&orderby=title&order=asc`;

		if ( cache.has( inputValue ) ) {
			return Promise.resolve( cache.get( inputValue ) );
		}

		return Promise.all( [
			fetchPostsByType( 'pages', queryParams ),
			fetchPostsByType( 'education', queryParams ),
		] ).then( ( [ pages, education ] ) => {
			const groupedResults = [
				{
					label: __( 'Pages', 'movant' ),
					options: pages.map( ( page ) => mapPostToOption( page, 'page' ) ),
				},
				{
					label: __( 'Education', 'movant' ),
					options: education.map( ( edu ) => mapPostToOption( edu, 'education' ) ),
				},
			];

			cache.set( inputValue, groupedResults );

			return groupedResults.map( ( group ) => ( {
				...group,
				options: group.options.filter( ( post ) => post.value !== postId ),
			} ) );
		} );
	};

	useEffect( () => {
		if ( selectedPages.length > 0 ) {
			const pageQuery = `/wp/v2/pages?include=${ selectedPages.join( ',' ) }&per_page=100`;
			const educationQuery = `/wp/v2/education?include=${ selectedPages.join(
				','
			) }&per_page=100`;

			Promise.all( [
				apiFetch( { path: pageQuery } ),
				apiFetch( { path: educationQuery } ),
			] ).then( ( [ pages, education ] ) => {
				const combinedPosts = [
					...pages.map( ( post ) => mapPostToOption( post, 'page' ) ),
					...education.map( ( post ) => mapPostToOption( post, 'education' ) ),
				];

				const sortedOptions = selectedPages.map( ( id ) =>
					combinedPosts.find( ( post ) => post.value === id )
				);

				setSelectedOptions( sortedOptions.filter( Boolean ) );
			} );
		} else {
			setSelectedOptions( [] );
		}
	}, [ selectedPages ] );

	const handleChange = ( selected ) => {
		const updatedPages = selected.map( ( option ) => option.value );
		setAttributes( { selectedPages: updatedPages } );
		setSelectedOptions( selected );
	};

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Page Tabs Settings', 'movant' ) } initialOpen={ true }>
					<AsyncSelect
						isMulti
						cacheOptions
						defaultOptions
						hideSelectedOptions={ false }
						loadOptions={ fetchPosts }
						value={ selectedOptions }
						onChange={ handleChange }
						placeholder={ __( 'Select posts…', 'movant' ) }
						formatGroupLabel={ ( group ) => (
							<div style={ { fontWeight: 'bold' } }>{ group.label }</div>
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<ServerSideRender
				block="movant/page-tabs"
				attributes={ { selectedPages, post_id: postId } }
			/>
		</div>
	);
}
