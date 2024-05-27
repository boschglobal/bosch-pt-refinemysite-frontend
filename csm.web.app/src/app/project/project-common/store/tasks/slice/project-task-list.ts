/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AbstractPageableList} from '../../../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {TaskListLinks} from '../../../api/tasks/resources/task-list.resource';
import {TasksSortField} from '../../../api/tasks/task.service';
import {ProjectTaskFilters} from './project-task-filters';

export class ProjectTaskList extends AbstractPageableList<TaskListLinks, TasksSortField> {
    public filters: ProjectTaskFilters = new ProjectTaskFilters();
    public isFilterPanelOpen: boolean;
}
