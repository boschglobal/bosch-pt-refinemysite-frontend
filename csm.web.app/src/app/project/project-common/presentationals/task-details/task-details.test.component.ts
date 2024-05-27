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

import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {Task} from '../../models/tasks/task';

@Component({
    selector: 'ss-task-details-test',
    template: `
        <ss-task-details [task]="task"
                         [attachments]="attachments">
        </ss-task-details>`,
})
export class TaskDetailsTestComponent {

    @Input()
    public attachments: AttachmentResource[];

    @Input()
    public task: Task;
}
