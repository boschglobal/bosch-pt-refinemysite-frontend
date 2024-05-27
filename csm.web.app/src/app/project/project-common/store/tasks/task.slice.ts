/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {TaskEntity} from '../../entities/task/task.entity';
import {ProjectTaskList} from './slice/project-task-list';

export interface ProjectTaskSlice {
    currentItem: AbstractItem;
    list: ProjectTaskList;
    calendar: ProjectTaskList;
    assignList: AbstractSelectionList;
    sendList: AbstractSelectionList;
    items: TaskEntity[];
}
