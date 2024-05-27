/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {State} from '../../../../../app.reducers';
import {
    SetItemsPerPageActionType,
    SetPageActionType
} from '../../../../../shared/misc/containers/pagination-component/pagination.component';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

@Component({
    selector: 'ss-project-tasks-pagination',
    templateUrl: './project-tasks-pagination.component.html',
})
export class ProjectTasksPaginationComponent {
    /**
     * @description Paginator date selector function
     * @type {Function}
     */
    public paginatorDataSelectorFunction: (state: State) => {} = new ProjectTaskQueries(null).getListPagination();

    /**
     * @description Creator class for action to set task list page
     * @type {ProjectTaskActions.Set.Page}
     */
    public setPageAction: SetPageActionType = (page: number): ProjectTaskActions => new ProjectTaskActions.Set.Page(page);

    /**
     * @description Creator class for action to set task list items per page
     * @type {ProjectTaskActions.Set.Items}
     */
    public setItemsPerPageAction: SetItemsPerPageActionType =
        (items: number): ProjectTaskActions => new ProjectTaskActions.Set.Items(items);
}
