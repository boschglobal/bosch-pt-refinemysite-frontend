/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {MOCK_TASK_CONSTRAINTS_RESOURCE} from '../../../../../test/mocks/task-constraints';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TaskConstraints} from './task-constraints';

describe('Task Constraints', () => {
    it('should return a TaskConstraint from a Task Constraint Resource when fromTaskConstraints is called', () => {
        const {items, version, taskId, _links} = MOCK_TASK_CONSTRAINTS_RESOURCE;
        const ids = items.map(item => item.key);

        const expectedTaskConstraint = {
            ids,
            version,
            taskId,
            requestStatus: RequestStatusEnum.empty,
            permissions: {
                canUpdate: _links.hasOwnProperty('update'),
            },
        };

        expect(TaskConstraints.fromTaskConstraintsResource(MOCK_TASK_CONSTRAINTS_RESOURCE)).toEqual(expectedTaskConstraint);
    });
});
