/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    transition,
    trigger,
    useAnimation
} from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';

import {JobCardStatusEnum} from '../../../../project/project-common/enums/job-card-status.enum';
import {
    bulgeInAnimation,
    bulgeOutAnimation
} from '../../../animation/bulge/bulge.animation';
import {COLORS} from '../../../ui/constants/colors.constant';

@Component({
    selector: 'ss-job-card-status',
    templateUrl: 'job-card-status.component.html',
    styleUrls: ['job-card-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('statusIconAnimation', [
            transition(':enter', [
                useAnimation(bulgeInAnimation),
            ]),
            transition(':leave', [
                useAnimation(bulgeOutAnimation),
            ]),
        ]),
    ],
})
export class JobCardStatusComponent {

    @Input()
    public status: JobCardStatusEnum;

    public jobStatusCompletedEnum = JobCardStatusEnum.Completed;

    public jobStatusCompletedIconColor = COLORS.light_green;

    public jobStatusFailedEnum = JobCardStatusEnum.Failed;

    public jobStatusFailedIconColor = COLORS.red;

    public jobStatusPartlyCompletedEnum = JobCardStatusEnum.PartlyCompleted;

    public jobStatusRunningEnum = JobCardStatusEnum.Running;

    public jobStatusRunningIconColor = COLORS.light_blue;
}
