/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {BREAKPOINTS_RANGE as breakpointsRange} from '../../../../app/shared/ui/constants/breakpoints.constant';

@Component({
    templateUrl: './if-media-query.test.component.html'
})
export class IfMediaQueryTestComponent {
    public min: number = breakpointsRange.md.min;
    public max: number = breakpointsRange.md.max;
}
