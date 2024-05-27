/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

export const TASK_CARD_WEEK_PLACEHOLDER_ID_PREFIX = 'ss-task-card-week-placeholder-';

@Component({
    selector: 'ss-task-card-week-placeholder',
    templateUrl: './task-card-week-placeholder.component.html',
    styleUrls: ['./task-card-week-placeholder.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardWeekPlaceholderComponent {
    @Input()
    public taskId: string;

    @Input()
    public taskStyles: { [key: string]: any };

    public taskCardPlaceholderIdPrefix = TASK_CARD_WEEK_PLACEHOLDER_ID_PREFIX;
}
