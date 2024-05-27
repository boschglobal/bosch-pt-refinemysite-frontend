/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

@Component({
    templateUrl: './input-mask.test.component.html',
})
export class InputMaskTestComponent {

    public mask: string;

    public maskPlaceholder: string;

    public maskSpecialCharacters: string[];

    public value = '';

    public handleMaskValueChange(value: string): void {
    }
}
