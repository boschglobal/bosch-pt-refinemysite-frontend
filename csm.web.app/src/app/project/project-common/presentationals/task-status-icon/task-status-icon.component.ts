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

import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {IconDimensionType} from '../../../../shared/ui/icons/icon.component';
import {TaskStatusEnum} from '../../enums/task-status.enum';

export const TASK_STATUS_ICON_DRAFT = 'task-status-draft';
export const TASK_STATUS_ICON_OPEN = 'task-status-open';
export const TASK_STATUS_ICON_STARTED = 'task-status-progress';
export const TASK_STATUS_ICON_CLOSED = 'task-status-done';
export const TASK_STATUS_ICON_ACCEPTED = 'task-status-accepted';

@Component({
    selector: 'ss-task-status-icon',
    templateUrl: './task-status-icon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusIconComponent {

    @Input()
    public set status(status: TaskStatusEnum) {
        const {name, color} = this._statusIcons[status];

        this.iconName = name;
        this.iconColor = color;
    }

    @Input()
    public dimension: IconDimensionType = 'normal';

    public iconName: string;

    public iconColor: string;

    private readonly _statusIcons: { [key in TaskStatusEnum]: { name: string; color: string } } = {
        [TaskStatusEnum.DRAFT]: {
            name: TASK_STATUS_ICON_DRAFT,
            color: COLORS.light_grey,
        },
        [TaskStatusEnum.OPEN]: {
            name: TASK_STATUS_ICON_OPEN,
            color: COLORS.dark_grey_75,
        },
        [TaskStatusEnum.STARTED]: {
            name: TASK_STATUS_ICON_STARTED,
            color: COLORS.dark_blue,
        },
        [TaskStatusEnum.CLOSED]: {
            name: TASK_STATUS_ICON_CLOSED,
            color: COLORS.light_green,
        },
        [TaskStatusEnum.ACCEPTED]: {
            name: TASK_STATUS_ICON_ACCEPTED,
            color: COLORS.light_green,
        },
    };
}
