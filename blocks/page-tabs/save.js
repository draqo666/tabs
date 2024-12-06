import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { selectedPages = [] } = attributes;

	return (
		<div { ...useBlockProps.save() }>
			<ul>
				{ selectedPages.map( ( id ) => (
					<li key={ id }>Page ID: { id }</li>
				) ) }
			</ul>
		</div>
	);
}
