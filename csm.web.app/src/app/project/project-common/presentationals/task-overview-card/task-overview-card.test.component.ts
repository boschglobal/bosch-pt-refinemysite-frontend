/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {MOCK_TASK_2} from '../../../../../test/mocks/tasks';
import {MenuItemsList} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {Task} from '../../models/tasks/task';

@Component({
    template: `
        <ss-task-overview-card [task]="task"
                               [isCritical]="isCritical"
                               [actions]="actions">
        </ss-task-overview-card>
    `,
    styles: [
        ':host { display: block; border: 1px solid #d4d7da; max-width: 272px; }',
    ],
})
export class TaskOverviewCardTestComponent {

    public actions: MenuItemsList[];

    public isCritical: boolean;

    public task: Task;

    public triggerChangeDetection(): void {
        this.task = {...MOCK_TASK_2};
    }
}
