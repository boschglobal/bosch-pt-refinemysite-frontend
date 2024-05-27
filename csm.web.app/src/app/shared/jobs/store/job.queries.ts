/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {xorWith} from 'lodash';
import * as moment from 'moment';
import {
    combineLatest,
    Observable,
} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    pairwise,
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {BaseQueries} from '../../misc/store/base.queries';
import {JobStatusEnum} from '../api/enums/job-status.enum';
import {JobResource} from '../api/resources/job.resource';
import {JobListLinks} from '../api/resources/job-list.resource';
import {JobSlice} from './job.slice';

export const JOBS_SORT_FN_BY_STATUS = (a: JobResource, b: JobResource): number => {
    const aStatusRunning = a.status === JobStatusEnum.Running || a.status === JobStatusEnum.Queued;
    const bStatusRunning = b.status === JobStatusEnum.Running || b.status === JobStatusEnum.Queued;
    const aStatusFirst = aStatusRunning && !bStatusRunning ? -1 : 1;
    const aStatusEqualB = a.status === b.status;

    return aStatusEqualB ? 0 : aStatusFirst;
};

export const JOBS_SORT_FN_BY_LAST_MODIFIED_DATE = (a: JobResource, b: JobResource): number =>
    moment(b.lastModifiedDate).diff(moment(a.lastModifiedDate));

export const GET_JOBS_SORTED = (jobs: JobResource[]): JobResource[] =>
    jobs
        .sort(JOBS_SORT_FN_BY_LAST_MODIFIED_DATE)
        .sort(JOBS_SORT_FN_BY_STATUS);

const JOBS_IS_EQUAL = (oldJobs: JobResource[], newJobs: JobResource[]): boolean =>
    !xorWith(oldJobs, newJobs, (a: JobResource, b: JobResource) =>
        a.id === b.id && a.lastModifiedDate === b.lastModifiedDate && a.read === b.read).length;

@Injectable({
    providedIn: 'root',
})
export class JobQueries extends BaseQueries<JobResource, JobSlice, JobListLinks> {

    public sliceName = 'jobSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeJobs(): Observable<JobResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                map(jobs => GET_JOBS_SORTED(jobs)),
                distinctUntilChanged(JOBS_IS_EQUAL));
    }

    public observeHasJobsRunning(): Observable<boolean> {
        return combineLatest([
            this._store.pipe(select(this.getList())),
            this._store.pipe(select(this._getWatchingIds())),
        ]).pipe(
            map(([jobs, watchingIds]: [JobResource[], string[]]) => {
                const hasJobsRunning = jobs.some(job => job.status === JobStatusEnum.Running || job.status === JobStatusEnum.Queued);
                const hasWatchingJobs = watchingIds.length > 0;

                return hasJobsRunning || hasWatchingJobs;
            }),
            distinctUntilChanged());
    }

    public observeJobListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    public observeJobListHasUpdates(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getSlice()),
                map(({items, list: {lastSeen}}) => this.hasJobUpdatesNotSeen(lastSeen, items)),
                distinctUntilChanged());
    }

    public observeJobsCompleted(): Observable<JobResource[]> {
        return this._store
            .pipe(
                select(this.getList()),
                pairwise(),
                map(([previousJobs, currentJobs]) =>
                    currentJobs.filter(({id, status}) => {
                        const previousJobState = previousJobs.find(previousJob => previousJob.id === id)?.status;

                        return status === JobStatusEnum.Completed && previousJobState && status !== previousJobState;
                    })),
                distinctUntilChanged());
    }

    public observeJobListLastSeen(): Observable<string> {
        return this._store
            .pipe(
                select(this.getSlice()),
                map(({list: {lastSeen}}) => lastSeen),
                distinctUntilChanged());
    }

    public observeWatchingJobsIds(): Observable<string[]> {
        return this._store
            .pipe(
                select(this._getWatchingIds()),
                distinctUntilChanged());
    }

    public hasJobUpdatesNotSeen(lastSeen: string, jobList: JobResource[]): boolean {
        const lastSeenMoment = moment(lastSeen);
        const lastUpdatedJobModifiedDate = this.getLastUpdatedJobNotReadModifiedDate(jobList);

        return lastSeenMoment.isValid() && lastUpdatedJobModifiedDate.isValid() && lastUpdatedJobModifiedDate.isAfter(lastSeenMoment);
    }

    public getLastUpdatedJobNotReadModifiedDate(jobList: JobResource[]): moment.Moment {
        const filteredJobListModifiedDate = jobList
            .filter(job => !job.read)
            .map(job => moment(job.lastModifiedDate));
        const modifiedDates = filteredJobListModifiedDate.length ? filteredJobListModifiedDate : [moment.invalid()];

        return moment.max(modifiedDates);
    }

    private _getWatchingIds(): (state: State) => string[] {
        return (state: State) => this._getSlice(state).watchingIds;
    }
}
