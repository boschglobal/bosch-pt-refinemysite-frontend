/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectFiltersCaptureContextEnum} from './project-filter-capture.component';

@Component({
    selector: 'ss-project-filter-capture-test',
    template: `
        <ng-container [ngSwitch]="testContext">
            <ss-project-filter-capture
                *ngSwitchCase="'task-and-milestone-filters'"
                [context]="context"
                [milestoneFilters]="milestoneFilters"
                [taskFilters]="taskFilters"
                [wholeProjectDuration]="wholeProjectDuration">
            </ss-project-filter-capture>
            <ss-project-filter-capture
                *ngSwitchCase="'task-filters'"
                [context]="context"
                [taskFilters]="taskFilters"
                [wholeProjectDuration]="wholeProjectDuration">
            </ss-project-filter-capture>
        </ng-container>
    `,
})
export class ProjectFilterCaptureTestComponent {

    public context: ProjectFiltersCaptureContextEnum;

    public milestoneFilters: MilestoneFilters;

    public taskFilters: ProjectTaskFilters;

    public testContext: ProjectFilterCaptureTestContext;

    public wholeProjectDuration = false;
}

type ProjectFilterCaptureTestContext = 'task-and-milestone-filters' | 'task-filters';
