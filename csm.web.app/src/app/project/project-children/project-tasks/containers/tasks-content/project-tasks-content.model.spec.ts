/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {MOCK_TASKS} from '../../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../../../test/mocks/workareas';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {ProjectTaskCardAssigneeModel} from '../../../../project-common/presentationals/project-tasks-card-assignee.model';
import {ProjectTaskContentModel} from './project-tasks-content.model';

describe('Project Tasks Content Model', () => {
    const newTasks = cloneDeep(MOCK_TASKS);
    newTasks[0].workArea = {
        id: '789',
        displayName: 'Xaa',
    };
    newTasks[1].schedule = undefined;
    const [taskWithSchedule, taskWithoutSchedule] = newTasks;
    const taskContentTest: ProjectTaskContentModel = new ProjectTaskContentModel(
        'foo',
        'Getting Things Done',
        TaskStatusEnum.OPEN,
        new ResourceReference('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', 'My Super Project'),
        '2018-12-10',
        '2018-12-16',
        {
            name: 'Craft A',
            color: '#f5a100',
        },
        new ProjectTaskCardAssigneeModel(
            'foo',
            'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
            true,
            new ResourceReferenceWithPicture(
                'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
                'John Pianos',
                ''
            ),
            new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a49e', 'Jons Company'),
            TaskStatusEnum.OPEN,
            true,
            false,
            'b8763b19-de8e-ea0d-2d6f-d77feb70a491',
        ),
        {
            uncriticalTopics: 4,
            criticalTopics: 10,
        },
        true,
        false,
        MOCK_WORKAREA_B
    );

    it('should return task schedule start as null when it is undefined', () => {
        expect(ProjectTaskContentModel.fromTaskAndWorkAreaResource(taskWithoutSchedule).start).toBeNull();
    });

    it('should return task schedule end as null when it is undefined', () => {
        expect(ProjectTaskContentModel.fromTaskAndWorkAreaResource(taskWithoutSchedule).end).toBeNull();
    });

    it('should return workArea null when workArea is undefined', () => {
        expect(ProjectTaskContentModel.fromTaskAndWorkAreaResource(taskWithoutSchedule).workArea).toBeNull();
    });

    it('should return a Project Task Content Model with workArea from a Task that has workArea', () => {
        expect(ProjectTaskContentModel.fromTaskAndWorkAreaResource(
            taskWithSchedule,
            MOCK_WORKAREA_B
        )).toEqual(taskContentTest);
    });
});
