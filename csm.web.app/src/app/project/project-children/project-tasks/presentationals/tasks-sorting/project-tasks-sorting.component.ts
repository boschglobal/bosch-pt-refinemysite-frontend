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
    Output
} from '@angular/core';

import {State} from '../../../../../app.reducers';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

const TASKS_SORT_METHODS: SelectOption[] = [
    {
        value: 'name',
        label: 'Task_Title_Label',
    },
    {
        value: 'workArea',
        label: 'Generic_WorkingArea',
    },
    {
        value: 'craft',
        label: 'Generic_Craft',
    },
    {
        value: 'company',
        label: 'Generic_Company',
    },
    {
        value: 'start',
        label: 'Generic_Start',
    },
    {
        value: 'end',
        label: 'Generic_Due',
    },
    {
        value: 'status',
        label: 'Task_Status_Label',
    },
    {
        value: 'news',
        label: 'Generic_News',
    }
];

@Component({
    selector: 'ss-project-tasks-sorting',
    templateUrl: './project-tasks-sorting.component.html',
    styleUrls: ['./project-tasks-sorting.component.scss']
})
export class ProjectTasksSortingComponent {

    /**
     * @description Emits when the pane is to be dismissed
     * @type {EventEmitter}
     */
    @Output() public close: EventEmitter<null> = new EventEmitter();

    /**
     * @description Options to generate sort field radio buttons
     * @type {SelectOption[]}
     */
    public sortMethods: SelectOption[] = TASKS_SORT_METHODS;

    /**
     * @description Creator class for action to set task sort
     * @type {ProjectTaskActions.Set.Sort}
     */
    public setSortAction: any = ProjectTaskActions.Set.Sort;

    /**
     * @description Function to receive sorted list
     * @type {(state: State) => SorterData}
     */
    public sorterDateSelectorFunction: (state: State) => {} = new ProjectTaskQueries(null).getListSort();

    /**
     * @description Handles click on cancel button
     */
    public handleCancel(): void {
        this.close.emit();
    }
}
