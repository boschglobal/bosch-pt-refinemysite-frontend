/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {MOCK_TASK_2} from '../../../../../../test/mocks/tasks';
import {SaveTaskListItemResource} from './save-task-list-item.resource';

describe('Save Task List Item Resource', () => {

    const task = MOCK_TASK_2;

    it('should return a new instance of SaveTaskListItemResource when calling fromTask()', () => {
        const {id, version, project, name, description, status, location, projectCraft, workArea, schedule: {start, end}, assignee} = task;
        const expectedResult = new SaveTaskListItemResource(
            id,
            version,
            project.id,
            name,
            description,
            status,
            location,
            projectCraft.id,
            workArea.id,
            start,
            end,
            assignee.id,
            null
        );

        expect(SaveTaskListItemResource.fromTask(task)).toEqual(expectedResult);
    });
});
