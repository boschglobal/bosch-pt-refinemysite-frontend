/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE,
    MOCK_TASK_CONSTRAINTS_RESOURCE
} from '../../../../../test/mocks/task-constraints';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TaskConstraints} from '../../models/task-constraints/task-constraints';
import {TaskConstraintsActions} from './task-constraints.actions';
import {TASK_CONSTRAINTS_INITIAL_STATE} from './task-constraints.initial-state';
import {TASK_CONSTRAINT_REDUCER} from './task-constraints.reducer';
import {TaskConstraintsSlice} from './task-constraints.slice';

describe('Task Constraints Reducer', () => {
    let initialState: TaskConstraintsSlice;
    let nextState: TaskConstraintsSlice;

    const taskId = 'foo';

    beforeEach(() => {
        initialState = TASK_CONSTRAINTS_INITIAL_STATE;
        nextState = cloneDeep(TASK_CONSTRAINTS_INITIAL_STATE);
    });

    it('should handle TaskConstraintsActions.Initialize.All()', () => {
        const action: Action = new TaskConstraintsActions.Initialize.All();

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle TaskConstraintsActions.Request.One()', () => {
        const action: Action = new TaskConstraintsActions.Request.One(taskId);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), nextState.lists[taskId], {requestStatus: RequestStatusEnum.progress}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TaskConstraintsActions.Request.OneFulfilled()', () => {
        const action: Action = new TaskConstraintsActions.Request.OneFulfilled(taskId, MOCK_TASK_CONSTRAINTS_RESOURCE);
        const taskConstraints = TaskConstraints.fromTaskConstraintsResource(MOCK_TASK_CONSTRAINTS_RESOURCE);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), taskConstraints, {requestStatus: RequestStatusEnum.success}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TaskConstraintsActions.Request.OneRejected()', () => {
        const action: Action = new TaskConstraintsActions.Request.OneRejected(taskId);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), initialState.lists[taskId], {requestStatus: RequestStatusEnum.error}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TaskConstraintsActions.Update.One()', () => {
        const action: Action = new TaskConstraintsActions.Update.One(taskId, MOCK_SAVE_TASK_CONSTRAINTS_RESOURCE);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), initialState.lists[taskId], {requestStatus: RequestStatusEnum.progress}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TaskConstraintsActions.Update.OneFulfilled()', () => {
        const action: Action = new TaskConstraintsActions.Update.OneFulfilled(taskId, MOCK_TASK_CONSTRAINTS_RESOURCE);
        const taskConstraints = TaskConstraints.fromTaskConstraintsResource(MOCK_TASK_CONSTRAINTS_RESOURCE);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), taskConstraints, {requestStatus: RequestStatusEnum.success}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TaskConstraintsActions.Update.OneRejected()', () => {
        const action: Action = new TaskConstraintsActions.Update.OneRejected(taskId);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), initialState.lists[taskId], {requestStatus: RequestStatusEnum.error}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle TaskConstraintsActions.Update.OneReset()', () => {
        const action: Action = new TaskConstraintsActions.Update.OneReset(taskId);

        nextState.lists = Object.assign(new Map(), {
            [taskId]: Object.assign({}, new TaskConstraints(), initialState.lists[taskId], {requestStatus: RequestStatusEnum.empty}),
        });

        expect(TASK_CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });
});
