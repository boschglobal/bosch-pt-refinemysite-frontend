/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    animate,
    animation,
    keyframes,
    style
} from '@angular/animations';

const BULGE_ANIMATION_TIMING_NORMAL_MS = '250ms';
const BULGE_ANIMATION_TIMING_FAST_MS = '100ms';
const BULGE_ANIMATION_DELAY_DEFAULT_MS = '0ms';
const BULGE_ANIMATION_EASING = 'ease-in-out';
const BULGE_ANIMATION_ANIMATE_TIMINGS = '{{ timing }} {{ delay }} {{ easing }}';

export const bulgeInAnimation = animation([
    animate(BULGE_ANIMATION_ANIMATE_TIMINGS, keyframes([
        style({transform: 'scale(1)', opacity: 0.5, offset: 0}),
        style({transform: 'scale(1.15)', opacity: 0.8, offset: 0.1}),
        style({transform: 'scale(1)', opacity: 1, offset: 1}),
    ])),
], {
    params: {
        timing: BULGE_ANIMATION_TIMING_FAST_MS,
        delay: BULGE_ANIMATION_DELAY_DEFAULT_MS,
        easing: BULGE_ANIMATION_EASING,
    },
});

export const bulgeOutAnimation = animation([
    animate(BULGE_ANIMATION_ANIMATE_TIMINGS, keyframes([
        style({transform: 'scale(1)', opacity: 1, offset: 0}),
        style({transform: 'scale(1.1)', opacity: 0.8, offset: 0.1}),
        style({transform: 'scale(0.5)', opacity: 0, offset: 1}),
    ])),
], {
    params: {
        timing: BULGE_ANIMATION_TIMING_NORMAL_MS,
        delay: BULGE_ANIMATION_DELAY_DEFAULT_MS,
        easing: BULGE_ANIMATION_EASING,
    },
});

export const bulgeInSvgCircleAnimation = animation([
    animate(BULGE_ANIMATION_ANIMATE_TIMINGS, keyframes([
        style({r: '{{rInit}}', opacity: 0, offset: 0}),
        style({r: '{{rMid}}', opacity: 0.5, offset: 0.2}),
        style({r: '{{rFinal}}', opacity: 1, offset: 1}),
    ])),
], {
    params: {
        timing: BULGE_ANIMATION_TIMING_NORMAL_MS,
        delay: BULGE_ANIMATION_DELAY_DEFAULT_MS,
        easing: BULGE_ANIMATION_EASING,
    },
});

export const bulgeOutSvgCircleAnimation = animation([
    animate(BULGE_ANIMATION_ANIMATE_TIMINGS, keyframes([
        style({r: '{{rInit}}', opacity: 1, offset: 0}),
        style({r: '{{rMid}}', opacity: 0.8, offset: 0.3}),
        style({r: '{{rFinal}}', opacity: 0, offset: 1}),
    ])),
], {
    params: {
        timing: BULGE_ANIMATION_TIMING_NORMAL_MS,
        delay: BULGE_ANIMATION_DELAY_DEFAULT_MS,
        easing: BULGE_ANIMATION_EASING,
    },
});
