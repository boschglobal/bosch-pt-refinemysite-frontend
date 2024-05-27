/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JOB_MOCK_8} from '../../../../../test/mocks/jobs';
import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardProjectCopyData} from './job-card-project-copy-data';

describe('Job Card Project Copy Data', () => {

    it('should set the correct title based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_8, status: JobStatusEnum.Running};
        expect(JobCardProjectCopyData.fromJobResource(job).title).toBe('Job_ProjectCopyCard_RunningStatusTitle');

        job = {...JOB_MOCK_8, status: JobStatusEnum.Queued};
        expect(JobCardProjectCopyData.fromJobResource(job).title).toBe('Job_ProjectCopyCard_RunningStatusTitle');

        job = {...JOB_MOCK_8, status: JobStatusEnum.Completed};
        expect(JobCardProjectCopyData.fromJobResource(job).title).toBe('Job_ProjectCopyCard_CompletedStatusTitle');

        job = {...JOB_MOCK_8, status: JobStatusEnum.Failed};
        expect(JobCardProjectCopyData.fromJobResource(job).title).toBe('Job_ProjectCopyCard_FailedStatusTitle');

        job = {...JOB_MOCK_8, status: JobStatusEnum.Rejected};
        expect(JobCardProjectCopyData.fromJobResource(job).title).toBe('Job_ProjectCopyCard_FailedStatusTitle');
    });

    it('should set the correct status based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_8, status: JobStatusEnum.Running};
        expect(JobCardProjectCopyData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_8, status: JobStatusEnum.Queued};
        expect(JobCardProjectCopyData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_8, status: JobStatusEnum.Completed};
        expect(JobCardProjectCopyData.fromJobResource(job).status).toBe(JobCardStatusEnum.Completed);

        job = {...JOB_MOCK_8, status: JobStatusEnum.Failed};
        expect(JobCardProjectCopyData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_8, status: JobStatusEnum.Rejected};
        expect(JobCardProjectCopyData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);
    });

    it('should have the correct rerouteUrl based on the job result projectId', () => {
        const job: JobResource = {...JOB_MOCK_8, status: JobStatusEnum.Rejected};
        const expectedResult = `projects/${JOB_MOCK_8.result.projectId}/dashboard`;

        expect(JobCardProjectCopyData.fromJobResource(job).rerouteUrl).toBe(expectedResult);
    });
});
