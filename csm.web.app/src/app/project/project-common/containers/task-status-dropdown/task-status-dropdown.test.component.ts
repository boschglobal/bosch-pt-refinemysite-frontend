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

import {Task} from '../../models/tasks/task';

@Component({
    selector: 'ss-task-status-dropdown-test',
    template: '<ss-task-status-dropdown [task]="task"></ss-task-status-dropdown>',
})
export class TaskStatusDropdownTestComponent {

    @Input()
    public task: Task;
}
