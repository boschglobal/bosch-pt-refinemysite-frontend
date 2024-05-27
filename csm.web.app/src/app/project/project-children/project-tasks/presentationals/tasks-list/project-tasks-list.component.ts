/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {Task} from '../../../../project-common/models/tasks/task';
import {ProjectTaskContentModel} from '../../containers/tasks-content/project-tasks-content.model';

@Component({
    selector: 'ss-project-tasks-list',
    templateUrl: './project-tasks-list.component.html',
    styleUrls: ['./project-tasks-list.component.scss'],
})
export class ProjectTasksListComponent {

    /**
     * @description Property injected to table component as records
     * @type {Object[]}
     */
    @Input()
    public tasks: ProjectTaskContentModel[];

    /**
     * @description Property injected to loader and table component to handle loadings
     * @type {boolean}
     */
    @Input()
    public isLoading = false;

    /**
     * @description Property injected to list component to allow selection of tasks
     * @type {boolean}
     */
    @Input()
    public isSelecting: boolean;

    /**
     * @description Triggered when task is clicked
     * @type {EventEmitter<Task>}
     */
    @Output()
    public onClickTask: EventEmitter<Task> = new EventEmitter<Task>();

    /**
     * @description Triggered when selection changes
     * @type {EventEmitter<string[]>}
     */
    @Output()
    public onSelectionChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /**
     * @description Property injected to table component to allow selection of tasks
     * @type {boolean}
     */
    @Input()
    public isRowSelectable: Function = () => true

    /**
     * @description Property that holds selected rows
     * @type {Array}
     */
    @Input()
    public selectedRows: string[] = [];

    /**
     * @description Called when form details button is triggered
     * @param {Task} task
     */
    public onClickDetails(task: Task): void {
        this.onClickTask.emit(task);
    }
}
