/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {COLORS} from '../../../ui/constants/colors.constant';

export class StickyElement {
    /**
     * @description Property that has is sticky status
     * @type {boolean}
     */
    public isSticky = false;

    /**
     * @description Property with elements styles
     * @type {Object}
     */
    public styles: {
        [key: string]: string | number;
    } = {};

    constructor(public id: string,
                public el: HTMLElement,
                public mirror: HTMLElement,
                public top: number,
                public bottom: number,
                public stickyIndex = 100,
                public stickyUntil = 0,
                public stickyBorderBottom = false) {
        this._setStyles();
        this._mirrorStyles();
        this._disableSticky();
    }

    /**
     * @description Retrieves element distance to top;
     * @param {HTMLElement} el
     * @returns {number}
     */
    public static elementDistanceToTop(el: HTMLElement): number {
        return el.getBoundingClientRect().top;
    }

    /**
     * @description Tries to make element stick or unstick based on it's distance to the top
     */
    public updateSticky(): void {
        this._mirrorStyles();

        if (this.isSticky) {
            this._enableSticky();
            if (this._shouldDisableSticky()) {
                this._disableSticky();
            }
        } else if (this._shouldEnableSticky()) {
            this._enableSticky();
        }
    }

    private _setStyles(): void {
        const {width} = this.el.getBoundingClientRect();
        this.styles.position = Object.assign(window.getComputedStyle(this.el)).position;
        this.styles.width = width;
    }

    private _mirrorStyles(): void {
        this.el.style.width = `${this.el.parentElement.getBoundingClientRect().width}px`;

        const {width, height} = this.el.getBoundingClientRect();
        this.mirror.style.width = `${width}px`;
        this.mirror.style.height = `${height}px`;
    }

    private _enableSticky(): void {
        const styles = {
            position: 'fixed',
            width: `${this.el.parentElement.getBoundingClientRect().width}px`,
            zIndex: this.stickyIndex,
            top: `${this._getTop()}px`,
            borderBottom: this.stickyBorderBottom ? `1px solid ${COLORS.light_grey_50}` : this.el.style.borderBottom,
        };

        Object.assign(this.el.style, styles);
        Object.assign(this.mirror.style, {
            display: 'block',
        });
        this.isSticky = true;
    }

    private _disableSticky(): void {
        Object.assign(this.el.style, {
            position: this.styles.position,
            top: 'auto',
            borderBottom: this.el.style.borderBottom,
        });

        Object.assign(this.mirror.style, {
            display: 'none',
        });
        this.isSticky = false;
    }

    private _shouldEnableSticky(): boolean {
        return StickyElement.elementDistanceToTop(this.el) < this._getTop() && this.stickyUntil <= window.innerWidth;
    }

    private _shouldDisableSticky(): boolean {
        return StickyElement.elementDistanceToTop(this.mirror) >= this._getTop() || this.stickyUntil > window.innerWidth;
    }

    private _getTop(): number {
        return typeof this.bottom !== 'undefined' ?
            Math.min(window.innerHeight - (this.bottom + this.el.getBoundingClientRect().height), this.top) : this.top;
    }
}
