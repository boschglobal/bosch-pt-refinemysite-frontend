/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {JobResource} from '../../api/resources/job.resource';

@Component({
    selector: 'ss-job-card-list-test',
    template: `
        <ss-job-card-list
            [jobs]="jobs"
            [isLoading]="isLoading"
            [jobServiceUnavailable]="jobServiceUnavailable"
            (jobCardClicked)="handleCardClick($event)"></ss-job-card-list>`,
    styles: [
        ':host { padding: 16px; display: block; }',
        '::ng-deep .ss-job-card-list { width: 360px; border: 1px solid #efeff0; }',
        '::ng-deep .ss-job-card-list__cards { max-height: 360px; overflow: auto; }',
        '::ng-deep ss-no-items { height: 360px; display: flex; align-items: center; justify-content: center; }',
    ],
})
export class JobCardListTestComponent {

    @Input()
    public isLoading: boolean;

    @Input()
    public jobs: JobResource[];

    @Input()
    public jobServiceUnavailable: boolean;

    public handleCardClick(event: string){}
}
