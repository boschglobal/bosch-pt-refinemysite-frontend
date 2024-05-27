/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {SelectListOption} from './select-list.component';

@Component({
    templateUrl: './select-list.test.component.html',
})

export class SelectListTestComponent {

    public options: SelectListOption[];

    public selected: SelectListOption;

    public handleChange(): void {
    }
}
