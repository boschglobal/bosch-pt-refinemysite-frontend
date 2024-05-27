/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {ProjectFiltersCaptureContextEnum} from '../project-filter-capture/project-filter-capture.component';
import {TasksFilterFormData} from './tasks-filter-capture.component';

@Component({
    selector: 'ss-tasks-filter-capture-test',
    template: `
        <ss-tasks-filter-capture
            [allDaysInDateRangeDisabled]="allDaysInDateRangeDisabled"
            [context]="context"
            [defaultValues]="defaultValues"
            [useCriteria]="useCriteria"></ss-tasks-filter-capture>
    `,
})
export class TasksFilterCaptureTestComponent {
    public allDaysInDateRangeDisabled: boolean;

    public context: ProjectFiltersCaptureContextEnum;

    public defaultValues: TasksFilterFormData;

    public useCriteria: boolean;
}
