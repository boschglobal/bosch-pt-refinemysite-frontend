/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JOB_MOCK_9} from '../../../../../test/mocks/jobs';
import {
    MOCK_RESCHEDULE_RESOURCE,
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE,
    MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS,
} from '../../../../../test/mocks/project-reschedule';
import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobContextProjectRescheduleResource} from '../../../../shared/jobs/api/resources/job-context-project-reschedule.resource';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardProjectRescheduleData} from './job-card-project-reschedule-data';

describe('Job Card Project Reschedule Data', () => {

    const rescheduleResourceWithoutErrors = MOCK_RESCHEDULE_RESOURCE;
    const rescheduleResourceWithFailedMilestones = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE;
    const rescheduleResourceWithFailedTasks = MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_TASKS;

    it('should set the correct title based on the Job Resources status and failed reschedules', () => {
        let job: JobResource<JobContextProjectRescheduleResource, RescheduleResource>;

        job = {...JOB_MOCK_9, status: JobStatusEnum.Running};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_RunningStatusTitle');

        job = {...JOB_MOCK_9, status: JobStatusEnum.Queued};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_RunningStatusTitle');

        job = {...JOB_MOCK_9, status: JobStatusEnum.Completed, result: rescheduleResourceWithoutErrors};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_CompletedStatusTitle');

        job = {...JOB_MOCK_9, status: JobStatusEnum.Completed, result: rescheduleResourceWithFailedMilestones};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_PartlyCompletedStatusTitle');

        job = {...JOB_MOCK_9, status: JobStatusEnum.Completed, result: rescheduleResourceWithFailedTasks};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_PartlyCompletedStatusTitle');

        job = {...JOB_MOCK_9, status: JobStatusEnum.Failed};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_FailedStatusTitle');

        job = {...JOB_MOCK_9, status: JobStatusEnum.Rejected};
        expect(JobCardProjectRescheduleData.fromJobResource(job).title).toBe('Job_ProjectRescheduleCard_FailedStatusTitle');
    });

    it('should set the correct status based on the Job Resources status', () => {
        let job: JobResource<JobContextProjectRescheduleResource, RescheduleResource>;

        job = {...JOB_MOCK_9, status: JobStatusEnum.Running};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_9, status: JobStatusEnum.Queued};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_9, status: JobStatusEnum.Completed, result: rescheduleResourceWithoutErrors};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.Completed);

        job = {...JOB_MOCK_9, status: JobStatusEnum.Completed, result: rescheduleResourceWithFailedMilestones};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.PartlyCompleted);

        job = {...JOB_MOCK_9, status: JobStatusEnum.Completed, result: rescheduleResourceWithFailedTasks};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.PartlyCompleted);

        job = {...JOB_MOCK_9, status: JobStatusEnum.Failed};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_9, status: JobStatusEnum.Rejected};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_9, status: 'NOT_SUPPORTED' as JobStatusEnum};
        expect(JobCardProjectRescheduleData.fromJobResource(job).status).toBeNull();
    });
});
