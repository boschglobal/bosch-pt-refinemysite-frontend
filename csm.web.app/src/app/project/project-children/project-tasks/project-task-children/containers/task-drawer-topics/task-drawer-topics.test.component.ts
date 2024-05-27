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

import {Task} from '../../../../../project-common/models/tasks/task';

@Component({
    selector: 'ss-task-drawer-topics-test',
    template: `
        <ss-task-drawer-topics [task]="task">
        </ss-task-drawer-topics>`,
})
export class TaskDrawerTopicsTestComponent {

    @Input()
    public task: Task;
}
