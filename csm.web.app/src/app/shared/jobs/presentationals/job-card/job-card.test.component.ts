/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {JobCard} from '../../../../project/project-common/models/job-card/job-card';

@Component({
    selector: 'ss-job-card-test',
    template: `
        <ss-job-card
            [card]="card"
            (downloadTriggered)="handleDownloadTriggered($event)"></ss-job-card>
    `,
    styles: [
        ':host { display: block; border: 1px solid #d4d7da; max-width: 345px; }',
    ],
})
export class JobCardTestComponent {
    @Input()
    public card: JobCard;

    public handleDownloadTriggered(event: string) {}
}
