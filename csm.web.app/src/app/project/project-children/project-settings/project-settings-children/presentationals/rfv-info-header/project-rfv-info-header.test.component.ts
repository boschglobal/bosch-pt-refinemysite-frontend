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
        <ss-project-rfv-info-header
            [totalItems]="totalItems"
            [activeItems]="activeItems">
        </ss-project-rfv-info-header>
    `,
})
export class ProjectRfvInfoHeaderTestComponent {

    @Input()
    public activeItems = 0;

    @Input()
    public totalItems = 0;
}
