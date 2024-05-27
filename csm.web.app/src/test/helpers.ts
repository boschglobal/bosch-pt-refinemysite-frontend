/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

export type SpecialKey = 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey';

const resizeEvent: Event = new Event('resize');
const scrollEvent: Event = new Event('scroll');

export const updateWindowInnerWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        get: () => width,
        configurable: true,
    });
    window.dispatchEvent(resizeEvent);
};

export const updateWindowInnerHeight = (height: number) => {
    Object.defineProperty(window, 'innerHeight', {
        get: () => height,
        configurable: true,
    });
    window.dispatchEvent(resizeEvent);
};

export const updateWindowScrollY = (scrollY: number) => {
    Object.defineProperty(window, 'scrollY', {
        get: () => scrollY,
        configurable: true,
    });
    window.dispatchEvent(scrollEvent);
};

export const setEventKey = (event: KeyboardEvent, key: string) => {
    Object.defineProperty(event, 'key', {
        get: () => key,
        configurable: true,
    });
};

export const setEventSpecialKey = (event: KeyboardEvent, key: SpecialKey, isPressed: boolean) => {
    Object.defineProperty(event, key, {
        get: () => isPressed,
        configurable: true,
    });
};

export const setUserAgent = (userAgent: string) => {
    Object.defineProperty(window.navigator, 'userAgent', {
        get: () => userAgent,
        configurable: true,
    });
};

export const documentElementStyle = (() => {
    const init = document.documentElement.style;
    return {
        unset: () => {
            Object.defineProperty(document.documentElement, 'style', {
                get: () => ({}),
                configurable: true,
            });
        },
        reset: () => {
            Object.defineProperty(document.documentElement, 'style', {
                get: () => init,
                configurable: true,
            });
        },
    };
})();

export const isElementPropertyColor = (el, prop, color) => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect( 0, 0, 1, 1 );
    ctx.fillStyle = getComputedStyle(el, null).getPropertyValue(prop);
    ctx.fillRect( 1, 0, 1, 1 );
    const a = JSON.stringify(Array.from(ctx.getImageData(0, 0, 1, 1).data));
    const b = JSON.stringify(Array.from(ctx.getImageData(1, 0, 1, 1).data));
    return a === b;
};

export const isValidUUID = (uuid: string): boolean => {
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    return regexExp.test(uuid);
};

export const getExpectedAlertAction = (alert: Action): Action => {
    (alert as any).payload.id = jasmine.any(String);
    return alert;
};
