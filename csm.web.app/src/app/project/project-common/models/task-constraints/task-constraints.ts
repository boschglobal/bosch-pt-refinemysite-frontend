/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    TaskConstraintsResource,
    TaskConstraintsResourceLinks
} from '../../api/task-constraints/resources/task-constraints.resource';

export class TaskConstraints extends AbstractList<TaskConstraintsResourceLinks> {
    taskId: string;
    permissions: TaskConstraintsPermissions;

    public static fromTaskConstraintsResource(taskConstraintsResource: TaskConstraintsResource): TaskConstraints {
        const {version, items, taskId} = taskConstraintsResource;
        const ids = items.map(item => item.key);

        return {
            ids,
            version,
            taskId,
            permissions: this._mapLinksToPermissions(taskConstraintsResource),
            requestStatus: RequestStatusEnum.empty,
        };
    }

    private static _mapLinksToPermissions(taskConstraintsResource: TaskConstraintsResource): TaskConstraintsPermissions {
        const {_links} = taskConstraintsResource;

        return {
            canUpdate: _links.hasOwnProperty('update'),
        };
    }
}

interface TaskConstraintsPermissions {
    canUpdate: boolean;
}
