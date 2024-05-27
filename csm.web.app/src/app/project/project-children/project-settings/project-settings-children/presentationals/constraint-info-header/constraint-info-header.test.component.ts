/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

@Component({
    template: `
        <ss-constraint-info-header
            [totalItems]="totalItems"
            [activeItems]="activeItems">
        </ss-constraint-info-header>
    `,
})
export class ConstraintInfoHeaderTestComponent {

    @Input()
    public activeItems = 0;

    @Input()
    public totalItems = 0;
}
