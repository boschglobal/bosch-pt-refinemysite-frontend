/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';

import {TaskStatusEnumHelper} from '../../enums/task-status.enum';
import {Task} from '../../models/tasks/task';

@Component({
    selector: 'ss-project-tasks-status-label',
    templateUrl: './project-tasks-status-label.component.html',
    styleUrls: ['./project-tasks-status-label.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTasksStatusLabelComponent {
    /**
     * @description Input specify the task
     * @param status
     */
    @Input()
    public task: Task;

    /**
     * @description Label identifier
     */
    public get label(): string {
        return TaskStatusEnumHelper.getLabelByValue(this.task.status);
    }
}
