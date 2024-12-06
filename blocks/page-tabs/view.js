import { store, getElement } from '@wordpress/interactivity';

const { state } = store( 'movantPagesTabs', {
	actions: {
		*updateTab() {
			const { ref } = getElement();
			const { value } = ref;

			state.movantCurrentTab = value;
			const newUrl = ref.dataset.value;

			const url = new URL( newUrl );

			const { actions } = yield import( '@wordpress/interactivity-router' );

			yield actions.navigate( `${ url }` );

			setActiveTabColor();
			findMissingStyles();
		},
	},
} );

const loadBlockStyles = async ( styleIds, lastItemSelector ) => {
	try {
		const response = await fetch( '/wp-json/movant/v1/load-styles', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( { styleIds } ),
		} );

		if ( ! response.ok ) {
			throw new Error( 'Failed to fetch styles' );
		}

		const styles = await response.json();

		let lastItem = document.querySelector(
			`style[id^="${ lastItemSelector }"], link[id^="${ lastItemSelector }"]`
		);
		if ( ! lastItem ) {
			lastItem = document.querySelector( `style[id^="movant"], link[id^="movant"]` );
		}

		styles.forEach( ( styleTag ) => {
			const template = document.createElement( 'template' );
			template.innerHTML = styleTag.trim();
			const styleElement = template.content.firstChild;

			const existingStyle = document.head.querySelector( `#${ styleElement.id }` );
			if ( ! existingStyle ) {
				const parent = lastItem.parentNode;
				if ( lastItem.nextSibling ) {
					parent.insertBefore( styleElement, lastItem.nextSibling );
				} else {
					parent.appendChild( styleElement );
				}
			}
		} );
	} catch ( error ) {
		/* eslint-disable no-console */
		console.error( 'Error loading styles:', error );
	}
};

const findMissingStyles = () => {
	const missingStyles = [];
	let lastFound = '';

	document
		.querySelectorAll( '.wp-block-movant-page-tabs__tab-content [data-style-id]' )
		.forEach( ( element ) => {
			const styleId = element.getAttribute( 'data-style-id' );

			if ( ! styleId ) {
				return;
			}

			const styleElementId = `style[id^="${ styleId }"], link[id^="${ styleId }"]`;

			if ( ! document.querySelector( styleElementId ) ) {
				missingStyles.push( element.getAttribute( 'data-style-id' ) );
			} else {
				lastFound = styleId;
			}
		} );

	loadBlockStyles( [ ...new Set( missingStyles ) ], lastFound );
};

const setActiveTabColor = () => {
	const activeTab = document.querySelector( '.wp-block-movant-page-tabs__tab--active' );
	const contentWrapper = document.querySelector( '.wp-block-movant-page-tabs__tab-content' );

	if ( activeTab && contentWrapper ) {
		const section = contentWrapper.querySelector( 'section' );
		if ( section ) {
			let color = window.getComputedStyle( section ).backgroundColor;
			if ( color === 'rgba(0, 0, 0, 0)' ) {
				color = 'rgba(255, 255, 255, 1)';
			}
			if ( section.classList.contains( 'is-style-inverted' ) ) {
				activeTab.classList.add( 'is-style-inverted' );
			}
			activeTab.style.setProperty( '--wp-preset-active-button-color', color );
		}
	}
};

setActiveTabColor();
