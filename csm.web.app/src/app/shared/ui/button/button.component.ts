/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input
} from '@angular/core';

export type ButtonStyle =
    'primary' |
    'primary-light-blue' |
    'primary-red' |
    'secondary' |
    'secondary-black' |
    'secondary-grey' |
    'secondary-light-blue' |
    'secondary-light-green' |
    'secondary-red' |
    'tertiary' |
    'tertiary-black' |
    'tertiary-grey' |
    'tertiary-light-blue' |
    'tertiary-light-green' |
    'tertiary-red' |
    'integrated' |
    'integrated-black' |
    'integrated-grey' |
    'inverted' |
    'inverted-grey';

export type ButtonSize =
    'auto' |
    'tiny' |
    'small' |
    'normal' |
    'large';

export const BASE_BUTTON_CSS_CLASS = 'ss-buttons';

@Component({
    selector: '[ss-button]',
    styleUrls: ['./button.component.scss'],
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {

    @Input()
    public buttonActive: boolean;

    @Input()
    public buttonProportional: boolean;

    @Input()
    public buttonNoPadding: boolean;

    @Input()
    public buttonSize: ButtonSize = 'normal';

    @Input()
    public buttonStyle: ButtonStyle = 'primary';

    @Input()
    public buttonCircular: boolean;

    @HostBinding('class')
    public get class(): string {
        const activeClass = this.buttonActive ? `${BASE_BUTTON_CSS_CLASS}--active` : '';
        const noPaddingClass = this.buttonNoPadding ? `${BASE_BUTTON_CSS_CLASS}--no-padding` : '';
        const proportionalClass = this.buttonProportional ? `${BASE_BUTTON_CSS_CLASS}--proportional` : '';
        const circularClass = this.buttonCircular ? `${BASE_BUTTON_CSS_CLASS}--circular` : '';

        return `${BASE_BUTTON_CSS_CLASS}--${this.buttonStyle}
                ${BASE_BUTTON_CSS_CLASS}--${this.buttonSize}
                ${activeClass}
                ${noPaddingClass}
                ${proportionalClass}
                ${circularClass}`;
    }
}
