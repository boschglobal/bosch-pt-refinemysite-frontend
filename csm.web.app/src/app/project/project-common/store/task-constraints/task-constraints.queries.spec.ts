/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_TASK_CONSTRAINTS_RESOURCE} from '../../../../../test/mocks/task-constraints';
import {MOCK_TASK_RESOURCE} from '../../../../../test/mocks/tasks';
import {TaskConstraints} from '../../models/task-constraints/task-constraints';
import {TaskConstraintsQueries} from './task-constraints.queries';

describe('Task Constraints Queries', () => {
    let taskConstraintsQueries: TaskConstraintsQueries;

    const taskId = MOCK_TASK_RESOURCE.id;
    const taskConstraints: TaskConstraints = TaskConstraints.fromTaskConstraintsResource(MOCK_TASK_CONSTRAINTS_RESOURCE);

    const initialState = {
        projectModule: {
            projectTaskSlice: {
                items: [MOCK_TASK_RESOURCE],
            },
            taskConstraintsSlice: {
                lists: {
                    [taskId]: taskConstraints,
                },
            },
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: new MockStore(initialState),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        taskConstraintsQueries = TestBed.inject(TaskConstraintsQueries);
    });

    it('should observe Task Constraints by Task ID', () => {
        taskConstraintsQueries.observeTaskConstraintsByTaskId(taskId)
            .subscribe(constraints => expect(constraints).toEqual(MOCK_TASK_CONSTRAINTS_RESOURCE.items));
    });

    it('should observe Task Constraints request status by Task ID', () => {
        taskConstraintsQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)
            .subscribe(status => expect(status).toEqual(taskConstraints.requestStatus));
    });

    it('should observe Task Constraints update permissions by Task ID', () => {
        taskConstraintsQueries.observeTaskUpdateConstraintsPermissionByTaskId(taskId)
            .subscribe(hasPermission => expect(hasPermission).toEqual(taskConstraints.permissions.canUpdate));
    });

    it('should observe Task Constraints version by Task ID', () => {
        taskConstraintsQueries.observeTaskConstraintsVersionByTaskId(taskId)
            .subscribe(version => expect(version).toEqual(taskConstraints.version));
    });
});
