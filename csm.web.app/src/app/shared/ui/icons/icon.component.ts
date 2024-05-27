/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    state,
    style,
    transition,
    trigger,
    useAnimation,
} from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import {
    DomSanitizer,
    SafeStyle
} from '@angular/platform-browser';
import {AnimationOptions} from 'ngx-lottie';

import {
    bulgeInSvgCircleAnimation,
    bulgeOutSvgCircleAnimation,
} from '../../animation/bulge/bulge.animation';
import {COLORS} from '../constants/colors.constant';

enum ICON_DIMENSION {
    xsmall = 12,
    small = 18,
    normal = 24,
    large = 48
}

@Component({
    selector: 'ss-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('bulgeBadge', [
            state('bulgeBadgeIn', style({r: '24px'})),
            state('bulgeBadgeOut', style({r: '0px'})),
            transition('bulgeBadgeOut => bulgeBadgeIn', [
                useAnimation(bulgeInSvgCircleAnimation),
            ], {
                params: {
                    rInit: '18px',
                    rMid: '30px',
                    rFinal: '24px',
                },
            }),
            transition('bulgeBadgeIn => bulgeBadgeOut', [
                useAnimation(bulgeOutSvgCircleAnimation),
            ], {
                params: {
                    rInit: '24px',
                    rMid: '28px',
                    rFinal: '24px',
                },
            }),
        ]),
    ],
})
export class IconComponent {

    /**
     * @description Input that describes svg icon name that can be found on resources folder
     */
    @Input()
    public set name(name: string) {
        this.icon = this._getIcon(name);
        this.animatedIcon = this._getAnimatedIcon(name);
    }

    /**
     * @description Input that specifies if the icon should be animated
     */
    @Input()
    public animated = false;

    /**
     * @description Input that manages icon badge visibility
     */
    @Input()
    public badge = false;

    /**
     * @description Input that sets badge fill color
     */
    @Input()
    public badgeFillColor: string = COLORS.red;

    /**
     * @description Input that sets badge stroke color
     */
    @Input()
    public badgeStrokeColor: string = COLORS.white;

    /**
     * @description Input that defines svg icon color
     */
    @Input()
    public color: string;

    /**
     * @description Input to rotate svg icon
     * @type {number}
     */
    @Input()
    public set rotate(value: number) {
        this.iconStyles = this._getIconStyles(value);
    }

    /**
     * @description Input to set svg icon dimension
     * @param dimension
     */
    @Input()
    public set dimension(dimension: IconDimensionType) {
        const dim = typeof dimension === 'number' ? dimension : ICON_DIMENSION[dimension];
        this.dimensionInPx = this._getDimensionInPx(dim);
    }

    public dimensionInPx: string = this._getDimensionInPx(ICON_DIMENSION.normal);

    public animatedIcon: AnimationOptions;

    public icon: string = this._getIcon('');

    public iconStyles: SafeStyle = this._getIconStyles(0);

    constructor(private _domSanitizer: DomSanitizer) {
    }

    /**
     * @description Retrieve json animation path
     * @returns {string}
     */
    private _getAnimatedIcon(name: string): AnimationOptions {
        return {
            path: `assets/animations/${name}.json`,
        };
    }

    /**
     * @description Retrieve svg icon path
     * @returns {string}
     */
    private _getIcon(name: string): string {
        return `/assets/icons/${name}.svg#${name}`;
    }

    private _getIconStyles(rotate: number): SafeStyle {
        return this._domSanitizer.bypassSecurityTrustStyle(`transform: rotate(${rotate}deg); transform-origin: center center;`);
    }

    private _getDimensionInPx(dimension: number): string {
        return `${dimension}px`;
    }
}

export type IconDimensionType = 'xsmall' | 'small' | 'normal' | 'large' | number;

export interface IconModel {
    name: string;
    color?: string;
    rotate?: number;
    dimension?: IconDimensionType;
}
