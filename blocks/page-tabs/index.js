import { registerBlockType } from '@wordpress/blocks';
import { ReactComponent as Icon } from '@/images/icons/logo.svg';

import './style.scss';

import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	apiVersion: 3,
	icon: Icon,

	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
} );
