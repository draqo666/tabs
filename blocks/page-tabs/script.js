/**
 * This file is used to initialize the sliders both in the editor and on the front-end.
 * It uses the Slider class with different configurations for the editor and the view.
 *
 * So, in the editor:
 *  - The slider is initialized with the observer option set to true,
 *    so it updates the slider when the slides are added or removed.
 *  - It will initialize non-initialized sliders every time the breakpoint matches.
 *
 *  And on the front-end:
 *  - We won't use the observer option because we won't be adding or removing slides.
 *  - It will initialize the sliders only once because we won't be adding or removing sliders.
 */

import executeCallbackForContent from '@/js/helpers/execute-callback-for-content';
import Slider from '@/js/helpers/swiper';

const selector = '.swiper.wp-block-movant-page-tabs__wrapper';

function editorCallback() {
	new Slider( selector, 'edit' );
}

function viewCallback() {
	new Slider( selector, 'view' );
}
executeCallbackForContent( viewCallback, editorCallback );
