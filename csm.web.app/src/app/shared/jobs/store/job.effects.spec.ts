/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    Subject,
    Subscription,
    throwError
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    JOB_LIST_MOCK_ONE_OF_ONE_PAGE,
    JOB_LIST_MOCK_ONE_OF_TWO_PAGE,
    JOB_LIST_MOCK_TWO_OF_TWO_PAGE,
    JOB_MOCK_1,
    JOB_MOCK_2,
    JOB_MOCK_3,
    JOB_MOCK_9,
} from '../../../../test/mocks/jobs';
import {
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE,
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS,
} from '../../../../test/mocks/project-reschedule';
import {RealtimeServiceStub} from '../../../../test/stubs/realtime-service.stub';
import {RescheduleResource} from '../../../project/project-common/api/reschedule/resources/reschedule.resource';
import {CalendarActions} from '../../../project/project-common/store/calendar/calendar/calendar.actions';
import {ProjectCopyAction} from '../../../project/project-common/store/project-copy/project-copy.actions';
import {ProjectExportAction} from '../../../project/project-common/store/project-export/project-export.actions';
import {ProjectImportActions} from '../../../project/project-common/store/project-import/project-import.actions';
import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {AlertActions} from '../../alert/store/alert.actions';
import {DownloadFileHelper} from '../../misc/helpers/download-file.helper';
import {RealtimeService} from '../../realtime/api/realtime.service';
import {RealtimeEventJobDataResource} from '../../realtime/api/resources/realtime-event-job-data.resource';
import {BlobService} from '../../rest/services/blob.service';
import {JobStatusEnum} from '../api/enums/job-status.enum';
import {JobTypeEnum} from '../api/enums/job-type.enum';
import {JobService} from '../api/job.service';
import {JobResource} from '../api/resources/job.resource';
import {JobContextProjectRescheduleResource} from '../api/resources/job-context-project-reschedule.resource';
import {JobListResource} from '../api/resources/job-list.resource';
import {JobActions} from './job.actions';
import {
    JOB_STATUS_COMPLETED_SUCCESS_MESSAGE_BY_TYPE,
    JobEffects
} from './job.effects';
import {JobQueries} from './job.queries';
import SpyObj = jasmine.SpyObj;
import {RescheduleActions} from '../../../project/project-common/store/reschedule/reschedule.actions';

