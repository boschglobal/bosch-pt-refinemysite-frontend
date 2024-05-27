/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {
    cloneDeep,
    unionBy,
} from 'lodash';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

import {
    JOB_MOCK_1,
    JOB_MOCK_2,
    JOB_MOCK_3,
    JOB_MOCK_4,
} from '../../../../test/mocks/jobs';
import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {JobStatusEnum} from '../api/enums/job-status.enum';
import {JobResource} from '../api/resources/job.resource';
import {JOB_SLICE_INITIAL_STATE} from './job.initial-state';
import {
    GET_JOBS_SORTED,
    JobQueries
} from './job.queries';

describe('Job Queries', () => {
    let jobQueries: JobQueries;
    let store: MockStore;
    let subscription: Subscription;
    let jobItemsCopy: JobResource[];

    const currentDate = moment();
    const jobItems = [JOB_MOCK_1, JOB_MOCK_2, JOB_MOCK_3];
    const now = currentDate.toISOString();
    const minuteAgo = currentDate.clone().subtract(1, 'm').toISOString();
    const yesterday = currentDate.clone().subtract(1, 'd').toISOString();

    const updateJobItemsProperties = (list: JobResource[], lastModifiedDatesList: string[], statusList: JobStatusEnum[]): JobResource[] => (
        list.map((job, i) => ({
            ...job,
            status: statusList[i],
            lastModifiedDate: lastModifiedDatesList[i],
        })));

    const initialState: Pick<State, 'jobSlice'> = {
        jobSlice: {
            ...JOB_SLICE_INITIAL_STATE,
            items: jobItems,
            list: {
                ...JOB_SLICE_INITIAL_STATE.list,
                ids: jobItems.map(job => job.id),
                lastSeen: currentDate.clone().toISOString(),
                requestStatus: RequestStatusEnum.success,
            },
        },
    };

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
            JobQueries,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        jobQueries = TestBed.inject(JobQueries);
        store = TestBed.inject(MockStore);

        jobItemsCopy = cloneDeep(jobItems);
    });

    afterEach(() => store.setState(initialState));

    it('should observe job list', () => {
        const sortedJobItems = GET_JOBS_SORTED(jobItemsCopy);

        subscription = jobQueries.observeJobs()
            .subscribe(jobs => expect(jobs).toEqual(sortedJobItems));
        subscription.unsubscribe();
    });

    it('should emit job list when jobs change', () => {
        const newState = cloneDeep(initialState);
        const newJob = JOB_MOCK_4;
        const updatedJobLastModifiedDate = {...JOB_MOCK_1, lastModifiedDate: new Date().toISOString()};
        const updatedJobRead = {...JOB_MOCK_1, read: true};
        const jobItemsWithUpdatedJobLastModifiedDate = unionBy([updatedJobLastModifiedDate], jobItemsCopy, 'id');
        const jobItemsWithUpdatedJobRead = unionBy([updatedJobRead], jobItemsCopy, 'id');
        const jobItemsWithNewJob = [...jobItemsWithUpdatedJobLastModifiedDate, newJob];
        const initialJobItems = GET_JOBS_SORTED(jobItemsCopy);
        const sortedJobItemsWithUpdatedJobLastModifiedDate = GET_JOBS_SORTED(jobItemsWithUpdatedJobLastModifiedDate);
        const sortedJobItemsWithNewJob = GET_JOBS_SORTED(jobItemsWithNewJob);
        const sortedJobItemsWithUpdatedJobRead = GET_JOBS_SORTED(jobItemsWithUpdatedJobRead);
        const results: JobResource[][] = [];

        subscription = jobQueries.observeJobs()
            .subscribe(result => results.push(result));

        newState.jobSlice.items = jobItemsWithUpdatedJobLastModifiedDate;
        setStoreState(newState);

        newState.jobSlice.items = jobItemsWithUpdatedJobRead;
        setStoreState(newState);

        newState.jobSlice.items = jobItemsWithNewJob;
        newState.jobSlice.list.ids = jobItemsWithNewJob.map(job => job.id);
        setStoreState(newState);

        expect(results.length).toBe(4);
        expect(results[0]).toEqual(initialJobItems);
        expect(results[1]).toEqual(sortedJobItemsWithUpdatedJobLastModifiedDate);
        expect(results[2]).toEqual(sortedJobItemsWithUpdatedJobRead);
        expect(results[3]).toEqual(sortedJobItemsWithNewJob);
        subscription.unsubscribe();
    });

    it('should not emit job list when jobs do not change', () => {
        const newState = cloneDeep(initialState);
        const results: JobResource[][] = [];
        const expectedResult = GET_JOBS_SORTED(jobItemsCopy);

        subscription = jobQueries.observeJobs()
            .subscribe(result => results.push(result));

        newState.jobSlice.items = jobItemsCopy;

        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(expectedResult);
        subscription.unsubscribe();
    });

    it('should observe has jobs when there are running and queued jobs', () => {
        let newJobItems = jobItemsCopy.map(job => Object.assign({}, job, {status: JobStatusEnum.Running}));
        const newState = cloneDeep(initialState);
        const results: boolean[] = [];

        newState.jobSlice.items = newJobItems;

        setStoreState(newState);

        subscription = jobQueries.observeHasJobsRunning()
            .subscribe(hasJobsRunning => results.push(hasJobsRunning));

        newJobItems = jobItemsCopy.map(job => Object.assign({}, job, {status: JobStatusEnum.Completed}));

        newState.jobSlice.items = newJobItems;

        setStoreState(newState);

        newJobItems = jobItemsCopy.map(job => Object.assign({}, job, {status: JobStatusEnum.Queued}));

        newState.jobSlice.items = newJobItems;

        setStoreState(newState);

        expect(results.length).toEqual(3);
        expect(results[0]).toBeTruthy();
        expect(results[1]).toBeFalsy();
        expect(results[2]).toBeTruthy();
        subscription.unsubscribe();
    });

    it('should observe has jobs when there are watching jobs', () => {
        const newJobItems = jobItemsCopy.map(job => Object.assign({}, job, {status: JobStatusEnum.Completed}));
        const newState = cloneDeep(initialState);
        const results: boolean[] = [];

        newState.jobSlice.items = newJobItems;

        setStoreState(newState);

        subscription = jobQueries.observeHasJobsRunning()
            .subscribe(hasJobsRunning => results.push(hasJobsRunning));

        newState.jobSlice.watchingIds = ['foo'];

        setStoreState(newState);

        expect(results.length).toEqual(2);
        expect(results[0]).toBeFalsy();
        expect(results[1]).toBeTruthy();
        subscription.unsubscribe();
    });

    it('should observe job list request status', () => {
        const newState = cloneDeep(initialState);
        const results: RequestStatusEnum[] = [];

        newState.jobSlice.list.requestStatus = RequestStatusEnum.progress;

        setStoreState(newState);

        subscription = jobQueries.observeJobListRequestStatus()
            .subscribe(requestStatus => results.push(requestStatus));

        newState.jobSlice.list.requestStatus = RequestStatusEnum.success;

        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toBe(RequestStatusEnum.progress);
        expect(results[1]).toBe(RequestStatusEnum.success);
        subscription.unsubscribe();
    });

    it('should observe job list has updates', () => {
        const newState = cloneDeep(initialState);
        const results: boolean[] = [];
        const newLastSeen = currentDate.clone().toISOString();
        const newJobItems = jobItemsCopy.map(job => Object.assign({}, job, {lastModifiedDate: newLastSeen}));
        const newJobUpdate = Object.assign({}, newJobItems[0], {lastModifiedDate: currentDate.clone().add(1, 'm').toISOString()});

        newState.jobSlice.items = newJobItems;
        newState.jobSlice.list.lastSeen = newLastSeen;

        setStoreState(newState);

        subscription = jobQueries.observeJobListHasUpdates()
            .subscribe(hasUpdates => results.push(hasUpdates));

        newState.jobSlice = {
            ...newState.jobSlice,
            items: [newJobUpdate, newJobItems[1]],
        };

        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toBeFalsy();
        expect(results[1]).toBeTruthy();
        subscription.unsubscribe();
    });

    it('should observe jobs already present in the store whose status has changed to completed', () => {
        const newState = cloneDeep(initialState);
        const results: JobResource[] = [];
        const currentJobItems = jobItemsCopy.map(job => Object.assign({}, job, {status: JobStatusEnum.Running}));
        const updatedJob = Object.assign({}, currentJobItems[0], {status: JobStatusEnum.Completed});
        const newJob = Object.assign({}, JOB_MOCK_4, {status: JobStatusEnum.Completed});

        newState.jobSlice.items = currentJobItems;

        setStoreState(newState);

        subscription = jobQueries.observeJobsCompleted()
            .subscribe(completedJobs => results.push(...completedJobs));

        newState.jobSlice.items = [updatedJob, currentJobItems[1], newJob];
        newState.jobSlice.list.ids = newState.jobSlice.items.map(item => item.id);

        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results).toEqual([updatedJob]);
        subscription.unsubscribe();
    });

    it('should return true when there are jobs not seen', () => {
        const newLastSeen = currentDate.clone().toISOString();
        const newJobUpdate = Object.assign({}, jobItemsCopy[0], {lastModifiedDate: currentDate.clone().add(1, 'm').toISOString()});

        expect(jobQueries.hasJobUpdatesNotSeen(newLastSeen, [newJobUpdate])).toBeTruthy();
    });

    it('should return false when all jobs are seen', () => {
        const newLastSeen = currentDate.clone().toISOString();
        const newJobUpdate = Object.assign({}, jobItemsCopy[0], {lastModifiedDate: newLastSeen});

        expect(jobQueries.hasJobUpdatesNotSeen(newLastSeen, [newJobUpdate])).toBeFalsy();
    });

    it('should return the most recent modified date of not read jobs', () => {
        const today = currentDate.clone();
        const tomorrow = currentDate.clone().add(1, 'd');
        const nexYear = currentDate.clone().add(1, 'y');
        const job1 = Object.assign({}, JOB_MOCK_1, {read: false, lastModifiedDate: today.toISOString()});
        const job2 = Object.assign({}, JOB_MOCK_1, {read: true, lastModifiedDate: nexYear.toISOString()});
        const job3 = Object.assign({}, JOB_MOCK_1, {read: false, lastModifiedDate: tomorrow.toISOString()});
        const jobList = [job1, job2, job3];

        expect(jobQueries.getLastUpdatedJobNotReadModifiedDate(jobList).isSame(tomorrow)).toBeTruthy();
    });

    it('should return a valid moment when job list has jobs unread', () => {
        const job1 = Object.assign({}, JOB_MOCK_1, {read: false, lastModifiedDate: currentDate.toISOString()});
        const job2 = Object.assign({}, JOB_MOCK_1, {read: true, lastModifiedDate: currentDate.toISOString()});
        const jobList = [job1, job2];

        expect(jobQueries.getLastUpdatedJobNotReadModifiedDate(jobList).isValid()).toBeTruthy();
    });

    it('should return a invalid moment when job list has jobs but all are read', () => {
        const job1 = Object.assign({}, JOB_MOCK_1, {read: true, lastModifiedDate: currentDate.toISOString()});
        const job2 = Object.assign({}, JOB_MOCK_1, {read: true, lastModifiedDate: currentDate.toISOString()});
        const jobList = [job1, job2];

        expect(jobQueries.getLastUpdatedJobNotReadModifiedDate(jobList).isValid()).toBeFalsy();
    });

    it('should return an invalid moment when job list does not have jobs', () => {
        expect(jobQueries.getLastUpdatedJobNotReadModifiedDate([]).isValid()).toBeFalsy();
    });

    it('should observe job list last seen', () => {
        subscription = jobQueries.observeJobListLastSeen()
            .subscribe(lastSeen => expect(lastSeen).toEqual(currentDate.toISOString()));
        subscription.unsubscribe();
    });

    it('should observe watching job ids', () => {
        const newState = cloneDeep(initialState);
        const watchingIds = ['foo', 'bar'];
        const results: string[][] = [];

        newState.jobSlice.watchingIds = watchingIds;
        setStoreState(newState);

        subscription = jobQueries.observeWatchingJobsIds()
            .subscribe(ids => results.push(ids));

        setStoreState(initialState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(watchingIds);
        expect(results[1]).toEqual([]);
        subscription.unsubscribe();
    });

    it('should sort jobs by lastModifiedDate DESC when all jobs status is RUNNING or QUEUE', () => {
        const newState = cloneDeep(initialState);
        const lastModifiedDateList = [now, minuteAgo, yesterday];
        const statusList = [JobStatusEnum.Running, JobStatusEnum.Queued, JobStatusEnum.Running];
        const jobList = updateJobItemsProperties(jobItemsCopy, lastModifiedDateList, statusList);
        const results: JobResource[] = [];
        const expectedResult = jobList;

        newState.jobSlice.items = GET_JOBS_SORTED(cloneDeep(jobList)).reverse();
        setStoreState(newState);

        subscription = jobQueries.observeJobs()
            .subscribe(result => results.push(...result));

        expect(results).toEqual(expectedResult);
        subscription.unsubscribe();
    });

    it('should sort jobs by lastModifiedDate DESC when all jobs status are different from RUNNING or QUEUE', () => {
        const newState = cloneDeep(initialState);
        const lastModifiedDateList = [now, minuteAgo, yesterday];
        const statusList = [JobStatusEnum.Rejected, JobStatusEnum.Completed, JobStatusEnum.Failed];
        const jobList = updateJobItemsProperties(jobItemsCopy, lastModifiedDateList, statusList);
        const results: JobResource[] = [];
        const expectedResult = jobList;

        newState.jobSlice.items = GET_JOBS_SORTED(cloneDeep(jobList)).reverse();
        setStoreState(newState);

        subscription = jobQueries.observeJobs()
            .subscribe(result => results.push(...result));

        expect(results).toEqual(expectedResult);
        subscription.unsubscribe();
    });

    it('should sort jobs by RUNNING or QUEUE status and lastModifiedDate DESC', () => {
        const newState = cloneDeep(initialState);
        const lastModifiedDateList = [now, minuteAgo, yesterday];
        const statusList = [JobStatusEnum.Running, JobStatusEnum.Queued, JobStatusEnum.Failed];
        const jobList = updateJobItemsProperties(jobItemsCopy, lastModifiedDateList, statusList);
        const results: JobResource[] = [];
        const expectedResult = jobList;

        newState.jobSlice.items = GET_JOBS_SORTED(cloneDeep(jobList)).reverse();
        setStoreState(newState);

        subscription = jobQueries.observeJobs()
            .subscribe(result => results.push(...result));

        expect(results).toEqual(expectedResult);
        subscription.unsubscribe();
    });

    it('should not sort jobs with equal statuses and lastModifiedDate', () => {
        const newState = cloneDeep(initialState);
        const lastModifiedDateList = [now, now, now];
        const statusList = [JobStatusEnum.Failed, JobStatusEnum.Failed, JobStatusEnum.Failed];
        const jobList = updateJobItemsProperties(jobItemsCopy, lastModifiedDateList, statusList);
        const results: JobResource[] = [];
        const expectedResult = jobList;

        newState.jobSlice.items = cloneDeep(jobList);
        setStoreState(newState);

        subscription = jobQueries.observeJobs()
            .subscribe(result => results.push(...result));

        expect(results).toEqual(expectedResult);
        subscription.unsubscribe();
    });
});
