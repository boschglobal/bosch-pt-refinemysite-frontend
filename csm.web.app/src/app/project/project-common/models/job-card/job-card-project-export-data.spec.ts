/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    JOB_MOCK_7,
    JOB_MOCK_10,
} from '../../../../../test/mocks/jobs';
import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardProjectExportData} from './job-card-project-export-data';

describe('Job Card Project Export Data', () => {

    it('should set the correct title based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_7, status: JobStatusEnum.Running};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_RunningStatusTitle');

        job = {...JOB_MOCK_7, status: JobStatusEnum.Queued};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_RunningStatusTitle');

        job = {...JOB_MOCK_7, status: JobStatusEnum.Completed};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_CompletedStatusTitle');

        job = {...JOB_MOCK_7, status: JobStatusEnum.Failed};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_FailedStatusTitle');

        job = {...JOB_MOCK_7, status: JobStatusEnum.Rejected};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_FailedStatusTitle');

        job = {...JOB_MOCK_10, status: JobStatusEnum.Running};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_RunningStatusTitle');

        job = {...JOB_MOCK_10, status: JobStatusEnum.Queued};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_RunningStatusTitle');

        job = {...JOB_MOCK_10, status: JobStatusEnum.Completed};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_CompletedStatusTitle');

        job = {...JOB_MOCK_10, status: JobStatusEnum.Failed};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_FailedStatusTitle');

        job = {...JOB_MOCK_10, status: JobStatusEnum.Rejected};
        expect(JobCardProjectExportData.fromJobResource(job).title).toBe('Job_ProjectExportCard_FailedStatusTitle');
    });

    it('should set the correct status based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_7, status: JobStatusEnum.Running};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_7, status: JobStatusEnum.Queued};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_7, status: JobStatusEnum.Completed};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Completed);

        job = {...JOB_MOCK_7, status: JobStatusEnum.Failed};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_7, status: JobStatusEnum.Rejected};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_10, status: JobStatusEnum.Running};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_10, status: JobStatusEnum.Queued};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_10, status: JobStatusEnum.Completed};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Completed);

        job = {...JOB_MOCK_10, status: JobStatusEnum.Failed};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_10, status: JobStatusEnum.Rejected};
        expect(JobCardProjectExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);
    });
});
