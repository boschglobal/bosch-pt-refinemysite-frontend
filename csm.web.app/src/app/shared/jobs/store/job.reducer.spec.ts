/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {
    cloneDeep,
    unionBy
} from 'lodash';

import {
    JOB_LIST_MOCK_ONE_OF_ONE_PAGE,
    JOB_MOCK_1,
    JOB_MOCK_2,
    JOB_MOCK_3,
    JOB_MOCK_4,
} from '../../../../test/mocks/jobs';
import {AbstractMarkableList} from '../../misc/api/datatypes/abstract-markable-list.datatype';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {JobStatusEnum} from '../api/enums/job-status.enum';
import {JobResource} from '../api/resources/job.resource';
import {JobActions} from './job.actions';
import {JOB_SLICE_INITIAL_STATE} from './job.initial-state';
import {JOB_REDUCER} from './job.reducer';
import {JobSlice} from './job.slice';

describe('Job Reducer', () => {
    let initialState: JobSlice;
    let midState: JobSlice;
    let nextState: JobSlice;

    beforeEach(() => {
        initialState = JOB_SLICE_INITIAL_STATE;
        midState = cloneDeep(JOB_SLICE_INITIAL_STATE);
        nextState = cloneDeep(JOB_SLICE_INITIAL_STATE);
    });

    it('should handle JobActions.Request.All()', () => {
        const action = new JobActions.Request.All();

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(JOB_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Request.AllFulfilled()', () => {
        const action = new JobActions.Request.AllFulfilled(JOB_LIST_MOCK_ONE_OF_ONE_PAGE);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            ids: JOB_LIST_MOCK_ONE_OF_ONE_PAGE.items.map(item => item.id),
            requestStatus: RequestStatusEnum.success,
            lastSeen: JOB_LIST_MOCK_ONE_OF_ONE_PAGE.lastSeen,
        });
        nextState.items = [JOB_MOCK_1, JOB_MOCK_2];

        expect(JOB_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Request.AllRejected()', () => {
        const action = new JobActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(JOB_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Set.ListAsSeenFulfilled()', () => {
        const lastSeen = JOB_MOCK_1.lastModifiedDate;
        const action = new JobActions.Set.ListAsSeenFulfilled(lastSeen);

        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen,
        });

        expect(JOB_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Set.JobAsReadFulfilled()', () => {
        const jobId = JOB_MOCK_1.id;
        const items = [JOB_MOCK_1, JOB_MOCK_2];
        const action = new JobActions.Set.JobAsReadFulfilled(jobId);
        const updatedJob = Object.assign(new JobResource(), JOB_MOCK_1, {read: true});

        midState.items = items;

        nextState.items = unionBy([updatedJob], midState.items, 'id');

        expect(JOB_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Set.JobToWatch()', () => {
        const jobId1 = 'foo';
        const jobId2 = 'bar';
        const action = new JobActions.Set.JobToWatch(jobId1);

        midState.watchingIds = [jobId2];
        nextState.watchingIds = [jobId1, jobId2];

        expect(JOB_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Unset.JobToWatch()', () => {
        const jobId1 = 'foo';
        const jobId2 = 'bar';
        const action = new JobActions.Unset.JobToWatch(jobId1);

        midState.watchingIds = [jobId1, jobId2];
        nextState.watchingIds = [jobId2];

        expect(JOB_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle JobActions.Update.OneFulfilled()', () => {
        const items = [JOB_MOCK_1, JOB_MOCK_2];
        const itemsIds = items.map(job => job.id);
        const updatedJob = Object.assign({}, JOB_MOCK_3, {status: JobStatusEnum.Queued});
        const action = new JobActions.Update.OneFulfilled(updatedJob);
        const lastSeen = new Date().getTime().toLocaleString();

        midState.items = items;
        midState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen,
            ids: itemsIds,
        });

        nextState.items = unionBy([updatedJob], midState.items, 'id');
        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen,
            ids: [updatedJob.id, ...itemsIds],
        });

        expect(JOB_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should set list lastSeen on JobActions.Update.OneFulfilled() if it is not defined', () => {
        const action = new JobActions.Update.OneFulfilled(JOB_MOCK_4);

        midState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen: null,
        });

        nextState.items = [JOB_MOCK_4];
        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen: JOB_MOCK_4.lastModifiedDate,
            ids: [JOB_MOCK_4.id],
        });

        expect(JOB_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should not set list lastSeen on JobActions.Update.OneFulfilled() if it is defined', () => {
        const action = new JobActions.Update.OneFulfilled(JOB_MOCK_4);
        const lastSeen = new Date().getTime().toLocaleString();

        midState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen,
        });

        nextState.items = [JOB_MOCK_4];
        nextState.list = Object.assign(new AbstractMarkableList(), nextState.list, {
            lastSeen,
            ids: [JOB_MOCK_4.id],
        });

        expect(JOB_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(JOB_REDUCER(initialState, action)).toEqual(initialState);
    });
});
