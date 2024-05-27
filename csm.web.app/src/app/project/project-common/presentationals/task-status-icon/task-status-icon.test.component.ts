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

import {IconDimensionType} from '../../../../shared/ui/icons/icon.component';
import {TaskStatusEnum} from '../../enums/task-status.enum';

@Component({
    selector: 'ss-task-status-icon-test',
    template: `
        <ss-task-status-icon
            [status]="status"
            [dimension]="dimension">
        </ss-task-status-icon>`,
})
export class TaskStatusIconTestComponent {

    @Input()
    public status: TaskStatusEnum;

    @Input()
    public dimension: IconDimensionType;

}
