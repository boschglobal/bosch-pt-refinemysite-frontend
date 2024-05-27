/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {COLORS} from '../constants/colors.constant';
import {
    ButtonSize,
    ButtonStyle,
} from './button.component';

@Component({
    selector: 'ss-button-test',
    templateUrl: './button.test.component.html',
})
export class ButtonTestComponent {

    public buttonActive: boolean;

    public buttonNoPadding: boolean;

    public buttonProportional: boolean;

    public buttonSize: ButtonSize;

    public buttonCircular: boolean;

    set buttonStyle(value: ButtonStyle) {
        this._buttonStyle = value;

        this._styleBody(value);
    }

    get buttonStyle(): ButtonStyle {
        return this._buttonStyle;
    }

    public disable: boolean;

    public icon: boolean;

    public text: string;

    private _buttonStyle: ButtonStyle;

    private _styleBody(value: ButtonStyle): void {
        document.body.style.background = value === 'inverted' ?
            COLORS.light_blue :
            'transparent';
    }
}
