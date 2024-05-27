/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {JobCardStatusEnum} from '../../../../project/project-common/enums/job-card-status.enum';

@Component({
    selector: 'ss-job-card-test',
    template: `
        <ss-job-card-status [status]="status"></ss-job-card-status>`,
    styles: [
        ':host {padding: 16px; display: block;}',
    ],
})
export class JobCardStatusTestComponent {
    public status: JobCardStatusEnum;
}
