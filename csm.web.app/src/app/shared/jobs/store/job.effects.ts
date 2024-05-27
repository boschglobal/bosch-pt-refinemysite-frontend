/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {flatten} from 'lodash';
import {
    Observable,
    of,
    throwError,
    zip,
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    mergeAll,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {CalendarActionEnum} from '../../../project/project-common/store/calendar/calendar/calendar.actions';
import {ProjectCopyActionEnum} from '../../../project/project-common/store/project-copy/project-copy.actions';
import {ExportProjectActionsEnum} from '../../../project/project-common/store/project-export/project-export.actions';
import {ProjectImportActionEnum} from '../../../project/project-common/store/project-import/project-import.actions';
import {RescheduleActionEnum} from '../../../project/project-common/store/reschedule/reschedule.actions';
import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {AlertActions} from '../../alert/store/alert.actions';
import {DownloadFileHelper} from '../../misc/helpers/download-file.helper';
import {RealtimeService} from '../../realtime/api/realtime.service';
import {RealtimeEventJobDataResource} from '../../realtime/api/resources/realtime-event-job-data.resource';
import {BlobService} from '../../rest/services/blob.service';
import {JobStatusEnum} from '../api/enums/job-status.enum';
import {
    JOB_TYPES_SUPPORTED,
    JobTypeEnum,
} from '../api/enums/job-type.enum';
import {JobService} from '../api/job.service';
import {JobResource} from '../api/resources/job.resource';
import {JobListResource} from '../api/resources/job-list.resource';
import {
    JobActionEnum,
    JobActions
} from './job.actions';
import {JobQueries} from './job.queries';

export const JOB_STATUS_COMPLETED_SUCCESS_MESSAGE_BY_TYPE: { [key in JobTypeEnum]?: string } = {
    [JobTypeEnum.CalendarExportPdf]: 'Job_CompletedCalendarExportPDF_SuccessMessage',
    [JobTypeEnum.CalendarExportCsv]: 'Job_CompletedCalendarExportCSV_SuccessMessage',
    [JobTypeEnum.CalendarExportJson]: 'Job_CompletedCalendarExportJSON_SuccessMessage',
    [JobTypeEnum.ProjectImport]: 'Job_ProjectImportCard_CompletedStatusTitle',
    [JobTypeEnum.ProjectExport]: 'Job_ProjectExportCard_CompletedStatusTitle',
    [JobTypeEnum.ProjectExportZip]: 'Job_ProjectExportCard_CompletedStatusTitle',
    [JobTypeEnum.ProjectCopy]: 'Job_ProjectCopyCard_CompletedStatusTitle',
    [JobTypeEnum.ProjectReschedule]: 'Job_ProjectRescheduleCard_CompletedStatusTitle',
};

const WATCHING_JOB_STATUS_COMPLETED_BY_TYPE: JobTypeEnum[] = [
    JobTypeEnum.CalendarExportPdf,
    JobTypeEnum.CalendarExportCsv,
    JobTypeEnum.CalendarExportJson,
    JobTypeEnum.ProjectImport,
    JobTypeEnum.ProjectExport,
    JobTypeEnum.ProjectExportZip,
    JobTypeEnum.ProjectCopy,
    JobTypeEnum.ProjectReschedule,
];

@Injectable()
export class JobEffects {

    private _watchingJobsStatusChangeToCompleted$: Observable<JobResource> = this._jobQueries.observeJobsCompleted()
        .pipe(
            map((jobs) => jobs.filter(job => WATCHING_JOB_STATUS_COMPLETED_BY_TYPE.includes(job.type))),
            mergeAll(),
            withLatestFrom(this._jobQueries.observeWatchingJobsIds()),
            filter(([job, watchingJobs]) => watchingJobs.includes(job.id)),
            map(([job]) => job),
        );

    constructor(private _actions$: Actions,
                private _blobService: BlobService,
                private _downloadFileHelper: DownloadFileHelper,
                private _jobQueries: JobQueries,
                private _jobService: JobService,
                private _realtimeService: RealtimeService) {
    }

    /**
     * @description Stream of events for job updates via realtime
     * @type {Observable<Action>}
     */
    public newJobChange$: Observable<Action> = createEffect(() => this._realtimeService.getJobEvents()
        .pipe(
            map((jobEvent: RealtimeEventJobDataResource) => new JobActions.Update.OneFulfilled(jobEvent.job))));

    /**
     * @description Stream of events for jobs which the status changed to completed to trigger an alert
     * @type {Observable<Action>}
     */
    public triggerJobStatusChangeAlert$: Observable<Action> = createEffect(() => this._watchingJobsStatusChangeToCompleted$
        .pipe(
            map((job: JobResource) => {
                if (job.type === JobTypeEnum.ProjectReschedule
                    && (!!job.result.failed.milestones.length || !!job.result.failed.tasks.length)) {
                    return new AlertActions.Add.WarningAlert(
                        {message: new AlertMessageResource('Job_ProjectRescheduleCard_PartlyCompletedStatusTitle')});
                }

                return new AlertActions.Add.SuccessAlert(
                    {message: new AlertMessageResource(JOB_STATUS_COMPLETED_SUCCESS_MESSAGE_BY_TYPE[job.type])});
            })));

    /**
     * @description Stream of events for jobs which the status changed to completed to trigger an automatic download
     *@type{Observable<Action>}
     */
    public triggerJobStatusChangeAutomaticDownload$: Observable<Action> = createEffect(() => this._watchingJobsStatusChangeToCompleted$
        .pipe(
            mergeMap(({id, result: {url, fileName}}) => this._blobService.getBlob(url)
                .pipe(
                    mergeMap(value => value ? of(value) : throwError(value)),
                    mergeMap(blob => {
                        this._downloadFileHelper.downloadBlob(fileName, blob);

                        return [
                            new JobActions.Unset.JobToWatch(id),
                            new JobActions.Set.JobAsRead(id),
                        ];
                    }),
                    catchError(() => of(new JobActions.Unset.JobToWatch(id))),
                ))
        ));

    /**
     * @description Set a new job to watch interceptor
     * @type {Observable<Action>}
     */
    public triggerJobWatch$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarActionEnum.ExportOneFulfilled,
                ExportProjectActionsEnum.ExportOneFulfilled,
                ProjectCopyActionEnum.CopyOneFulfilled,
                ProjectImportActionEnum.ImportOneFulfilled,
                RescheduleActionEnum.RescheduleOneFulfilled,
            ),
            map(({id}) => new JobActions.Set.JobToWatch(id))));

    /**
     * @description Unset a job to watch interceptor
     * @type {Observable<Action>}
     */
    public triggerJobUnwatch$: Observable<Action> = createEffect(() => this._realtimeService.getJobEvents()
        .pipe(
            withLatestFrom(this._jobQueries.observeWatchingJobsIds()),
            filter(([{job: {id}}, watchingJobs]: [RealtimeEventJobDataResource, string[]]) => watchingJobs.includes(id)),
            filter(([{job: {status}}]: [RealtimeEventJobDataResource, string[]]) =>
                status === JobStatusEnum.Failed || status === JobStatusEnum.Rejected),
            map(([{job: {id}}]: [RealtimeEventJobDataResource, string[]]) => new JobActions.Unset.JobToWatch(id))));

    /**
     * @description Request jobs interceptor to request list of jobs
     * @type {Observable<Action[]>}
     */
    public requestJobs$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(JobActionEnum.RequestAll),
            withLatestFrom(this._jobQueries.observeJobListLastSeen()),
            switchMap(([, lastSeen]) => {
                const pageNumber = 0;
                const pageSize = 100;

                return this._jobService.findAll(pageNumber, pageSize)
                    .pipe(
                        mergeMap((jobList: JobListResource) => {
                            const requests = [of(jobList)];

                            for (let page = pageNumber + 1; page < jobList.totalPages; page++) {
                                requests.push(this._jobService.findAll(page, pageSize));
                            }

                            return zip(...requests);
                        }),
                        map((jobLists: JobListResource[]) => {
                            const items = jobLists.map(jobList => jobList.items);
                            const filteredItems = flatten(items).filter(job => JOB_TYPES_SUPPORTED.includes(job.type));

                            return Object.assign({}, jobLists[0], {items: filteredItems});
                        }),
                        mergeMap((jobList: JobListResource) => {
                            const actions: Action[] = [new JobActions.Request.AllFulfilled(jobList)];
                            const markListAsSeen = this._jobQueries.hasJobUpdatesNotSeen(lastSeen, jobList.items);

                            if (markListAsSeen) {
                                const lastUpdatedJobModifiedDate = this._jobQueries.getLastUpdatedJobNotReadModifiedDate(jobList.items);

                                actions.push(new JobActions.Set.ListAsSeen(lastUpdatedJobModifiedDate.toISOString()));
                            }

                            return actions;
                        }),
                        catchError(() => of(new JobActions.Request.AllRejected())));
            })
        ));

    public setListAsSeen$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(JobActionEnum.SetListAsSeen),
            switchMap((action: JobActions.Set.ListAsSeen) =>
                this._jobService.markJobListAsSeen(action.payload)
                    .pipe(
                        map(() => new JobActions.Set.ListAsSeenFulfilled(action.payload)),
                        catchError(() => of(new JobActions.Set.ListAsSeenRejected()))))));

    public setJobAsRead$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(JobActionEnum.SetJobAsRead),
            mergeMap((action: JobActions.Set.JobAsRead) =>
                this._jobService.markJobAsRead(action.payload)
                    .pipe(
                        map(() => new JobActions.Set.JobAsReadFulfilled(action.payload)),
                        catchError(() => of(new JobActions.Set.JobAsReadRejected(action.payload)))))));
}