describe('Job Effects', () => {
    let actions: ReplaySubject<any>;
    let blobService: SpyObj<BlobService>;
    let downloadFileHelper: SpyObj<DownloadFileHelper>;
    let jobEffects: JobEffects;
    let jobService: any;
    let subscription: Subscription;

    const currentDate = moment();
    const pageNumber = 0;
    const pageSize = 100;

    const job: ReplaySubject<RealtimeEventJobDataResource> = new Subject() as ReplaySubject<RealtimeEventJobDataResource>;
    const completedJobsSubject: Subject<JobResource[]> = new Subject<JobResource[]>();
    const jobListSubject: Subject<JobResource[]> = new Subject<JobResource[]>();
    const jobListLastSeenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(currentDate.toISOString());
    const watchingJobsSubject: Subject<string[]> = new Subject<string[]>();
    const errorResponse: Observable<any> = throwError('error');

    const jobQueriesMock: JobQueries = mock(JobQueries);

    const moduleDef: TestModuleMetadata = {
        providers: [
            JobEffects,
            provideMockActions(() => actions),
            {
                provide: BlobService,
                useValue: jasmine.createSpyObj('BlobService', ['getBlob']),
            },
            {
                provide: DownloadFileHelper,
                useValue: jasmine.createSpyObj('DownloadFileHelper', ['downloadBlob']),
            },
            {
                provide: JobQueries,
                useValue: instance(jobQueriesMock),
            },
            {
                provide: JobService,
                useValue: jasmine.createSpyObj('JobService', [
                    'findAll',
                    'markJobListAsSeen',
                    'markJobAsRead',
                ]),
            },
            {
                provide: RealtimeService,
                useValue: new RealtimeServiceStub(job),
            },
        ],
    };

    const getJobListResource =
        (jobList: JobListResource, lastSeen = currentDate.toISOString(), lastModifiedDate = currentDate.toISOString()): JobListResource => {
            const jobListCopy = cloneDeep(jobList);

            return Object.assign({}, jobListCopy,
                {lastSeen, items: jobListCopy.items.map(item => Object.assign({}, item, {lastModifiedDate}))});
        };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(jobQueriesMock.observeJobs()).thenReturn(jobListSubject);
        when(jobQueriesMock.observeJobsCompleted()).thenReturn(completedJobsSubject);
        when(jobQueriesMock.observeJobListLastSeen()).thenReturn(jobListLastSeenSubject);
        when(jobQueriesMock.observeWatchingJobsIds()).thenReturn(watchingJobsSubject);

        actions = new ReplaySubject(1);

        blobService = TestBed.inject(BlobService) as SpyObj<BlobService>;
        downloadFileHelper = TestBed.inject(DownloadFileHelper) as SpyObj<DownloadFileHelper>;
        jobEffects = TestBed.inject(JobEffects);
        jobService = TestBed.inject(JobService);

        downloadFileHelper.downloadBlob.calls.reset();
        jobService.findAll.calls.reset();
        jobService.markJobListAsSeen.calls.reset();
        jobService.markJobAsRead.calls.reset();
    });

    it('should trigger a JobActions.Update.OneFulfilled when a job realtime event is received', () => {
        const jobEvent = new RealtimeEventJobDataResource(JOB_MOCK_1);
        const expectedResult = new JobActions.Update.OneFulfilled(JOB_MOCK_1);

        subscription = jobEffects.newJobChange$.subscribe(result => expect(result).toEqual(expectedResult));

        job.next(jobEvent);
        subscription.unsubscribe();
    });

    it('should trigger AlertActions.Add.SuccessAlert for the job that the state changes to completed, whose type is allowed and' +
        ' is being watched', () => {
        const results: Action[] = [];
        const supportedJob: JobResource = JOB_MOCK_1;
        const notSupportedJob: JobResource = Object.assign({}, JOB_MOCK_2, {type: 'NOT_SUPPORTED_TYPE'});
        const key = JOB_STATUS_COMPLETED_SUCCESS_MESSAGE_BY_TYPE[supportedJob.type];
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource((key))});

        jobEffects.triggerJobStatusChangeAlert$.subscribe(result => results.push(result));

        watchingJobsSubject.next([supportedJob.id]);
        completedJobsSubject.next([supportedJob]);
        completedJobsSubject.next([notSupportedJob]);

        const firstResult = results[0] as AlertActions.Add.SuccessAlert;

        expect(results.length).toBe(1);
        expect(firstResult.type).toEqual(expectedResult.type);
        expect(firstResult.payload.type).toBe(expectedResult.payload.type);
        expect(firstResult.payload.message).toEqual(expectedResult.payload.message);
    });

    it('should trigger AlertActions.Add.WarningAlert for a Reschedule job that the state changes to completed,' +
        ' is being watched and some milestones failed to be rescheduled', () => {
        const results: Action[] = [];
        const supportedJob: JobResource<JobContextProjectRescheduleResource, RescheduleResource> = {
            ...JOB_MOCK_9,
            result: MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE,
        };
        const notSupportedJob: JobResource = Object.assign({}, JOB_MOCK_2, {type: 'NOT_SUPPORTED_TYPE'});
        const key = 'Job_ProjectRescheduleCard_PartlyCompletedStatusTitle';
        const expectedResult = new AlertActions.Add.WarningAlert({message: new AlertMessageResource((key))});

        jobEffects.triggerJobStatusChangeAlert$.subscribe(result => results.push(result));

        watchingJobsSubject.next([supportedJob.id]);
        completedJobsSubject.next([supportedJob]);
        completedJobsSubject.next([notSupportedJob]);

        const firstResult = results[0] as AlertActions.Add.WarningAlert;

        expect(results.length).toBe(1);
        expect(firstResult.type).toEqual(expectedResult.type);
        expect(firstResult.payload.type).toBe(expectedResult.payload.type);
        expect(firstResult.payload.message).toEqual(expectedResult.payload.message);
    });

    it('should trigger AlertActions.Add.WarningAlert for a Reschedule job that the state changes to completed,' +
        ' is being watched and some tasks failed to be rescheduled', () => {
        const results: Action[] = [];
        const supportedJob: JobResource<JobContextProjectRescheduleResource, RescheduleResource> = {
            ...JOB_MOCK_9,
            result: MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS,
        };
        const notSupportedJob: JobResource = Object.assign({}, JOB_MOCK_2, {type: 'NOT_SUPPORTED_TYPE'});
        const key = 'Job_ProjectRescheduleCard_PartlyCompletedStatusTitle';
        const expectedResult = new AlertActions.Add.WarningAlert({message: new AlertMessageResource((key))});

        jobEffects.triggerJobStatusChangeAlert$.subscribe(result => results.push(result));

        watchingJobsSubject.next([supportedJob.id]);
        completedJobsSubject.next([supportedJob]);
        completedJobsSubject.next([notSupportedJob]);

        const firstResult = results[0] as AlertActions.Add.WarningAlert;

        expect(results.length).toBe(1);
        expect(firstResult.type).toEqual(expectedResult.type);
        expect(firstResult.payload.type).toBe(expectedResult.payload.type);
        expect(firstResult.payload.message).toEqual(expectedResult.payload.message);
    });

    it('should not trigger AlertActions.Add.SuccessAlert for the job that the state changes to completed, whose type is allowed but' +
        ' is not being watched', () => {
        const results: Action[] = [];
        const supportedJob1: JobResource = JOB_MOCK_1;
        const supportedJob2: JobResource = JOB_MOCK_2;
        const key = JOB_STATUS_COMPLETED_SUCCESS_MESSAGE_BY_TYPE[supportedJob2.type];
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource((key))});

        jobEffects.triggerJobStatusChangeAlert$.subscribe(result => results.push(result));

        watchingJobsSubject.next([supportedJob2.id]);
        completedJobsSubject.next([supportedJob1]);
        completedJobsSubject.next([supportedJob2]);

        const firstResult = results[0] as AlertActions.Add.SuccessAlert;

        expect(results.length).toBe(1);
        expect(firstResult.type).toEqual(expectedResult.type);
        expect(firstResult.payload.type).toBe(expectedResult.payload.type);
        expect(firstResult.payload.message).toEqual(expectedResult.payload.message);
    });

    it('should trigger a JobActions.Unset.JobToWatch and JobActions.Set.JobAsRead action after a successful blob download ' +
        'for a job that the state changes to completed, whose type is allowed and is being watched', () => {
        const results: Action[] = [];
        const completedJob = JOB_MOCK_2;
        const expectedFirstResult = new JobActions.Unset.JobToWatch(completedJob.id);
        const expectedSecondResult = new JobActions.Set.JobAsRead(completedJob.id);
        const {result: {fileName}} = completedJob;
        const blob = new Blob();

        jobEffects.triggerJobStatusChangeAutomaticDownload$.subscribe(result => results.push(result));

        blobService.getBlob.and.returnValue(of(blob));
        watchingJobsSubject.next([completedJob.id]);
        completedJobsSubject.next([completedJob]);

        const firstResult = results[0] as JobActions.Unset.JobToWatch;
        const secondResult = results[1] as JobActions.Set.JobAsRead;

        expect(results.length).toBe(2);
        expect(firstResult.type).toEqual(expectedFirstResult.type);
        expect(firstResult.jobId).toBe(expectedFirstResult.jobId);
        expect(secondResult.type).toEqual(expectedSecondResult.type);
        expect(secondResult.payload).toBe(expectedSecondResult.payload);
        expect(downloadFileHelper.downloadBlob).toHaveBeenCalledTimes(1);
        expect(downloadFileHelper.downloadBlob).toHaveBeenCalledWith(fileName, blob);
    });

    it('should trigger JobActions.Unset.JobToWatch after a unsuccessful blob download for a job that the state changes to completed,' +
        ' whose type is allowed and is being watched', () => {
        const results: Action[] = [];
        const completedJob = JOB_MOCK_2;
        const expectedResult = new JobActions.Unset.JobToWatch(completedJob.id);

        jobEffects.triggerJobStatusChangeAutomaticDownload$.subscribe(result => results.push(result));

        blobService.getBlob.and.returnValue(of(null));
        watchingJobsSubject.next([completedJob.id]);
        completedJobsSubject.next([completedJob]);

        const firstResult = results[0] as JobActions.Unset.JobToWatch;

        expect(results.length).toBe(1);
        expect(firstResult.type).toEqual(expectedResult.type);
        expect(firstResult.jobId).toBe(expectedResult.jobId);
        expect(downloadFileHelper.downloadBlob).not.toHaveBeenCalled();
    });

    it('should not trigger JobActions.Unset.JobToWatch after a job state changes to completed, whose type is allowed ' +
        'but is not being watched', () => {
        const results: Action[] = [];
        const completedJob = JOB_MOCK_1;

        jobEffects.triggerJobStatusChangeAutomaticDownload$.subscribe(result => results.push(result));

        completedJobsSubject.next([completedJob]);

        expect(results.length).toBe(0);
    });

    it('should trigger JobActions.Request.AllFulfilled and JobActions.Set.ListAsSeen actions after a successful job list request ' +
        'and mark list as seen when user has updates not seen', () => {
        const results = [];
        const oldLastSeen = currentDate.clone().subtract(1, 'd').toISOString();
        const jobListResponse = getJobListResource(JOB_LIST_MOCK_ONE_OF_ONE_PAGE, oldLastSeen, currentDate.toISOString());
        const firstExpectedResult = new JobActions.Request.AllFulfilled(jobListResponse);
        const secondExpectedResult = new JobActions.Set.ListAsSeen(currentDate.toISOString());

        when(jobQueriesMock.hasJobUpdatesNotSeen(anything(), anything())).thenReturn(true);
        when(jobQueriesMock.getLastUpdatedJobNotReadModifiedDate(anything())).thenReturn(currentDate);
        jobListLastSeenSubject.next(oldLastSeen);
        jobService.findAll.and.returnValue(of(jobListResponse));
        jobEffects.requestJobs$.subscribe(result => results.push(result));

        actions.next(new JobActions.Request.All());

        const firstResult = results[0] as JobActions.Request.AllFulfilled;
        const secondResult = results[1] as JobActions.Set.ListAsSeen;

        expect(results.length).toEqual(2);
        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult).toEqual(secondExpectedResult);
        expect(jobService.findAll).toHaveBeenCalledTimes(1);
        expect(jobService.findAll).toHaveBeenCalledWith(pageNumber, pageSize);
    });

    it('should trigger JobActions.Request.AllFulfilled action after a successful job list request', () => {
        const results = [];
        const jobListResponse = getJobListResource(JOB_LIST_MOCK_ONE_OF_ONE_PAGE);
        const firstExpectedResult = new JobActions.Request.AllFulfilled(jobListResponse);

        when(jobQueriesMock.hasJobUpdatesNotSeen(anything(), anything())).thenReturn(false);
        jobService.findAll.and.returnValue(of(jobListResponse));
        jobEffects.requestJobs$.subscribe(result => results.push(result));

        actions.next(new JobActions.Request.All());

        const firstResult = results[0] as JobActions.Request.AllFulfilled;

        expect(results.length).toEqual(1);
        expect(firstResult).toEqual(firstExpectedResult);
        expect(jobService.findAll).toHaveBeenCalledTimes(1);
        expect(jobService.findAll).toHaveBeenCalledWith(pageNumber, pageSize);
    });

    it('should trigger JobActions.Request.AllFulfilled action after a successful job list requests when ' +
        'there are more then page 1 of results', () => {
        const results = [];
        const jobListResponsePage1 = getJobListResource(JOB_LIST_MOCK_ONE_OF_TWO_PAGE);
        const jobListResponsePage2 = getJobListResource(JOB_LIST_MOCK_TWO_OF_TWO_PAGE);
        const expectedPayload = Object.assign({}, jobListResponsePage1,
            {items: [...jobListResponsePage1.items, ...jobListResponsePage2.items]});
        const firstExpectedResult = new JobActions.Request.AllFulfilled(expectedPayload);

        when(jobQueriesMock.hasJobUpdatesNotSeen(anything(), anything())).thenReturn(false);
        jobService.findAll.and.returnValue(of(jobListResponsePage1), of(jobListResponsePage2));
        jobEffects.requestJobs$.subscribe(result => results.push(result));

        actions.next(new JobActions.Request.All());

        const firstResult = results[0] as JobActions.Request.AllFulfilled;

        expect(results.length).toEqual(1);
        expect(firstResult).toEqual(firstExpectedResult);
        expect(jobService.findAll).toHaveBeenCalledTimes(2);
    });

    it('should trigger JobActions.Request.AllFulfilled action with a list of only supported jobs', () => {
        const results = [];
        const notSupportedJobType: JobResource = {...JOB_MOCK_1, type: 'NOT-SUPPORTED-TYPE-1' as JobTypeEnum};
        const jobListWithUnsupportedJobTypes = {
            ...JOB_LIST_MOCK_ONE_OF_ONE_PAGE,
            items: [
                ...JOB_LIST_MOCK_ONE_OF_ONE_PAGE.items,
                notSupportedJobType,
            ],
        };
        const jobListResponse = getJobListResource(jobListWithUnsupportedJobTypes);
        const firstExpectedResultData = getJobListResource(JOB_LIST_MOCK_ONE_OF_ONE_PAGE);
        const firstExpectedResult = new JobActions.Request.AllFulfilled(firstExpectedResultData);

        when(jobQueriesMock.hasJobUpdatesNotSeen(anything(), anything())).thenReturn(false);
        jobService.findAll.and.returnValue(of(jobListResponse));
        jobEffects.requestJobs$.subscribe(result => results.push(result));

        actions.next(new JobActions.Request.All());

        const firstResult = results[0] as JobActions.Request.AllFulfilled;

        expect(results.length).toEqual(1);
        expect(firstResult).toEqual(firstExpectedResult);
        expect(jobService.findAll).toHaveBeenCalledTimes(1);
        expect(jobService.findAll).toHaveBeenCalledWith(pageNumber, pageSize);
    });

    it('should trigger JobActions.Request.AllRejected action after a unsuccessful job list request', () => {
        const expectedResult = new JobActions.Request.AllRejected();

        jobService.findAll.and.returnValue(errorResponse);

        jobEffects.requestJobs$.subscribe(result => expect(result).toEqual(expectedResult));

        actions.next(new JobActions.Request.All());
    });

    it('should trigger JobActions.Set.ListAsSeenFulfilled action after a successful mark list as seen request', () => {
        const lastSeen = currentDate.toISOString();
        const expectedResult = new JobActions.Set.ListAsSeenFulfilled(lastSeen);

        jobService.markJobListAsSeen.and.returnValue(of(lastSeen));

        jobEffects.setListAsSeen$.subscribe(result => expect(result).toEqual(expectedResult));

        actions.next(new JobActions.Set.ListAsSeen(lastSeen));
    });

    it('should trigger JobActions.Set.ListAsSeenRejected action after a unsuccessful mark list as seen request', () => {
        const lastSeen = currentDate.toISOString();
        const expectedResult = new JobActions.Set.ListAsSeenRejected();

        jobService.markJobListAsSeen.and.returnValue(errorResponse);

        jobEffects.setListAsSeen$.subscribe(result => expect(result).toEqual(expectedResult));

        actions.next(new JobActions.Set.ListAsSeen(lastSeen));
    });

    it('should trigger JobActions.Set.JobAsReadFulfilled action after a successful mark job as read request', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobAsReadFulfilled(jobId);

        jobService.markJobAsRead.and.returnValue(of(jobId));

        jobEffects.setJobAsRead$.subscribe(result => expect(result).toEqual(expectedResult));

        actions.next(new JobActions.Set.JobAsRead(jobId));
    });

    it('should trigger JobActions.Set.JobAsReadRejected action after a unsuccessful mark job as read request', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobAsReadRejected(jobId);

        jobService.markJobAsRead.and.returnValue(errorResponse);

        jobEffects.setJobAsRead$.subscribe(result => expect(result).toEqual(expectedResult));

        actions.next(new JobActions.Set.JobAsRead(jobId));
    });

    it('should trigger JobActions.Set.JobToWatch action after a CalendarActions.Export.OneFulfilled action', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobToWatch(jobId);

        jobEffects.triggerJobWatch$.subscribe(result => expect(result).toEqual(expectedResult));

        actions.next(new CalendarActions.Export.OneFulfilled(jobId));
    });

    it('should trigger JobActions.Set.JobToWatch action after a ProjectImportActions.Import.OneFulfilled action', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobToWatch(jobId);

        jobEffects.triggerJobWatch$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        actions.next(new ProjectImportActions.Import.OneFulfilled(jobId));
    });

    it('should trigger JobActions.Set.JobToWatch action after a ProjectImportActions.Import.OneFulfilled action', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobToWatch(jobId);

        jobEffects.triggerJobWatch$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        actions.next(new ProjectExportAction.Export.OneFulfilled(jobId));
    });

    it('should trigger JobActions.Set.JobToWatch action after a ProjectCopyAction.Copy.OneFulfilled action', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobToWatch(jobId);

        jobEffects.triggerJobWatch$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        actions.next(new ProjectCopyAction.Copy.OneFulfilled(jobId));
    });

    it('should trigger JobActions.Set.JobToWatch action after a RescheduleActions.Reschedule.OneFulfilled action', () => {
        const jobId = 'foo';
        const expectedResult = new JobActions.Set.JobToWatch(jobId);

        jobEffects.triggerJobWatch$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });

        actions.next(new RescheduleActions.Reschedule.OneFulfilled(jobId));
    });

    it('should trigger JobActions.Unset.JobToWatch action for job realtime update events with a FAILED or REJECTED statuses ' +
        'and their ids are part of the watched jobs ids', () => {
        const failedJob = {...JOB_MOCK_1, status: JobStatusEnum.Failed};
        const rejectedJob = {...JOB_MOCK_2, status: JobStatusEnum.Rejected};
        const failedJobEvent = new RealtimeEventJobDataResource(failedJob);
        const rejectedJobEvent = new RealtimeEventJobDataResource(rejectedJob);
        const results = [];
        const expectedResults = [
            new JobActions.Unset.JobToWatch(failedJob.id),
            new JobActions.Unset.JobToWatch(rejectedJob.id),
        ];

        subscription = jobEffects.triggerJobUnwatch$.subscribe(result => results.push(result));

        watchingJobsSubject.next([failedJob.id, rejectedJob.id]);
        job.next(failedJobEvent);
        job.next(rejectedJobEvent);

        expect(results.length).toEqual(2);
        expect(results).toEqual(expectedResults);
        subscription.unsubscribe();
    });

    it('should not trigger JobActions.Unset.JobToWatch action for job realtime update events with statuses ' +
        'different then FAILED or REJECTED even if their ids are part of the watched jobs ids', () => {
        const queueJob = {...JOB_MOCK_1, status: JobStatusEnum.Queued};
        const runningJob = {...JOB_MOCK_2, status: JobStatusEnum.Running};
        const completedJob = {...JOB_MOCK_3, status: JobStatusEnum.Completed};
        const queueJobEvent = new RealtimeEventJobDataResource(queueJob);
        const runningJobEvent = new RealtimeEventJobDataResource(runningJob);
        const completedJobEvent = new RealtimeEventJobDataResource(completedJob);
        const results = [];

        subscription = jobEffects.triggerJobUnwatch$.subscribe(result => results.push(result));

        watchingJobsSubject.next([queueJob.id, runningJob.id, completedJob.id]);
        job.next(queueJobEvent);
        job.next(runningJobEvent);
        job.next(completedJobEvent);

        expect(results).toEqual([]);
        subscription.unsubscribe();
    });
});
